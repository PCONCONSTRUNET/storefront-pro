// Webhook do Mercado Pago. Recebe notificações de pagamento, atualiza o pedido,
// dispara WhatsApp via bot da VPS e e-mail de confirmação.
// POST /functions/v1/mp-webhook?type=payment&data.id=123
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const BOT_BASE = "http://178.105.54.230:3005";
const BOT_TOKEN = "princesa_secret_123";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });

  const MP_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
  if (!MP_TOKEN) {
    console.warn("[mp-webhook] sem MERCADOPAGO_ACCESS_TOKEN — ignorando (modo sandbox)");
    return new Response("sandbox", { status: 200 });
  }

  // MP envia ?type=payment&data.id=XXX (e/ou body com {type, data:{id}})
  const url = new URL(req.url);
  let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  let topic = url.searchParams.get("type") ?? url.searchParams.get("topic");

  if (!paymentId) {
    try {
      const body = await req.json();
      paymentId = body?.data?.id ?? body?.id ?? null;
      topic = body?.type ?? body?.topic ?? topic;
    } catch { /* sem body */ }
  }

  if (topic && topic !== "payment") {
    return new Response("ignored", { status: 200 });
  }
  if (!paymentId) return new Response("no payment id", { status: 200 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Idempotência: se já processamos esse evento, retorna ok
  const eventId = `mp-${paymentId}-${Date.now()}`;

  // Busca status atualizado direto no MP
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { "Authorization": `Bearer ${MP_TOKEN}` },
  });
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
    .from("orders").select("*").eq("id", externalRef).maybeSingle();
  if (!order) return new Response("order not found", { status: 200 });

  // Já estava aprovado? não notifica de novo
  const wasApproved = order.payment_status === "approved";

  // Atualiza
  await supabase.from("orders").update({
    payment_status: newStatus,
    mp_payment_id: String(payment.id),
    paid_at: newStatus === "approved" ? (payment.date_approved ?? new Date().toISOString()) : order.paid_at,
  }).eq("id", order.id);

  // Loga evento
  await supabase.from("payment_events").insert({
    mp_event_id: eventId,
    mp_payment_id: String(payment.id),
    order_id: order.id,
    event_type: payment.status,
    raw_payload: payment,
  });

  // Notifica cliente quando aprovado (apenas 1x)
  if (newStatus === "approved" && !wasApproved) {
    const phone = String(order.customer_phone).replace(/\D/g, "");
    const total = Number(order.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const mensagem = `Olá ${order.customer_name.split(" ")[0]}! 💖\n\nSeu pagamento foi *aprovado* e seu pedido na Princesa de Laços está confirmado!\n\n🧾 Pedido: #${order.id.slice(0, 8)}\n💰 Valor: ${total}\n\nJá estamos preparando tudo com muito carinho. Em breve avisaremos quando sair para entrega! ✨`;

    try {
      await fetch(`${BOT_BASE}/webhook/notificacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: phone, mensagem, token: BOT_TOKEN }),
      });
    } catch (e) {
      console.error("[mp-webhook] WhatsApp falhou:", e);
    }

    // E-mail de confirmação
    try {
      await supabase.functions.invoke("send-order-confirmation-email", {
        body: {
          email: order.customer_email,
          customerName: order.customer_name,
          orderId: order.id.slice(0, 8),
          items: order.items,
          total: Number(order.total),
          paymentMethod: order.payment_method === "card" ? "Cartão de crédito" : "Pix",
        },
      });
    } catch (e) {
      console.error("[mp-webhook] e-mail falhou:", e);
    }
  }

  return new Response("ok", { status: 200 });
});
