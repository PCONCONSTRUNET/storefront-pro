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
