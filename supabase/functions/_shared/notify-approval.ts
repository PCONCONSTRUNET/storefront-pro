// Dispara e-mail e push quando um pedido é aprovado.
// Usado pelo webhook do MP.
import {
  sendOrderConfirmationEmailOnce,
} from "./order-confirmation-email.ts";


type SupabaseClient = {
  functions: { invoke: (n: string, opts: any) => Promise<any> };
  from: (table: string) => any;
};

function formatTotal(order: { total: number | string }) {
  return Number(order.total).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Push para admin quando um pedido entra (Pix pendente ou cartão em análise). */
export async function notifyNewOrderAdmin(
  supabase: SupabaseClient,
  order: { id: string; customer_name: string; total: number | string },
) {
  const total = formatTotal(order);
  const shortId = String(order.id).slice(0, 8);
  try {
    await supabase.functions.invoke("send-push", {
      body: {
        title: "🛍️ Novo pedido!",
        message: `${order.customer_name} fez um pedido de ${total} (#${shortId}).`,
        url: "/admin/pedidos",
        audience: "admin",
      },
    });
  } catch (e) {
    console.error("[notify-new-order] push admin falhou:", e);
  }
}

export async function notifyOrderApproved(
  supabase: SupabaseClient,
  order: any,
) {
  console.log("[notify-approval] start order=", order.id, "email=", order.customer_email);
  const total = formatTotal(order);
  const firstName = String(order.customer_name ?? "Cliente").split(" ")[0];
  const method = order.payment_method === "card" ? "Cartão de crédito" : "Pix";


  // E-mail de confirmação (Resend direto — invoke entre edge functions falha em produção)
  if (order.customer_email) {
    try {
      const emailResult = await sendOrderConfirmationEmailOnce(supabase, {
        email: order.customer_email,
        customerName: order.customer_name,
        orderId: String(order.id),
        items: order.items,
        total: Number(order.total),
        paymentMethod: method,
      });
      console.log("[notify-approval] e-mail:", JSON.stringify(emailResult));
    } catch (e) {
      console.error("[notify-approval] e-mail falhou:", e);
    }
  }

  // Push notification — admin (sempre)
  console.log("[notify-approval] enviando push admin para pedido", order.id);
  try {
    const adminRes = await supabase.functions.invoke("send-push", {
      body: {
        title: "Pagamento aprovado ✨",
        message: `Pedido #${String(order.id).slice(0, 8)} de ${firstName} (${total}) confirmado.`,
        url: "/admin/pedidos",
        audience: "admin",
      },
    });
    console.log("[notify-approval] push admin response:", JSON.stringify(adminRes));
  } catch (e) {
    console.error("[notify-approval] push admin falhou:", e);
  }

  // Push notification — cliente (busca customer.id pelo e-mail)
  let customerId: string | null = order.customer_id ?? null;
  if (!customerId && order.customer_email) {
    try {
      const { data: cust } = await (supabase as any)
        .from("customers")
        .select("id")
        .eq("email", String(order.customer_email).toLowerCase().trim())
        .maybeSingle();
      customerId = cust?.id ?? null;
    } catch (e) {
      console.error("[notify-approval] lookup customer falhou:", e);
    }
  }

  console.log("[notify-approval] customerId para push cliente:", customerId);
  if (customerId) {
    try {
      const cliRes = await supabase.functions.invoke("send-push", {
        body: {
          title: "Pagamento aprovado 💖",
          message: `Seu pedido #${String(order.id).slice(0, 8)} foi confirmado e está aguardando retirada no ateliê.`,
          url: `/pedido/${order.id}`,
          externalUserIds: [String(customerId)],
        },
      });
      console.log("[notify-approval] push cliente response:", JSON.stringify(cliRes));
    } catch (e) {
      console.error("[notify-approval] push cliente falhou:", e);
    }
  }
}
