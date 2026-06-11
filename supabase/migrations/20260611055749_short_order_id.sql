-- 1) payment_events order_id de uuid para text
ALTER TABLE public.payment_events DROP CONSTRAINT IF EXISTS payment_events_order_id_fkey;
ALTER TABLE public.payment_events ALTER COLUMN order_id TYPE text USING order_id::text;

-- 2) reviews order_id de uuid para text
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_order_id_fkey;
ALTER TABLE public.reviews ALTER COLUMN order_id TYPE text USING order_id::text;

-- 3) orders id de uuid para text
ALTER TABLE public.orders DROP CONSTRAINT orders_pkey CASCADE;
ALTER TABLE public.orders ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.orders ADD PRIMARY KEY (id);

-- 4) Recriar FKs
ALTER TABLE public.payment_events ADD CONSTRAINT payment_events_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

-- 5) Ajustar apply_order_stock_decrement
DROP FUNCTION IF EXISTS public.apply_order_stock_decrement(uuid);

CREATE OR REPLACE FUNCTION public.apply_order_stock_decrement(_order_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _item jsonb;
  _product_id text;
  _qty int;
BEGIN
  -- Percorrer os items do pedido
  FOR _item IN
    SELECT jsonb_array_elements(items)
    FROM orders
    WHERE id = _order_id
  LOOP
    _product_id := _item->>'productId';
    _qty := (_item->>'quantity')::int;

    IF _product_id IS NOT NULL AND _qty > 0 THEN
      UPDATE products
      SET stock = GREATEST(0, stock - _qty)
      WHERE id = _product_id;
    END IF;
  END LOOP;
END;
$$;

-- 6) Elegibilidade do customer_review_eligibility
DROP FUNCTION IF EXISTS public.customer_review_eligibility(text, text);

CREATE OR REPLACE FUNCTION public.customer_review_eligibility(p_email text, p_product_id text)
RETURNS TABLE (eligible boolean, order_id text, variation text, already_reviewed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order_id text;
  _variation text;
  _already boolean;
BEGIN
  SELECT o.id,
         (item->>'variation')::text
  INTO _order_id, _variation
  FROM orders o,
       jsonb_array_elements(o.items) as item
  WHERE o.customer_email = p_email
    AND (item->>'productId')::text = p_product_id
    AND o.payment_status = 'approved'
  ORDER BY o.created_at DESC
  LIMIT 1;

  IF _order_id IS NULL THEN
    RETURN QUERY SELECT false, null::text, null::text, false;
    RETURN;
  END IF;

  SELECT true INTO _already
  FROM reviews r
  WHERE r.product_id = p_product_id
    AND r.order_id = _order_id
    AND r.customer_email = p_email
  LIMIT 1;

  IF _already IS NULL THEN _already := false; END IF;

  RETURN QUERY SELECT (_order_id IS NOT NULL), _order_id, _variation, _already;
END;
$$;

-- 7) Adicionar coluna tracking_code
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_code TEXT;
