import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const errors: string[] = [];

    // Tentar apagar as tabelas relacionadas a pedidos, clientes e financeiro.
    // Ordem importa por conta de restrições de chaves estrangeiras (se não houver ON DELETE CASCADE)
    const tablesToClear = [
      "password_reset_tokens",
      "activity_logs",
      "product_waitlist",
      "payment_events",
      "transactions",
      "reviews",
      "orders",
      "affiliate_consignments",
      "affiliate_sales",
      "affiliate_credentials",
      "affiliates",
      "customer_credentials",
      "customers",
      "coupons"
    ];

    for (const table of tablesToClear) {
      // Como não usamos auth.users, podemos apenas limpar a tabela onde não é um ID inválido,
      // O que no Supabase delete sem eq() falha, então usamos .neq('id', 'null') ou similar
      // Algumas tabelas usam ID string, outras UUID. Para ser agnóstico:
      const { error } = await admin.from(table).delete().neq("id", "deletar_tudo");
      if (error) {
        console.error(`Erro ao limpar ${table}:`, error);
        errors.push(`${table}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.error("admin-limpeza-geral partial errors:", errors);
      return json({ success: false, errors }, 500);
    }

    return json({ success: true });
  } catch (err) {
    console.error("admin-limpeza-geral error", err);
    return json({ error: err instanceof Error ? err.message : "Erro interno" }, 500);
  }
});
