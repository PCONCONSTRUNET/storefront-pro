import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  return new Response(JSON.stringify({ ok: true, message: "Push desativado" }), {
    headers: { "Content-Type": "application/json" },
  });
});
