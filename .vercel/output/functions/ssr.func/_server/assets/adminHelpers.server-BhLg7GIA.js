import { d as createClient, s as stringType, c as supabaseAdmin } from "./client.server-C7GAOqxY.js";
function createSupabaseClient() {
  const SUPABASE_URL = "https://glezvjgtzplflzevclor.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZXp2amd0enBsZmx6ZXZjbG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDYyNjMsImV4cCI6MjA5MzYyMjI2M30._bbOrxbqoZfH9rRyyLDgudUfbCOAWqfZqwTUYWFjzsc";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "implicit"
    }
  });
}
let _supabase;
const supabase = new Proxy(
  {},
  {
    get(_, prop, receiver) {
      if (!_supabase) _supabase = createSupabaseClient();
      return Reflect.get(_supabase, prop, receiver);
    }
  }
);
const client = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  supabase
}, Symbol.toStringTag, { value: "Module" }));
const emailSchema = stringType().trim().toLowerCase().email().max(255);
function newToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function audit(email, action, description, metadata = {}) {
  try {
    await supabaseAdmin.from("activity_logs").insert({
      action,
      category: "admin",
      description,
      metadata: { admin_email: email, ...metadata }
    });
  } catch (e) {
    console.error("[audit] failed:", e);
  }
}
export {
  audit as a,
  client as c,
  emailSchema as e,
  newToken as n,
  supabase as s
};
