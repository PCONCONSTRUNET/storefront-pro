-- Corrige o tipo do parametro _id de uuid para text,
-- pois a coluna orders.id e TEXT (id curto como "GIRDQ").
CREATE OR REPLACE FUNCTION public.get_pix_order_status(_id text)
RETURNS TABLE(
  id text,
  payment_status payment_status,
  pix_qr_code text,
  pix_qr_code_base64 text,
  pix_expires_at timestamptz,
  total numeric,
  customer_name text,
  customer_email text,
  customer_phone text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, payment_status, pix_qr_code, pix_qr_code_base64, pix_expires_at, total, customer_name, customer_email, customer_phone
  FROM public.orders
  WHERE id = _id
  LIMIT 1
$$;
