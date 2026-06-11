import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";
import { useEffect, useState } from "react";
import {
  initialProducts,
  initialCategories,
  initialCoupons,
  initialFAQ,
  type Product,
  type Category,
  type Coupon,
  type FAQItem as FAQItemData,
} from "./data";
import { useNotifications } from "./notifications";
import { cloud, fetchCloudSnapshot } from "./cloud";
import { supabase } from "@/integrations/supabase/client";
import {
  detectAndAlertNewOrders,
  resetAdminOrderAlert,
} from "./adminOrderAlert";
export {
  ORDER_STATUS_LABEL,
  getOrderStatusLabel,
  normalizeOrderStatus,
  DELIVERY_STATUS_LABEL,
  getDeliveryStatusLabel,
  normalizeDeliveryStatus,
  type OrderStatus,
  type DeliveryStatus,
} from "./orderStatus";
import { normalizeOrderStatus, normalizeDeliveryStatus, type OrderStatus, type DeliveryStatus } from "./orderStatus";

const brlFmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export type CartItem = {
  productId: string;
  quantity: number;
  variation?: string;
};

export type Review = {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  photos: string[];
  videos: string[];
  verified: boolean;
  variation?: string;
  orderId?: string;
  createdAt: string;
};

export type WaitlistEntry = {
  id: string;
  productId: string;
  customerId?: string;
  email: string;
  notified: boolean;
  createdAt: string;
};

export type FAQItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
};

export type ActivityLog = {
  id: string;
  action: string;
  category: "auth" | "catalog" | "order" | "admin" | "error" | "affiliate";
  description: string;
  metadata?: any;
  userId?: string;
  createdAt: string;
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf?: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    variation?: string;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: "pix" | "card" | "cash";
  deliveryMethod: "entrega" | "retirada";
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  address: string;
  couponCode?: string;
  notes?: string;
  paymentStatus?: string;
  paidAt?: string;
  mpPaymentId?: string;
  pixExpiresAt?: string;
  trackingCode?: string;
};

export type Affiliate = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  commissionType: "percent" | "fixed";
  commissionValue: number;
  active: boolean;
  createdAt: string;
};

export type AffiliateSaleStatus = "pendente" | "confirmada" | "cancelada";

export type AffiliateSale = {
  id: string;
  affiliateId: string;
  customerName: string;
  customerPhone?: string;
  productDescription: string;
  saleValue: number;
  commissionEarned: number;
  status: AffiliateSaleStatus;
  notes?: string;
  createdAt: string;
};

export type TransactionKind = "entrada" | "saida";
export type TransactionCategory =
  | "venda"
  | "comissao_afiliada"
  | "fornecedor"
  | "marketing"
  | "operacional"
  | "outros";

export type Transaction = {
  id: string;
  kind: TransactionKind;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string;
  affiliateId?: string;
  productSummary?: string;
  notes?: string;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  addresses?: string[];
  addressData?: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    cpf?: string;
  };
  favorites?: string[];
  createdAt: string;
};

export type StoreSettings = {
  storeName: string;
  whatsapp: string;
  address: string;
  instagram: string;
  facebook: string;
  shippingFee: number;
  acceptCash: boolean;
  acceptCard: boolean;
  acceptPix: boolean;
  bannerTitle: string;
  bannerSubtitle: string;
  email: string;
  cpfCnpj?: string;
  shippingRules?: { id: string; state: string; city: string; fee: number }[];
  superfreteActive?: boolean;
  superfreteCepOrigem?: string;
  shippingFeeActive?: boolean;
};

const defaultSettings: StoreSettings = {
  storeName: "Princesa de Laços",
  whatsapp: "(48) 8864-4474",
  email: "jessicamendes-20@outlook.com",
  address: "Rua Jaime Locatelli — Bairro Farroupilha",
  instagram: "@princesadelacos",
  facebook: "/princesadelacos",
  shippingFee: 12.9,
  acceptCash: true,
  acceptCard: true,
  acceptPix: true,
  bannerTitle: "Coleção Encantada 2026",
  bannerSubtitle: "Laços feitos com amor para princesas de todas as idades",
  superfreteActive: true,
  superfreteCepOrigem: "88735000",
  shippingFeeActive: true,
};

export type SessionKind = "admin" | "customer" | "affiliate";
export type SessionToken = {
  token: string;
  subjectId: string;
  issuedAt: string;
  expiresAt: string;
};

// Customer sessions never expire — only explicit logout clears them.
// Admin sessions slide with a 30-day TTL (sensitive area).
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 365 * 100; // effectively forever (100 years)
const CUSTOMER_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 365 * 100; // never expires
const SESSION_REFRESH_THRESHOLD_MS = 1000 * 60 * 60 * 24; // refresh at most once/day

function makeSession(subjectId: string): SessionToken {
  const now = Date.now();
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return {
    token: `${subjectId}.${rand}`,
    subjectId,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
  };
}

function isSessionValid(s: SessionToken | null | undefined): s is SessionToken {
  if (!s) return false;
  return new Date(s.expiresAt).getTime() > Date.now();
}

type AppState = {
  products: Product[];
  categories: Category[];
  coupons: Coupon[];
  cart: CartItem[];
  orders: Order[];
  customers: Customer[];
  currentCustomerId: string | null;
  isAdmin: boolean;
  settings: StoreSettings;
  appliedCoupon: string | null;
  affiliates: Affiliate[];
  affiliateSales: AffiliateSale[];
  currentAffiliateId: string | null;
  transactions: Transaction[];
  reviews: Review[];
  adminPasswordOverride: Record<string, string>;
  adminToken: string | null;
  sessions: {
    admin: SessionToken | null;
    customer: SessionToken | null;
    affiliate: SessionToken | null;
  };
  // New features
  faq: FAQItem[];
  waitlist: WaitlistEntry[];
  activityLogs: ActivityLog[];
  referralId: string | null;
  setReferralId: (id: string | null) => void;

  refreshSession: (kind: SessionKind) => void;
  findAccountByEmail: (
    email: string,
  ) => { kind: SessionKind; email: string; phone?: string } | null;
  resetPasswordFor: (
    kind: SessionKind,
    email: string,
    newPassword: string,
  ) => { ok: boolean; message: string };

  addToCart: (productId: string, quantity?: number, variation?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;

  registerCustomer: (c: Omit<Customer, "id" | "createdAt">) => Promise<{
    ok: boolean;
    message: string;
  }>;
  loginCustomer: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; message: string }>;
  logoutCustomer: () => void;
  updateCustomer: (
    data: Partial<Pick<Customer, "name" | "phone" | "address" | "password" | "addressData">>,
  ) => Promise<{
    ok: boolean;
    message: string;
  }>;
  addAddress: (address: string) => void;
  removeAddress: (index: number) => void;
  toggleFavorite: (productId: string) => void;
  loginAdmin: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; message: string }>;
  logoutAdmin: () => void;

  loginAffiliate: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; message: string }>;
  logoutAffiliate: () => void;
  registerAffiliate: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<{
    ok: boolean;
    message: string;
  }>;
  upsertAffiliate: (a: Affiliate) => void;
  deleteAffiliate: (id: string) => void;
  registerAffiliateSale: (
    s: Omit<
      AffiliateSale,
      "id" | "createdAt" | "commissionEarned" | "status"
    > & {
      status?: AffiliateSaleStatus;
      commissionOverride?: number;
    },
  ) => AffiliateSale | null;
  updateAffiliateSaleStatus: (id: string, status: AffiliateSaleStatus) => void;
  deleteAffiliateSale: (id: string) => void;

  placeOrder: (data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerCpf?: string;
    address: string;
    paymentMethod: "pix" | "card" | "cash";
    deliveryMethod: "entrega" | "retirada";
    notes?: string;
  }) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrderLocally: (id: string, patch: Partial<Order>) => void;
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => void;
  updateOrderNotes: (id: string, notes: string) => void;
  updateOrderTrackingCode: (id: string, trackingCode: string) => void;
  deleteOrder: (id: string) => void;
  saveRemoteOrder: (data: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerCpf?: string;
    items: Order["items"];
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    paymentMethod: "pix" | "card" | "cash";
    deliveryMethod: "entrega" | "retirada";
    address: string;
    notes?: string;
    status: OrderStatus;
    mpPaymentId?: string;
    paidAt?: string;
  }) => void;

  upsertProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => void;
  upsertCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  upsertCoupon: (c: Coupon) => void;
  deleteCoupon: (code: string) => void;
  updateSettings: (s: Partial<StoreSettings>) => void;

  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => Transaction;
  updateTransaction: (
    id: string,
    patch: Partial<Omit<Transaction, "id" | "createdAt">>,
  ) => void;
  deleteTransaction: (id: string) => void;

  addReview: (r: {
    productId: string;
    rating: number;
    comment: string;
    photos: string[];
    videos: string[];
  }) => Promise<{ ok: boolean; message: string }>;
  deleteReview: (id: string) => void;

  joinWaitlist: (
    productId: string,
    email: string,
  ) => { ok: boolean; message: string };
  upsertFAQ: (f: FAQItem) => void;
  deleteFAQ: (id: string) => void;

  sync: () => Promise<void>;
};

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const val = await get(name);
      if (val) return val;
    } catch (e) {
      console.warn("IndexedDB get falhou, tentando localStorage", e);
    }
    return localStorage.getItem(name) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await set(name, value);
    } catch (e) {
      console.warn("IndexedDB set falhou", e);
    }
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      // Ignora erro de cota
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await del(name);
    } catch (e) {}
    localStorage.removeItem(name);
  },
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({

      products: initialProducts,
      categories: initialCategories,
      coupons: initialCoupons,
      cart: [],
      orders: [],
      customers: [],
      currentCustomerId: null,
      isAdmin: false,
      settings: defaultSettings,
      appliedCoupon: null,
      affiliates: [],
      affiliateSales: [],
      currentAffiliateId: null,
      transactions: [],
      adminPasswordOverride: {},
      adminToken: null,
      reviews: [],
      faq: initialFAQ,
      waitlist: [],
      activityLogs: [],
      referralId: null,
      sessions: { admin: null, customer: null, affiliate: null },

      setReferralId: (id) => set({ referralId: id }),

      refreshSession: (kind) => {
        const sess = get().sessions[kind];
        if (!isSessionValid(sess)) return;
        const remaining = new Date(sess.expiresAt).getTime() - Date.now();
        // Slide forward only if more than the threshold has been used.
        if (SESSION_TTL_MS - remaining < SESSION_REFRESH_THRESHOLD_MS) return;
        const next: SessionToken = {
          ...sess,
          expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
        };
        set((s) => ({ sessions: { ...s.sessions, [kind]: next } }));
      },

      findAccountByEmail: (email) => {
        const e = email.trim().toLowerCase();
        if (!e) return null;
        const ADMIN_EMAILS = ["lucaspereirabn10@gmail.com"];
        if (ADMIN_EMAILS.includes(e)) return { kind: "admin", email: e };
        const aff = get().affiliates.find((a) => a.email.toLowerCase() === e);
        if (aff)
          return { kind: "affiliate", email: aff.email, phone: aff.phone };
        const cust = get().customers.find((c) => c.email.toLowerCase() === e);
        if (cust)
          return { kind: "customer", email: cust.email, phone: cust.phone };
        return null;
      },
      resetPasswordFor: (kind, email, newPassword) => {
        const e = email.trim().toLowerCase();
        if (!newPassword || newPassword.length < 4)
          return { ok: false, message: "Senha muito curta (mín. 4)" };
        if (kind === "admin") {
          set((s) => ({
            adminPasswordOverride: {
              ...s.adminPasswordOverride,
              [e]: newPassword,
            },
          }));
          return { ok: true, message: "Senha redefinida com sucesso" };
        }
        if (kind === "affiliate") {
          const exists = get().affiliates.find(
            (a) => a.email.toLowerCase() === e,
          );
          if (!exists)
            return {
              ok: false,
              message: "Conta não encontrada neste dispositivo",
            };
          set((s) => ({
            affiliates: s.affiliates.map((a) =>
              a.email.toLowerCase() === e ? { ...a, password: newPassword } : a,
            ),
          }));
          return { ok: true, message: "Senha redefinida com sucesso" };
        }
        const exists = get().customers.find((c) => c.email.toLowerCase() === e);
        if (!exists)
          return {
            ok: false,
            message: "Conta não encontrada neste dispositivo",
          };
        set((s) => ({
          customers: s.customers.map((c) =>
            c.email.toLowerCase() === e ? { ...c, password: newPassword } : c,
          ),
        }));
        return { ok: true, message: "Senha redefinida com sucesso" };
      },

      addTransaction: (t) => {
        const tx: Transaction = {
          ...t,
          id: `tx_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ transactions: [tx, ...s.transactions] }));
        cloud.upsertTransaction(tx);
        return tx;
      },
      updateTransaction: (id, patch) => {
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        }));
        const tx = get().transactions.find((t) => t.id === id);
        if (tx) cloud.upsertTransaction(tx);
      },
      deleteTransaction: (id) => {
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        }));
        cloud.deleteTransaction(id);
      },

      addReview: async (data) => {
        const state = get();
        const customer = state.customers.find(
          (c) => c.id === state.currentCustomerId,
        );
        if (!customer) return { ok: false, message: "Faça login para avaliar" };
        if (!data.rating || data.rating < 1 || data.rating > 5)
          return { ok: false, message: "Selecione uma nota" };
        if (!data.comment.trim() && data.photos.length === 0 && data.videos.length === 0)
          return { ok: false, message: "Escreva um comentário ou envie mídia" };

        const res = await cloud.submitVerifiedReview({
          customerId: customer.id,
          productId: data.productId,
          rating: data.rating,
          comment: data.comment.trim(),
          photos: data.photos,
          videos: data.videos,
        });
        if (!res.ok) return { ok: false, message: res.message };

        const review: Review = {
          id: res.id || `rev_${Date.now()}`,
          productId: data.productId,
          customerId: customer.id,
          customerName: customer.name,
          rating: data.rating,
          comment: data.comment.trim(),
          photos: data.photos,
          videos: data.videos,
          verified: true,
          variation: res.variation,
          orderId: res.orderId,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ reviews: [review, ...s.reviews] }));
        return { ok: true, message: "Avaliação publicada!" };
      },
      deleteReview: (id) => {
        set((s) => ({
          reviews: s.reviews.filter((r) => {
            if (r.id !== id) return true;
            return !(s.isAdmin || r.customerId === s.currentCustomerId);
          }),
        }));
        cloud.deleteReview(id);
      },

      joinWaitlist: (productId, email) => {
        const state = get();
        const customerId = state.currentCustomerId || undefined;
        const entry: WaitlistEntry = {
          id: `wait_${Date.now()}`,
          productId,
          email,
          customerId,
          notified: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ waitlist: [entry, ...s.waitlist] }));
        cloud.joinWaitlist({ productId, email, customerId });
        return {
          ok: true,
          message: "Você será avisada assim que o estoque chegar! ✨",
        };
      },

      upsertFAQ: (f) => {
        set((s) => ({
          faq: s.faq.find((x) => x.id === f.id)
            ? s.faq.map((x) => (x.id === f.id ? f : x))
            : [...s.faq, f].sort((a, b) => a.sortOrder - b.sortOrder),
        }));
        cloud.upsertFAQ(f);
      },

      deleteFAQ: (id) => {
        set((s) => ({ faq: s.faq.filter((f) => f.id !== id) }));
        cloud.deleteFAQ(id);
      },

      addToCart: (productId, quantity = 1, variation) =>
        set((s) => {
          const existing = s.cart.find(
            (i) => i.productId === productId && i.variation === variation,
          );
          if (existing) {
            return {
              cart: s.cart.map((i) =>
                i === existing ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { cart: [...s.cart, { productId, quantity, variation }] };
        }),
      removeFromCart: (productId) =>
        set((s) => ({ cart: s.cart.filter((i) => i.productId !== productId) })),
      updateCartQty: (productId, qty) =>
        set((s) => ({
          cart:
            qty <= 0
              ? s.cart.filter((i) => i.productId !== productId)
              : s.cart.map((i) =>
                  i.productId === productId ? { ...i, quantity: qty } : i,
                ),
        })),
      clearCart: () => set({ cart: [], appliedCoupon: null }),

      applyCoupon: (code) => {
        const c = get().coupons.find(
          (x) => x.code.toUpperCase() === code.toUpperCase() && x.active,
        );
        if (!c) return { ok: false, message: "Cupom inválido" };
        const subtotal = computeSubtotal(get());
        if (subtotal < c.minOrder)
          return {
            ok: false,
            message: `Pedido mínimo R$ ${c.minOrder.toFixed(2)}`,
          };
        if (c.usedCount >= c.maxUses)
          return { ok: false, message: "Cupom esgotado" };
        set({ appliedCoupon: c.code });
        return { ok: true, message: "Cupom aplicado!" };
      },
      removeCoupon: () => set({ appliedCoupon: null }),

      registerCustomer: async (c) => {
        const { registerCustomerFn } = await import("./auth.functions");
        const res = await registerCustomerFn({
          data: {
            name: c.name,
            email: c.email,
            phone: c.phone || "",
            password: c.password,
            address: c.address,
          },
        });
        if (!res.ok) return { ok: false, message: res.message };
        const newC: Customer = {
          ...res.customer,
          password: "",
          address: res.customer.address ?? undefined,
        };
        set((s) => ({
          customers: [...s.customers.filter((x) => x.id !== newC.id), newC],
          currentCustomerId: newC.id,
          sessions: { ...s.sessions, customer: makeSession(newC.id) },
        }));
        import("./emails")
          .then((m) =>
            m.sendWelcomeEmail({ email: newC.email, name: newC.name }),
          )
          .catch(() => {});
        return { ok: true, message: res.message };
      },
      loginCustomer: async (email, password) => {
        const { loginCustomerFn } = await import("./auth.functions");
        const res = await loginCustomerFn({ data: { email, password } });
        if (!res.ok) return { ok: false, message: res.message };
        const c: Customer = {
          id: res.customer.id,
          name: res.customer.name,
          email: res.customer.email,
          phone: res.customer.phone,
          password: "",
          address: res.customer.address ?? undefined,
          addresses: (res.customer.addresses as string[]) || [],
          favorites: (res.customer.favorites as string[]) || [],
          createdAt: res.customer.createdAt,
        };
        const newSession = makeSession(c.id);

        set((s) => {
          const email = (c.email || "").trim().toLowerCase();
          const reattachedOrders = s.orders.map((o) =>
            o.customerId !== c.id &&
            email &&
            (o.customerEmail || "").trim().toLowerCase() === email
              ? { ...o, customerId: c.id }
              : o,
          );
          return {
            customers: [...s.customers.filter((x) => x.id !== c.id), c],
            currentCustomerId: c.id,
            sessions: { ...s.sessions, customer: newSession },
            orders: reattachedOrders,
          };
        });

        cloud.logActivity({
          action: "login",
          category: "auth",
          description: `Cliente logou: ${c.name}`,
          userId: c.id,
        });

        // Backup robusto na LocalStorage para o caso do IDB falhar no F5 rápido
        localStorage.setItem("princesa-auth", JSON.stringify({
          currentCustomerId: c.id,
          session: newSession
        }));

        return { ok: true, message: res.message };
      },
      logoutCustomer: () => {
        localStorage.removeItem("princesa-auth");
        set((s) => ({
          currentCustomerId: null,
          sessions: { ...s.sessions, customer: null },
        }));
      },
      updateCustomer: async (data) => {
        const id = get().currentCustomerId;
        if (!id) return { ok: false, message: "Não autenticada" };
        const { password, ...rest } = data;
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id ? { ...c, ...rest } : c,
          ),
        }));
        const c = get().customers.find((x) => x.id === id);
        if (c) cloud.upsertCustomer(c);
        if (password && password.length >= 4) {
          const { updateCustomerPasswordFn } = await import("./auth.functions");
          const r = await updateCustomerPasswordFn({
            data: { customerId: id, newPassword: password },
          });
          if (!r.ok) return { ok: false, message: r.message };
        }
        return { ok: true, message: "Dados atualizados" };
      },
      addAddress: (address) => {
        const id = get().currentCustomerId;
        if (!id || !address.trim()) return;
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id
              ? { ...c, addresses: [...(c.addresses || []), address.trim()] }
              : c,
          ),
        }));
        const c = get().customers.find((x) => x.id === id);
        if (c) cloud.upsertCustomer(c);
      },
      removeAddress: (index) => {
        const id = get().currentCustomerId;
        if (!id) return;
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id
              ? {
                  ...c,
                  addresses: (c.addresses || []).filter((_, i) => i !== index),
                }
              : c,
          ),
        }));
        const c = get().customers.find((x) => x.id === id);
        if (c) cloud.upsertCustomer(c);
      },
      toggleFavorite: (productId) => {
        const id = get().currentCustomerId;
        if (!id) return;
        set((s) => ({
          customers: s.customers.map((c) => {
            if (c.id !== id) return c;
            const favs = c.favorites || [];
            return {
              ...c,
              favorites: favs.includes(productId)
                ? favs.filter((p) => p !== productId)
                : [...favs, productId],
            };
          }),
        }));
        const c = get().customers.find((x) => x.id === id);
        if (c) cloud.upsertCustomer(c);
      },
      loginAdmin: async (email, password) => {
        const normalized = email.trim().toLowerCase();
        try {
          const { loginAdminFn } = await import("./admin.functions");
          const res = await loginAdminFn({
            data: { email: normalized, password },
          });
          if (!res.ok) return { ok: false, message: res.message };
          set((s) => ({
            isAdmin: true,
            adminToken: null, // cookie httpOnly — token nunca toca o JS
            sessions: { ...s.sessions, admin: makeSession(normalized) },
          }));
          cloud.logActivity({
            action: "admin_login",
            category: "auth",
            description: `Admin logou: ${normalized}`,
          });
          return { ok: true, message: res.message || "Bem-vindo!" };
        } catch (e: any) {
          return { ok: false, message: e?.message || "Erro de conexão" };
        }
      },
      logoutAdmin: () => {
        resetAdminOrderAlert();
        import("./admin.functions").then(({ logoutAdminFn }) =>
          logoutAdminFn().catch(() => {}),
        );
        set((s) => ({
          isAdmin: false,
          adminToken: null,
          sessions: { ...s.sessions, admin: null },
        }));
      },

      loginAffiliate: async (email, password) => {
        const { loginAffiliateFn } = await import("./auth.functions");
        const res = await loginAffiliateFn({ data: { email, password } });
        if (!res.ok) return { ok: false, message: res.message };
        const a: Affiliate = { ...res.affiliate, password: "" };
        set((s) => ({
          affiliates: [...s.affiliates.filter((x) => x.id !== a.id), a],
          currentAffiliateId: a.id,
          sessions: { ...s.sessions, affiliate: makeSession(a.id) },
        }));
        cloud.logActivity({
          action: "affiliate_login",
          category: "auth",
          description: `Afiliada logou: ${a.name}`,
          userId: a.id,
        });
        return { ok: true, message: res.message };
      },
      logoutAffiliate: () =>
        set((s) => ({
          currentAffiliateId: null,
          sessions: { ...s.sessions, affiliate: null },
        })),
      registerAffiliate: async (data) => {
        const name = data.name.trim();
        const email = data.email.trim().toLowerCase();
        if (!name || !email || !data.password)
          return { ok: false, message: "Preencha todos os campos" };
        if (data.password.length < 4)
          return { ok: false, message: "Senha muito curta" };
        const { registerAffiliateFn } = await import("./auth.functions");
        const res = await registerAffiliateFn({
          data: { name, email, password: data.password, phone: data.phone.trim() },
        });
        if (!res.ok) return { ok: false, message: res.message };
        const newA: Affiliate = { ...res.affiliate, password: "" };
        set((s) => ({
          affiliates: [...s.affiliates.filter((x) => x.id !== newA.id), newA],
          currentAffiliateId: newA.id,
          sessions: { ...s.sessions, affiliate: makeSession(newA.id) },
        }));
        return { ok: true, message: res.message };
      },
      upsertAffiliate: (a) => {
        set((s) => ({
          affiliates: s.affiliates.find((x) => x.id === a.id)
            ? s.affiliates.map((x) => (x.id === a.id ? a : x))
            : [...s.affiliates, a],
        }));
        cloud.upsertAffiliate(a);
      },
      deleteAffiliate: (id) => {
        set((s) => ({
          affiliates: s.affiliates.filter((a) => a.id !== id),
          affiliateSales: s.affiliateSales.filter((v) => v.affiliateId !== id),
        }));
        cloud.deleteAffiliate(id);
      },
      registerAffiliateSale: (data) => {
        const aff = get().affiliates.find((a) => a.id === data.affiliateId);
        if (!aff) return null;
        const commission =
          typeof data.commissionOverride === "number"
            ? data.commissionOverride
            : aff.commissionType === "percent"
              ? (data.saleValue * aff.commissionValue) / 100
              : aff.commissionValue;
        const sale: AffiliateSale = {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `vaf_${Date.now()}`,
          affiliateId: data.affiliateId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          productDescription: data.productDescription,
          saleValue: data.saleValue,
          commissionEarned: Math.round(commission * 100) / 100,
          status: data.status || "pendente",
          notes: data.notes,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ affiliateSales: [sale, ...s.affiliateSales] }));
        cloud.upsertAffiliateSale(sale);

        // Se a venda for registrada como confirmada, entra no financeiro
        if (sale.status === "confirmada") {
          const tx: Transaction = {
            id: `tx_aff_${sale.id}`,
            kind: "entrada",
            category: "venda",
            description: `Venda Afiliada: ${aff.name} — ${data.customerName}`,
            amount: data.saleValue,
            date: sale.createdAt,
            productSummary: data.productDescription,
            createdAt: sale.createdAt,
          };
          set((s) => ({ transactions: [tx, ...s.transactions] }));
          cloud.upsertTransaction(tx);
        }

        try {
          useNotifications.getState().trigger(
            "afiliada_nova_venda",
            {
              afiliada: aff.name,
              cliente: data.customerName,
              total: brlFmt(data.saleValue),
            },
            { audience: "admin" },
          );
        } catch {
          /* ignore */
        }
        return sale;
      },
      updateAffiliateSaleStatus: (id, status) => {
        const sale = get().affiliateSales.find((v) => v.id === id);
        set((s) => ({
          affiliateSales: s.affiliateSales.map((v) =>
            v.id === id ? { ...v, status } : v,
          ),
        }));
        const updated = get().affiliateSales.find((v) => v.id === id);
        if (updated) cloud.upsertAffiliateSale(updated);
        if (sale && status === "confirmada") {
          const aff = get().affiliates.find((a) => a.id === sale.affiliateId);
          try {
            useNotifications.getState().trigger(
              "afiliada_venda_confirmada",
              {
                cliente: sale.customerName,
                comissao: brlFmt(sale.commissionEarned),
              },
              { audience: "afiliada", recipientId: aff?.id },
            );
          } catch {
            /* ignore */
          }
        }
      },
      deleteAffiliateSale: (id) => {
        set((s) => ({
          affiliateSales: s.affiliateSales.filter((v) => v.id !== id),
        }));
        cloud.deleteAffiliateSale(id);
      },

      placeOrder: (data) => {
        const state = get();
        const items = state.cart.map((ci) => {
          const p = state.products.find((x) => x.id === ci.productId)!;
          return {
            productId: p.id,
            name: p.name,
            price: p.price,
            quantity: ci.quantity,
            image: p.image,
            variation: ci.variation,
          } as Order["items"][number];
        });
        const subtotal = items.reduce((a, b) => a + b.price * b.quantity, 0);
        const coupon = state.coupons.find(
          (c) => c.code === state.appliedCoupon,
        );
        const discount = coupon
          ? coupon.type === "percent"
            ? (subtotal * coupon.value) / 100
            : coupon.value
          : 0;
        const shipping = 0;
        const total = Math.max(0, subtotal - discount) + shipping;
        const order: Order = {
          id: Math.random().toString(36).substring(2, 7).toUpperCase(),
          customerId: state.currentCustomerId || "guest",
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerCpf: data.customerCpf,
          items,
          subtotal,
          discount,
          shipping,
          total,
          paymentMethod: data.paymentMethod,
          deliveryMethod: data.deliveryMethod,
          status:
            data.paymentMethod === "cash" ? "aguardando_pagamento" : "pago",
          deliveryStatus: "pendente",
          createdAt: new Date().toISOString(),
          address:
            data.deliveryMethod === "retirada"
              ? state.settings.address
              : data.address,
          couponCode: state.appliedCoupon || undefined,
          notes: data.notes?.trim() || undefined,
        };

        // Automatic affiliate registration if referral exists
        if (state.referralId) {
          get().registerAffiliateSale({
            affiliateId: state.referralId,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            productDescription: items
              .map((i) => `${i.quantity}x ${i.name}`)
              .join(", "),
            saleValue: total,
            status: order.status === "pago" ? "confirmada" : "pendente",
          });
        }

        set((s) => ({
          orders: [order, ...s.orders],
          cart: [],
          appliedCoupon: null,
          coupons: coupon
            ? s.coupons.map((c) =>
                c.code === coupon.code
                  ? { ...c, usedCount: c.usedCount + 1 }
                  : c,
              )
            : s.coupons,
          products: s.products.map((p) => {
            const it = items.find((i) => i.productId === p.id);
            return it ? { ...p, stock: Math.max(0, p.stock - it.quantity) } : p;
          }),
        }));
        cloud.logActivity({
          action: "order_placed",
          category: "order",
          description: `Novo pedido ${order.id} de ${order.customerName}`,
          metadata: { total: order.total, items: order.items.length },
        });
        // Notificações automáticas
        try {
          const notif = useNotifications.getState();

          // Notificação apenas para o ADMIN
          notif.trigger(
            "novo_pedido_admin",
            {
              cliente: order.customerName,
              pedido: order.id,
              total: brlFmt(order.total),
            },
            { audience: "admin" },
          );

          if (order.status === "pago") {
            // Também avisar o admin sobre o pagamento imediato
            notif.trigger(
              "pagamento_aprovado",
              {
                cliente: order.customerName,
                pedido: order.id,
                total: brlFmt(order.total),
              },
              { audience: "admin" }, // Alterado de cliente para admin
            );

            import("./emails")
              .then((m) =>
                m.sendOrderConfirmationEmail({
                  email: order.customerEmail,
                  customerName: order.customerName,
                  orderId: order.id,
                  items: order.items.map((i) => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                  })),
                  total: order.total,
                  paymentMethod: order.paymentMethod,
                }),
              )
              .catch(() => {});
            // Desconta estoque no servidor (idempotente via RPC)
            cloud.applyOrderStockDecrement(order.id).catch(() => {});
          }
          // Estoque baixo
          get().products.forEach((p) => {
            if (
              items.find((i) => i.productId === p.id) &&
              p.stock > 0 &&
              p.stock <= 3
            ) {
              notif.trigger(
                "estoque_baixo",
                { produto: p.name, estoque: p.stock },
                { audience: "admin" },
              );
            }
          });
        } catch {
          /* ignore */
        }
        // ... cloud persistence logic continues ...
        return order;
      },
      saveRemoteOrder: (data) => {
        const state = get();
        if (state.orders.some((o) => o.id === data.id)) return;
        const order: Order = {
          id: data.id,
          customerId: state.currentCustomerId || "guest",
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerCpf: data.customerCpf,
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount,
          shipping: data.shipping,
          total: data.total,
          paymentMethod: data.paymentMethod,
          deliveryMethod: data.deliveryMethod,
          status: normalizeOrderStatus(data.status),
          deliveryStatus: "pendente",
          createdAt: new Date().toISOString(),
          address: data.address,
          notes: data.notes,
          mpPaymentId: data.mpPaymentId,
          paidAt: data.paidAt,
        };
        set((s) => ({ orders: [order, ...s.orders] }));
      },
      updateOrderStatus: (id, status) => {
        const nextStatus = normalizeOrderStatus(status);
        const order = get().orders.find((o) => o.id === id);
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status: nextStatus } : o,
          ),
        }));
        if (!order) return;
        cloud.updateOrderStatus(id, nextStatus === "pago" ? "paid" : nextStatus);

        // Notificações de status agora apenas para logs/admin se necessário,
        // mas o usuário pediu para focar no admin.
        if (nextStatus === "pago") {
          try {
            useNotifications.getState().trigger(
              "pagamento_aprovado",
              {
                cliente: order.customerName,
                pedido: order.id,
                total: brlFmt(order.total),
              },
              { audience: "admin" }, // Sempre para o admin
            );
          } catch {}
        }
        if (nextStatus === "pago") {
          // record sale transaction once
          const exists = get().transactions.find(
            (t) => t.description.includes(order.id) && t.category === "venda",
          );
          if (!exists) {
            const tx: Transaction = {
              id:
                typeof crypto !== "undefined" && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `tx_${Date.now()}`,
              kind: "entrada",
              category: "venda",
              description: `Pedido ${order.id} — ${order.customerName}`,
              amount: order.total,
              date: new Date().toISOString(),
              productSummary: order.items
                .map((i) => `${i.quantity}x ${i.name}`)
                .join(", "),
              createdAt: new Date().toISOString(),
            };
            set((s) => ({ transactions: [tx, ...s.transactions] }));
            cloud.upsertTransaction(tx);
          }
          import("./emails")
            .then((m) =>
              m.sendOrderConfirmationEmail({
                email: order.customerEmail,
                customerName: order.customerName,
                orderId: order.id,
                items: order.items.map((i) => ({
                  name: i.name,
                  quantity: i.quantity,
                  price: i.price,
                })),
                total: order.total,
                paymentMethod: order.paymentMethod,
              }),
            )
            .catch(() => {});
        }
      },
      updateOrderLocally: (id, patch) => {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        }));
      },
      updateDeliveryStatus: (id, status) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, deliveryStatus: status } : o,
          ),
        }));
        cloud.updateDeliveryStatus(id, status);
      },
      updateOrderNotes: (id, notes) => {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, notes } : o)),
        }));
        cloud.updateOrderNotes(id, notes);
      },
      updateOrderTrackingCode: (id, trackingCode) => {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, trackingCode } : o)),
        }));
        cloud.updateOrderTrackingCode(id, trackingCode);
      },
      deleteOrder: (id) => {
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
        cloud.deleteOrder(id);
      },

      upsertProduct: async (p) => {
        // Persiste primeiro no servidor; só atualiza estado local se OK.
        await cloud.upsertProduct(p);
        set((s) => ({
          products: s.products.find((x) => x.id === p.id)
            ? s.products.map((x) => (x.id === p.id ? p : x))
            : [...s.products, p],
        }));
      },
      deleteProduct: (id) => {
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
        cloud.deleteProduct(id);
      },
      upsertCategory: (c) => {
        set((s) => ({
          categories: s.categories.find((x) => x.id === c.id)
            ? s.categories.map((x) => (x.id === c.id ? c : x))
            : [...s.categories, c],
        }));
        cloud.upsertCategory(c);
      },
      deleteCategory: (id) => {
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
        cloud.deleteCategory(id);
      },
      upsertCoupon: (c) => {
        set((s) => ({
          coupons: s.coupons.find((x) => x.code === c.code)
            ? s.coupons.map((x) => (x.code === c.code ? c : x))
            : [...s.coupons, c],
        }));
        cloud.upsertCoupon(c);
      },
      deleteCoupon: (code) => {
        set((s) => ({ coupons: s.coupons.filter((c) => c.code !== code) }));
        cloud.deleteCoupon(code);
      },
      updateSettings: (s2) => {
        set((s) => ({ settings: { ...s.settings, ...s2 } }));
        cloud.upsertSettings(get().settings);
      },
      sync: async () => {
        const snap = await fetchCloudSnapshot();
        const cur = get();
        detectAndAlertNewOrders(cur.orders, snap.orders, cur.isAdmin);
        const isPlaceholder = (url: string) =>
          !url || url === "" || url === "null" || url.length < 5;
        
        // TEMPORARY CLEANUP: Exclui produtos falsos no sync
        const isSampleId = (id: string) => ["p1","p2","p3","p4","p5","p6","p7","p8","p9","p10"].includes(id);
        const realRemoteProducts = snap.products.filter(p => !isSampleId(p.id));

        const mergedProducts = realRemoteProducts.map((remote) => {
          const local = cur.products.find((p) => p.id === remote.id);
          if (!local) return remote;

          // CRITICAL: If local has a valid illustration, KEEP IT.
          // The database doesn't have real photos yet, so we prioritize the AI-generated ones.
          const localIsIllustration = local.image?.startsWith("/products/");
          const remoteIsRealImage = remote.image?.startsWith("http") || remote.image?.startsWith("data:");

          return {
            ...remote,
            image:
              localIsIllustration && !remoteIsRealImage
                ? local.image
                : remote.image || local.image,
            gallery:
              localIsIllustration && !remoteIsRealImage
                ? local.gallery
                : remote.gallery && remote.gallery.length > 0
                  ? remote.gallery
                  : local.gallery,
          };
        });
        set((s) => {
          const updates: Partial<AppState> = {
            products: mergedProducts,
            categories: snap.categories,
            coupons: snap.coupons,
            reviews: snap.reviews,
            faq: snap.faq,
            settings: snap.settings
              ? { ...s.settings, ...snap.settings }
              : s.settings,
          };

          if (s.isAdmin) {
            updates.customers = snap.customers;
            updates.affiliates = snap.affiliates;
            updates.affiliateSales = snap.affiliateSales;
            updates.transactions = snap.transactions;
            updates.orders = snap.orders;
            updates.waitlist = snap.waitlist;
            updates.activityLogs = snap.activityLogs;
          }

          return updates;
        });
      },
    }),
    {
      name: "princesa-store-v2",
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      skipHydration: typeof window === "undefined",
      partialize: (state) => {
        return {
          ...state,
          activityLogs: [], 
        };
      },
      migrate: (persistedState: any, version: number) => {
        const persisted = persistedState as any;
        if (!persisted) return persisted;
        return persisted;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const sessions = state.sessions || {
          admin: null,
          customer: null,
          affiliate: null,
        };
        const patch: Partial<AppState> = {};
        const nextSessions = { ...sessions };

        // --- ADMIN: invalida se sessão expirou ---
        if (!isSessionValid(sessions.admin) && state.isAdmin) {
          patch.isAdmin = false;
          patch.adminToken = null;
          nextSessions.admin = null;
        }

        // --- BACKUP ROBUSTO DO CLIENTE ---
        // Se a store hidratou vazia (ex: falha no IDB no F5), tenta recuperar do backup
        if (!state.currentCustomerId && typeof window !== "undefined") {
          try {
            const backupStr = localStorage.getItem("princesa-auth");
            if (backupStr) {
              const backup = JSON.parse(backupStr);
              if (backup.currentCustomerId) {
                patch.currentCustomerId = backup.currentCustomerId;
                state.currentCustomerId = backup.currentCustomerId;
                if (backup.session) {
                  nextSessions.customer = backup.session;
                  sessions.customer = backup.session;
                }
              }
            }
          } catch (e) {}
        } else if (state.currentCustomerId && nextSessions.customer && typeof window !== "undefined") {
          // Salva pró-ativamente para proteger usuários que já estavam logados
          try {
            localStorage.setItem("princesa-auth", JSON.stringify({
              currentCustomerId: state.currentCustomerId,
              session: nextSessions.customer
            }));
          } catch (e) {}
        }

        // --- CLIENTE: NUNCA deslogamos automaticamente.
        // Se há currentCustomerId mas sessions.customer está null/expirado,
        // recriamos a sessão silenciosamente (token de 100 anos).
        if (state.currentCustomerId && !sessions.customer) {
          nextSessions.customer = {
            token: `${state.currentCustomerId}.restored`,
            subjectId: state.currentCustomerId,
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + CUSTOMER_SESSION_TTL_MS).toISOString(),
          };
        }

        // --- AFILIADA: mesma lógica ---
        if (state.currentAffiliateId && !sessions.affiliate) {
          nextSessions.affiliate = {
            token: `${state.currentAffiliateId}.restored`,
            subjectId: state.currentAffiliateId,
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + CUSTOMER_SESSION_TTL_MS).toISOString(),
          };
        }

        useStore.setState({ ...patch, sessions: nextSessions });

        // Revalida sessão admin via cookie httpOnly no servidor.
        if (typeof window !== "undefined") {
          import("./admin.functions").then(({ getAdminSessionFn }) =>
            getAdminSessionFn()
              .then((r) => {
                const serverHasAdmin = Boolean(r?.email);
                const localSaysAdmin = useStore.getState().isAdmin;
                if (localSaysAdmin && !serverHasAdmin) {
                  useStore.setState({
                    isAdmin: false,
                    adminToken: null,
                    sessions: {
                      ...useStore.getState().sessions,
                      admin: null,
                    },
                  });
                }
              })
              .catch(() => {}),
          );

          // SOLUÇÃO DEFINITIVA: Se há currentCustomerId mas o objeto customer
          // não está na lista local (race condition com IDB ou dados perdidos),
          // busca diretamente do servidor e restaura na store.
          // Isso garante que o cliente NUNCA veja a tela de login após um F5.
          if (state.currentCustomerId) {
            const existsLocally = (state.customers || []).some(
              (c) => c.id === state.currentCustomerId,
            );
            if (!existsLocally) {
              import("./admin.functions")
                .then(({ fetchCustomerByIdFn }) =>
                  fetchCustomerByIdFn({ data: { customerId: state.currentCustomerId! } }),
                )
                .then((res) => {
                  if (res?.customer) {
                    const c = res.customer;
                    useStore.setState((s) => ({
                      customers: [
                        ...s.customers.filter((x) => x.id !== c.id),
                        { ...c, password: "" },
                      ],
                      // Garante que o ID continua setado
                      currentCustomerId: c.id,
                      sessions: {
                        ...s.sessions,
                        customer: {
                          token: `${c.id}.restored`,
                          subjectId: c.id,
                          issuedAt: new Date().toISOString(),
                          expiresAt: new Date(Date.now() + CUSTOMER_SESSION_TTL_MS).toISOString(),
                        },
                      },
                    }));
                  }
                })
                .catch(() => {});
            }
          }
        }
      },

    },
  ),
);

export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(
    () => typeof window !== "undefined" && useStore.persist.hasHydrated(),
  );
  useEffect(() => {
    if (useStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    let active = true;
    const markHydrated = () => {
      if (active) setHydrated(true);
    };
    const unsub = useStore.persist.onFinishHydration(markHydrated);
    return () => {
      active = false;
      unsub();
    };
  }, []);
  return hydrated;
}

let _hydratingFromCloud: Promise<void> | null = null;
export function hydrateFromCloud(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (_hydratingFromCloud) return _hydratingFromCloud;
  _hydratingFromCloud = (async () => {
    try {
      // CRITICAL: Aguarda a hidratação do IndexedDB terminar ANTES de buscar
      // dados na nuvem. Sem isso, uma race condition fazia o cloud chegar antes
      // do IDB, resultando em cur.customers = [] e deslogando o cliente.
      if (!useStore.persist.hasHydrated()) {
        await new Promise<void>((resolve) => {
          const unsub = useStore.persist.onFinishHydration(() => {
            unsub();
            resolve();
          });
          // safety timeout: se o IDB demorar mais de 3s, continua mesmo assim
          setTimeout(resolve, 3000);
        });
      }

      const snap = await fetchCloudSnapshot();
      const cur = useStore.getState();
      // Merge by id: prefer cloud rows, keep any local-only items the cloud doesn't know yet.
      const mergeById = <T extends { id: string }>(local: T[], remote: T[]) => {
        const map = new Map<string, T>();
        local.forEach((x) => map.set(x.id, x));
        remote.forEach((x) => {
          const loc = map.get(x.id);
          if (loc) {
            // Standard fallback
            const isPlaceholder = (url: string) =>
              !url ||
              url === "" ||
              url === "null" ||
              (!url.startsWith("http") &&
                !url.startsWith("/") &&
                !url.startsWith("data:"));

            if (isPlaceholder((x as any).image)) {
              (x as any).image = (loc as any).image;
            }
            if (
              !(x as any).gallery ||
              (x as any).gallery.length === 0 ||
              isPlaceholder((x as any).gallery[0])
            ) {
              (x as any).gallery = (loc as any).gallery;
            }
          }
          map.set(x.id, x);
        });
        return Array.from(map.values());
      };
      const mergeByCode = <T extends { code: string }>(
        local: T[],
        remote: T[],
      ) => {
        const map = new Map<string, T>();
        local.forEach((x) => map.set(x.code, x));
        remote.forEach((x) => map.set(x.code, x));
        return Array.from(map.values());
      };
      // TEMPORARY CLEANUP: Exclui produtos e categorias de demonstração que ficaram no banco de dados.
      const isSampleId = (id: string) => ["p1","p2","p3","p4","p5","p6","p7","p8","p9","p10"].includes(id);
      const isSampleCatId = (id: string) => ["lacos", "tiaras", "bicos", "kits", "elasticos", "presilhas"].includes(id);
      
      const realProducts = snap.products.filter(p => !isSampleId(p.id));
      const realCategories = snap.categories.filter(c => !isSampleCatId(c.id));

      if (realProducts.length !== snap.products.length) {
         snap.products.filter(p => isSampleId(p.id)).forEach(p => cloud.deleteProduct(p.id).catch(() => {}));
      }
      if (realCategories.length !== snap.categories.length) {
         snap.categories.filter(c => isSampleCatId(c.id)).forEach(c => cloud.deleteCategory(c.id).catch(() => {}));
      }

      // SEGURANÇA: para não-admins, snap.customers e snap.orders vêm vazios.
      // Nunca sobrescreva a lista local com uma lista vazia — isso deslogaria o cliente.
      const isAdmin = cur.isAdmin;
      const mergedCustomers = isAdmin && snap.customers.length > 0
        ? mergeById(cur.customers, snap.customers)
        : cur.customers; // preserva 100% os dados locais do cliente

      const mergedOrders = isAdmin && snap.orders.length > 0
        ? mergeById(cur.orders, snap.orders)
        : cur.orders;

      const mergedAffiliates = isAdmin && snap.affiliates.length > 0
        ? mergeById(cur.affiliates, snap.affiliates)
        : cur.affiliates;

      const mergedAffiliateSales = isAdmin && snap.affiliateSales.length > 0
        ? mergeById(cur.affiliateSales, snap.affiliateSales)
        : cur.affiliateSales;

      const mergedTransactions = isAdmin && snap.transactions.length > 0
        ? mergeById(cur.transactions, snap.transactions)
        : cur.transactions;

      const mergedWaitlist = isAdmin && snap.waitlist.length > 0
        ? mergeById(cur.waitlist, snap.waitlist)
        : cur.waitlist;

      const mergedActivityLogs = isAdmin && snap.activityLogs.length > 0
        ? mergeById(cur.activityLogs, snap.activityLogs)
        : cur.activityLogs;

      useStore.setState({
        customers: mergedCustomers,
        products: realProducts.length
          ? mergeById(cur.products.filter(p => !isSampleId(p.id)), realProducts)
          : cur.products.filter(p => !isSampleId(p.id)),
        categories: realCategories.length
          ? mergeById(cur.categories.filter(c => !isSampleCatId(c.id)), realCategories)
          : cur.categories.filter(c => !isSampleCatId(c.id)),
        coupons: snap.coupons.length
          ? mergeByCode(cur.coupons, snap.coupons)
          : cur.coupons,
        affiliates: mergedAffiliates,
        affiliateSales: mergedAffiliateSales,
        transactions: mergedTransactions,
        reviews: mergeById(cur.reviews, snap.reviews),
        orders: mergedOrders,
        faq: mergeById(cur.faq, snap.faq),
        waitlist: mergedWaitlist,
        activityLogs: mergedActivityLogs,
        settings: snap.settings
          ? ({ ...cur.settings, ...snap.settings } as StoreSettings)
          : cur.settings,
      });
      // One-shot push of any local-only items so legacy localStorage data lands in the cloud.
      const pushed = "cloud_initial_push_v1";
      if (!localStorage.getItem(pushed)) {
        cur.customers
          .filter((c) => !snap.customers.find((x) => x.id === c.id))
          .forEach((c) => cloud.upsertCustomer(c));
        cur.products
          .filter((p) => !snap.products.find((x) => x.id === p.id))
          .forEach((p) => cloud.upsertProduct(p));
        cur.categories
          .filter((c) => !snap.categories.find((x) => x.id === c.id))
          .forEach((c) => cloud.upsertCategory(c));
        cur.coupons
          .filter((c) => !snap.coupons.find((x) => x.code === c.code))
          .forEach((c) => cloud.upsertCoupon(c));
        cur.affiliates
          .filter((a) => !snap.affiliates.find((x) => x.id === a.id))
          .forEach((a) => cloud.upsertAffiliate(a));
        cur.affiliateSales
          .filter((s) => !snap.affiliateSales.find((x) => x.id === s.id))
          .forEach((s) => cloud.upsertAffiliateSale(s));
        cur.transactions
          .filter((t) => !snap.transactions.find((x) => x.id === t.id))
          .forEach((t) => cloud.upsertTransaction(t));
        cur.reviews
          .filter((r) => !snap.reviews.find((x) => x.id === r.id))
          .forEach((r) => cloud.upsertReview(r));
        if (!snap.settings) cloud.upsertSettings(cur.settings);
        localStorage.setItem(pushed, "1");
      }
    } catch (e) {
      console.warn("[hydrateFromCloud] failed", e);
    }
  })();
  return _hydratingFromCloud;
}

function computeSubtotal(s: AppState) {
  return s.cart.reduce((a, ci) => {
    const p = s.products.find((x) => x.id === ci.productId);
    return p ? a + p.price * ci.quantity : a;
  }, 0);
}

export const selectCartTotals = (s: AppState) => {
  const subtotal = computeSubtotal(s);
  const coupon = s.coupons.find((c) => c.code === s.appliedCoupon);
  const discount = coupon
    ? coupon.type === "percent"
      ? (subtotal * coupon.value) / 100
      : coupon.type === "fixed"
        ? coupon.value
        : 0
    : 0;
  const shipping = 0;
  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, shipping, total, coupon };
};

export const selectCartCount = (s: AppState) =>
  s.cart.reduce((a, i) => a + i.quantity, 0);
export const selectCurrentCustomer = (s: AppState) =>
  s.customers.find((c) => c.id === s.currentCustomerId) || null;

// Helper para evitar ciclo em cloud.ts
if (typeof window !== "undefined") {
  (window as any).__princesaAdmin = () => useStore.getState().isAdmin;
}
