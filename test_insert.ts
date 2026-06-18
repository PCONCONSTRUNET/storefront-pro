import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  const row = {
    id: "TEST12345",
    customer_id: null,
    customer_name: "Lucas Teste",
    customer_email: "lucas@teste.com",
    customer_phone: "11999999999",
    customer_document: null,
    items: [],
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0,
    payment_method: "pix",
    delivery_method: "entrega",
    payment_status: "approved",
    delivery_status: "pendente",
    created_at: new Date().toISOString(),
    address: "Rua Teste",
    notes: null,
    coupon_code: "FREE",
    paid_at: new Date().toISOString(),
  };

  const { error, data } = await supabaseAdmin.from("orders").insert(row).select();
  console.log("Error:", error);
  console.log("Data:", data);

  if (!error) {
    await supabaseAdmin.from("orders").delete().eq("id", "TEST12345");
  }
}

test();
