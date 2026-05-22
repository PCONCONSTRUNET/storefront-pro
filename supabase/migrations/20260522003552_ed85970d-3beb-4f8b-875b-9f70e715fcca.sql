-- Função que valida o token admin e LÊ a configuração do gateway.
CREATE OR REPLACE FUNCTION public.admin_get_payment_gateway(_token text)
RETURNS TABLE(
  mp_access_token text,
  mp_public_key text,
  environment text,
  max_installments integer,
  installment_fees jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _expires timestamptz;
BEGIN
  SELECT s.email, s.expires_at INTO _email, _expires
  FROM public.admin_sessions s WHERE s.token = _token LIMIT 1;
  IF _email IS NULL THEN RAISE EXCEPTION 'invalid admin session'; END IF;
  IF _expires < now() THEN RAISE EXCEPTION 'admin session expired'; END IF;

  RETURN QUERY
  SELECT g.mp_access_token, g.mp_public_key, g.environment, g.max_installments, g.installment_fees
  FROM public.payment_gateway g
  WHERE g.id = 1
  LIMIT 1;
END;
$$;

-- Função que valida o token admin e SALVA a configuração do gateway.
CREATE OR REPLACE FUNCTION public.admin_save_payment_gateway(
  _token text,
  _mp_access_token text,
  _mp_public_key text,
  _environment text,
  _max_installments integer,
  _installment_fees jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _expires timestamptz;
BEGIN
  SELECT s.email, s.expires_at INTO _email, _expires
  FROM public.admin_sessions s WHERE s.token = _token LIMIT 1;
  IF _email IS NULL THEN RAISE EXCEPTION 'invalid admin session'; END IF;
  IF _expires < now() THEN RAISE EXCEPTION 'admin session expired'; END IF;

  INSERT INTO public.payment_gateway (id, mp_access_token, mp_public_key, environment, max_installments, installment_fees, updated_at)
  VALUES (1, NULLIF(_mp_access_token, ''), NULLIF(_mp_public_key, ''), _environment, _max_installments, _installment_fees, now())
  ON CONFLICT (id) DO UPDATE SET
    mp_access_token = EXCLUDED.mp_access_token,
    mp_public_key   = EXCLUDED.mp_public_key,
    environment     = EXCLUDED.environment,
    max_installments = EXCLUDED.max_installments,
    installment_fees = EXCLUDED.installment_fees,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_payment_gateway(text) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_get_payment_gateway(text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_save_payment_gateway(text, text, text, text, integer, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_save_payment_gateway(text, text, text, text, integer, jsonb) TO anon, authenticated;