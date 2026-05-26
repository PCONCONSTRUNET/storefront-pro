// Helpers used by admin.functions.ts handlers.
// MUST live in a separate module — the TanStack server-fn code-splitter
// (tss-serverfn-split) extracts each handler into its own chunk and
// sibling top-level declarations in the same .functions.ts file become
// undefined at runtime (ReferenceError → 500).
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const emailSchema = z.string().trim().toLowerCase().email().max(255);

export function newToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function audit(
  email: string | null,
  action: string,
  description: string,
  metadata: Record<string, unknown> = {},
) {
  try {
    await supabaseAdmin.from("activity_logs").insert({
      action,
      category: "admin",
      description,
      metadata: { admin_email: email, ...metadata },
    });
  } catch (e) {
    console.error("[audit] failed:", e);
  }
}
