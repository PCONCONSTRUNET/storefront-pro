
-- 1) Colunas novas em reviews
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS order_id uuid,
  ADD COLUMN IF NOT EXISTS variation text,
  ADD COLUMN IF NOT EXISTS videos jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id, created_at DESC);

-- 2) Bucket de mídia
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-media',
  'review-media',
  true,
  31457280, -- 30MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de Storage (idempotentes)
DROP POLICY IF EXISTS "review-media public read" ON storage.objects;
CREATE POLICY "review-media public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-media');

DROP POLICY IF EXISTS "review-media public upload" ON storage.objects;
CREATE POLICY "review-media public upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'review-media');

-- 3) Elegibilidade: cliente pode avaliar? Retorna order_id + variação se sim.
CREATE OR REPLACE FUNCTION public.customer_review_eligibility(
  _customer_id uuid,
  _product_id text
)
RETURNS TABLE (eligible boolean, order_id uuid, variation text, already_reviewed boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order_id uuid;
  _variation text;
  _already boolean;
BEGIN
  IF _customer_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, false;
    RETURN;
  END IF;

  SELECT o.id,
         (SELECT it->>'variation'
            FROM jsonb_array_elements(o.items) it
           WHERE it->>'productId' = _product_id
           LIMIT 1)
    INTO _order_id, _variation
    FROM public.orders o
   WHERE o.customer_email = (SELECT lower(c.email) FROM public.customers c WHERE c.id = _customer_id)
     AND lower(coalesce(o.payment_status::text, '')) IN ('paid','approved','pago')
     AND EXISTS (
       SELECT 1 FROM jsonb_array_elements(o.items) it
        WHERE it->>'productId' = _product_id
     )
   ORDER BY o.paid_at DESC NULLS LAST, o.created_at DESC
   LIMIT 1;

  SELECT EXISTS (
    SELECT 1 FROM public.reviews r
     WHERE r.product_id = _product_id
       AND r.customer_id = _customer_id
  ) INTO _already;

  RETURN QUERY SELECT (_order_id IS NOT NULL), _order_id, _variation, _already;
END;
$$;

-- 4) Submit verificado
CREATE OR REPLACE FUNCTION public.submit_verified_review(
  _customer_id uuid,
  _product_id text,
  _rating int,
  _comment text,
  _photos jsonb,
  _videos jsonb
)
RETURNS TABLE (ok boolean, message text, id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _name text;
  _elig record;
  _new_id uuid;
BEGIN
  IF _rating IS NULL OR _rating < 1 OR _rating > 5 THEN
    RETURN QUERY SELECT false, 'Nota inválida'::text, NULL::uuid; RETURN;
  END IF;

  SELECT c.name INTO _name FROM public.customers c WHERE c.id = _customer_id;
  IF _name IS NULL THEN
    RETURN QUERY SELECT false, 'Cliente não encontrado'::text, NULL::uuid; RETURN;
  END IF;

  SELECT * INTO _elig FROM public.customer_review_eligibility(_customer_id, _product_id) LIMIT 1;

  IF NOT _elig.eligible THEN
    RETURN QUERY SELECT false, 'Apenas quem comprou e pagou pode avaliar'::text, NULL::uuid; RETURN;
  END IF;
  IF _elig.already_reviewed THEN
    RETURN QUERY SELECT false, 'Você já avaliou este produto'::text, NULL::uuid; RETURN;
  END IF;

  _new_id := gen_random_uuid();
  INSERT INTO public.reviews (id, product_id, customer_id, customer_name, rating, comment, photos, videos, verified, order_id, variation)
  VALUES (_new_id, _product_id, _customer_id, _name, _rating, coalesce(trim(_comment), ''),
          coalesce(_photos, '[]'::jsonb), coalesce(_videos, '[]'::jsonb),
          true, _elig.order_id, _elig.variation);

  RETURN QUERY SELECT true, 'Avaliação publicada!'::text, _new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.customer_review_eligibility(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_verified_review(uuid, text, int, text, jsonb, jsonb) TO anon, authenticated;
