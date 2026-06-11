import { useStore } from "@/lib/store";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SUPERFRETE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODExNDI2NDMsInN1YiI6IlF1RzJ4cmlITXdldXJZbVI1Q0hVdDA1eXh5ZjEifQ.TpxzJ_bMMFS7CconVPTzBpJh8cWZbPWujwrwuvrDac0";

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
          "Authorization": `Bearer ${SUPERFRETE_TOKEN}`,
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
      cepOrigem: z.string().min(8),
      cepDestino: z.string().min(8),
      customerName: z.string(),
      customerDocument: z.string().optional(),
      customerAddress: z.string(),
      weight: z.number().optional().default(0.3),
      insuranceValue: z.number().optional().default(0),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const response = await fetch("https://api.superfrete.com/api/v0/cart", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SUPERFRETE_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          from: { 
            postal_code: data.cepOrigem,
            name: "Princesa de Laços", // or from settings
          },
          to: { 
            postal_code: data.cepDestino,
            name: data.customerName,
            address: data.customerAddress,
            document: data.customerDocument || ""
          },
          services: "1,2", // PAC e SEDEX
          options: {
            own_hand: false,
            receipt: false,
            insurance_value: data.insuranceValue
          },
          package: {
            weight: data.weight,
            width: 15,
            height: 15,
            length: 15
          },
          order_id: data.orderId,
          tags: ["via correios"]
        })
      });

      if (!response.ok) {
        console.error("SuperFrete Cart Error:", await response.text());
        return { ok: false, error: "Falha ao enviar para o Super Frete" };
      }

      const resData = await response.json();
      return { ok: true, data: resData };
    } catch (error) {
      console.error("SuperFrete Cart Exception:", error);
      return { ok: false, error: "Erro interno ao integrar com Super Frete" };
    }
  });

export async function createSuperFreteCart(orderData: { id: string; customerName: string; address: string; customerCpf?: string; total: number; }) {
  const settings = useStore.getState().settings;
  const isActive = settings.superfreteActive !== false;
  const cepOrigem = settings.superfreteCepOrigem?.replace(/\D/g, "");

  if (!isActive || !cepOrigem || cepOrigem.length !== 8) return;

  const cepMatch = orderData.address.match(/CEP:\s*([\d-]+)/i);
  const cepDestino = cepMatch ? cepMatch[1].replace(/\D/g, "") : "";
  if (cepDestino.length !== 8) return;

  return await createSuperFreteCartFn({ 
    data: { 
      orderId: orderData.id,
      cepOrigem, 
      cepDestino, 
      customerName: orderData.customerName,
      customerAddress: orderData.address,
      customerDocument: orderData.customerCpf,
      insuranceValue: orderData.total > 0 ? orderData.total : 0
    } 
  });
}
