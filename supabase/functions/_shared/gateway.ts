// Lê configuração do gateway (token MP, ambiente, parcelas, taxas)
// da tabela payment_gateway via service_role. Faz fallback para env vars.
type SupabaseClient = {
  from: (t: string) => any;
};

export type GatewayConfig = {
  access_token: string | null;
  public_key: string | null;
  environment: "production";
  max_installments: number;
  installment_fees: Record<string, number>;
};

export async function loadGatewayConfig(
  supabase: SupabaseClient,
): Promise<GatewayConfig> {
  const envToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") || null;
  const envPub = Deno.env.get("MERCADOPAGO_PUBLIC_KEY") || null;
  let access_token = envToken;
  let public_key = envPub;
  let max_installments = 3;
  let installment_fees: Record<string, number> = {};

  try {
    const { data } = await supabase
      .from("payment_gateway")
      .select(
        "mp_access_token, mp_public_key, max_installments, installment_fees",
      )
      .eq("id", 1)
      .maybeSingle();
    if (data) {
      access_token = access_token ?? data.mp_access_token ?? null;
      public_key = public_key ?? data.mp_public_key ?? null;
      max_installments = Number(data.max_installments ?? 3);
      installment_fees = (data.installment_fees as any) ?? {};
    }
  } catch (e) {
    console.warn("[gateway] falha ao ler payment_gateway:", e);
  }

  return {
    access_token,
    public_key,
    environment: "production",
    max_installments,
    installment_fees,
  };
}
