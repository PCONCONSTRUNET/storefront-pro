import { sendEmail, corsHeaders, baseLayout } from "../_shared/resend.ts";

interface Item { name: string; quantity: number; price: number; }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { email, customerName, orderId, items, total, paymentMethod } = await req.json() as {
      email: string; customerName?: string; orderId: string; items: Item[]; total: number; paymentMethod?: string;
    };
    if (!email || !orderId || !items) throw new Error("dados incompletos");

    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const rows = items.map(i => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f3e8ee">${i.name} <span style="color:#999">×${i.quantity}</span></td>
        <td style="padding:8px 0;border-bottom:1px solid #f3e8ee;text-align:right">${fmt(i.price * i.quantity)}</td>
      </tr>`).join("");

    const html = baseLayout(
      "Pagamento e pedido aprovados! 🎉",
      `<p>Oi${customerName ? ` ${customerName}` : ""}, recebemos seu pagamento e seu pedido já está confirmado! 💖</p>
       <p style="margin:16px 0;color:#555"><strong>Pedido:</strong> #${orderId}${paymentMethod ? `<br><strong>Pagamento:</strong> ${paymentMethod}` : ""}</p>
       <table style="width:100%;border-collapse:collapse;margin-top:8px">
         ${rows}
         <tr>
           <td style="padding:14px 0;font-weight:bold;font-size:16px">Total</td>
           <td style="padding:14px 0;font-weight:bold;font-size:16px;text-align:right;color:#be185d">${fmt(total)}</td>
         </tr>
       </table>
       <div style="margin-top:24px;padding:14px 16px;background:#fff5f8;border:1px solid #fce7f3;border-radius:12px">
         <p style="margin:0;font-size:14px;color:#be185d;font-weight:600">📍 Aguardando retirada no ateliê</p>
         <p style="margin:6px 0 0;font-size:13px;color:#555">Como nossos produtos já são prontos, seu pedido está disponível para retirada no ateliê. Te avisaremos pelo WhatsApp para combinar o melhor horário. ✨</p>
       </div>
       <p style="margin-top:18px">Obrigada pela compra!</p>`
    );
    await sendEmail({ to: email, subject: `Pedido aprovado #${orderId} — pronto para retirada`, html });
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e instanceof Error ? e.message : e) }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
