-- Ativa o Row Level Security para evitar os avisos "Síndrome das Pernas Inquietas" do Supabase.
-- Como essas tabelas são acessadas apenas pelo backend via supabaseAdmin (service_role),
-- não é necessário criar policies de acesso para os usuários normais. Apenas ativar o RLS já resolve a segurança.

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_consignments ENABLE ROW LEVEL SECURITY;
