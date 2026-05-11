// Simulador para SANDBOX: marca um pedido como aprovado e dispara
// WhatsApp + e-mail, exatamente como o webhook real faria.
// POST /functions/v1/mp-simulate-approve  Body: { order_id }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { notifyOrderApproved } from "../_shared/notify-approval.ts";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST")
    return json({ error: "Método não permitido" }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }
  const orderId = body?.order_id;
  if (!orderId) return json({ error: "order_id obrigatório" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !order) return json({ error: "Pedido não encontrado" }, 404);

  if (order.payment_status === "approved") {
    return json({ ok: true, already_approved: true });
  }

  await supabase
    .from("orders")
    .update({
      payment_status: "approved",
      paid_at: new Date().toISOString(),
      mp_payment_id: order.mp_payment_id ?? `SANDBOX-${Date.now()}`,
    })
    .eq("id", order.id);

  await supabase.from("payment_events").insert({
    mp_event_id: `sandbox-${order.id}-${Date.now()}`,
    mp_payment_id: order.mp_payment_id ?? `SANDBOX-${Date.now()}`,
    order_id: order.id,
    event_type: "approved",
    raw_payload: { simulated: true },
  });

  await notifyOrderApproved(supabase, { ...order, payment_status: "approved" });

  return json({ ok: true, order_id: order.id });
});
