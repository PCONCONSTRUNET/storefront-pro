const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "Princesa de Laços <onboarding@resend.dev>";

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY não configurada");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Resend error ${res.status}: ${txt}`);
  }
  return await res.json();
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function baseLayout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#fff5f8;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#333">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);margin-top:24px">
      <div style="background:linear-gradient(135deg,#ec4899,#f43f5e);padding:24px;text-align:center;color:#fff">
        <h1 style="margin:0;font-size:22px">Princesa de Laços</h1>
      </div>
      <div style="padding:28px 24px">
        <h2 style="margin:0 0 12px;font-size:20px;color:#be185d">${title}</h2>
        ${body}
      </div>
      <div style="padding:16px;text-align:center;font-size:12px;color:#888;background:#fafafa">
        Princesa de Laços · feito com carinho 💖
      </div>
    </div>
  </body></html>`;
}
