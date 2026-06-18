import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY! 
);

async function test() {
  const { data, error } = await supabaseAdmin.rpc("admin_read_table", {
    table: "orders",
    limit: 1
  });
  console.log("Error:", error);
  console.log("Data:", data);

  // let's try an invalid insert to get the error message
  const row = {
    id: "TEST12345",
    customer_name: "Teste",
    customer_email: "a@a.com",
    customer_phone: "1199999",
    total: 0,
    payment_method: "pix",
    delivery_method: "entrega",
    payment_status: "approved",
  };
  const { error: insErr } = await supabaseAdmin.from("orders").insert(row);
  console.log("Insert Error:", insErr);
}

test();
