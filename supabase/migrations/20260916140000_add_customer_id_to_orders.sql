-- Adiciona coluna customer_id na tabela orders para vincular pedidos a clientes cadastrados.
-- E nullable pois pedidos manuais ou de clientes sem cadastro podem nao ter vinculo.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- Tambem adiciona a coluna delivery_status caso ainda nao exista
-- (usada pelo codigo mas pode estar faltando em alguns ambientes)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'pendente';
