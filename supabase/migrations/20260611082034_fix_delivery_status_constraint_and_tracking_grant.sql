-- 1. Expandir o CHECK constraint para incluir 'postado_correios'
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_delivery_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_delivery_status_check
  CHECK (delivery_status IN ('pendente','em_separacao','postado_correios','saiu_para_entrega','entregue'));

-- 2. Recriar o get_order_tracking com GRANT correto para anon
CREATE OR REPLACE FUNCTION public.get_order_tracking(_id text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'status', payment_status,
    'deliveryStatus', delivery_status,
    'trackingCode', tracking_code,
    'notes', notes
  )
  FROM public.orders
  WHERE id = _id;
$$;

-- Garantir que usuários anônimos (clientes sem login) possam chamar esta função
REVOKE ALL ON FUNCTION public.get_order_tracking(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_tracking(text) TO anon, authenticated;
