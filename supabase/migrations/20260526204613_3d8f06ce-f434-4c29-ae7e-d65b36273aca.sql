
ALTER TABLE public.admin_sessions
  ADD COLUMN IF NOT EXISTS last_rotated_at timestamptz NOT NULL DEFAULT now();

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
     AND expires_at > now()
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

CREATE OR REPLACE FUNCTION public.verify_admin_login(_email text, _password text)
RETURNS TABLE(token text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_hash text;
  v_email text;
  v_token text;
  v_rl record;
BEGIN
  -- Rate limit: 5 tentativas por 5 minutos por e-mail (normalizado)
  SELECT * INTO v_rl FROM public.check_rate_limit(
    'admin_login',
    lower(trim(_email)),
    5,
    300
  );
  IF NOT v_rl.allowed THEN
    RAISE EXCEPTION 'rate_limited: tente novamente em % segundos', v_rl.retry_after_seconds
      USING ERRCODE = 'P0001';
  END IF;

  SELECT ac.password_hash, ac.email
    INTO v_hash, v_email
  FROM public.admin_credentials ac
  WHERE lower(ac.email) = lower(trim(_email))
  LIMIT 1;

  IF v_hash IS NULL THEN
    RETURN;
  END IF;

  IF extensions.crypt(_password, v_hash) <> v_hash THEN
    RETURN;
  END IF;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  PERFORM public.create_admin_session(v_email, v_token);

  RETURN QUERY SELECT v_token, v_email;
END;
$$;
