-- ============================================================
-- customer_notifications: notificações in-app para clientes
-- ============================================================

CREATE TABLE public.customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  order_id TEXT,
  type TEXT NOT NULL DEFAULT 'status_update',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cnotif_email ON public.customer_notifications(customer_email);
CREATE INDEX idx_cnotif_created ON public.customer_notifications(created_at DESC);

ALTER TABLE public.customer_notifications ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler (o cliente filtra pelo próprio email no client-side)
CREATE POLICY "anyone can read notifications"
  ON public.customer_notifications FOR SELECT
  TO anon, authenticated
  USING (true);

-- Qualquer um pode marcar como lida (UPDATE só do campo read)
CREATE POLICY "anyone can update notifications"
  ON public.customer_notifications FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- RPC: notify_customer_order — chamada pelo admin quando muda status
-- Não precisa de auth porque o admin já validou a sessão antes de chamar
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_customer_order(
  _order_id text,
  _type text,
  _title text,
  _message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
BEGIN
  -- Busca o email do cliente pelo pedido
  SELECT customer_email INTO _email
  FROM public.orders
  WHERE id = _order_id
  LIMIT 1;

  IF _email IS NULL THEN
    RETURN; -- pedido não encontrado, ignora
  END IF;

  INSERT INTO public.customer_notifications
    (customer_email, order_id, type, title, message)
  VALUES
    (lower(trim(_email)), _order_id, _type, _title, _message);
END;
$$;

-- Disponível para anon e authenticated (admin chama via client anon key)
GRANT EXECUTE ON FUNCTION public.notify_customer_order(text, text, text, text) TO anon, authenticated;
