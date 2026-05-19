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

type ApiErrorPayload = { error?: string };

const getApiErrorMessage = (data: unknown) => {
  if (typeof data !== "object" || data === null || !("error" in data)) return null;
  const message = (data as ApiErrorPayload).error;
  return typeof message === "string" && message.length > 0 ? message : null;
};

export async function createPixPayment(
  input: CreatePixInput,
): Promise<CreatePixResult> {
  const { data, error } = await supabase.functions.invoke("mp-create-pix", {
    body: input,
  });
  if (error) throw new Error(error.message || "Falha ao criar pagamento Pix");
  const apiError = getApiErrorMessage(data);
  if (apiError) throw new Error(apiError);
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
  const apiError = getApiErrorMessage(data);
  if (apiError) throw new Error(apiError);
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
  const { data, error } = await supabase.rpc("get_pix_order_status", {
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
  const apiError = getApiErrorMessage(data);
  if (apiError) throw new Error(apiError);
}

export const isSandboxOrder = (o: Pick<OrderRow, "pix_qr_code"> | null) =>
  !!o && o.pix_qr_code === "SANDBOX_PIX_CODE_TESTE";
