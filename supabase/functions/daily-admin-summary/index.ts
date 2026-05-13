// Resumo diário do admin (push + push detalhado).
// Roda via pg_cron todo dia às 23h (UTC = 20h BRT).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // Janela: últimas 24h (do horário de execução)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, total, payment_status, created_at")
      .gte("created_at", since);

    if (error) throw error;

    const list = orders ?? [];
    const total = list.length;
    const approved = list.filter((o) => o.payment_status === "approved");
    const pending = list.filter((o) => o.payment_status === "pending");
    const expired = list.filter((o) => o.payment_status === "expired");
    const revenue = approved.reduce((acc, o) => acc + Number(o.total ?? 0), 0);

    const message =
      total === 0
        ? "Nenhum pedido nas últimas 24h. Bora movimentar a loja! ✨"
        : `📦 ${total} pedido(s) | ✅ ${approved.length} pago(s) (${brl(revenue)}) | ⏳ ${pending.length} pendente(s) | ⏱️ ${expired.length} expirado(s)`;

    await supabase.functions.invoke("send-push", {
      body: {
        title: "📊 Resumo do dia — Princesa de Laços",
        message,
        url: "/admin/dashboard",
        audience: "admin",
      },
    });

    return json({
      ok: true,
      total,
      approved: approved.length,
      pending: pending.length,
      expired: expired.length,
      revenue,
    });
  } catch (e) {
    console.error("[daily-admin-summary] erro:", e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
