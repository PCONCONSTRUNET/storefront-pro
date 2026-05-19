CREATE OR REPLACE FUNCTION public.get_payment_public_key()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT mp_public_key FROM public.payment_gateway WHERE id = 1 LIMIT 1
$$;

UPDATE public.payment_gateway SET environment = 'production' WHERE id = 1;