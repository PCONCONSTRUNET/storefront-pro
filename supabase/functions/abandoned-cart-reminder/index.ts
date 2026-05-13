// Lembrete de carrinho abandonado:
// Pedidos Pix pendentes entre 2h e 24h sem pagamento → envia WhatsApp + e-mail.
// Roda via pg_cron a cada 1h.
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

const BOT_BASE = "http://178.105.54.230:3005";
const BOT_TOKEN = "princesa_secret_123";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const now = Date.now();
    const min = new Date(now - 24 * 60 * 60 * 1000).toISOString(); // 24h atrás
    const max = new Date(now - 2 * 60 * 60 * 1000).toISOString(); // 2h atrás

    const { data: pending, error } = await supabase
      .from("orders")
      .select("id, customer_name, customer_phone, customer_email, total, payment_method")
      .eq("payment_status", "pending")
      .is("reminder_sent_at", null)
      .gte("created_at", min)
      .lte("created_at", max)
      .limit(50);

    if (error) throw error;
    if (!pending || pending.length === 0) {
      return json({ ok: true, sent: 0 });
    }

    let sent = 0;
    for (const order of pending) {
      const firstName = String(order.customer_name ?? "Cliente").split(" ")[0];
      const total = Number(order.total).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      const orderShort = String(order.id).slice(0, 8);
      const method = order.payment_method === "pix" ? "Pix" : "pagamento";

      const mensagem = `Oi ${firstName}! 💖\n\nNotamos que seu pedido na Princesa de Laços ainda está aguardando ${method}.\n\n🧾 Pedido: #${orderShort}\n💰 Valor: ${total}\n\nConclua agora e garanta seus produtos antes que esgotem! ✨\n\nQualquer dúvida é só me chamar aqui 💕`;

      const phone = String(order.customer_phone ?? "").replace(/\D/g, "");
      if (phone) {
        try {
          await fetch(`${BOT_BASE}/webhook/notificacao`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numero: phone, mensagem, token: BOT_TOKEN }),
          });
        } catch (e) {
          console.error("[abandoned-cart] WhatsApp falhou:", e);
        }
      }

      // marca como enviado
      await supabase
        .from("orders")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", order.id);

      sent++;
    }

    // Avisa o admin
    try {
      await supabase.functions.invoke("send-push", {
        body: {
          title: "🛒 Lembretes de carrinho",
          message: `${sent} cliente(s) receberam lembrete de pedido pendente.`,
          url: "/admin/pedidos",
          audience: "admin",
        },
      });
    } catch (e) {
      console.error("[abandoned-cart] push admin falhou:", e);
    }

    return json({ ok: true, sent });
  } catch (e) {
    console.error("[abandoned-cart] erro:", e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
