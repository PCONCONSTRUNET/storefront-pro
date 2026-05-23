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
    const { data, error } = await supabase.functions.invoke(fn, { body });
    if (error) {
      console.warn(`[email] ${fn}:`, error.message);
      return false;
    }
    const payload = data as { error?: string; ok?: boolean } | null;
    if (payload?.error) {
      console.warn(`[email] ${fn}:`, payload.error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`[email] ${fn} falhou`, e);
    return false;
  }
}

export const sendWelcomeEmail = (p: WelcomePayload) =>
  safeInvoke("send-welcome-email", p);
export const sendPasswordResetEmail = (p: ResetPayload) =>
  safeInvoke("send-password-reset-email", p);
export const sendOrderConfirmationEmail = (p: OrderPayload) =>
  safeInvoke("send-order-confirmation-email", p);
