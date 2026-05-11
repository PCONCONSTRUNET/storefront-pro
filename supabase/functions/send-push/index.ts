// Envia push via OneSignal REST API.
// Body: { title, message, url?, audience?: "all" | "admin" | "affiliate" | "customer", externalUserIds?: string[] }
import { corsHeaders } from "../_shared/resend.ts";

const ONESIGNAL_APP_ID = "2daa3ed9-be86-4bc9-9819-4d641aea75d5";
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    if (!ONESIGNAL_REST_API_KEY)
      throw new Error("ONESIGNAL_REST_API_KEY não configurada");

    const { title, message, url, audience, externalUserIds, subscriptionIds } =
      await req.json();
    if (!title || !message) throw new Error("title e message são obrigatórios");

    const payload: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title, pt: title },
      contents: { en: message, pt: message },
      url: url || undefined,
    };

    if (Array.isArray(subscriptionIds) && subscriptionIds.length > 0) {
      payload.include_subscription_ids = subscriptionIds;
    } else if (Array.isArray(externalUserIds) && externalUserIds.length > 0) {
      // OneSignal v16+: use include_aliases instead of deprecated include_external_user_ids
      payload.include_aliases = { external_id: externalUserIds };
      payload.target_channel = "push";
    } else if (audience === "all") {
      payload.included_segments = ["All"];
    } else if (audience === "admin") {
      payload.filters = [
        { field: "tag", key: "role", relation: "=", value: "admin" },
      ];
    } else if (audience === "customer") {
      payload.filters = [
        { field: "tag", key: "role", relation: "=", value: "customer" },
      ];
    } else if (audience === "affiliate") {
      payload.filters = [
        { field: "tag", key: "role", relation: "=", value: "affiliate" },
      ];
    } else {
      payload.included_segments = ["Subscribed Users"];
    }

    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("[send-push] OneSignal response:", res.status, JSON.stringify(data));

    if (!res.ok) {
      // 400 with "All included players are not subscribed" is not a real error
      const errStr = JSON.stringify(data);
      if (res.status === 400 && (data.errors?.includes("All included players are not subscribed") || data.recipients === 0)) {
        console.warn("[send-push] No recipients yet — device may not be registered");
        return new Response(JSON.stringify({ ok: true, recipients: 0, warning: "No registered devices yet" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("[send-push] OneSignal erro", res.status, errStr);
      return new Response(JSON.stringify({ error: data }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, id: data.id, recipients: data.recipients }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("[send-push] erro:", e);
    return new Response(
      JSON.stringify({ error: String((e as Error).message ?? e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
