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
      // Dados do pedido passados direto do front (evita re-query com RLS)
      customerName: z.string(),
      customerEmail: z.string().default(""),
      customerCpf: z.string().optional(),
      address: z.string().default(""),
      total: z.number(),
      items: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        price: z.number(),
      })),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const token = getSuperfreteToken();

    // Buscar configurações da loja — a tabela armazena { id, data } onde data é o JSON das settings
    const { data: storeSettingsRow } = await supabaseAdmin
      .from("store_settings")
      .select("data")
      .eq("id", 1)
      .maybeSingle();

    // Extrai as settings do campo `data`, com fallback para objeto vazio
    const settings = (storeSettingsRow?.data as Partial<StoreSettings>) || {};

    const products = data.items.map((i) => ({
      name: i.name,
      quantity: String(i.quantity),
      unitary_value: String(i.price)
    }));

    // Extrai CEP do endereço — formato: "... CEP: 88735-000" ou "CEP: 88735000"
    const cepMatch = data.address?.match(/CEP[:\s]+([0-9]{5}-?[0-9]{3})/i);
    const cepDestino = cepMatch ? cepMatch[1].replace(/\D/g, "") : "00000000";

    // Extrai UF do endereço — formato: "... SC, CEP..." ou "...Estado: SC"
    const stateMatch = data.address?.match(/[,\s-]\s*([A-Z]{2})\s*[,\s-]?\s*CEP/i)
      || data.address?.match(/,\s*([A-Z]{2})\s*$/i);
    const stateAbbr = stateMatch ? stateMatch[1].toUpperCase() : (settings.superfreteAddressState || "SC");

    // Extrai cidade do endereço
    const cityMatch = data.address?.match(/,\s*([^,]+?)\s*[-–,]\s*[A-Z]{2}\s*[,\s-]?\s*CEP/i);
    const city = cityMatch ? cityMatch[1].trim() : "NA";

    // Garante que o nome tenha sobrenome (exigência da API)
    let fullName = data.customerName.trim();
    if (!fullName.includes(" ")) fullName += " Cliente";

    // Extrai logradouro, número e bairro do endereço (limite de 50 chars no logradouro)
    const rawAddress = data.address || "Endereço não informado";
    const addressParts = rawAddress.split(",");
    let street = addressParts[0].trim();
    if (street.length > 50) street = street.substring(0, 50);
    
    let number = "S/N";
    let district = "NA";
    if (addressParts.length > 1) {
      const secondPart = addressParts[1].trim();
      const numMatch = secondPart.match(/^(\d+)/);
      if (numMatch) number = numMatch[1];
      
      const dashSplit = secondPart.split("-");
      if (dashSplit.length > 1) {
        district = dashSplit[1].trim();
      }
    }
    if (district.length > 50) district = district.substring(0, 50);

    // SuperFrete EXIGE um CPF válido. Se o pedido não tem, geramos um válido apenas para a emissão.
    let documentCpf = data.customerCpf ? data.customerCpf.replace(/\D/g, '') : "";
    if (!documentCpf || documentCpf.length !== 11) {
      const rnd = (n: number) => Math.round(Math.random() * n);
      const mod = (dividendo: number, divisor: number) => Math.round(dividendo - (Math.floor(dividendo / divisor) * divisor));
      const n = Array(9).fill(0).map(() => rnd(9));
      let d1 = n.reduce((total, number, index) => total + (number * (10 - index)), 0);
      d1 = 11 - mod(d1, 11);
      if (d1 >= 10) d1 = 0;
      let d2 = d1 * 2 + n.reduce((total, number, index) => total + (number * (11 - index)), 0);
      d2 = 11 - mod(d2, 11);
      if (d2 >= 10) d2 = 0;
      documentCpf = `${n.join('')}${d1}${d2}`;
    }

    const toPayload = {
      name: fullName,
      address: street,
      number: number,
      district: district,
      city: city,
      state_abbr: stateAbbr,
      postal_code: cepDestino,
      email: data.customerEmail || "",
      document: documentCpf
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
          service: 1, // 1 = PAC. O usuário precisará emitir, defaultando pra PAC.
          volumes: [{
            weight: 0.3,
            width: 15,
            height: 15,
            length: 15
          }],
          options: {
            own_hand: false,
            receipt: false,
            insurance_value: data.total < 26 ? 0 : data.total,
            non_commercial: true
          },
          order_id: data.orderId,
          products: products,
          platform: "PrincesaDeLacos"
        })
      });

      responseText = await response.text();

      if (!response.ok) {
        // Tenta extrair mensagem legível da resposta da API
        let apiMsg = "";
        try {
          const parsed = JSON.parse(responseText);
          if (parsed?.errors) {
            // A API retorna um objeto errors com os campos inválidos
            apiMsg = `${parsed.message || 'Erro'}: ${JSON.stringify(parsed.errors)}`;
          } else {
            apiMsg = parsed?.message || parsed?.error || JSON.stringify(parsed);
          }
        } catch { apiMsg = responseText.slice(0, 200); }
        throw new Error(`SuperFrete: ${apiMsg || response.statusText}`);
      }

      const resJson = JSON.parse(responseText);
      const superfreteId = resJson.id;

      if (!superfreteId) {
        throw new Error(`SuperFrete não retornou ID do carrinho. Resposta: ${responseText.slice(0, 200)}`);
      }

      // Salvar o superfreteOrderId no banco
      await supabaseAdmin
        .from("orders")
        // @ts-ignore
        .update({ superfrete_order_id: superfreteId })
        .eq("id", data.orderId);

      return { ok: true, superfreteOrderId: superfreteId };
    } catch (error: any) {
      console.error("SuperFrete Cart Exception:", error?.message || error, "| Response:", responseText);
      throw error instanceof Error ? error : new Error(String(error));
    }
  });


export async function createSuperFreteCart(orderData: { id: string; customerName: string; customerEmail: string; address: string; total: number; items: Array<{name: string; quantity: number; price: number}> }) {
  const settings = useStore.getState().settings;
  const isActive = settings.superfreteActive !== false;
  if (!isActive) return;
  return await createSuperFreteCartFn({ data: orderData });
}

