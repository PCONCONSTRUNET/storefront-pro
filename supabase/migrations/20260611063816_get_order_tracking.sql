CREATE OR REPLACE FUNCTION public.get_order_tracking(_id text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
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
