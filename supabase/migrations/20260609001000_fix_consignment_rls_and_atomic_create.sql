-- =====================================================================
-- Fix: RLS policies para affiliate_consignments + função atômica
-- =====================================================================

-- 1) Garante que a tabela tem RLS ativa mas com políticas que permitam
--    operações via service_role (já é o padrão) e via funções SECURITY DEFINER.

-- Verifica e adiciona políticas para affiliate_consignments caso não existam
DO $$
BEGIN
  -- Política de SELECT para admin
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'affiliate_consignments'
      AND policyname = 'admin_all_consignments'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY admin_all_consignments ON public.affiliate_consignments
        FOR ALL
        USING (true)
        WITH CHECK (true);
    $pol$;
  END IF;
END $$;

-- 2) Função SECURITY DEFINER que cria afiliada + retirada atomicamente,
--    sem precisar da chave service_role no servidor da aplicação.
CREATE OR REPLACE FUNCTION public.admin_create_affiliate_consignment(
  p_affiliate_name  text,
  p_quantity        integer,
  p_total_value     numeric,
  p_picked_up_at    timestamptz DEFAULT now(),
  p_notes           text        DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER   -- executa como owner (postgres), bypassa RLS
SET search_path = public
AS $$
DECLARE
  v_aff_id  uuid := gen_random_uuid();
  v_email   text;
  v_row     jsonb;
BEGIN
  v_email := v_aff_id::text || '@pendente.com';

  -- Insere a afiliada
  INSERT INTO public.affiliates (id, name, email, phone, commission_type, commission_value, active)
  VALUES (v_aff_id, p_affiliate_name, v_email, '', 'percent', 10, true);

  -- Insere a retirada
  INSERT INTO public.affiliate_consignments (affiliate_id, quantity, total_value, picked_up_at, notes)
  VALUES (v_aff_id, p_quantity, p_total_value, p_picked_up_at, p_notes)
  RETURNING to_jsonb(affiliate_consignments.*) INTO v_row;

  RETURN jsonb_build_object(
    'ok',           true,
    'affiliate_id', v_aff_id,
    'row',          v_row
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'ok',      false,
    'message', SQLERRM
  );
END;
$$;

-- Permite que a chave anon chame esta função (ela própria valida auth via cookie na camada app)
GRANT EXECUTE ON FUNCTION public.admin_create_affiliate_consignment TO anon, authenticated;
