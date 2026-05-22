// Server functions ADMIN — toda mutação/leitura sensível passa por aqui.
// Usa supabaseAdmin (service_role, bypass RLS) e exige token de sessão admin
// emitido por loginAdminFn (bcrypt + tabela privada admin_sessions).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { supabase } from "@/integrations/supabase/client";
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
      .select("email, password_hash")
      .eq("email", data.email)
      .maybeSingle();
    if (!cred) return { ok: false as const, message: "Credenciais inválidas" };
    const ok = await bcrypt.compare(data.password, cred.password_hash);
    if (!ok) return { ok: false as const, message: "Credenciais inválidas" };

    const token = newToken();
    const { error } = await supabaseAdmin.from("admin_sessions").insert({
      email: cred.email,
      token,
    });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: "Bem-vindo!", token, email: cred.email };
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
// Lê via client server depois de validar a sessão admin.
async function adminRead(token: string, table: string, orderBy?: string, dir: "asc" | "desc" = "desc", limit = 1000) {
  await requireAdmin(token);
  let query = supabaseAdmin.from(table as any).select("*").limit(limit);
  if (orderBy) query = query.order(orderBy, { ascending: dir === "asc" });
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as any[]) || [];
}

export const adminFetchAllFn = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ token: tokenSchema }).parse(i))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const [cust, affs, affSales, affCons, txs, ords, wait, logs] =
      await Promise.all([
        adminRead(data.token, "customers"),
        adminRead(data.token, "affiliates"),
        adminRead(data.token, "affiliate_sales", "created_at", "desc"),
        adminRead(data.token, "affiliate_consignments", "picked_up_at", "desc"),
        adminRead(data.token, "transactions", "date", "desc"),
        adminRead(data.token, "orders", "created_at", "desc", 500),
        adminRead(data.token, "product_waitlist"),
        adminRead(data.token, "activity_logs", "created_at", "desc", 200),
      ]);
    return {
      customers: cust,
      affiliates: affs,
      affiliateSales: affSales,
      affiliateConsignments: affCons,
      transactions: txs,
      orders: ords,
      waitlist: wait,
      activityLogs: logs,
    };
  });


// ---------- CONSIGNAÇÕES (retiradas de laços pela afiliada) ----------
export const listConsignmentsFn = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ token: tokenSchema }).parse(i))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { data: rows } = await supabaseAdmin
      .from("affiliate_consignments")
      .select("*")
      .order("picked_up_at", { ascending: false });
    return { consignments: rows || [] };
  });

export const createConsignmentFn = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        token: tokenSchema,
        affiliate_id: z.string().uuid(),
        quantity: z.number().int().min(0).max(100000),
        total_value: z.number().min(0).max(1_000_000),
        picked_up_at: z.string().datetime().optional(),
        notes: z.string().trim().max(1000).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { data: row, error } = await supabaseAdmin
      .from("affiliate_consignments")
      .insert({
        affiliate_id: data.affiliate_id,
        quantity: data.quantity,
        total_value: data.total_value,
        picked_up_at: data.picked_up_at ?? new Date().toISOString(),
        notes: data.notes ?? null,
      })
      .select("*")
      .single();
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, row };
  });

export const deleteConsignmentFn = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({ token: tokenSchema, id: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { error } = await supabaseAdmin
      .from("affiliate_consignments")
      .delete()
      .eq("id", data.id);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
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
    const { error } = await (supabase as any).rpc("admin_db_write", {
      _token: data.token,
      _op: "upsert",
      _table: data.table,
      _row: data.row,
      _on_conflict: data.onConflict ?? null,
      _match: null,
      _patch: null,
    });
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
    const { error } = await (supabase as any).rpc("admin_db_write", {
      _token: data.token,
      _op: "update",
      _table: data.table,
      _row: null,
      _on_conflict: null,
      _match: data.match,
      _patch: data.patch,
    });
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
    const { error } = await (supabase as any).rpc("admin_db_write", {
      _token: data.token,
      _op: "delete",
      _table: data.table,
      _row: null,
      _on_conflict: null,
      _match: data.match,
      _patch: null,
    });
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
    const { data: rows } = await (supabase as any).rpc("get_payment_gateway");
    const row = Array.isArray(rows) ? rows[0] : rows;
    return {
      mp_access_token: row?.mp_access_token ?? "",
      mp_public_key: row?.mp_public_key ?? "",
      environment: "production" as const,
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
        environment: z.enum(["sandbox", "production"]).default("production"),
        max_installments: z.number().int().min(1).max(12),
        installment_fees: z.record(z.string(), z.number().min(0).max(100)),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    try {
      await requireAdmin(data.token);
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? `Auth: ${e.message}` : "Sessão inválida" };
    }
    try {
      const { error } = await (supabase as any).rpc("save_payment_gateway", {
        _mp_access_token: data.mp_access_token || "",
        _mp_public_key: data.mp_public_key || "",
        _environment: data.environment,
        _max_installments: data.max_installments,
        _installment_fees: data.installment_fees,
      });
      if (error) return { ok: false as const, message: `DB: ${error.message}` };
      return { ok: true as const, message: "Configuração salva!" };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? `RPC: ${e.message}` : "Erro RPC" };
    }
  });
