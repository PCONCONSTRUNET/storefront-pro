import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY! // wait, let's use anon key since policies allow read
);

async function test() {
  const { data, error } = await supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }).limit(2);
  console.log("Error:", error);
  console.log("Latest Orders:", JSON.stringify(data, null, 2));

  const { data: prods } = await supabaseAdmin.from("products").select("id, stock").limit(3);
  console.log("Products:", JSON.stringify(prods, null, 2));
}

test();
