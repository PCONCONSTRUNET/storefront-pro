import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/resend.ts";
import {
  sendOrderConfirmationEmailOnce,
  type OrderConfirmationPayload,
} from "../_shared/order-confirmation-email.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as OrderConfirmationPayload;
    if (!body.email || !body.orderId || body.items == null) {
      throw new Error("dados incompletos");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const result = await sendOrderConfirmationEmailOnce(supabase, body);

    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[send-order-confirmation-email]", e);
    return new Response(
      JSON.stringify({ error: String(e instanceof Error ? e.message : e) }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
