import { supabase } from "@/integrations/supabase/client";

export type CreatePixInput = {
  customer: { name: string; email: string; phone: string; document?: string };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
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

export async function createPixPayment(
  input: CreatePixInput,
): Promise<CreatePixResult> {
  const { data, error } = await supabase.functions.invoke("mp-create-pix", {
    body: input,
  });
  if (error) throw new Error(error.message || "Falha ao criar pagamento Pix");
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as CreatePixResult;
}

export type CardPayload = {
  token: string;
  payment_method_id: string;
  issuer_id?: string;
  installments: number;
  payer?: { identification?: { type: string; number: string } };
};

export type CreateCardInput = Omit<CreatePixInput, never> & {
  card: CardPayload;
};

export type CreateCardResult = {
  order_id: string;
  mp_payment_id: number;
  status: "approved" | "pending" | "rejected" | "cancelled";
  mp_status: string;
  status_detail: string;
  total: number;
};

export async function createCardPayment(
  input: CreateCardInput,
): Promise<CreateCardResult> {
  const { data, error } = await supabase.functions.invoke("mp-create-card", {
    body: input,
  });
  if (error) throw new Error(error.message || "Falha ao processar cartão");
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as CreateCardResult;
}

export type OrderRow = {
  id: string;
  payment_status:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled"
    | "refunded"
    | "expired";
  pix_qr_code: string | null;
  pix_qr_code_base64: string | null;
  pix_expires_at: string | null;
  total: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
};

export async function fetchOrder(id: string): Promise<OrderRow | null> {
  const { data, error } = await (supabase as any).rpc("get_pix_order_status", {
    _id: id,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as OrderRow | null;
}

export async function simulateApprove(orderId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke(
    "mp-simulate-approve",
    {
      body: { order_id: orderId },
    },
  );
  if (error) throw new Error(error.message || "Falha ao simular aprovação");
  if ((data as any)?.error) throw new Error((data as any).error);
}

export const isSandboxOrder = (o: Pick<OrderRow, "pix_qr_code"> | null) =>
  !!o && o.pix_qr_code === "SANDBOX_PIX_CODE_TESTE";
