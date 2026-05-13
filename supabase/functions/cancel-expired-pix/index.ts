// Cancela pedidos Pix vencidos (sem pagamento) e devolve o estoque.
// Roda via pg_cron a cada 30 minutos.
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { data: expired, error } = await supabase
      .from("orders")
      .select("id, items, customer_name, total")
      .eq("payment_method", "pix")
      .eq("payment_status", "pending")
      .not("pix_expires_at", "is", null)
      .lt("pix_expires_at", new Date().toISOString())
      .limit(100);

    if (error) throw error;
    if (!expired || expired.length === 0) {
      return json({ ok: true, cancelled: 0 });
    }

    const ids: string[] = [];
    for (const order of expired) {
      // Devolve estoque
      const items = (order.items as any[]) ?? [];
      for (const it of items) {
        if (!it?.productId || !it?.quantity) continue;
        const { data: prod } = await supabase
          .from("products")
          .select("stock")
          .eq("id", it.productId)
          .maybeSingle();
        if (prod) {
          await supabase
            .from("products")
            .update({ stock: (prod.stock ?? 0) + Number(it.quantity) })
            .eq("id", it.productId);
        }
      }

      // Marca pedido como expirado
      await supabase
        .from("orders")
        .update({ payment_status: "expired" })
        .eq("id", order.id);

      await supabase.from("payment_events").insert({
        mp_event_id: `expired-${order.id}-${Date.now()}`,
        order_id: order.id,
        event_type: "expired",
        raw_payload: { reason: "pix_timeout" },
      });

      ids.push(String(order.id).slice(0, 8));
    }

    // Notifica admin via push
    if (ids.length > 0) {
      try {
        await supabase.functions.invoke("send-push", {
          body: {
            title: "⏱️ Pix expirados",
            message: `${ids.length} pedido(s) Pix venceram e foram cancelados: ${ids.slice(0, 5).join(", ")}${ids.length > 5 ? "…" : ""}`,
            url: "/admin/pedidos",
            audience: "admin",
          },
        });
      } catch (e) {
        console.error("[cancel-expired-pix] push falhou:", e);
      }
    }

    return json({ ok: true, cancelled: ids.length, ids });
  } catch (e) {
    console.error("[cancel-expired-pix] erro:", e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
