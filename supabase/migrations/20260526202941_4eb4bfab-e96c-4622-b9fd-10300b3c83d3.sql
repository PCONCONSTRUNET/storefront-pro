
-- 1. Bloquear acesso anônimo às funções que retornam password_hash
REVOKE EXECUTE ON FUNCTION public.get_admin_auth_record(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_customer_auth_record(text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.get_admin_auth_record(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_customer_auth_record(text) TO service_role;

-- 2. Criar verify_customer_login (espelho do verify_admin_login) — valida bcrypt no banco
-- Usa extension pgcrypto/bcrypt já presente (extensions.crypt)
CREATE OR REPLACE FUNCTION public.verify_customer_login(_email text, _password text)
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  phone text,
  address text,
  addresses jsonb,
  favorites jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_hash text;
  v_id uuid;
BEGIN
  SELECT c.id, cc.password_hash
    INTO v_id, v_hash
  FROM public.customers c
  JOIN public.customer_credentials cc ON cc.customer_id = c.id
  WHERE lower(c.email) = lower(trim(_email))
  LIMIT 1;

  IF v_hash IS NULL THEN
    RETURN;
  END IF;

  -- bcrypt verify (suporta tanto crypt() quanto hashes bcrypt do bcryptjs com prefixo $2a/$2b)
  IF extensions.crypt(_password, v_hash) <> v_hash THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT c.id, c.name, c.email, c.phone, c.address, c.addresses, c.favorites, c.created_at
  FROM public.customers c
  WHERE c.id = v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_customer_login(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_customer_login(text, text) TO service_role;

-- 3. Restringir RPCs administrativas para service_role (já validam token internamente,
-- mas não há razão para serem chamáveis com a anon key)
REVOKE EXECUTE ON FUNCTION public.admin_db_write(text, text, text, jsonb, text, jsonb, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_db_read(text, text, integer, text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_save_payment_gateway(text, text, text, text, integer, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_get_payment_gateway(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.create_admin_session(text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_admin_session_record(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.delete_admin_session(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.refresh_admin_session(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.save_payment_gateway(text, text, text, integer, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_payment_gateway() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.create_customer_with_password_hash(text, text, text, text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_customer_password_hash(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.apply_order_stock_decrement(uuid) FROM anon, authenticated, public;

GRANT EXECUTE ON FUNCTION public.admin_db_write(text, text, text, jsonb, text, jsonb, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_db_read(text, text, integer, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_save_payment_gateway(text, text, text, text, integer, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_payment_gateway(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_admin_session(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_session_record(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_admin_session(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_admin_session(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.save_payment_gateway(text, text, text, integer, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_payment_gateway() TO service_role;
GRANT EXECUTE ON FUNCTION public.create_customer_with_password_hash(text, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_customer_password_hash(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_order_stock_decrement(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_admin_login(text, text) TO service_role;

-- verify_admin_login pode continuar acessível ao anon (é o login do admin pelo cliente)
-- mas como agora chamamos via server fn (service_role), também revogamos
REVOKE EXECUTE ON FUNCTION public.verify_admin_login(text, text) FROM anon, authenticated, public;

-- 4. Restringir consume_password_reset_token (só servidor)
REVOKE EXECUTE ON FUNCTION public.consume_password_reset_token(text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.consume_password_reset_token(text) TO service_role;

-- 5. Restringir check_rate_limit (só servidor)
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) TO service_role;

-- 6. password_reset_tokens — remover SELECT público (token só é consumido via RPC server-side)
DROP POLICY IF EXISTS "anyone can read by token" ON public.password_reset_tokens;
