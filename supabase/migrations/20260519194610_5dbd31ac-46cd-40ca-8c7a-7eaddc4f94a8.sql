CREATE OR REPLACE FUNCTION public.get_payment_installment_config()
RETURNS TABLE(max_installments integer, installment_fees jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT max_installments, installment_fees
  FROM public.payment_gateway WHERE id = 1 LIMIT 1
$$;