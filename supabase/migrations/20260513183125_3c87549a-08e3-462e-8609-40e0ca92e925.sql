
-- ============= ADMIN AUTH PRIVADA =============
CREATE TABLE IF NOT EXISTS public.admin_credentials (
  email text PRIMARY KEY,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
-- (sem policies → ninguém acessa exceto service_role)

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  token text PRIMARY KEY,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- bootstrap: senha atual "admin123" → hash bcrypt
-- gerado externamente; rounds=10
INSERT INTO public.admin_credentials (email, password_hash)
VALUES (
  'lucaspereirabn10@gmail.com',
  '$2b$10$XuoPbkTukCtAnwKw03AFWuvMBh6dOWzpXLRiaUCGkfjiZ4SyfOVQK'
)
ON CONFLICT (email) DO NOTHING;

-- ============= LOCKDOWN RLS =============

-- products: leitura pública / escrita só backend
DROP POLICY IF EXISTS "public write products" ON public.products;
DROP POLICY IF EXISTS "public update products" ON public.products;
DROP POLICY IF EXISTS "public delete products" ON public.products;

-- categories
DROP POLICY IF EXISTS "public write categories" ON public.categories;
DROP POLICY IF EXISTS "public update categories" ON public.categories;
DROP POLICY IF EXISTS "public delete categories" ON public.categories;

-- coupons (mantém leitura pública para validar no checkout)
DROP POLICY IF EXISTS "public write coupons" ON public.coupons;
DROP POLICY IF EXISTS "public update coupons" ON public.coupons;
DROP POLICY IF EXISTS "public delete coupons" ON public.coupons;

-- faq_items
DROP POLICY IF EXISTS "admin write faq" ON public.faq_items;
DROP POLICY IF EXISTS "admin update faq" ON public.faq_items;
DROP POLICY IF EXISTS "admin delete faq" ON public.faq_items;

-- store_settings (read público, write backend)
DROP POLICY IF EXISTS "public write store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "public update store_settings" ON public.store_settings;

-- reviews (read público, insert público para clientes postarem; update/delete só backend)
DROP POLICY IF EXISTS "public update reviews" ON public.reviews;
DROP POLICY IF EXISTS "public delete reviews" ON public.reviews;

-- affiliates (sem leitura/escrita pública — backend faz tudo via auth.functions e admin.functions)
DROP POLICY IF EXISTS "public read affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "public write affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "public update affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "public delete affiliates" ON public.affiliates;

-- affiliate_sales (totalmente privado)
DROP POLICY IF EXISTS "public read affiliate_sales" ON public.affiliate_sales;
DROP POLICY IF EXISTS "public write affiliate_sales" ON public.affiliate_sales;
DROP POLICY IF EXISTS "public update affiliate_sales" ON public.affiliate_sales;
DROP POLICY IF EXISTS "public delete affiliate_sales" ON public.affiliate_sales;

-- transactions (totalmente privado)
DROP POLICY IF EXISTS "public read transactions" ON public.transactions;
DROP POLICY IF EXISTS "public write transactions" ON public.transactions;
DROP POLICY IF EXISTS "public update transactions" ON public.transactions;
DROP POLICY IF EXISTS "public delete transactions" ON public.transactions;

-- customers (totalmente privado, backend gerencia via auth.functions)
DROP POLICY IF EXISTS "anyone can read customers" ON public.customers;
DROP POLICY IF EXISTS "anyone can insert customers" ON public.customers;
DROP POLICY IF EXISTS "anyone can update customers" ON public.customers;
DROP POLICY IF EXISTS "anyone can delete customers" ON public.customers;

-- orders: insert público (checkout sem login), leitura/edição backend
DROP POLICY IF EXISTS "anyone can read orders" ON public.orders;
DROP POLICY IF EXISTS "anyone can update orders" ON public.orders;
DROP POLICY IF EXISTS "anyone can delete orders" ON public.orders;

-- activity_logs: insert público (eventos básicos), leitura backend
DROP POLICY IF EXISTS "anyone can read logs" ON public.activity_logs;

-- product_waitlist: insert público (entrar na fila), leitura backend
DROP POLICY IF EXISTS "anyone can read waitlist" ON public.product_waitlist;
