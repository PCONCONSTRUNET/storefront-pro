import { supabase } from "@/integrations/supabase/client";

type WelcomePayload = { email: string; name?: string };
type ResetPayload = { email: string; resetUrl: string };
type OrderItem = { name: string; quantity: number; price: number };
type OrderPayload = {
  email: string;
  customerName?: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  paymentMethod?: string;
};

async function safeInvoke(fn: string, body: Record<string, unknown>) {
  try {
    const { error } = await supabase.functions.invoke(fn, { body });
    if (error) console.warn(`[email] ${fn}:`, error.message);
  } catch (e) {
    console.warn(`[email] ${fn} falhou`, e);
  }
}

export const sendWelcomeEmail = (p: WelcomePayload) => safeInvoke("send-welcome-email", p);
export const sendPasswordResetEmail = (p: ResetPayload) => safeInvoke("send-password-reset-email", p);
export const sendOrderConfirmationEmail = (p: OrderPayload) => safeInvoke("send-order-confirmation-email", p);
