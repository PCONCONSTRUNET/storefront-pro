// Webhook do Mercado Pago. Recebe notificações de pagamento, atualiza o pedido,
// dispara WhatsApp via bot da VPS e e-mail de confirmação.
// POST /functions/v1/mp-webhook?type=payment&data.id=123
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { loadGatewayConfig } from "../_shared/gateway.ts";
import { notifyOrderApproved } from "../_shared/notify-approval.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });

  // MP envia ?type=payment&data.id=XXX (e/ou body com {type, data:{id}})
  const url = new URL(req.url);
  let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  let topic = url.searchParams.get("type") ?? url.searchParams.get("topic");

  if (!paymentId) {
    try {
      const body = await req.json();
      paymentId = body?.data?.id ?? body?.id ?? null;
      topic = body?.type ?? body?.topic ?? topic;
    } catch {
      /* sem body */
    }
  }

  if (topic && topic !== "payment") {
    return new Response("ignored", { status: 200 });
  }
  if (!paymentId) return new Response("no payment id", { status: 200 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const gateway = await loadGatewayConfig(supabase);
  const MP_TOKEN = gateway.access_token;
  if (!MP_TOKEN) {
    console.warn("[mp-webhook] sem token configurado — ignorando (sandbox)");
    return new Response("sandbox", { status: 200 });
  }

  // Idempotência: se já processamos esse evento, retorna ok
  const eventId = `mp-${paymentId}-${Date.now()}`;

  // Busca status atualizado direto no MP
  const mpRes = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: { Authorization: `Bearer ${MP_TOKEN}` },
    },
  );
  if (!mpRes.ok) {
    console.error("[mp-webhook] MP fetch falhou:", mpRes.status);
    return new Response("mp error", { status: 200 }); // 200 pra MP não reenviar infinito
  }
  const payment = await mpRes.json();
  const externalRef: string | undefined = payment.external_reference;

  if (!externalRef) return new Response("no ref", { status: 200 });

  // Mapeia status
  const statusMap: Record<string, string> = {
    approved: "approved",
    pending: "pending",
    in_process: "pending",
    rejected: "rejected",
    cancelled: "cancelled",
    refunded: "refunded",
    charged_back: "refunded",
  };
  const newStatus = statusMap[payment.status] ?? "pending";

  // Busca pedido
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", externalRef)
    .maybeSingle();
  if (!order) return new Response("order not found", { status: 200 });

  // Atualiza de forma atômica: só "ganha" a notificação o webhook que
  // realmente transicionou o status para approved (evita duplicidade
  // quando o Mercado Pago reenvia notificações em paralelo).
  const shouldApprove = newStatus === "approved";
  const baseUpdate = {
    payment_status: newStatus,
    mp_payment_id: String(payment.id),
    paid_at:
      newStatus === "approved"
        ? (payment.date_approved ?? new Date().toISOString())
        : order.paid_at,
  };

  const updateRes = shouldApprove
    ? await supabase
        .from("orders")
        .update(baseUpdate)
        .eq("id", order.id)
        .neq("payment_status", "approved")
        .select("id")
    : await supabase
        .from("orders")
        .update(baseUpdate)
        .eq("id", order.id)
        .select("id");

  const justApproved = shouldApprove && (updateRes.data?.length ?? 0) > 0;

  if (justApproved) {
    const productSummary = Array.isArray(order.items)
      ? order.items
          .map((item: any) => `${Number(item.quantity ?? 1)}x ${item.name ?? item.productId ?? "Produto"}`)
          .join(", ")
      : null;

    await supabase.from("transactions").upsert({
      id: order.id,
      kind: "entrada",
      category: "venda",
      description: `Pedido ${order.id} — ${order.customer_name}`,
      amount: order.total,
      date: payment.date_approved ?? new Date().toISOString(),
      product_summary: productSummary,
      notes: `Mercado Pago: ${payment.id}`,
    });

    await supabase.from("activity_logs").insert({
      action: "payment_approved",
      category: "order",
      description: `Pagamento aprovado do pedido ${order.id} — ${order.customer_name}`,
      metadata: {
        order_id: order.id,
        mp_payment_id: String(payment.id),
        total: Number(order.total),
      },
    });
  }

  // Loga evento
  await supabase.from("payment_events").insert({
    mp_event_id: eventId,
    mp_payment_id: String(payment.id),
    order_id: order.id,
    event_type: payment.status,
    raw_payload: payment,
  });

  // Notifica cliente + admin quando aprovado (apenas 1x — claim atômico acima)
  if (justApproved) {
    try {
      await supabase.rpc("apply_order_stock_decrement", { _order_id: order.id });
    } catch (e) {
      console.error("[mp-webhook] stock decrement falhou:", e);
    }
    await notifyOrderApproved(supabase, order);
  }

  return new Response("ok", { status: 200 });
});
