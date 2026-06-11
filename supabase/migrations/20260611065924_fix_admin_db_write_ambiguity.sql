CREATE OR REPLACE FUNCTION public.admin_db_write(
  _token text,
  _op text,
  _table text,
  _row jsonb DEFAULT NULL,
  _on_conflict text DEFAULT NULL,
  _match jsonb DEFAULT NULL,
  _patch jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _expires timestamptz;
  _allowed text[] := ARRAY[
    'customers','products','categories','coupons',
    'affiliates','affiliate_sales','affiliate_consignments',
    'transactions','reviews','store_settings','faq_items',
    'orders','activity_logs','product_waitlist'
  ];
  _sql text;
  _cols text;
  _vals text;
  _update_set text;
  _where text;
BEGIN
  -- 1. validar sessão admin
  SELECT email, expires_at INTO _email, _expires
  FROM public.admin_sessions
  WHERE token = _token
  LIMIT 1;

  IF _email IS NULL THEN
    RAISE EXCEPTION 'invalid admin session';
  END IF;
  IF _expires < now() THEN
    RAISE EXCEPTION 'admin session expired';
  END IF;

  -- 2. allowlist
  IF NOT (_table = ANY(_allowed)) THEN
    RAISE EXCEPTION 'table not allowed: %', _table;
  END IF;

  -- 3. executar operação
  IF _op = 'upsert' THEN
    IF _row IS NULL THEN RAISE EXCEPTION 'row required'; END IF;

    SELECT string_agg(quote_ident(k), ',') INTO _cols
    FROM jsonb_object_keys(_row) k;
    SELECT string_agg(format('(_pop).%I', k), ',') INTO _vals
    FROM jsonb_object_keys(_row) k;

    IF _on_conflict IS NOT NULL AND _on_conflict <> '' THEN
      SELECT string_agg(format('%I = EXCLUDED.%I', k, k), ', ') INTO _update_set
      FROM jsonb_object_keys(_row) k
      WHERE k <> _on_conflict;

      _sql := format(
        'WITH _pop AS (SELECT * FROM jsonb_populate_record(NULL::public.%I, $1)) '
        || 'INSERT INTO public.%I (%s) SELECT %s FROM _pop '
        || 'ON CONFLICT (%I) DO UPDATE SET %s',
        _table, _table, _cols, _vals, _on_conflict,
        COALESCE(NULLIF(_update_set, ''), format('%I = EXCLUDED.%I', _on_conflict, _on_conflict))
      );
    ELSE
      _sql := format(
        'WITH _pop AS (SELECT * FROM jsonb_populate_record(NULL::public.%I, $1)) '
        || 'INSERT INTO public.%I (%s) SELECT %s FROM _pop',
        _table, _table, _cols, _vals
      );
    END IF;

    EXECUTE _sql USING _row;
    RETURN jsonb_build_object('ok', true);

  ELSIF _op = 'update' THEN
    IF _patch IS NULL OR _match IS NULL THEN
      RAISE EXCEPTION 'patch and match required';
    END IF;

    SELECT string_agg(format('%I = (_pop).%I', k, k), ', ') INTO _update_set
    FROM jsonb_object_keys(_patch) k;
    -- Qualificando a coluna com alias t para evitar ambiguidade com _pop
    SELECT string_agg(format('t.%I::text = ($2->>%L)', k, k), ' AND ') INTO _where
    FROM jsonb_object_keys(_match) k;

    _sql := format(
      'WITH _pop AS (SELECT * FROM jsonb_populate_record(NULL::public.%I, $1)) '
      || 'UPDATE public.%I AS t SET %s FROM _pop WHERE %s',
      _table, _table, _update_set, _where
    );
    EXECUTE _sql USING _patch, _match;
    RETURN jsonb_build_object('ok', true);

  ELSIF _op = 'delete' THEN
    IF _match IS NULL THEN RAISE EXCEPTION 'match required'; END IF;

    -- Qualificando a coluna com alias t
    SELECT string_agg(format('t.%I::text = ($1->>%L)', k, k), ' AND ') INTO _where
    FROM jsonb_object_keys(_match) k;

    _sql := format('DELETE FROM public.%I AS t WHERE %s', _table, _where);
    EXECUTE _sql USING _match;
    RETURN jsonb_build_object('ok', true);

  ELSE
    RAISE EXCEPTION 'unknown op: %', _op;
  END IF;
END;
$$;
