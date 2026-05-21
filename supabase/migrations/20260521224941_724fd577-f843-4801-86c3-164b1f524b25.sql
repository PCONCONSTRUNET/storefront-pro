
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.verify_admin_login(_email text, _password text)
RETURNS TABLE(token text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
  v_email text;
  v_token text;
BEGIN
  SELECT ac.password_hash, ac.email
    INTO v_hash, v_email
  FROM public.admin_credentials ac
  WHERE lower(ac.email) = lower(trim(_email))
  LIMIT 1;

  IF v_hash IS NULL THEN
    RETURN;
  END IF;

  IF crypt(_password, v_hash) <> v_hash THEN
    RETURN;
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');
  PERFORM public.create_admin_session(v_email, v_token);

  RETURN QUERY SELECT v_token, v_email;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_admin_login(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_admin_login(text, text) TO anon, authenticated;
