CREATE OR REPLACE FUNCTION public.get_admin_auth_record(_email text)
RETURNS TABLE(email text, password_hash text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ac.email, ac.password_hash
  FROM public.admin_credentials ac
  WHERE lower(ac.email) = lower(trim(_email))
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.create_admin_session(_email text, _token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_sessions (email, token)
  VALUES (lower(trim(_email)), _token);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_session_record(_token text)
RETURNS TABLE(email text, expires_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.email, s.expires_at
  FROM public.admin_sessions s
  WHERE s.token = _token
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.delete_admin_session(_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_sessions
  WHERE token = _token;
END;
$$;