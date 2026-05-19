CREATE OR REPLACE FUNCTION public.save_payment_gateway(
  _mp_access_token text,
  _mp_public_key text,
  _environment text,
  _max_installments integer,
  _installment_fees jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.payment_gateway (id, mp_access_token, mp_public_key, environment, max_installments, installment_fees, updated_at)
  VALUES (1, NULLIF(_mp_access_token, ''), NULLIF(_mp_public_key, ''), _environment, _max_installments, _installment_fees, now())
  ON CONFLICT (id) DO UPDATE SET
    mp_access_token = EXCLUDED.mp_access_token,
    mp_public_key = EXCLUDED.mp_public_key,
    environment = EXCLUDED.environment,
    max_installments = EXCLUDED.max_installments,
    installment_fees = EXCLUDED.installment_fees,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_payment_gateway()
RETURNS TABLE(mp_access_token text, mp_public_key text, environment text, max_installments integer, installment_fees jsonb)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT mp_access_token, mp_public_key, environment, max_installments, installment_fees
  FROM public.payment_gateway WHERE id = 1 LIMIT 1
$$;