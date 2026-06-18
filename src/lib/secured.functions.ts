// Server fns para RPCs que foram restringidas a service_role.
// Migram chamadas que antes vinham do browser usando a anon key.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const consumeResetTokenFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ token: z.string().min(8).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin.rpc(
      "consume_password_reset_token",
      { _token: data.token },
    );
    if (error || !rows || rows.length === 0) return null;
    const row = rows[0] as { subject_type: string; subject_email: string };
    return { subjectType: row.subject_type, subjectEmail: row.subject_email };
  });

export const applyOrderStockDecrementFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ orderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.rpc("apply_order_stock_decrement", {
      _order_id: data.orderId,
    });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const submitLocalOrderFn = createServerFn({ method: "POST" })
  .inputValidator((input) => z.any().parse(input))
  .handler(async ({ data }) => {
    if (!data || !data.id || !data.customerName) return { ok: false };
    
    const row = {
      id: data.id,
      customer_id: data.customerId !== "guest" ? data.customerId : null,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      customer_document: data.customerCpf || null,
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount,
      shipping: data.shipping,
      total: data.total,
      payment_method: data.paymentMethod,
      delivery_method: data.deliveryMethod,
      payment_status: data.status,
      delivery_status: data.deliveryStatus,
      created_at: data.createdAt,
      address: data.address,
      notes: data.notes || null,
      coupon_code: data.couponCode || null,
      paid_at: data.status === "pago" ? new Date().toISOString() : null,
    };

    const { error } = await supabaseAdmin.from("orders").insert(row);
    if (error) {
      console.error("[submitLocalOrderFn] Insert failed:", error);
      return { ok: false, message: error.message };
    }

    if (row.payment_status === "pago") {
      await supabaseAdmin.rpc("apply_order_stock_decrement", {
        _order_id: row.id,
      });
    }

    return { ok: true };
  });
