// Server functions ADMIN — toda mutação/leitura sensível passa por aqui.
// Usa supabaseAdmin (service_role, bypass RLS) e exige token de sessão admin
// emitido por loginAdminFn (bcrypt + tabela privada admin_sessions).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const emailSchema = z.string().trim().toLowerCase().email().max(255);
const tokenSchema = z.string().min(20).max(200);

// ---------- helpers ----------
function newToken() {
  // 32 bytes hex
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function requireAdmin(token: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("admin_sessions")
    .select("email, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) throw new Error("Sessão admin inválida");
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.from("admin_sessions").delete().eq("token", token);
    throw new Error("Sessão admin expirada");
  }
  return data.email;
}

// ---------- LOGIN / LOGOUT ----------
export const loginAdminFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ email: emailSchema, password: z.string().min(1).max(200) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: cred } = await supabaseAdmin
      .from("admin_credentials")
      .select("password_hash")
      .eq("email", data.email)
      .maybeSingle();
    if (!cred) return { ok: false as const, message: "Credenciais inválidas" };
    const ok = await bcrypt.compare(data.password, cred.password_hash);
    if (!ok) return { ok: false as const, message: "Credenciais inválidas" };

    const token = newToken();
    await supabaseAdmin.from("admin_sessions").insert({
      token,
      email: data.email,
    });
    return { ok: true as const, message: "Bem-vindo!", token, email: data.email };
  });

export const logoutAdminFn = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ token: tokenSchema }).parse(i))
  .handler(async ({ data }) => {
    await supabaseAdmin.from("admin_sessions").delete().eq("token", data.token);
    return { ok: true as const };
  });

export const updateAdminPasswordFn = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        token: tokenSchema,
        newPassword: z.string().min(6).max(200),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const email = await requireAdmin(data.token);
    const password_hash = await bcrypt.hash(data.newPassword, 10);
    const { error } = await supabaseAdmin
      .from("admin_credentials")
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq("email", email);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: "Senha atualizada" };
  });

// ---------- SNAPSHOT ADMIN (todas tabelas privadas) ----------
export const adminFetchAllFn = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ token: tokenSchema }).parse(i))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const [cust, affs, affSales, txs, ords, wait, logs] = await Promise.all([
      supabaseAdmin.from("customers").select("*"),
      supabaseAdmin.from("affiliates").select("*"),
      supabaseAdmin
        .from("affiliate_sales")
        .select("*")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("transactions")
        .select("*")
        .order("date", { ascending: false }),
      supabaseAdmin
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin.from("product_waitlist").select("*"),
      supabaseAdmin
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    return {
      customers: cust.data || [],
      affiliates: affs.data || [],
      affiliateSales: affSales.data || [],
      transactions: txs.data || [],
      orders: ords.data || [],
      waitlist: wait.data || [],
      activityLogs: logs.data || [],
    };
  });

// ---------- MUTAÇÕES GENÉRICAS (allowlist de tabelas) ----------
const WRITE_TABLES = [
  "customers",
  "products",
  "categories",
  "coupons",
  "affiliates",
  "affiliate_sales",
  "affiliate_consignments",
  "transactions",
  "reviews",
  "store_settings",
  "faq_items",
  "orders",
  "activity_logs",
  "product_waitlist",
] as const;
type WriteTable = (typeof WRITE_TABLES)[number];

export const adminUpsertFn = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        token: tokenSchema,
        table: z.enum(WRITE_TABLES),
        row: z.record(z.string(), z.any()),
        onConflict: z.string().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const q: any = supabaseAdmin.from(data.table as WriteTable);
    const { error } = data.onConflict
      ? await q.upsert(data.row, { onConflict: data.onConflict })
      : await q.upsert(data.row);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const adminUpdateFn = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        token: tokenSchema,
        table: z.enum(WRITE_TABLES),
        match: z.record(z.string(), z.any()),
        patch: z.record(z.string(), z.any()),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    let q: any = (supabaseAdmin.from(data.table as WriteTable) as any).update(data.patch);
    for (const [k, v] of Object.entries(data.match)) q = q.eq(k, v);
    const { error } = await q;
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

export const adminDeleteFn = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        token: tokenSchema,
        table: z.enum(WRITE_TABLES),
        match: z.record(z.string(), z.any()),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    let q: any = supabaseAdmin.from(data.table as WriteTable).delete();
    for (const [k, v] of Object.entries(data.match)) q = q.eq(k, v);
    const { error } = await q;
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

// ---------- LEITURAS DO CLIENTE LOGADO (próprios dados) ----------
// Identificação por customerId UUID — não exige password porque já houve login.
// O frontend só envia o customerId vindo da própria sessão local após loginCustomerFn.
export const getCustomerOrdersFn = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        customerId: z.string().uuid().optional(),
        email: emailSchema.optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    if (!data.customerId && !data.email) return { orders: [] };
    let q = supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data.email) q = q.ilike("customer_email", data.email);
    const { data: rows } = await q;
    return { orders: rows || [] };
  });

export const getAffiliateSalesFn = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({ affiliateId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data }) => {
    const { data: rows } = await supabaseAdmin
      .from("affiliate_sales")
      .select("*")
      .eq("affiliate_id", data.affiliateId)
      .order("created_at", { ascending: false });
    return { sales: rows || [] };
  });

// ---------- ESCRITAS DO PRÓPRIO CLIENTE (perfil) ----------
export const updateCustomerFn = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        customerId: z.string().uuid(),
        patch: z
          .object({
            name: z.string().trim().min(1).max(255).optional(),
            phone: z.string().trim().max(50).optional(),
            address: z.string().trim().max(500).nullable().optional(),
            addresses: z.array(z.any()).optional(),
            favorites: z.array(z.string()).optional(),
          })
          .strict(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("customers")
      .update(data.patch as any)
      .eq("id", data.customerId);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });

// ---------- GATEWAY DE PAGAMENTO (Mercado Pago) ----------
export const getGatewayConfigFn = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ token: tokenSchema }).parse(i))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { data: row } = await supabaseAdmin
      .from("payment_gateway")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    return {
      mp_access_token: row?.mp_access_token ?? "",
      mp_public_key: row?.mp_public_key ?? "",
      environment: (row?.environment ?? "sandbox") as "sandbox" | "production",
      max_installments: Number(row?.max_installments ?? 3),
      installment_fees: (row?.installment_fees ?? {}) as Record<string, number>,
    };
  });

export const saveGatewayConfigFn = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        token: tokenSchema,
        mp_access_token: z.string().trim().max(500).default(""),
        mp_public_key: z.string().trim().max(500).default(""),
        environment: z.enum(["sandbox", "production"]),
        max_installments: z.number().int().min(1).max(12),
        installment_fees: z.record(z.string(), z.number().min(0).max(100)),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { error } = await supabaseAdmin.from("payment_gateway").upsert(
      {
        id: 1,
        mp_access_token: data.mp_access_token || null,
        mp_public_key: data.mp_public_key || null,
        environment: data.environment,
        max_installments: data.max_installments,
        installment_fees: data.installment_fees,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: "Configuração salva!" };
  });
