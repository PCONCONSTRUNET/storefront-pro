-- Tabela privada para configuração do gateway Mercado Pago.
-- Sem políticas RLS = inacessível para anon/authenticated.
-- Leitura/escrita apenas via supabaseAdmin (service_role).

CREATE TABLE IF NOT EXISTS public.payment_gateway (
  id integer PRIMARY KEY DEFAULT 1,
  mp_access_token text,
  mp_public_key text,
  environment text NOT NULL DEFAULT 'sandbox',
  max_installments integer NOT NULL DEFAULT 3,
  installment_fees jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_gateway_singleton CHECK (id = 1),
  CONSTRAINT payment_gateway_environment CHECK (environment IN ('sandbox','production'))
);

ALTER TABLE public.payment_gateway ENABLE ROW LEVEL SECURITY;
-- nenhuma policy: anon/authenticated não conseguem ler nem escrever.

-- Linha singleton
INSERT INTO public.payment_gateway (id, environment, max_installments, installment_fees)
VALUES (1, 'sandbox', 3, '{"1":0,"2":0,"3":0}'::jsonb)
ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER payment_gateway_set_updated_at
BEFORE UPDATE ON public.payment_gateway
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();