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
  const envToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")?.trim() || null;
  const envPub = Deno.env.get("MERCADOPAGO_PUBLIC_KEY")?.trim() || null;
  let access_token: string | null = null;
  let public_key: string | null = null;
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
      access_token = String(data.mp_access_token ?? "").trim() || null;
      public_key = String(data.mp_public_key ?? "").trim() || null;
      max_installments = Number(data.max_installments ?? 3);
      installment_fees = (data.installment_fees as any) ?? {};
    }
  } catch (e) {
    console.warn("[gateway] falha ao ler payment_gateway:", e);
  }

  access_token = access_token ?? envToken;
  public_key = public_key ?? envPub;

  return {
    access_token,
    public_key,
    environment: "production",
    max_installments,
    installment_fees,
  };
}
