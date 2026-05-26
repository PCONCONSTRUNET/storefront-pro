
DROP FUNCTION IF EXISTS public.get_admin_session_record(text);

CREATE FUNCTION public.get_admin_session_record(_token text)
RETURNS TABLE(email text, expires_at timestamptz, last_rotated_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.email, s.expires_at, s.last_rotated_at
  FROM public.admin_sessions s
  WHERE s.token = _token
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_admin_session_record(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_session_record(text) TO service_role;
