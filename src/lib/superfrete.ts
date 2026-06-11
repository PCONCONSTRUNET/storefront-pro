import { useStore, type StoreSettings } from "@/lib/store";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminAuth } from "./adminAuth.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Fallback para hardcoded se a env não existir no deploy atual, mas recomenda-se usar env var.
const getSuperfreteToken = () => process.env.SUPERFRETE_API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODExNDI2NDMsInN1YiI6IlF1RzJ4cmlITXdldXJZbVI1Q0hVdDA1eXh5ZjEifQ.TpxzJ_bMMFS7CconVPTzBpJh8cWZbPWujwrwuvrDac0";

export type ShippingQuote = {
  name: string;
  price: number;
  discountPrice: number;
  deliveryTime: number; // days
  id: number;
};

export const calculateShippingFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      cepOrigem: z.string().min(8),
      cepDestino: z.string().min(8),
      insuranceValue: z.number().optional().default(0),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const response = await fetch("https://api.superfrete.com/api/v0/calculator", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${getSuperfreteToken()}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          from: { postal_code: data.cepOrigem },
          to: { postal_code: data.cepDestino },
          services: "1,2", // PAC e SEDEX
          options: {
            own_hand: false,
            receipt: false,
            insurance_value: data.insuranceValue
          },
          package: {
            weight: 0.3, // 300 gramas
            width: 15,
            height: 15,
            length: 15
          }
        })
      });

      if (!response.ok) {
        console.error("SuperFrete Error:", await response.text());
        return [];
      }

      const resData = await response.json();
      if (Array.isArray(resData)) {
        return resData.map((item: any) => ({
          id: item.service || item.id,
          name: item.name,
          price: Number(item.price), // Preço com desconto já aplicado pelo Superfrete
          discountPrice: Number(item.price), // O preço final a ser cobrado do cliente
          deliveryTime: Number(item.delivery_time)
        }));
      }
      return [];
    } catch (error) {
      console.error("SuperFrete Exception:", error);
      return [];
    }
  });

export async function calculateShipping(cepDestino: string, insuranceValue: number = 0): Promise<ShippingQuote[]> {
  // Ler configurações do painel
  const settings = useStore.getState().settings;
  const isActive = settings.superfreteActive !== false;
  const cepOrigem = settings.superfreteCepOrigem?.replace(/\D/g, "");

  if (!isActive || !cepOrigem || cepOrigem.length !== 8) return [];

  // Limpar CEP
  const toCep = cepDestino.replace(/\D/g, "");
  if (toCep.length !== 8) return [];

  return await calculateShippingFn({ data: { cepOrigem, cepDestino: toCep, insuranceValue } }) as ShippingQuote[];
}

export const createSuperFreteCartFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      orderId: z.string(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const token = getSuperfreteToken();

      // Buscar dados do pedido
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", data.orderId)
        .single();
      if (orderError || !orderData) throw new Error("Pedido não encontrado");

      // Buscar configurações da loja
      const { data: storeSettingsData } = await supabaseAdmin
        .from("store_settings")
        .select("*")
        .single();
      if (!storeSettingsData) throw new Error("Configurações não encontradas");

      const settings = storeSettingsData as unknown as StoreSettings;

      const parsedItems = Array.isArray(orderData.items) 
        ? (orderData.items as any[]) 
        : JSON.parse((orderData.items as string) || "[]");

      const products = parsedItems.map((i: any) => ({
        name: i.name,
        quantity: String(i.quantity),
        unitary_value: String(i.price)
      }));

      const cepMatch = orderData.address?.match(/CEP:\s*([\d-]+)/i);
      const cepDestino = cepMatch ? cepMatch[1].replace(/\D/g, "") : "00000000";

      const toPayload = {
        name: orderData.customer_name,
        address: orderData.address,
        district: "NA", // Substituir por bairro real se aplicável
        city: "NA", // Substituir por cidade real se aplicável
        state_abbr: "SP", // OBRIGATÓRIO (CAIXA ALTA) - no ambiente real, deve vir do CEP ou do cadastro
        postal_code: cepDestino,
        email: orderData.customer_email || "",
        document: orderData.customer_cpf || "00000000000"
      };

      const fromPayload = {
        name: settings.storeName || "Loja",
        address: settings.superfreteAddressStreet || "Rua Principal",
        number: settings.superfreteAddressNumber || "1",
        district: settings.superfreteAddressNeighborhood || "Centro",
        city: settings.superfreteAddressCity || "Cidade",
        state_abbr: settings.superfreteAddressState || "SP",
        postal_code: settings.superfreteCepOrigem?.replace(/\D/g, '') || ""
      };

      const response = await fetch("https://api.superfrete.com/api/v0/cart", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          from: fromPayload,
          to: toPayload,
          services: "1,2", // PAC e SEDEX
          options: {
            own_hand: false,
            receipt: false,
            insurance_value: orderData.total,
            non_commercial: true
          },
          package: {
            weight: 0.3,
            width: 15,
            height: 15,
            length: 15
          },
          order_id: data.orderId,
          products: products,
          platform: "PrincesaDeLacos"
        })
      });

      if (!response.ok) {
        console.error("SuperFrete Cart Error:", await response.text());
        throw new Error("Falha ao enviar para o Super Frete");
      }

      const resJson = await response.json();
      const superfreteId = resJson.id;

      // Salvar no BD
      await supabaseAdmin
        .from("orders")
        .update({ superfrete_order_id: superfreteId })
        .eq("id", data.orderId);

      return { ok: true, superfreteOrderId: superfreteId };
    } catch (error) {
      console.error("SuperFrete Cart Exception:", error);
      throw new Error("Erro interno ao integrar com Super Frete");
    }
  });

export async function createSuperFreteCart(orderData: { id: string }) {
  const settings = useStore.getState().settings;
  const isActive = settings.superfreteActive !== false;
  
  if (!isActive) return;

  return await createSuperFreteCartFn({ data: { orderId: orderData.id } });
}

// ------ Admin Functions ------
export const checkoutSuperfreteFn = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((input) => z.object({ orderId: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const token = getSuperfreteToken();

    const { data: order } = await supabaseAdmin.from("orders").select("superfrete_order_id").eq("id", data.orderId).single();
    if (!order || !order.superfrete_order_id) throw new Error("Pedido não tem id do superfrete gerado no carrinho");

    const res = await fetch("https://api.superfrete.com/api/v0/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        orders: [order.superfrete_order_id]
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Checkout Superfrete Error:", txt);
      throw new Error("Erro ao finalizar pedido na Superfrete");
    }

    const resJson = await res.json();
    if (!resJson.success) throw new Error("Checkout falhou");

    const track = resJson.purchase?.orders?.[0]?.tracking;

    await supabaseAdmin
      .from("orders")
      .update({ tracking_code: track })
      .eq("id", data.orderId);

    return { success: true, tracking: track };
  });

export const printSuperfreteTagFn = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((input) => z.object({ orderId: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const token = getSuperfreteToken();

    const { data: order } = await supabaseAdmin.from("orders").select("superfrete_order_id").eq("id", data.orderId).single();
    if (!order || !order.superfrete_order_id) throw new Error("Pedido não tem id do superfrete");

    const res = await fetch("https://api.superfrete.com/api/v0/tag/print", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        orders: [order.superfrete_order_id]
      })
    });

    if (!res.ok) throw new Error("Falha ao gerar link do pdf");

    const resJson = await res.json();

    await supabaseAdmin
      .from("orders")
      .update({ superfrete_label_url: resJson.url })
      .eq("id", data.orderId);

    return { success: true, url: resJson.url };
  });
