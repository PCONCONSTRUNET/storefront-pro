import { supabase } from "@/integrations/supabase/client";

export type CreatePixInput = {
  customer: { name: string; email: string; phone: string; document?: string };
  items: Array<{ productId: string; name: string; price: number; quantity: number; image?: string }>;
  totals: { subtotal: number; discount: number; shipping: number; total: number };
  delivery: "entrega" | "retirada";
  address?: string;
  notes?: string;
};

export type CreatePixResult = {
  order_id: string;
  mp_payment_id: number;
  qr_code: string;
  qr_code_base64: string;
  ticket_url?: string;
  expires_at?: string;
  total: number;
};

export async function createPixPayment(input: CreatePixInput): Promise<CreatePixResult> {
  const { data, error } = await supabase.functions.invoke("mp-create-pix", { body: input });
  if (error) throw new Error(error.message || "Falha ao criar pagamento Pix");
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as CreatePixResult;
}

export type OrderRow = {
  id: string;
  payment_status: "pending" | "approved" | "rejected" | "cancelled" | "refunded" | "expired";
  pix_qr_code: string | null;
  pix_qr_code_base64: string | null;
  pix_expires_at: string | null;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
};

export async function fetchOrder(id: string): Promise<OrderRow | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, payment_status, pix_qr_code, pix_qr_code_base64, pix_expires_at, total, customer_name, customer_email, customer_phone")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as OrderRow | null;
}
