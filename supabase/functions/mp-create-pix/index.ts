// Cria um pagamento Pix no Mercado Pago e salva o pedido no Supabase.
// POST /functions/v1/mp-create-pix
// Body: { customer: {...}, items: [...], totals: {...}, delivery, address, notes }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";
import { loadGatewayConfig } from "../_shared/gateway.ts";
import { notifyNewOrderAdmin } from "../_shared/notify-approval.ts";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "../_shared/rate-limit.ts";

const pixBodySchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1).max(255),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(8).max(30),
    document: z.string().trim().max(20).optional().nullable(),
  }),
  items: z.array(z.record(z.string(), z.any())).min(1).max(200),
  totals: z.object({
    subtotal: z.number().min(0).max(1_000_000).optional(),
    discount: z.number().min(0).max(1_000_000).optional(),
    shipping: z.number().min(0).max(1_000_000).optional(),
    total: z.number().min(0.01).max(1_000_000),
  }),
  delivery: z.enum(["entrega", "retirada"]).optional(),
  address: z.string().trim().max(1000).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

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

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const parsed = pixBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return json(
      { error: "Dados inválidos", issues: parsed.error.issues.slice(0, 5) },
      400,
    );
  }
  const body = parsed.data;
  const customer = body.customer;
  const items = body.items;
  const totals = body.totals;
  const total = Number(totals.total);

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

  const shortId = Math.random().toString(36).substring(2, 7).toUpperCase();

  // 1) Cria pedido no banco
  const { data: order, error: insErr } = await supabase
    .from("orders")
    .insert({
      id: shortId,
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

  // Reserva o estoque imediatamente
  try {
    await supabase.rpc("apply_order_stock_decrement", {
      _order_id: order.id,
    });
  } catch (e) {
    console.error("[mp-create-pix] stock decrement falhou:", e);
  }

  await notifyNewOrderAdmin(supabase, order);

  // 2) Chama Mercado Pago
  const [firstName, ...rest] = String(customer.name).trim().split(/\s+/);
  const lastName = rest.join(" ") || firstName;

  const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mp-webhook`;

  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 24);

  const mpPayload = {
    transaction_amount: Number(total.toFixed(2)),
    description: `Pedido Princesa de Laços #${order.id.slice(0, 8)}`,
    payment_method_id: "pix",
    notification_url: webhookUrl,
    external_reference: order.id,
    date_of_expiration: expirationDate.toISOString(),
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
