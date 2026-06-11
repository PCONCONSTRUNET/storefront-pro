import { useStore, type StoreSettings } from "@/lib/store";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Fallback para hardcoded se a env não existir no deploy atual, mas recomenda-se usar env var.
export const getSuperfreteToken = () => process.env.SUPERFRETE_API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODExNDI2NDMsInN1YiI6IlF1RzJ4cmlITXdldXJZbVI1Q0hVdDA1eXh5ZjEifQ.TpxzJ_bMMFS7CconVPTzBpJh8cWZbPWujwrwuvrDac0";

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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const token = getSuperfreteToken();

    // Buscar dados do pedido
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", data.orderId)
      .single();
    if (orderError || !orderData) throw new Error("Pedido não encontrado");

    // Buscar configurações da loja — a tabela armazena { id, data } onde data é o JSON das settings
    const { data: storeSettingsRow } = await supabaseAdmin
      .from("store_settings")
      .select("data")
      .eq("id", 1)
      .maybeSingle();

    // Extrai as settings do campo `data`, com fallback para objeto vazio
    const settings = (storeSettingsRow?.data as Partial<StoreSettings>) || {};

    const parsedItems = Array.isArray(orderData.items)
      ? (orderData.items as any[])
      : JSON.parse((orderData.items as string) || "[]");

    const products = parsedItems.map((i: any) => ({
      name: i.name,
      quantity: String(i.quantity),
      unitary_value: String(i.price)
    }));

    // Extrai CEP do endereço — formato: "... CEP: 88735-000" ou "CEP: 88735000"
    const cepMatch = orderData.address?.match(/CEP[:\s]+([0-9]{5}-?[0-9]{3})/i);
    const cepDestino = cepMatch ? cepMatch[1].replace(/\D/g, "") : "00000000";

    // Extrai UF do endereço — formato: "... SC, CEP..." ou "...Estado: SC"
    // Tenta capturar a sigla de estado de 2 letras que aparece antes do CEP
    const stateMatch = orderData.address?.match(/[,\s-]\s*([A-Z]{2})\s*[,\s-]?\s*CEP/i)
      || orderData.address?.match(/,\s*([A-Z]{2})\s*$/i);
    const stateAbbr = stateMatch ? stateMatch[1].toUpperCase() : (settings.superfreteAddressState || "SC");

    // Extrai cidade do endereço — tenta capturar antes da UF
    const cityMatch = orderData.address?.match(/,\s*([^,]+?)\s*[-–,]\s*[A-Z]{2}\s*[,\s-]?\s*CEP/i);
    const city = cityMatch ? cityMatch[1].trim() : "NA";

    const toPayload = {
      name: orderData.customer_name,
      address: orderData.address || "Endereço não informado",
      district: "NA",
      city: city,
      state_abbr: stateAbbr,
      postal_code: cepDestino,
      email: orderData.customer_email || "",
      document: (orderData as any).customer_document || "00000000000"
    };

    const fromPayload = {
      name: settings.storeName || "Loja",
      address: settings.superfreteAddressStreet || "Rua Principal",
      number: settings.superfreteAddressNumber || "1",
      district: settings.superfreteAddressNeighborhood || "Centro",
      city: settings.superfreteAddressCity || "Cidade",
      state_abbr: settings.superfreteAddressState || "SC",
      postal_code: settings.superfreteCepOrigem?.replace(/\D/g, '') || ""
    };

    let responseText = "";
    try {
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

      responseText = await response.text();

      if (!response.ok) {
        console.error("SuperFrete Cart Error:", responseText);
        // Tenta extrair mensagem legível da resposta da API
        let apiMsg = "";
        try {
          const parsed = JSON.parse(responseText);
          apiMsg = parsed?.message || parsed?.error || JSON.stringify(parsed);
        } catch { apiMsg = responseText.slice(0, 200); }
        throw new Error(`SuperFrete: ${apiMsg || response.statusText}`);
      }

      const resJson = JSON.parse(responseText);
      const superfreteId = resJson.id;

      if (!superfreteId) {
        throw new Error(`SuperFrete não retornou ID do carrinho. Resposta: ${responseText.slice(0, 200)}`);
      }

      // Salvar no BD
      await supabaseAdmin
        .from("orders")
        // @ts-ignore
        .update({ superfrete_order_id: superfreteId })
        .eq("id", data.orderId);

      return { ok: true, superfreteOrderId: superfreteId };
    } catch (error: any) {
      console.error("SuperFrete Cart Exception:", error?.message || error, "| Response:", responseText);
      // Re-lança o erro original (não engole mais com mensagem genérica)
      throw error instanceof Error ? error : new Error(String(error));
    }
  });


export async function createSuperFreteCart(orderData: { id: string }) {
  const settings = useStore.getState().settings;
  const isActive = settings.superfreteActive !== false;
  
  if (!isActive) return;

  return await createSuperFreteCartFn({ data: { orderId: orderData.id } });
}
