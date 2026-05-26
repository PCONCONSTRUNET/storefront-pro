
-- 1) Encurta sessão admin para 24h (antes: 7 dias)
ALTER TABLE public.admin_sessions ALTER COLUMN expires_at SET DEFAULT (now() + interval '24 hours');

-- 2) Função para estender (sliding) a sessão admin a cada uso válido
CREATE OR REPLACE FUNCTION public.refresh_admin_session(_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.admin_sessions
  SET expires_at = now() + interval '24 hours'
  WHERE token = _token
    AND expires_at > now();
END;
$$;

-- 3) Limpa sessões expiradas (one-shot)
DELETE FROM public.admin_sessions WHERE expires_at < now();
