import { sendEmail, baseLayout } from "./resend.ts";

export type OrderConfirmationItem = {
  name: string;
  quantity: number;
  price: number;
};

export type OrderConfirmationPayload = {
  email: string;
  customerName?: string;
  orderId: string;
  items: OrderConfirmationItem[] | unknown;
  total: number;
  paymentMethod?: string;
};

function normalizeItems(raw: unknown): OrderConfirmationItem[] {
  if (Array.isArray(raw)) {
    return raw.map((i) => ({
      name: String(i?.name ?? "Produto"),
      quantity: Number(i?.quantity ?? 1),
      price: Number(i?.price ?? 0),
    }));
  }
  if (typeof raw === "string") {
    try {
      return normalizeItems(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  return [];
}

export function buildOrderConfirmationHtml(
  payload: OrderConfirmationPayload & { items: OrderConfirmationItem[] },
): string {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const shortId = String(payload.orderId).slice(0, 8);
  const rows = payload.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f3e8ee">${i.name} <span style="color:#999">×${i.quantity}</span></td>
        <td style="padding:8px 0;border-bottom:1px solid #f3e8ee;text-align:right">${fmt(i.price * i.quantity)}</td>
      </tr>`,
    )
    .join("");

  return baseLayout(
    "Pagamento e pedido aprovados! 🎉",
    `<p>Oi${payload.customerName ? ` ${payload.customerName}` : ""}, recebemos seu pagamento e seu pedido já está confirmado! 💖</p>
       <p style="margin:16px 0;color:#555"><strong>Pedido:</strong> #${shortId}${payload.paymentMethod ? `<br><strong>Pagamento:</strong> ${payload.paymentMethod}` : ""}</p>
       <table style="width:100%;border-collapse:collapse;margin-top:8px">
         ${rows}
         <tr>
           <td style="padding:14px 0;font-weight:bold;font-size:16px">Total</td>
           <td style="padding:14px 0;font-weight:bold;font-size:16px;text-align:right;color:#be185d">${fmt(payload.total)}</td>
         </tr>
       </table>
       <div style="margin-top:24px;padding:14px 16px;background:#fff5f8;border:1px solid #fce7f3;border-radius:12px">
         <p style="margin:0;font-size:14px;color:#be185d;font-weight:600">📍 Aguardando retirada no ateliê</p>
         <p style="margin:6px 0 0;font-size:13px;color:#555">Como nossos produtos já são prontos, seu pedido está disponível para retirada no ateliê. Te avisaremos pelo WhatsApp para combinar o melhor horário. ✨</p>
       </div>
       <p style="margin-top:18px">Obrigada pela compra!</p>`,
  );
}

export function buildAdminOrderAlertHtml(
  payload: OrderConfirmationPayload & { items: OrderConfirmationItem[] },
): string {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const shortId = String(payload.orderId).slice(0, 8);
  const rows = payload.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f3e8ee">${i.name} <span style="color:#999">×${i.quantity}</span></td>
        <td style="padding:8px 0;border-bottom:1px solid #f3e8ee;text-align:right">${fmt(i.price * i.quantity)}</td>
      </tr>`,
    )
    .join("");

  return baseLayout(
    "Nova Venda Aprovada! 💰",
    `<p>O pedido <strong>#${shortId}</strong> do cliente <strong>${payload.customerName || payload.email}</strong> acabou de ter o pagamento aprovado.</p>
       <p style="margin:16px 0;color:#555"><strong>Pagamento:</strong> ${payload.paymentMethod || "Não informado"}</p>
       <table style="width:100%;border-collapse:collapse;margin-top:8px">
         ${rows}
         <tr>
           <td style="padding:14px 0;font-weight:bold;font-size:16px">Total</td>
           <td style="padding:14px 0;font-weight:bold;font-size:16px;text-align:right;color:#be185d">${fmt(payload.total)}</td>
         </tr>
       </table>
       <div style="margin-top:24px;text-align:center;">
         <a href="https://princesadelacos.com.br/admin" style="background:#be185d;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Acessar Painel Admin</a>
       </div>`,
  );
}

export async function sendOrderConfirmationEmailDirect(
  payload: OrderConfirmationPayload,
) {
  const items = normalizeItems(payload.items);
  if (!payload.email || !payload.orderId || items.length === 0) {
    throw new Error("dados incompletos");
  }

  const shortId = String(payload.orderId).slice(0, 8);
  
  // 1. Envia para o cliente
  await sendEmail({
    to: payload.email,
    subject: `Pedido aprovado #${shortId} — pronto para retirada`,
    html: buildOrderConfirmationHtml({ ...payload, items }),
  });

  // 2. Envia para a dona (E-mail mãe)
  const adminEmail = Deno.env.get("ADMIN_EMAIL") || "jessicamendes-20@outlook.com";
  try {
    await sendEmail({
      to: adminEmail,
      subject: `[Venda] Pedido aprovado #${shortId} - Cliente: ${payload.customerName || payload.email}`,
      html: buildAdminOrderAlertHtml({ ...payload, items }),
    });
    console.log(`[push] E-mail admin enviado para ${adminEmail}`);
  } catch (err) {
    console.error("[push] Erro ao enviar e-mail admin", err);
  }
}

type ActivityLogClient = {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (
        col: string,
        val: string,
      ) => {
        eq: (
          col: string,
          val: string,
        ) => {
          limit: (n: number) => {
            maybeSingle: () => Promise<{ data: { id: string } | null }>;
          };
        };
      };
    };
    insert: (row: Record<string, unknown>) => Promise<unknown>;
  };
};

/** Evita envio duplicado quando webhook + polling do cliente disparam juntos. */
export async function orderConfirmationEmailAlreadySent(
  supabase: ActivityLogClient,
  orderId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("activity_logs")
    .select("id")
    .eq("action", "order_confirmation_email_sent")
    .eq("metadata->>order_id", orderId)
    .limit(1)
    .maybeSingle();
  return !!data?.id;
}

export async function markOrderConfirmationEmailSent(
  supabase: ActivityLogClient,
  orderId: string,
  email: string,
) {
  await supabase.from("activity_logs").insert({
    action: "order_confirmation_email_sent",
    category: "order",
    description: `E-mail de confirmação enviado para ${email}`,
    metadata: { order_id: orderId, email },
  });
}

export async function sendOrderConfirmationEmailOnce(
  supabase: ActivityLogClient,
  payload: OrderConfirmationPayload,
) {
  if (await orderConfirmationEmailAlreadySent(supabase, payload.orderId)) {
    return { sent: false, skipped: true as const };
  }

  await sendOrderConfirmationEmailDirect(payload);
  await markOrderConfirmationEmailSent(
    supabase,
    payload.orderId,
    payload.email,
  );
  return { sent: true, skipped: false as const };
}
