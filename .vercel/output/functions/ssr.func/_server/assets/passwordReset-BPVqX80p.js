import { s as supabase } from "./adminHelpers.server-BhLg7GIA.js";
import { f as consumeResetTokenFn } from "./router-yLgiv1p7.js";
function randomToken() {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function createResetToken(subjectType, subjectEmail) {
  const token = randomToken();
  const { error } = await supabase.from("password_reset_tokens").insert({
    token,
    subject_type: subjectType,
    subject_email: subjectEmail.toLowerCase()
  });
  if (error) throw error;
  return token;
}
function buildResetUrl(token) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/redefinir-senha?token=${token}`;
}
async function consumeResetToken(token) {
  const result = await consumeResetTokenFn({ data: { token } });
  if (!result) return null;
  return {
    subjectType: result.subjectType,
    subjectEmail: result.subjectEmail
  };
}
export {
  createResetToken as a,
  buildResetUrl as b,
  consumeResetToken as c
};
