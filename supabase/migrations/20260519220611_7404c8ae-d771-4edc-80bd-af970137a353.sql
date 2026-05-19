ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'pendente';

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_delivery_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_delivery_status_check
  CHECK (delivery_status IN ('pendente','em_separacao','saiu_para_entrega','entregue'));

CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON public.orders(delivery_status);