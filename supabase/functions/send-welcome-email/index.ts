import { sendEmail, corsHeaders, baseLayout } from "../_shared/resend.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { email, name } = await req.json();
    if (!email) throw new Error("email obrigatório");
    const html = baseLayout(
      `Bem-vinda${name ? `, ${name}` : ""}! 🎀`,
      `<p>Que alegria ter você com a gente!</p>
       <p>Sua conta foi criada com sucesso. Agora você pode acompanhar seus pedidos, salvar favoritos e aproveitar nossas novidades.</p>
       <p style="margin-top:24px"><a href="https://princesadelacos.com.br" style="background:linear-gradient(135deg,#ec4899,#f43f5e);color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">Ver loja</a></p>`
    );
    await sendEmail({ to: email, subject: "Bem-vinda à Princesa de Laços 🎀", html });
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e instanceof Error ? e.message : e) }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
