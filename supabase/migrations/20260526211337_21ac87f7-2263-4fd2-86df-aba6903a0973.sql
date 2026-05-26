DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure::text AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public'
      AND p.proname IN (
        'admin_db_read','admin_db_write',
        'admin_save_payment_gateway','admin_get_payment_gateway',
        'get_admin_session_record','rotate_admin_session',
        'refresh_admin_session','delete_admin_session',
        'verify_admin_login','get_payment_gateway','save_payment_gateway'
      )
  LOOP
    EXECUTE 'GRANT EXECUTE ON FUNCTION ' || r.sig || ' TO service_role, authenticated, anon';
  END LOOP;
END $$;