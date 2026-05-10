import { supabase } from "@/integrations/supabase/client";

export type ResetSubject = "admin" | "customer" | "affiliate";

function randomToken(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createResetToken(subjectType: ResetSubject, subjectEmail: string) {
  const token = randomToken();
  const { error } = await supabase.from("password_reset_tokens").insert({
    token,
    subject_type: subjectType,
    subject_email: subjectEmail.toLowerCase(),
  });
  if (error) throw error;
  return token;
}

export function buildResetUrl(token: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/redefinir-senha?token=${token}`;
}

export async function consumeResetToken(
  token: string,
): Promise<{ subjectType: ResetSubject; subjectEmail: string } | null> {
  const { data, error } = await supabase.rpc("consume_password_reset_token", { _token: token });
  if (error || !data || data.length === 0) return null;
  const row = data[0] as { subject_type: ResetSubject; subject_email: string };
  return { subjectType: row.subject_type, subjectEmail: row.subject_email };
}
