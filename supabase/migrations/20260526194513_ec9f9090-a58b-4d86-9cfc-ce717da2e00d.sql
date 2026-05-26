
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  identifier text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 0,
  UNIQUE (bucket, identifier, window_start)
);

GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON public.rate_limits (bucket, identifier, window_start DESC);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _bucket text,
  _identifier text,
  _max_requests integer,
  _window_seconds integer
)
RETURNS TABLE(allowed boolean, current_count integer, retry_after_seconds integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _window_start timestamptz;
  _row public.rate_limits%rowtype;
BEGIN
  _window_start := date_trunc('second', now()) - (extract(epoch from now())::bigint % _window_seconds) * interval '1 second';

  -- Cleanup old windows (best-effort)
  DELETE FROM public.rate_limits
  WHERE window_start < now() - interval '1 day';

  INSERT INTO public.rate_limits (bucket, identifier, window_start, count)
  VALUES (_bucket, _identifier, _window_start, 1)
  ON CONFLICT (bucket, identifier, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING * INTO _row;

  IF _row.count > _max_requests THEN
    allowed := false;
    current_count := _row.count;
    retry_after_seconds := GREATEST(1, _window_seconds - extract(epoch from (now() - _row.window_start))::int);
  ELSE
    allowed := true;
    current_count := _row.count;
    retry_after_seconds := 0;
  END IF;
  RETURN NEXT;
END;
$$;
