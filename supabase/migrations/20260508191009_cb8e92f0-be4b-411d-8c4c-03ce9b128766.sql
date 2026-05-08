
-- Customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  address TEXT,
  addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
  favorites JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert customers" ON public.customers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anyone can read customers" ON public.customers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone can update customers" ON public.customers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anyone can delete customers" ON public.customers FOR DELETE TO anon, authenticated USING (true);

-- Categories
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  image TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public write categories" ON public.categories FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update categories" ON public.categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public delete categories" ON public.categories FOR DELETE TO anon, authenticated USING (true);

-- Products
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  description TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  category_id TEXT,
  stock INT NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  variations JSONB NOT NULL DEFAULT '[]'::jsonb,
  extra JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public write products" ON public.products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update products" ON public.products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public delete products" ON public.products FOR DELETE TO anon, authenticated USING (true);

-- Coupons
CREATE TABLE public.coupons (
  code TEXT PRIMARY KEY,
  kind TEXT NOT NULL DEFAULT 'percent',
  value NUMERIC NOT NULL DEFAULT 0,
  min_subtotal NUMERIC NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  extra JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read coupons" ON public.coupons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public write coupons" ON public.coupons FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update coupons" ON public.coupons FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public delete coupons" ON public.coupons FOR DELETE TO anon, authenticated USING (true);

-- Affiliates
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  commission_type TEXT NOT NULL DEFAULT 'percent',
  commission_value NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read affiliates" ON public.affiliates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public write affiliates" ON public.affiliates FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update affiliates" ON public.affiliates FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public delete affiliates" ON public.affiliates FOR DELETE TO anon, authenticated USING (true);

-- Affiliate sales
CREATE TABLE public.affiliate_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  product_description TEXT NOT NULL,
  sale_value NUMERIC NOT NULL DEFAULT 0,
  commission_earned NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read affiliate_sales" ON public.affiliate_sales FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public write affiliate_sales" ON public.affiliate_sales FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update affiliate_sales" ON public.affiliate_sales FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public delete affiliate_sales" ON public.affiliate_sales FOR DELETE TO anon, authenticated USING (true);

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  affiliate_id UUID,
  product_summary TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read transactions" ON public.transactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public write transactions" ON public.transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update transactions" ON public.transactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public delete transactions" ON public.transactions FOR DELETE TO anon, authenticated USING (true);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  customer_id UUID,
  customer_name TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  comment TEXT,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public write reviews" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update reviews" ON public.reviews FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public delete reviews" ON public.reviews FOR DELETE TO anon, authenticated USING (true);

-- Store settings (singleton)
CREATE TABLE public.store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read store_settings" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public write store_settings" ON public.store_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update store_settings" ON public.store_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
INSERT INTO public.store_settings (id, data) VALUES (1, '{}'::jsonb) ON CONFLICT DO NOTHING;

-- Allow admin to update/delete orders
CREATE POLICY "anyone can update orders" ON public.orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anyone can delete orders" ON public.orders FOR DELETE TO anon, authenticated USING (true);

-- updated_at triggers
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER affiliates_updated_at BEFORE UPDATE ON public.affiliates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
