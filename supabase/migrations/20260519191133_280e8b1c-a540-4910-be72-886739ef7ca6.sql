INSERT INTO public.admin_credentials (email, password_hash, updated_at)
VALUES (
  'lucaspereirabn10@gmail.com',
  '$2b$10$OQx0DXrhhrq7ZFL1B/z3DejCjG7e8qmxXaAEiLxpuLgtvtdzCd.9y',
  now()
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    updated_at = now();