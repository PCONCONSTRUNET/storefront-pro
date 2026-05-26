// Cria um pagamento Pix no Mercado Pago e salva o pedido no Supabase.
// POST /functions/v1/mp-create-pix
// Body: { customer: {...}, items: [...], totals: {...}, delivery, address, notes }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { loadGatewayConfig } from "../_shared/gateway.ts";
import { notifyNewOrderAdmin } from "../_shared/notify-approval.ts";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "../_shared/rate-limit.ts";

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

  // Rate limit: 5 req/min por IP
  const ip = getClientIp(req);
  const rl = await checkRateLimit({
    bucket: "mp-create-pix",
    identifier: ip,
    maxRequests: 5,
    windowSeconds: 60,
  });
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds, corsHeaders);

  // MP_TOKEN/SANDBOX serão definidos após carregar a config do gateway abaixo.

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const customer = body.customer ?? {};
  const items = Array.isArray(body.items) ? body.items : [];
  const totals = body.totals ?? {};
  const total = Number(totals.total ?? 0);

  if (!customer.name || !customer.email || !customer.phone) {
    return json({ error: "Dados do cliente incompletos" }, 400);
  }
  if (total <= 0) return json({ error: "Total inválido" }, 400);

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
  if (!/^APP_USR-|^TEST-/.test(MP_TOKEN)) {
    console.error("[mp-create-pix] token Mercado Pago inválido/inesperado");
    return json(
      { error: "Token do Mercado Pago inválido. Revise o Access Token no painel admin." },
      400,
    );
  }

  // 1) Cria pedido no banco
  const { data: order, error: insErr } = await supabase
    .from("orders")
    .insert({
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: String(customer.phone).replace(/\D/g, ""),
      customer_document: customer.document ?? null,
      delivery_method: body.delivery ?? "entrega",
      address: body.address ?? null,
      notes: body.notes ?? null,
      items,
      subtotal: Number(totals.subtotal ?? 0),
      discount: Number(totals.discount ?? 0),
      shipping: Number(totals.shipping ?? 0),
      total,
      payment_method: "pix",
      payment_status: "pending",
    })
    .select()
    .single();

  if (insErr || !order) {
    console.error("[mp-create-pix] insert order:", insErr);
    return json({ error: "Falha ao criar pedido" }, 500);
  }

  await notifyNewOrderAdmin(supabase, order);

  // 2) Chama Mercado Pago
  const [firstName, ...rest] = String(customer.name).trim().split(/\s+/);
  const lastName = rest.join(" ") || firstName;

  const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mp-webhook`;

  const mpPayload = {
    transaction_amount: Number(total.toFixed(2)),
    description: `Pedido Princesa de Laços #${order.id.slice(0, 8)}`,
    payment_method_id: "pix",
    notification_url: webhookUrl,
    external_reference: order.id,
    payer: {
      email: customer.email,
      first_name: firstName,
      last_name: lastName,
      ...(customer.document
        ? {
            identification: {
              type: "CPF",
              number: String(customer.document).replace(/\D/g, ""),
            },
          }
        : {}),
    },
  };

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
    console.error("[mp-create-pix] MP error:", mpRes.status, mpData);
    await supabase
      .from("orders")
      .update({ payment_status: "rejected" })
      .eq("id", order.id);
    return json(
      { error: mpData?.message || "Mercado Pago recusou o pagamento", details: mpData },
      502,
    );
  }

  const td = mpData.point_of_interaction?.transaction_data ?? {};
  const expiresAt = mpData.date_of_expiration ?? null;

  await supabase
    .from("orders")
    .update({
      mp_payment_id: String(mpData.id),
      pix_qr_code: td.qr_code ?? null,
      pix_qr_code_base64: td.qr_code_base64 ?? null,
      pix_expires_at: expiresAt,
    })
    .eq("id", order.id);

  return json({
    order_id: order.id,
    mp_payment_id: mpData.id,
    qr_code: td.qr_code,
    qr_code_base64: td.qr_code_base64,
    ticket_url: td.ticket_url,
    expires_at: expiresAt,
    total,
  });
});
