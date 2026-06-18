import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY! 
);

async function test() {
  const { data, error } = await supabaseAdmin.from("orders").select("*").eq("id", "TEST12345");
  console.log("Error:", error);
  console.log("Data:", data);
}

test();
