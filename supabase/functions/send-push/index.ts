import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ONESIGNAL_APP_ID = "63b84a50-f1ec-4940-97aa-a72bfc1f9a2e";
const ONESIGNAL_REST_API_KEY = "os_v2_app_mo4euuhr5reubf5ku4v7yh42fyj4ulmikcsuwiequ6wfp2iuso42s5easovoc5wpb3nokto7gwnh7h3eyrpf7dfdo6z6qcvccjo32hq";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { title, message, url, audience, subscriptionIds } = body;

    const payload: any = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title, pt: title },
      contents: { en: message, pt: message },
    };

    if (url) {
      payload.url = url;
    }

    if (subscriptionIds && subscriptionIds.length > 0) {
      payload.include_subscription_ids = subscriptionIds;
    } else if (audience === "admin") {
      // Tags filter for role=admin
      payload.filters = [
        { field: "tag", key: "role", relation: "=", value: "admin" },
      ];
    } else if (audience === "affiliate") {
      payload.filters = [
        { field: "tag", key: "role", relation: "=", value: "affiliate" },
      ];
    } else if (audience === "all") {
      payload.included_segments = ["Subscribed Users"];
    } else {
      throw new Error("Nenhum destinatário definido (audience ou subscriptionIds)");
    }

    const res = await fetch("https://api.onesignal.com/notifications?c=push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("[send-push] Result:", data);

    if (!res.ok) {
      throw new Error(data.errors?.[0] || "Erro desconhecido do OneSignal");
    }

    return new Response(
      JSON.stringify({ ok: true, data }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[send-push] Error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
