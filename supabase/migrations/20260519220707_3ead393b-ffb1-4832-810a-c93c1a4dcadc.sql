UPDATE public.orders
SET delivery_status = CASE
  WHEN payment_status::text = 'em_separacao' THEN 'em_separacao'
  WHEN payment_status::text = 'saiu_para_entrega' THEN 'saiu_para_entrega'
  WHEN payment_status::text IN ('concluido','entregue','delivered') THEN 'entregue'
  ELSE delivery_status
END,
payment_status = CASE
  WHEN payment_status::text IN ('em_separacao','saiu_para_entrega','concluido','entregue','delivered') THEN 'approved'::payment_status
  ELSE payment_status
END
WHERE payment_status::text IN ('em_separacao','saiu_para_entrega','concluido','entregue','delivered');