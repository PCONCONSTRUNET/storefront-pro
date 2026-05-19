const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM =
  Deno.env.get("RESEND_FROM_EMAIL") ??
  "Princesa de Laços <nao-responda@xn--princesadelaos-rjb.com.br>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY não configurada");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Resend error ${res.status}: ${txt}`);
  }
  return await res.json();
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOGO_URL =
  Deno.env.get("EMAIL_LOGO_URL") ??
  "https://amostrasistema.lovable.app/email-logo.png";
const SITE_URL =
  Deno.env.get("SITE_URL") ?? "https://amostrasistema.lovable.app";
const WHATSAPP_NUMBER = Deno.env.get("STORE_WHATSAPP") ?? "554888644474"; // formato wa.me
const WHATSAPP_DISPLAY =
  Deno.env.get("STORE_WHATSAPP_DISPLAY") ?? "(48) 8864-4474";
const INSTAGRAM_USER = Deno.env.get("STORE_INSTAGRAM") ?? "princesadelacos58";
const FACEBOOK_USER = Deno.env.get("STORE_FACEBOOK") ?? "princesadelacos";
const STORE_EMAIL = Deno.env.get("STORE_EMAIL") ?? "princesadelacos@proton.me";

export function baseLayout(title: string, body: string) {
  const year = new Date().getFullYear();
  return `<!doctype html><html><body style="margin:0;background:#fff5f8;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#333">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);margin-top:24px">
      <div style="background:#ffffff;padding:24px 16px 8px;text-align:center">
        <img src="${LOGO_URL}" alt="Princesa de Laços" width="220" style="display:inline-block;max-width:80%;height:auto" />
      </div>
      <div style="background:linear-gradient(135deg,#ec4899,#f43f5e);padding:18px;text-align:center;color:#fff">
        <h1 style="margin:0;font-size:20px;font-weight:600;letter-spacing:.3px">Princesa de Laços</h1>
      </div>
      <div style="padding:28px 24px">
        <h2 style="margin:0 0 12px;font-size:20px;color:#be185d">${title}</h2>
        ${body}
      </div>

      <!-- Footer / Identidade -->
      <div style="background:linear-gradient(180deg,#fff5f8,#ffe4ef);padding:24px 20px;text-align:center;border-top:1px solid #fce7f3">
        <p style="margin:0 0 10px;font-size:13px;color:#be185d;font-weight:600">Fale com a gente 💬</p>
        <p style="margin:0 0 14px;font-size:13px;color:#555;line-height:1.5">
          <a href="https://wa.me/${WHATSAPP_NUMBER}" style="color:#25D366;text-decoration:none;font-weight:600">WhatsApp ${WHATSAPP_DISPLAY}</a><br>
          <a href="mailto:${STORE_EMAIL}" style="color:#be185d;text-decoration:none">${STORE_EMAIL}</a>
        </p>

        <p style="margin:14px 0 8px;font-size:12px;color:#888">Siga nossas novidades</p>
        <p style="margin:0 0 16px">
          <a href="https://instagram.com/${INSTAGRAM_USER}" style="display:inline-block;margin:0 6px;padding:8px 14px;background:#fff;border:1px solid #fbcfe8;border-radius:999px;color:#be185d;text-decoration:none;font-size:12px;font-weight:600">📷 Instagram</a>
        </p>

        <p style="margin:14px 0 0;font-size:11px;color:#999;line-height:1.6">
          <a href="${SITE_URL}" style="color:#999;text-decoration:none">Loja</a> ·
          <a href="${SITE_URL}/politica-de-privacidade" style="color:#999;text-decoration:none">Privacidade</a> ·
          <a href="${SITE_URL}/politica-de-trocas" style="color:#999;text-decoration:none">Trocas e devoluções</a> ·
          <a href="${SITE_URL}/termos" style="color:#999;text-decoration:none">Termos</a>
        </p>
        <p style="margin:14px 0 0;font-size:11px;color:#aaa">
          © ${year} Princesa de Laços · Feito com carinho 💖<br>
          Você recebeu este e-mail porque é cliente da nossa loja.
        </p>
      </div>
    </div>
  </body></html>`;
}
