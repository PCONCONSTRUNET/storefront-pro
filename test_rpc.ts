import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY! // anon key
);

async function test() {
  // Let's insert an order using anon key (which failed previously, but let's try)
  // Wait, I can't test the RPC with anon key because it was revoked!
  console.log("I cannot test RPC with anon key, need service role key which I don't have.");
}

test();
