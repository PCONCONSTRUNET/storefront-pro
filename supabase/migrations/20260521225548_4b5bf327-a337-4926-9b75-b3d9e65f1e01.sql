
INSERT INTO public.admin_credentials (email, password_hash)
VALUES
  ('lucaspereirabn10@gmail.com', extensions.crypt('admin123', extensions.gen_salt('bf'))),
  ('jessicamendes-20@outlook.com', extensions.crypt('admin123', extensions.gen_salt('bf')))
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = now();
