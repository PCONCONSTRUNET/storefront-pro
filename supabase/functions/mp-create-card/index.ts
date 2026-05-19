// Cria um pagamento com Cartão (token gerado no front via SDK MP) e salva o pedido.
// POST /functions/v1/mp-create-card
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

import { loadGatewayConfig } from "../_shared/gateway.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST")
    return json({ error: "Método não permitido" }, 405);

  // MP_TOKEN/SANDBOX serão carregados da config do gateway abaixo.

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const customer = body.customer ?? {};
  const items = Array.isArray(body.items) ? body.items : [];
  const totals = body.totals ?? {};
  const card = body.card ?? {};

  if (!customer.name || !customer.email || !customer.phone) {
    return json({ error: "Dados do cliente incompletos" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const gateway = await loadGatewayConfig(supabase);
  const MP_TOKEN = gateway.access_token;

  if (!MP_TOKEN) {
    return json(
      { error: "Mercado Pago não configurado. Avise o lojista." },
      400,
    );
  }
  if (!card.token || !card.payment_method_id) {
    return json({ error: "Dados do cartão incompletos" }, 400);
  }

  // Aplica taxa de parcelamento configurada no admin (sempre recalcular no servidor)
  const subtotal = Number(totals.subtotal ?? 0);
  const discount = Number(totals.discount ?? 0);
  const shipping = Number(totals.shipping ?? 0);
  const baseTotal = Math.max(0, subtotal - discount + shipping);
  const maxInst = Math.max(1, Math.min(12, gateway.max_installments || 1));
  const requestedInst = Math.max(
    1,
    Math.min(maxInst, Number(card.installments ?? 1)),
  );
  const feePct =
    Number(gateway.installment_fees?.[String(requestedInst)] ?? 0) || 0;
  let fee = 0;
  if (feePct > 0 && baseTotal > 0) {
    const raw = Math.round(baseTotal * (feePct / 100) * 100) / 100;
    // garante que qualquer % de juros gere ao menos R$ 0,01 cobrado
    fee = Math.max(0.01, raw);
  }
  const total = Math.round((baseTotal + fee) * 100) / 100;


  if (total <= 0) return json({ error: "Total inválido" }, 400);

  // 1) Cria pedido
  const { data: order, error: insErr } = await supabase
    .from("orders")
    .insert({
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: String(customer.phone).replace(/\D/g, ""),
      customer_document: card.payer?.identification?.number ?? null,
      delivery_method: body.delivery ?? "entrega",
      address: body.address ?? null,
      notes: body.notes ?? null,
      items,
      subtotal,
      discount,
      shipping,
      total,
      payment_method: "card",
      payment_status: "pending",
    } as any)
    .select()
    .single();

  if (insErr || !order) {
    console.error("[mp-create-card] insert order:", insErr);
    return json({ error: "Falha ao criar pedido" }, 500);
  }


  const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mp-webhook`;

  const mpPayload: Record<string, unknown> = {
    transaction_amount: Number(total.toFixed(2)),
    token: card.token,
    description: `Pedido Princesa de Laços #${order.id.slice(0, 8)}`,
    installments: requestedInst,
    payment_method_id: card.payment_method_id,
    notification_url: webhookUrl,
    external_reference: order.id,
    payer: {
      email: customer.email,
      ...(card.payer?.identification
        ? { identification: card.payer.identification }
        : {}),
    },
    statement_descriptor: "PRINCESA LACOS",
  };
  if (card.issuer_id) mpPayload.issuer_id = card.issuer_id;

  const idempotencyKey = `${order.id}-${Date.now()}`;

  const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MP_TOKEN}`,
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(mpPayload),
  });

  const mpData = await mpRes.json();

  if (!mpRes.ok) {
    console.error("[mp-create-card] MP error:", mpRes.status, mpData);
    await supabase
      .from("orders")
      .update({ payment_status: "rejected" })
      .eq("id", order.id);
    return json(
      {
        error: mpData?.message || "Mercado Pago recusou o pagamento",
        details: mpData,
      },
      502,
    );
  }

  // status: approved | in_process | rejected | pending
  const statusMap: Record<string, string> = {
    approved: "approved",
    pending: "pending",
    in_process: "pending",
    rejected: "rejected",
    cancelled: "cancelled",
  };
  const newStatus = statusMap[mpData.status] ?? "pending";

  await supabase
    .from("orders")
    .update({
      mp_payment_id: String(mpData.id),
      payment_status: newStatus,
      paid_at:
        newStatus === "approved"
          ? (mpData.date_approved ?? new Date().toISOString())
          : null,
    })
    .eq("id", order.id);

  return json({
    order_id: order.id,
    mp_payment_id: mpData.id,
    status: newStatus,
    mp_status: mpData.status,
    status_detail: mpData.status_detail,
    total,
  });
});
