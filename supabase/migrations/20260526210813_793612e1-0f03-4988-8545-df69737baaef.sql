
INSERT INTO public.admin_credentials (email, password_hash)
VALUES
  ('lucaspereirabn10@gmail.com', extensions.crypt('admin123', extensions.gen_salt('bf'))),
  ('jessicamendes-20@outlook.com', extensions.crypt('admin123', extensions.gen_salt('bf')))
ON CONFLICT (email) DO UPDATE
  SET password_hash = EXCLUDED.password_hash,
      updated_at = now();

-- Limpa sessões antigas desses e-mails (força login novo gerando cookie httpOnly)
DELETE FROM public.admin_sessions WHERE email IN ('lucaspereirabn10@gmail.com', 'jessicamendes-20@outlook.com');

-- Limpa rate limit de login pra evitar bloqueio na próxima tentativa
DELETE FROM public.rate_limits WHERE bucket = 'admin_login' AND identifier IN ('lucaspereirabn10@gmail.com', 'jessicamendes-20@outlook.com');
