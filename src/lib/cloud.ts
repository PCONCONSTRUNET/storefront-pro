// Cloud sync layer — mirrors the Zustand store to Supabase tables and hydrates on boot.
// Designed to be non-invasive: every mutation in store.ts also calls one of these
// fire-and-forget helpers so the admin sees the same data persisted in the database.

import { supabase } from "@/integrations/supabase/client";
import type {
  Affiliate,
  AffiliateSale,
  Customer,
  Order,
  Review,
  StoreSettings,
  Transaction,
} from "./store";
import type { Category, Coupon, Product } from "./data";

// ---------- helpers ----------
const log = (label: string, err: unknown) => {
  if (err) console.warn(`[cloud:${label}]`, err);
};

async function sha256(text: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return text; // fallback: store plain (dev only)
}

export const hashPassword = (email: string, password: string) =>
  sha256(`${email.trim().toLowerCase()}::${password}`);

// ---------- mappers (db row → app shape and back) ----------
const toCustomer = (r: any): Customer => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone || "",
  password: r.password_hash || "",
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
  password: r.password_hash || "",
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
  status:
    r.payment_status === "paid"
      ? "pago"
      : r.payment_status === "pending"
        ? "aguardando_pagamento"
        : r.payment_status,
  createdAt: r.created_at,
  address: r.address || "",
  notes: r.notes || undefined,
});

// ---------- writes (fire-and-forget) ----------
export const cloud = {
  async upsertCustomer(c: Customer) {
    const { error } = await supabase.from("customers").upsert(
      {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        password_hash: c.password,
        address: c.address || null,
        addresses: c.addresses || [],
        favorites: c.favorites || [],
      },
      { onConflict: "id" },
    );
    log("upsertCustomer", error);
  },
  async deleteCustomer(id: string) {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    log("deleteCustomer", error);
  },

  async upsertProduct(p: Product) {
    const { error } = await supabase.from("products").upsert(
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
        extra: { sku: p.sku, hidden: p.hidden, minStock: p.minStock },
      },
      { onConflict: "id" },
    );
    log("upsertProduct", error);
  },
  async deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    log("deleteProduct", error);
  },

  async upsertCategory(c: Category) {
    const { error } = await supabase.from("categories").upsert(
      {
        id: c.id,
        name: c.name,
        slug: c.id,
        image: c.image,
        sort_order: c.order,
      },
      { onConflict: "id" },
    );
    log("upsertCategory", error);
  },
  async deleteCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    log("deleteCategory", error);
  },

  async upsertCoupon(c: Coupon) {
    const { error } = await supabase.from("coupons").upsert(
      {
        code: c.code,
        kind: c.type,
        value: c.value,
        min_subtotal: c.minOrder,
        expires_at: c.validUntil || null,
        active: c.active,
        extra: { maxUses: c.maxUses, usedCount: c.usedCount },
      },
      { onConflict: "code" },
    );
    log("upsertCoupon", error);
  },
  async deleteCoupon(code: string) {
    const { error } = await supabase.from("coupons").delete().eq("code", code);
    log("deleteCoupon", error);
  },

  async upsertAffiliate(a: Affiliate) {
    const { error } = await supabase.from("affiliates").upsert(
      {
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        password_hash: a.password,
        commission_type: a.commissionType,
        commission_value: a.commissionValue,
        active: a.active,
      },
      { onConflict: "id" },
    );
    log("upsertAffiliate", error);
  },
  async deleteAffiliate(id: string) {
    const { error } = await supabase.from("affiliates").delete().eq("id", id);
    log("deleteAffiliate", error);
  },

  async upsertAffiliateSale(s: AffiliateSale) {
    const { error } = await supabase.from("affiliate_sales").upsert(
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
      { onConflict: "id" },
    );
    log("upsertAffiliateSale", error);
  },
  async deleteAffiliateSale(id: string) {
    const { error } = await supabase.from("affiliate_sales").delete().eq("id", id);
    log("deleteAffiliateSale", error);
  },

  async upsertTransaction(t: Transaction) {
    const { error } = await supabase.from("transactions").upsert(
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
      { onConflict: "id" },
    );
    log("upsertTransaction", error);
  },
  async deleteTransaction(id: string) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    log("deleteTransaction", error);
  },

  async upsertReview(r: Review) {
    const { error } = await supabase.from("reviews").upsert(
      {
        id: r.id,
        product_id: r.productId,
        customer_id: r.customerId || null,
        customer_name: r.customerName,
        rating: r.rating,
        comment: r.comment,
        photos: r.photos || [],
      },
      { onConflict: "id" },
    );
    log("upsertReview", error);
  },
  async deleteReview(id: string) {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    log("deleteReview", error);
  },

  async upsertSettings(s: StoreSettings) {
    const { error } = await supabase.from("store_settings").upsert(
      {
        id: 1,
        data: s as any,
      },
      { onConflict: "id" },
    );
    log("upsertSettings", error);
  },

  async updateOrderStatus(id: string, status: string) {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: status as any })
      .eq("id", id);
    log("updateOrderStatus", error);
  },
  async deleteOrder(id: string) {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    log("deleteOrder", error);
  },

  async upsertNotificationLog(l: any) {
    const { error } = await supabase.from("notification_logs").upsert(
      {
        id: l.id,
        category: l.category,
        title: l.title,
        body: l.body,
        audience: l.audience,
        recipient_id: l.recipientId || null,
        channels: l.channels,
        sent_at: l.sentAt,
        read: l.read,
        metadata: l.data || {},
      },
      { onConflict: "id" },
    );
    if (error && error.code !== "P0001") log("upsertNotificationLog", error);
  },

  async logActivity(data: {
    action: string;
    category: "auth" | "catalog" | "order" | "admin" | "error";
    description: string;
    metadata?: any;
    userId?: string;
  }) {
    const { error } = await supabase.from("activity_logs").insert({
      action: data.action,
      category: data.category,
      description: data.description,
      metadata: data.metadata || {},
      user_id: data.userId || null,
      created_at: new Date().toISOString(),
    });
    if (error && error.code !== "P0001") log("logActivity", error);
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
};

export async function fetchCloudSnapshot(): Promise<CloudSnapshot> {
  const [cust, cats, prods, coups, affs, affSales, txs, revs, settings, ords] = await Promise.all([
    supabase.from("customers").select("*"),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("products").select("*"),
    supabase.from("coupons").select("*"),
    supabase.from("affiliates").select("*"),
    supabase.from("affiliate_sales").select("*").order("created_at", { ascending: false }),
    supabase.from("transactions").select("*").order("date", { ascending: false }),
    supabase.from("reviews").select("*").order("created_at", { ascending: false }),
    supabase.from("store_settings").select("data").eq("id", 1).maybeSingle(),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500),
  ]);
  return {
    customers: (cust.data || []).map(toCustomer),
    categories: (cats.data || []).map(toCategory),
    products: (prods.data || []).map(toProduct),
    coupons: (coups.data || []).map(toCoupon),
    affiliates: (affs.data || []).map(toAffiliate),
    affiliateSales: (affSales.data || []).map(toAffiliateSale),
    transactions: (txs.data || []).map(toTransaction),
    reviews: (revs.data || []).map(toReview),
    settings: (settings.data?.data as any) || null,
    orders: (ords.data || []).map(toOrder),
  };
}
