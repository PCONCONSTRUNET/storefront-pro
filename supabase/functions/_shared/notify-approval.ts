// Dispara WhatsApp + e-mail quando um pedido é aprovado.
// Usado pelo webhook do MP e pelo simulador de sandbox.
const BOT_BASE = "http://178.105.54.230:3005";
const BOT_TOKEN = "princesa_secret_123";

type SupabaseClient = { functions: { invoke: (n: string, opts: any) => Promise<any> } };

export async function notifyOrderApproved(supabase: SupabaseClient, order: any) {
  const phone = String(order.customer_phone ?? "").replace(/\D/g, "");
  const total = Number(order.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const firstName = String(order.customer_name ?? "Cliente").split(" ")[0];
  const method = order.payment_method === "card" ? "Cartão de crédito" : "Pix";

  const mensagem = `Olá ${firstName}! 💖\n\nSeu pagamento foi *aprovado* e seu pedido na Princesa de Laços está confirmado!\n\n🧾 Pedido: #${String(order.id).slice(0, 8)}\n💳 Forma: ${method}\n💰 Valor: ${total}\n\n📍 Como nossos produtos já são prontos, seu pedido está *aguardando retirada no ateliê*. Vamos te chamar por aqui para combinar o melhor horário! ✨`;

  // WhatsApp via VPS
  if (phone) {
    try {
      await fetch(`${BOT_BASE}/webhook/notificacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: phone, mensagem, token: BOT_TOKEN }),
      });
    } catch (e) {
      console.error("[notify-approval] WhatsApp falhou:", e);
    }
  }

  // E-mail de confirmação
  if (order.customer_email) {
    try {
      await supabase.functions.invoke("send-order-confirmation-email", {
        body: {
          email: order.customer_email,
          customerName: order.customer_name,
          orderId: String(order.id).slice(0, 8),
          items: order.items,
          total: Number(order.total),
          paymentMethod: method,
        },
      });
    } catch (e) {
      console.error("[notify-approval] e-mail falhou:", e);
    }
  }
}
