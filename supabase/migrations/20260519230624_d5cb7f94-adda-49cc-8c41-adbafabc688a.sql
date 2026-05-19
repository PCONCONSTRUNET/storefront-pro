ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stock_decremented_at timestamptz;

CREATE OR REPLACE FUNCTION public.apply_order_stock_decrement(_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _items jsonb;
  _already timestamptz;
  _it jsonb;
  _pid text;
  _qty int;
  _updated int := 0;
BEGIN
  SELECT items, stock_decremented_at
    INTO _items, _already
  FROM public.orders
  WHERE id = _order_id
  FOR UPDATE;

  IF _items IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'order not found');
  END IF;

  IF _already IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  FOR _it IN SELECT * FROM jsonb_array_elements(_items)
  LOOP
    _pid := COALESCE(_it->>'productId', _it->>'product_id');
    _qty := COALESCE((_it->>'quantity')::int, 0);
    IF _pid IS NOT NULL AND _qty > 0 THEN
      UPDATE public.products
         SET stock = GREATEST(0, stock - _qty),
             updated_at = now()
       WHERE id = _pid;
      _updated := _updated + 1;
    END IF;
  END LOOP;

  UPDATE public.orders
     SET stock_decremented_at = now()
   WHERE id = _order_id;

  RETURN jsonb_build_object('ok', true, 'items_updated', _updated);
END;
$$;

REVOKE ALL ON FUNCTION public.apply_order_stock_decrement(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_order_stock_decrement(uuid) TO anon, authenticated, service_role;