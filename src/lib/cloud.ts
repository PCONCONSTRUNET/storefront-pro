// Cloud sync — leituras públicas via supabase anon (RLS permite só o que é público),
// e TODAS as mutações + leituras sensíveis via server functions admin que validam
// a sessão pelo cookie httpOnly "princesa_admin_session". Sem cookie válido,
// as funções retornam 401 e a chamada é silenciosamente ignorada.

import { supabase } from "@/integrations/supabase/client";
import {
  adminUpsertFn,
  adminDeleteFn,
  adminUpdateFn,
  adminReadTableFn,
  updateCustomerFn,
} from "./admin.functions";
import { applyOrderStockDecrementFn } from "./secured.functions";
import type {
  Affiliate,
  AffiliateSale,
  Customer,
  Order,
  Review,
  StoreSettings,
  Transaction,
  WaitlistEntry,
  FAQItem,
  ActivityLog,
} from "./store";
import type { Category, Coupon, Product } from "./data";
import { normalizeOrderStatus, normalizeDeliveryStatus } from "./orderStatus";

// ---------- helpers ----------
const log = (label: string, err: unknown) => {
  if (err) console.warn(`[cloud:${label}]`, err);
};

type AdminSnapshot = {
  customers: Record<string, unknown>[];
  affiliates: Record<string, unknown>[];
  affiliateSales: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
  orders: Record<string, unknown>[];
  waitlist: Record<string, unknown>[];
  activityLogs: Record<string, unknown>[];
};

// Checa se o usuário está logado como admin no store (sem expor token).
function isAdminLogged(): boolean {
  try {
    // import dinâmico evita ciclo entre store ↔ cloud
    const { useStore } = require("./store");
    return Boolean(useStore.getState().isAdmin);
  } catch {
    return false;
  }
}

async function adminUpsert(
  table: string,
  row: Record<string, any>,
  onConflict?: string,
) {
  if (!isAdminLogged()) {
    throw new Error(
      "Sessão admin expirada. Faça login novamente para salvar.",
    );
  }
  const r = await adminUpsertFn({
    data: { table: table as any, row, onConflict },
  });
  if (!r.ok) {
    log(`upsert ${table}`, r.message);
    throw new Error(r.message || `Falha ao salvar em ${table}`);
  }
}

async function adminDelete(table: string, match: Record<string, any>) {
  if (!isAdminLogged()) return;
  try {
    const r = await adminDeleteFn({
      data: { table: table as any, match },
    });
    if (!r.ok) log(`delete ${table}`, r.message);
  } catch (e) {
    log(`delete ${table}`, e);
  }
}

async function adminPatch(
  table: string,
  match: Record<string, any>,
  patch: Record<string, any>,
) {
  if (!isAdminLogged()) return;
  try {
    const r = await adminUpdateFn({
      data: { table: table as any, match, patch },
    });
    if (!r.ok) log(`update ${table}`, r.message);
  } catch (e) {
    log(`update ${table}`, e);
  }
}

// Compat shim para fluxos antigos que ainda esperam hashPassword.
async function sha256(text: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(text),
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return text;
}
export const hashPassword = (email: string, password: string) =>
  sha256(`${email.trim().toLowerCase()}::${password}`);

// ---------- mappers ----------
const toCustomer = (r: any): Customer => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone || "",
  password: "",
  address: r.address || undefined,
  addresses: Array.isArray(r.addresses) ? r.addresses : [],
  favorites: Array.isArray(r.favorites) ? r.favorites : [],
  createdAt: r.created_at,
});

const toCategory = (r: any): Category => ({
  id: r.id,
  name: r.name,
  image: r.image || "🎀",
  order: r.sort_order ?? 0,
});

const toProduct = (r: any): Product => ({
  id: r.id,
  name: r.name,
  description: r.description || "",
  price: Number(r.price) || 0,
  oldPrice: r.original_price != null ? Number(r.original_price) : undefined,
  image: Array.isArray(r.images) && r.images[0] ? r.images[0] : "",
  gallery: Array.isArray(r.images) ? r.images.slice(1) : [],
  category: r.category_id || "",
  stock: r.stock ?? 0,
  sku: r.extra?.sku || "",
  active: r.active !== false,
  hidden: r.extra?.hidden || false,
  minStock: r.extra?.minStock,
  sortOrder: r.extra?.sortOrder,
  variations: Array.isArray(r.variations) ? r.variations : [],
});

const toCoupon = (r: any): Coupon => ({
  code: r.code,
  type: r.kind === "fixed" ? "fixed" : "percent",
  value: Number(r.value) || 0,
  validUntil: r.expires_at || "",
  maxUses: r.extra?.maxUses ?? 999,
  usedCount: r.extra?.usedCount ?? 0,
  minOrder: Number(r.min_subtotal) || 0,
  active: r.active !== false,
});

const toAffiliate = (r: any): Affiliate => ({
  id: r.id,
  name: r.name,
  email: r.email,
  password: "",
  phone: r.phone || "",
  commissionType: r.commission_type === "fixed" ? "fixed" : "percent",
  commissionValue: Number(r.commission_value) || 0,
  active: r.active !== false,
  createdAt: r.created_at,
});

const toAffiliateSale = (r: any): AffiliateSale => ({
  id: r.id,
  affiliateId: r.affiliate_id,
  customerName: r.customer_name,
  customerPhone: r.customer_phone || undefined,
  productDescription: r.product_description,
  saleValue: Number(r.sale_value) || 0,
  commissionEarned: Number(r.commission_earned) || 0,
  status: (r.status as any) || "pendente",
  notes: r.notes || undefined,
  createdAt: r.created_at,
});

const toTransaction = (r: any): Transaction => ({
  id: r.id,
  kind: r.kind,
  category: r.category,
  description: r.description,
  amount: Number(r.amount) || 0,
  date: r.date,
  affiliateId: r.affiliate_id || undefined,
  productSummary: r.product_summary || undefined,
  notes: r.notes || undefined,
  createdAt: r.created_at,
});

const toReview = (r: any): Review => ({
  id: r.id,
  productId: r.product_id,
  customerId: r.customer_id || "",
  customerName: r.customer_name,
  rating: r.rating,
  comment: r.comment || "",
  photos: Array.isArray(r.photos) ? r.photos : [],
  createdAt: r.created_at,
});

const toOrder = (r: any): Order => ({
  id: r.id,
  customerId: "guest",
  customerName: r.customer_name,
  customerEmail: r.customer_email,
  customerPhone: r.customer_phone,
  items: Array.isArray(r.items) ? r.items : [],
  subtotal: Number(r.subtotal) || 0,
  discount: Number(r.discount) || 0,
  shipping: Number(r.shipping) || 0,
  total: Number(r.total) || 0,
  paymentMethod: r.payment_method,
  deliveryMethod: r.delivery_method,
  status: normalizeOrderStatus(r.payment_status),
  deliveryStatus: normalizeDeliveryStatus(r.delivery_status),
  createdAt: r.created_at,
  address: r.address || "",
  notes: r.notes || undefined,
  paymentStatus: r.payment_status || undefined,
  paidAt: r.paid_at || undefined,
  mpPaymentId: r.mp_payment_id || undefined,
  pixExpiresAt: r.pix_expires_at || undefined,
});

const toWaitlist = (r: any): WaitlistEntry => ({
  id: r.id,
  productId: r.product_id,
  email: r.email,
  customerId: r.customer_id || undefined,
  notified: r.notified,
  createdAt: r.created_at,
});

const toFAQ = (r: any): FAQItem => ({
  id: r.id,
  category: r.category,
  question: r.question,
  answer: r.answer,
  sortOrder: r.sort_order,
});

const toActivityLog = (r: any): ActivityLog => ({
  id: r.id,
  action: r.action,
  category: r.category as any,
  description: r.description,
  metadata: r.metadata,
  userId: r.user_id || undefined,
  createdAt: r.created_at,
});

// ---------- writes ----------
export const cloud = {
  async upsertCustomer(c: Customer) {
    // Atualização de cliente vem do próprio cliente OU do admin.
    // Se admin, vai pelo proxy; se cliente comum, vai pelo updateCustomerFn.
    const token = getAdminToken();
    const row = {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address || null,
      addresses: c.addresses || [],
      favorites: c.favorites || [],
    };
    if (token) {
      await adminUpsert("customers", row, "id");
      return;
    }
    // cliente comum: atualizar só campos seguros do próprio perfil
    try {
      await updateCustomerFn({
        data: {
          customerId: c.id,
          patch: {
            name: c.name,
            phone: c.phone,
            address: c.address ?? null,
            addresses: (c.addresses || []) as any,
            favorites: c.favorites || [],
          },
        },
      });
    } catch (e) {
      log("upsertCustomer", e);
    }
  },
  async deleteCustomer(id: string) {
    await adminDelete("customers", { id });
  },

  async upsertProduct(p: Product) {
    await adminUpsert(
      "products",
      {
        id: p.id,
        name: p.name,
        slug: p.id,
        price: p.price,
        original_price: p.oldPrice ?? null,
        description: p.description,
        images: [p.image, ...(p.gallery || [])].filter(Boolean),
        category_id: p.category,
        stock: p.stock,
        active: p.active,
        featured: false,
        variations: p.variations || [],
        extra: { sku: p.sku, hidden: p.hidden, minStock: p.minStock, sortOrder: p.sortOrder },
      },
      "id",
    );
  },
  async deleteProduct(id: string) {
    await adminDelete("products", { id });
  },

  async upsertCategory(c: Category) {
    await adminUpsert(
      "categories",
      {
        id: c.id,
        name: c.name,
        slug: c.id,
        image: c.image,
        sort_order: c.order,
      },
      "id",
    );
  },
  async deleteCategory(id: string) {
    await adminDelete("categories", { id });
  },

  async upsertCoupon(c: Coupon) {
    await adminUpsert(
      "coupons",
      {
        code: c.code,
        kind: c.type,
        value: c.value,
        min_subtotal: c.minOrder,
        expires_at: c.validUntil || null,
        active: c.active,
        extra: { maxUses: c.maxUses, usedCount: c.usedCount },
      },
      "code",
    );
  },
  async deleteCoupon(code: string) {
    await adminDelete("coupons", { code });
  },

  async upsertAffiliate(a: Affiliate) {
    await adminUpsert(
      "affiliates",
      {
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        commission_type: a.commissionType,
        commission_value: a.commissionValue,
        active: a.active,
      },
      "id",
    );
  },
  async deleteAffiliate(id: string) {
    await adminDelete("affiliates", { id });
  },

  async upsertAffiliateSale(s: AffiliateSale) {
    await adminUpsert(
      "affiliate_sales",
      {
        id: s.id,
        affiliate_id: s.affiliateId,
        customer_name: s.customerName,
        customer_phone: s.customerPhone || null,
        product_description: s.productDescription,
        sale_value: s.saleValue,
        commission_earned: s.commissionEarned,
        status: s.status,
        notes: s.notes || null,
      },
      "id",
    );
  },
  async deleteAffiliateSale(id: string) {
    await adminDelete("affiliate_sales", { id });
  },

  async upsertTransaction(t: Transaction) {
    await adminUpsert(
      "transactions",
      {
        id: t.id,
        kind: t.kind,
        category: t.category,
        description: t.description,
        amount: t.amount,
        date: t.date,
        affiliate_id: t.affiliateId || null,
        product_summary: t.productSummary || null,
        notes: t.notes || null,
      },
      "id",
    );
  },
  async deleteTransaction(id: string) {
    await adminDelete("transactions", { id });
  },

  async upsertReview(r: Review) {
    // Reviews podem ser criadas por clientes via insert público; updates só admin.
    const token = getAdminToken();
    const row = {
      id: r.id,
      product_id: r.productId,
      customer_id: r.customerId || null,
      customer_name: r.customerName,
      rating: r.rating,
      comment: r.comment,
      photos: r.photos || [],
    };
    if (token) {
      await adminUpsert("reviews", row, "id");
    } else {
      const { error } = await supabase.from("reviews").insert(row);
      log("upsertReview", error);
    }
  },
  async deleteReview(id: string) {
    await adminDelete("reviews", { id });
  },

  async upsertSettings(s: StoreSettings) {
    await adminUpsert("store_settings", { id: 1, data: s as any }, "id");
  },

  async updateOrderStatus(id: string, status: string) {
    await adminPatch("orders", { id }, { payment_status: status });
    if (status === "paid" || status === "approved" || status === "pago") {
      try {
        await applyOrderStockDecrementFn({ data: { orderId: id } });
      } catch (e) {
        console.warn("[cloud] stock decrement failed", e);
      }
    }
  },
  async applyOrderStockDecrement(id: string) {
    try {
      await applyOrderStockDecrementFn({ data: { orderId: id } });
    } catch (e) {
      console.warn("[cloud] stock decrement failed", e);
    }
  },
  async updateDeliveryStatus(id: string, status: string) {
    await adminPatch("orders", { id }, { delivery_status: status });
  },
  async deleteOrder(id: string) {
    await adminDelete("orders", { id });
  },

  async upsertNotificationLog(_l: any) {
    // notification_logs descontinuado nesta camada; preservado como no-op.
  },

  async logActivity(data: Omit<ActivityLog, "id" | "createdAt">) {
    // activity_logs ainda permite insert público (auditoria básica).
    const { error } = await supabase.from("activity_logs").insert({
      action: data.action,
      category: data.category,
      description: data.description,
      metadata: data.metadata || {},
      user_id: data.userId || null,
    });
    if (error && (error as any).code !== "P0001") log("logActivity", error);
  },

  async joinWaitlist(
    data: Omit<WaitlistEntry, "id" | "createdAt" | "notified">,
  ) {
    // Insert público mantido pra cliente entrar na fila sem login.
    const { error } = await supabase.from("product_waitlist").insert({
      product_id: data.productId,
      customer_id: data.customerId || null,
      email: data.email,
    });
    log("joinWaitlist", error);
  },

  async upsertFAQ(f: FAQItem) {
    await adminUpsert("faq_items", {
      id: f.id,
      category: f.category,
      question: f.question,
      answer: f.answer,
      sort_order: f.sortOrder,
    });
  },

  async deleteFAQ(id: string) {
    await adminDelete("faq_items", { id });
  },
};

// ---------- hydration ----------
export type CloudSnapshot = {
  customers: Customer[];
  products: Product[];
  categories: Category[];
  coupons: Coupon[];
  affiliates: Affiliate[];
  affiliateSales: AffiliateSale[];
  transactions: Transaction[];
  reviews: Review[];
  settings: Partial<StoreSettings> | null;
  orders: Order[];
  faq: FAQItem[];
  waitlist: WaitlistEntry[];
  activityLogs: ActivityLog[];
};

export async function fetchCloudSnapshot(): Promise<CloudSnapshot> {
  // Leituras públicas (RLS permite anon SELECT):
  const [cats, prods, coups, revs, settings, faq] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase.from("products").select("*"),
    supabase.from("coupons").select("*"),
    supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("store_settings").select("data").eq("id", 1).maybeSingle(),
    supabase
      .from("faq_items")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  // Leituras privadas só se for admin logado. Usa RPC direto para funcionar
  // igual no preview e no domínio próprio, sem depender de server function.
  let admin: AdminSnapshot | null = null;
  const token = getAdminToken();
  if (token) {
    try {
      const read = async (
        table: string,
        orderBy?: string,
        orderDir: "asc" | "desc" = "desc",
        limit = 1000,
      ) => {
        const { data, error } = await (supabase as any).rpc("admin_db_read", {
          _token: token,
          _table: table,
          _limit: limit,
          _order_by: orderBy ?? null,
          _order_dir: orderDir,
        });
        if (error) throw error;
        return (data || []) as Record<string, unknown>[];
      };
      const [customers, affiliates, affiliateSales, affiliateConsignments, transactions, orders, waitlist, activityLogs] =
        await Promise.all([
          read("customers"),
          read("affiliates"),
          read("affiliate_sales", "created_at", "desc"),
          read("affiliate_consignments", "picked_up_at", "desc"),
          read("transactions", "date", "desc"),
          read("orders", "created_at", "desc", 500),
          read("product_waitlist"),
          read("activity_logs", "created_at", "desc", 200),
        ]);
      admin = { customers, affiliates, affiliateSales, transactions, orders, waitlist, activityLogs };
    } catch (e) {
      console.warn("[cloud:adminFetchAll]", e);
    }
  }

  return {
    customers: (admin?.customers || []).map(toCustomer),
    categories: (cats.data || []).map(toCategory),
    products: (prods.data || []).map(toProduct),
    coupons: (coups.data || []).map(toCoupon),
    affiliates: (admin?.affiliates || []).map(toAffiliate),
    affiliateSales: (admin?.affiliateSales || []).map(toAffiliateSale),
    transactions: (admin?.transactions || []).map(toTransaction),
    reviews: (revs.data || []).map(toReview),
    settings: (settings.data?.data as any) || null,
    orders: (admin?.orders || []).map(toOrder),
    faq: (faq.data || []).map(toFAQ),
    waitlist: (admin?.waitlist || []).map(toWaitlist),
    activityLogs: (admin?.activityLogs || []).map(toActivityLog),
  };
}
