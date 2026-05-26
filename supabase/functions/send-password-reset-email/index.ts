import { sendEmail, corsHeaders, baseLayout } from "../_shared/resend.ts";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "../_shared/rate-limit.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  try {
    const { email, resetUrl } = await req.json();
    if (!email || !resetUrl) throw new Error("email e resetUrl obrigatórios");

    // Rate limit: 3 req/hora por email + 10/hora por IP
    const normalizedEmail = String(email).trim().toLowerCase();
    const emailRl = await checkRateLimit({
      bucket: "password-reset-email",
      identifier: normalizedEmail,
      maxRequests: 3,
      windowSeconds: 3600,
    });
    if (!emailRl.allowed)
      return rateLimitResponse(emailRl.retryAfterSeconds, corsHeaders);

    const ipRl = await checkRateLimit({
      bucket: "password-reset-ip",
      identifier: getClientIp(req),
      maxRequests: 10,
      windowSeconds: 3600,
    });
    if (!ipRl.allowed)
      return rateLimitResponse(ipRl.retryAfterSeconds, corsHeaders);

    const html = baseLayout(
      "Redefinir sua senha",
      `<p>Recebemos um pedido para redefinir a senha da sua conta.</p>
       <p>Clique no botão abaixo para criar uma nova senha. Este link expira em 30 minutos.</p>
       <p style="margin-top:24px;text-align:center">
         <a href="${resetUrl}" style="background:linear-gradient(135deg,#ec4899,#f43f5e);color:#fff;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:bold">Redefinir senha</a>
       </p>
       <p style="margin-top:24px;font-size:13px;color:#777">Se você não pediu isso, pode ignorar este email com tranquilidade.</p>`,
    );
    await sendEmail({
      to: email,
      subject: "Redefinir senha — Princesa de Laços",
      html,
    });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e instanceof Error ? e.message : e) }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
