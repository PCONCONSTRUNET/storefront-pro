// Server functions ADMIN — auth via cookie httpOnly (princesa_admin_session).
// Login emite o cookie; toda função sensível usa requireAdminAuth middleware
// que lê o cookie no servidor — o token NUNCA é exposto ao JavaScript do browser.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdminAuth } from "./adminAuth.middleware";
import {
  setAdminSessionCookie,
  clearAdminSessionCookie,
  getAdminSessionCookie,
} from "./adminAuth.server";

const emailSchema = z.string().trim().toLowerCase().email().max(255);

// ---------- helpers ----------
function newToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function audit(
  email: string | null,
  action: string,
  description: string,
  metadata: Record<string, unknown> = {},
) {
  try {
    await supabaseAdmin.from("activity_logs").insert({
      action,
      category: "admin",
      description,
      metadata: { admin_email: email, ...metadata },
    });
  } catch (e) {
    console.error("[audit] failed:", e);
  }
}

// ---------- LOGIN / LOGOUT ----------
export const loginAdminFn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({ email: emailSchema, password: z.string().min(1).max(200) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // Rate limit: 5 tentativas / 5 min por e-mail (defesa contra brute-force)
    const { data: rl } = await (supabaseAdmin as any).rpc("check_rate_limit", {
      _bucket: "admin_login",
      _identifier: data.email,
      _max_requests: 5,
      _window_seconds: 300,
    });
    const rlRow = Array.isArray(rl) ? rl[0] : rl;
    if (rlRow && rlRow.allowed === false) {
      await audit(
        data.email,
        "admin.login.rate_limited",
        "Login admin bloqueado por rate limit",
        { retry_after_seconds: rlRow.retry_after_seconds },
      );
      return {
        ok: false as const,
        message: `Muitas tentativas. Tente novamente em ${rlRow.retry_after_seconds}s.`,
      };
    }

    const { data: cred } = await (supabaseAdmin as any)
      .rpc("get_admin_auth_record", { _email: data.email })
      .maybeSingle();
    if (!cred) {
      await audit(
        data.email,
        "admin.login.failed",
        "Tentativa de login admin com email inexistente",
      );
      return { ok: false as const, message: "Credenciais inválidas" };
    }
    const ok = await bcrypt.compare(data.password, cred.password_hash);
    if (!ok) {
      await audit(
        data.email,
        "admin.login.failed",
        "Senha incorreta no login admin",
      );
      return { ok: false as const, message: "Credenciais inválidas" };
    }

    const token = newToken();
    const { error } = await (supabaseAdmin as any).rpc("create_admin_session", {
      _email: data.email,
      _token: token,
    });
    if (error) return { ok: false as const, message: error.message };

    // Token vive APENAS em cookie httpOnly — nunca retorna ao browser.
    setAdminSessionCookie(token);
    await audit(data.email, "admin.login.success", "Login admin realizado");
    return { ok: true as const, message: "Bem-vindo!", email: data.email };
  });


export const logoutAdminFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const token = getCookie(ADMIN_COOKIE);
    if (token) {
      await (supabaseAdmin as any)
        .rpc("delete_admin_session", { _token: token })
        .then(() => {})
        .catch(() => {});
    }
    clearAdminSessionCookie();
    return { ok: true as const };
  });

// Bootstrap do frontend: revalida cookie e retorna email se sessão ativa.
export const getAdminSessionFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const token = getCookie(ADMIN_COOKIE);
    if (!token) return { email: null as string | null };
    const { data } = await (supabaseAdmin as any)
      .rpc("get_admin_session_record", { _token: token })
      .maybeSingle();
    if (!data || new Date(data.expires_at).getTime() < Date.now()) {
      clearAdminSessionCookie();
      return { email: null as string | null };
    }
    return { email: data.email as string };
  },
);

export const updateAdminPasswordFn = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((i) =>
    z.object({ newPassword: z.string().min(6).max(200) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const password_hash = await bcrypt.hash(data.newPassword, 10);
    const { error } = await supabaseAdmin
      .from("admin_credentials")
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq("email", context.adminEmail);
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: "Senha atualizada" };
  });

// ---------- CONSIGNAÇÕES ----------
export const listConsignmentsFn = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .handler(async () => {
    const { data: rows } = await supabaseAdmin
      .from("affiliate_consignments")
      .select("*")
      .order("picked_up_at", { ascending: false });
    return { consignments: rows || [] };
  });

export const createConsignmentFn = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((i) =>
    z
      .object({
        affiliate_id: z.string().uuid(),
        quantity: z.number().int().min(0).max(100000),
        total_value: z.number().min(0).max(1_000_000),
        picked_up_at: z.string().datetime().optional(),
        notes: z.string().trim().max(1000).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
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
  .middleware([requireAdminAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
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

export const adminUpsertFn = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((i) =>
    z
      .object({
        table: z.enum(WRITE_TABLES),
        row: z.record(z.string(), z.any()),
        onConflict: z.string().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { error } = await (supabaseAdmin as any).rpc("admin_db_write", {
      _token: context.adminToken,
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
  .middleware([requireAdminAuth])
  .inputValidator((i) =>
    z
      .object({
        table: z.enum(WRITE_TABLES),
        match: z.record(z.string(), z.any()),
        patch: z.record(z.string(), z.any()),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { error } = await (supabaseAdmin as any).rpc("admin_db_write", {
      _token: context.adminToken,
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
  .middleware([requireAdminAuth])
  .inputValidator((i) =>
    z
      .object({
        table: z.enum(WRITE_TABLES),
        match: z.record(z.string(), z.any()),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { error } = await (supabaseAdmin as any).rpc("admin_db_write", {
      _token: context.adminToken,
      _op: "delete",
      _table: data.table,
      _row: null,
      _on_conflict: null,
      _match: data.match,
      _patch: null,
    });
    if (error) return { ok: false as const, message: error.message };
    await audit(
      context.adminEmail,
      "admin.delete",
      `Exclusão em ${data.table}`,
      { table: data.table, match: data.match },
    );
    return { ok: true as const };
  });

// Snapshot completo de tabelas privadas (usado pelo cloud sync).
const READ_TABLES = [
  "customers",
  "affiliates",
  "affiliate_sales",
  "affiliate_consignments",
  "transactions",
  "orders",
  "product_waitlist",
  "activity_logs",
] as const;

export const adminReadTableFn = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((i) =>
    z
      .object({
        table: z.enum(READ_TABLES),
        limit: z.number().int().min(1).max(2000).default(1000),
        orderBy: z.string().max(64).nullable().optional(),
        orderDir: z.enum(["asc", "desc"]).default("desc"),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await (supabaseAdmin as any).rpc(
      "admin_db_read",
      {
        _token: context.adminToken,
        _table: data.table,
        _limit: data.limit,
        _order_by: data.orderBy ?? null,
        _order_dir: data.orderDir,
      },
    );
    if (error) return { ok: false as const, message: error.message, rows: [] as any[] };
    return { ok: true as const, rows: (rows || []) as any[] };
  });

// ---------- LEITURAS DO CLIENTE LOGADO (próprios dados) ----------
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
  .inputValidator((i) => z.object({ affiliateId: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { data: rows } = await supabaseAdmin
      .from("affiliate_sales")
      .select("*")
      .eq("affiliate_id", data.affiliateId)
      .order("created_at", { ascending: false });
    return { sales: rows || [] };
  });

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

// ---------- GATEWAY DE PAGAMENTO ----------
export const getGatewayConfigFn = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .handler(async () => {
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
  .middleware([requireAdminAuth])
  .inputValidator((i) =>
    z
      .object({
        mp_access_token: z.string().trim().max(500).default(""),
        mp_public_key: z.string().trim().max(500).default(""),
        environment: z.enum(["sandbox", "production"]).default("production"),
        max_installments: z.number().int().min(1).max(12),
        installment_fees: z.record(z.string(), z.number().min(0).max(100)),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    try {
      const { error } = await (supabaseAdmin as any).rpc("save_payment_gateway", {
        _mp_access_token: data.mp_access_token || "",
        _mp_public_key: data.mp_public_key || "",
        _environment: data.environment,
        _max_installments: data.max_installments,
        _installment_fees: data.installment_fees,
      });
      if (error) return { ok: false as const, message: `DB: ${error.message}` };
      await audit(
        context.adminEmail,
        "admin.gateway.save",
        "Configuração do gateway de pagamento alterada",
        {
          environment: data.environment,
          max_installments: data.max_installments,
          has_access_token: Boolean(data.mp_access_token),
          has_public_key: Boolean(data.mp_public_key),
        },
      );
      return { ok: true as const, message: "Configuração salva!" };
    } catch (e) {
      return {
        ok: false as const,
        message: e instanceof Error ? `RPC: ${e.message}` : "Erro RPC",
      };
    }
  });

// ---------- SYNC STATUS ----------
export const getSyncStatusFn = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .handler(async () => {
    async function tableStats(table: string, tsCol = "updated_at") {
      const client = supabaseAdmin as any;
      const [{ count }, latest] = await Promise.all([
        client.from(table).select("*", { count: "exact", head: true }),
        client
          .from(table)
          .select(tsCol)
          .order(tsCol, { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      return {
        count: count ?? 0,
        lastAt: (latest.data as any)?.[tsCol] ?? null,
      };
    }

    const [orders, paidOrders, transactions, activityLogs, paymentEvents, lastWebhook] =
      await Promise.all([
        tableStats("orders", "updated_at"),
        (supabaseAdmin as any)
          .from("orders")
          .select("paid_at", { count: "exact" })
          .eq("payment_status", "paid")
          .order("paid_at", { ascending: false })
          .limit(1)
          .then((r: any) => ({
            count: r.count ?? 0,
            lastAt: (r.data?.[0] as any)?.paid_at ?? null,
          })),
        tableStats("transactions", "created_at"),
        tableStats("activity_logs", "created_at"),
        tableStats("payment_events", "processed_at"),
        supabaseAdmin
          .from("payment_events")
          .select("mp_event_id, mp_payment_id, order_id, event_type, processed_at, raw_payload")
          .order("processed_at", { ascending: false })
          .limit(1)
          .maybeSingle()
          .then((r) => r.data),
      ]);

    let lastWebhookStatus: string | null = null;
    if (lastWebhook?.order_id) {
      const { data: o } = await supabaseAdmin
        .from("orders")
        .select("payment_status")
        .eq("id", lastWebhook.order_id)
        .maybeSingle();
      lastWebhookStatus = (o as any)?.payment_status ?? null;
    }

    return {
      ok: true as const,
      serverTime: new Date().toISOString(),
      tables: { orders, paidOrders, transactions, activityLogs, paymentEvents },
      lastWebhook: lastWebhook
        ? {
            mpEventId: lastWebhook.mp_event_id,
            mpPaymentId: lastWebhook.mp_payment_id,
            orderId: lastWebhook.order_id,
            eventType: lastWebhook.event_type,
            processedAt: lastWebhook.processed_at,
            orderStatus: lastWebhookStatus,
          }
        : null,
    };
  });
