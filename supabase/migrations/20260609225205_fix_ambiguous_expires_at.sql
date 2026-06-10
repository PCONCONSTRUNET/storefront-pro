-- Fix ambiguous column reference 'expires_at' in rotate_admin_session

CREATE OR REPLACE FUNCTION public.rotate_admin_session(_old_token text, _new_token text)
RETURNS TABLE(email text, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _expires timestamptz;
BEGIN
  UPDATE public.admin_sessions
     SET token = _new_token,
         last_rotated_at = now(),
         expires_at = now() + interval '24 hours'
   WHERE token = _old_token
     AND admin_sessions.expires_at > now()
  RETURNING admin_sessions.email, admin_sessions.expires_at
       INTO _email, _expires;

  IF _email IS NULL THEN
    RETURN;
  END IF;

  email := _email;
  expires_at := _expires;
  RETURN NEXT;
END;
$$;

-- Clean up expired sessions (cache/lixo antigo)
DELETE FROM public.admin_sessions WHERE expires_at < now();
