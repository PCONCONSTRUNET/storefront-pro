
-- Waitlist for out-of-stock products
CREATE TABLE public.product_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  customer_id UUID,
  email TEXT NOT NULL,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can join waitlist" ON public.product_waitlist FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anyone can read waitlist" ON public.product_waitlist FOR SELECT TO anon, authenticated USING (true);

-- FAQ Items
CREATE TABLE public.faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read faq" ON public.faq_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write faq" ON public.faq_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin update faq" ON public.faq_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin delete faq" ON public.faq_items FOR DELETE TO anon, authenticated USING (true);

-- Activity Logs (Audit Logs)
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read logs" ON public.activity_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone can insert logs" ON public.activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
