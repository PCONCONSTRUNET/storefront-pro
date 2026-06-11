import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminAuth } from "./adminAuth.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getSuperfreteToken } from "./superfrete";

export const checkoutSuperfreteFn = createServerFn({ method: "POST" })
  // @ts-ignore - Middleware type mismatch workaround
  .middleware([requireAdminAuth])
  .inputValidator((input) => z.object({ orderId: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const token = getSuperfreteToken();

    // @ts-ignore - superfrete_order_id not in generated types yet
    const { data: order } = await supabaseAdmin.from("orders").select("superfrete_order_id").eq("id", data.orderId).single();
    // @ts-ignore
    if (!order || !order.superfrete_order_id) throw new Error("Pedido não tem id do superfrete gerado no carrinho");

    const res = await fetch("https://api.superfrete.com/api/v0/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        // @ts-ignore
        orders: [order.superfrete_order_id]
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Checkout Superfrete Error:", txt);
      throw new Error("Erro ao finalizar pedido na Superfrete");
    }

    const resJson = await res.json();
    if (!resJson.success) throw new Error("Checkout falhou");

    const track = resJson.purchase?.orders?.[0]?.tracking;

    await supabaseAdmin
      .from("orders")
      // @ts-ignore - tracking_code not in generated types yet
      .update({ tracking_code: track })
      .eq("id", data.orderId);

    return { success: true, tracking: track };
  });

export const printSuperfreteTagFn = createServerFn({ method: "POST" })
  // @ts-ignore - Middleware type mismatch workaround
  .middleware([requireAdminAuth])
  .inputValidator((input) => z.object({ orderId: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const token = getSuperfreteToken();

    // @ts-ignore - superfrete_order_id not in generated types yet
    const { data: order } = await supabaseAdmin.from("orders").select("superfrete_order_id").eq("id", data.orderId).single();
    // @ts-ignore
    if (!order || !order.superfrete_order_id) throw new Error("Pedido não tem id do superfrete");

    const res = await fetch("https://api.superfrete.com/api/v0/tag/print", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        // @ts-ignore
        orders: [order.superfrete_order_id]
      })
    });

    if (!res.ok) throw new Error("Falha ao gerar link do pdf");

    const resJson = await res.json();

    await supabaseAdmin
      .from("orders")
      // @ts-ignore - superfrete_label_url not in generated types yet
      .update({ superfrete_label_url: resJson.url })
      .eq("id", data.orderId);

    return { success: true, url: resJson.url };
  });
