import { useStore } from "@/lib/store";

export type ShippingQuote = {
  name: string;
  price: number;
  discountPrice: number;
  deliveryTime: number; // days
  id: number;
};

export async function calculateShipping(cepDestino: string, insuranceValue: number = 0): Promise<ShippingQuote[]> {
  // Ler configurações do painel
  const settings = useStore.getState().settings;
  const token = settings.superfreteToken;
  const cepOrigem = settings.superfreteCepOrigem;

  if (!token || !cepOrigem) return [];

  // Limpar CEP
  const toCep = cepDestino.replace(/\D/g, "");
  if (toCep.length !== 8) return [];

  try {
    const response = await fetch("https://app.superfrete.com/api/v2/calculator", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        from: { postal_code: cepOrigem },
        to: { postal_code: toCep },
        services: "1,2", // PAC e SEDEX
        options: {
          own_hand: false,
          receipt: false,
          insurance_value: insuranceValue
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

    const data = await response.json();
    
    // A API da Superfrete retorna um array de cotações
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        id: item.service || item.id, // 1 ou 2
        name: item.name, // "PAC" ou "SEDEX"
        price: parseFloat(item.price),
        discountPrice: parseFloat(item.discount || item.price),
        deliveryTime: item.delivery_time
      }));
    }

    return [];
  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    return [];
  }
}
