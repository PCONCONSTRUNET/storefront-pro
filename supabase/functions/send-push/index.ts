// Envia push via OneSignal REST API.
// Body: { title, message, url?, audience?: "all" | "admin" | "affiliate" | "customer", externalUserIds?: string[] }
import { corsHeaders } from "../_shared/resend.ts";

const ONESIGNAL_APP_ID = "eceb417e-8a33-4d57-9a0f-0cdfe8f8c7e6";
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!ONESIGNAL_REST_API_KEY) throw new Error("ONESIGNAL_REST_API_KEY não configurada");

    const { title, message, url, audience, externalUserIds } = await req.json();
    if (!title || !message) throw new Error("title e message são obrigatórios");

    const payload: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title, pt: title },
      contents: { en: message, pt: message },
      url: url || undefined,
    };

    if (Array.isArray(externalUserIds) && externalUserIds.length > 0) {
      // OneSignal v16+: use include_aliases instead of deprecated include_external_user_ids
      payload.include_aliases = { external_id: externalUserIds };
      payload.target_channel = "push";
    } else if (audience && audience !== "all") {
      // segmenta por tag "audience" (admin / affiliate / customer)
      payload.filters = [{ field: "tag", key: "audience", relation: "=", value: audience }];
    } else {
      payload.included_segments = ["Subscribed Users"];
    }

    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[send-push] OneSignal erro", res.status, data);
      return new Response(JSON.stringify({ error: data }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data.id, recipients: data.recipients }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[send-push] erro:", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
