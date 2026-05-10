import { create } from "zustand";
import { persist } from "zustand/middleware";
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

const brlFmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export type CartItem = { productId: string; quantity: number; variation?: string };

export type Review = {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  photos: string[]; // data URLs
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

export type OrderStatus =
  | "aguardando_pagamento"
  | "pago"
  | "em_separacao"
  | "saiu_para_entrega"
  | "concluido"
  | "cancelado"
  | "reembolsado";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  em_separacao: "Em separação",
  saiu_para_entrega: "Saiu para entrega",
  concluido: "Concluído",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: { productId: string; name: string; price: number; quantity: number; image: string }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: "pix" | "card" | "cash";
  deliveryMethod: "entrega" | "retirada";
  status: OrderStatus;
  createdAt: string;
  address: string;
  couponCode?: string;
  notes?: string;
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
};

const defaultSettings: StoreSettings = {
  storeName: "Princesa de Laços",
  whatsapp: "(11) 99999-9999",
  address: "Rua das Flores, 123 — São Paulo/SP",
  instagram: "@princesadelacos",
  facebook: "/princesadelacos",
  shippingFee: 12.9,
  acceptCash: true,
  acceptCard: true,
  acceptPix: true,
  bannerTitle: "Coleção Encantada 2026",
  bannerSubtitle: "Laços feitos com amor para princesas de todas as idades",
};

export type SessionKind = "admin" | "customer" | "affiliate";
export type SessionToken = {
  token: string;
  subjectId: string;
  issuedAt: string;
  expiresAt: string;
};

// Sliding session: any user activity within this window keeps the session alive.
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
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

  registerCustomer: (c: Omit<Customer, "id" | "createdAt">) => { ok: boolean; message: string };
  loginCustomer: (email: string, password: string) => { ok: boolean; message: string };
  logoutCustomer: () => void;
  updateCustomer: (data: Partial<Pick<Customer, "name" | "phone" | "address" | "password">>) => {
    ok: boolean;
    message: string;
  };
  addAddress: (address: string) => void;
  removeAddress: (index: number) => void;
  toggleFavorite: (productId: string) => void;
  loginAdmin: (email: string, password: string) => { ok: boolean; message: string };
  logoutAdmin: () => void;

  loginAffiliate: (email: string, password: string) => { ok: boolean; message: string };
  logoutAffiliate: () => void;
  registerAffiliate: (data: { name: string; email: string; password: string; phone: string }) => {
    ok: boolean;
    message: string;
  };
  upsertAffiliate: (a: Affiliate) => void;
  deleteAffiliate: (id: string) => void;
  registerAffiliateSale: (
    s: Omit<AffiliateSale, "id" | "createdAt" | "commissionEarned" | "status"> & {
      status?: AffiliateSaleStatus;
    },
  ) => AffiliateSale | null;
  updateAffiliateSaleStatus: (id: string, status: AffiliateSaleStatus) => void;
  deleteAffiliateSale: (id: string) => void;

  placeOrder: (data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    paymentMethod: "pix" | "card" | "cash";
    deliveryMethod: "entrega" | "retirada";
    notes?: string;
  }) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;

  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  upsertCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  upsertCoupon: (c: Coupon) => void;
  deleteCoupon: (code: string) => void;
  updateSettings: (s: Partial<StoreSettings>) => void;

  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => Transaction;
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, "id" | "createdAt">>) => void;
  deleteTransaction: (id: string) => void;

  addReview: (r: Omit<Review, "id" | "createdAt" | "customerId" | "customerName">) => {
    ok: boolean;
    message: string;
  };
  deleteReview: (id: string) => void;

  joinWaitlist: (productId: string, email: string) => { ok: boolean; message: string };
  upsertFAQ: (f: FAQItem) => void;
  deleteFAQ: (id: string) => void;

  sync: () => Promise<void>;
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
        if (aff) return { kind: "affiliate", email: aff.email, phone: aff.phone };
        const cust = get().customers.find((c) => c.email.toLowerCase() === e);
        if (cust) return { kind: "customer", email: cust.email, phone: cust.phone };
        return null;
      },
      resetPasswordFor: (kind, email, newPassword) => {
        const e = email.trim().toLowerCase();
        if (!newPassword || newPassword.length < 4)
          return { ok: false, message: "Senha muito curta (mín. 4)" };
        if (kind === "admin") {
          set((s) => ({ adminPasswordOverride: { ...s.adminPasswordOverride, [e]: newPassword } }));
          return { ok: true, message: "Senha redefinida com sucesso" };
        }
        if (kind === "affiliate") {
          const exists = get().affiliates.find((a) => a.email.toLowerCase() === e);
          if (!exists) return { ok: false, message: "Conta não encontrada neste dispositivo" };
          set((s) => ({
            affiliates: s.affiliates.map((a) =>
              a.email.toLowerCase() === e ? { ...a, password: newPassword } : a,
            ),
          }));
          return { ok: true, message: "Senha redefinida com sucesso" };
        }
        const exists = get().customers.find((c) => c.email.toLowerCase() === e);
        if (!exists) return { ok: false, message: "Conta não encontrada neste dispositivo" };
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
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }));
        const tx = get().transactions.find((t) => t.id === id);
        if (tx) cloud.upsertTransaction(tx);
      },
      deleteTransaction: (id) => {
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
        cloud.deleteTransaction(id);
      },

      addReview: (data) => {
        const state = get();
        const customer = state.customers.find((c) => c.id === state.currentCustomerId);
        if (!customer) return { ok: false, message: "Faça login para avaliar" };
        if (!data.rating || data.rating < 1 || data.rating > 5)
          return { ok: false, message: "Selecione uma nota" };
        if (!data.comment.trim() && data.photos.length === 0)
          return { ok: false, message: "Escreva um comentário ou envie uma foto" };
        const review: Review = {
          id: `rev_${Date.now()}`,
          productId: data.productId,
          customerId: customer.id,
          customerName: customer.name,
          rating: data.rating,
          comment: data.comment.trim(),
          photos: data.photos,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ reviews: [review, ...s.reviews] }));
        cloud.upsertReview(review);
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
        return { ok: true, message: "Você será avisada assim que o estoque chegar! ✨" };
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
              : s.cart.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
        })),
      clearCart: () => set({ cart: [], appliedCoupon: null }),

      applyCoupon: (code) => {
        const c = get().coupons.find(
          (x) => x.code.toUpperCase() === code.toUpperCase() && x.active,
        );
        if (!c) return { ok: false, message: "Cupom inválido" };
        const subtotal = computeSubtotal(get());
        if (subtotal < c.minOrder)
          return { ok: false, message: `Pedido mínimo R$ ${c.minOrder.toFixed(2)}` };
        if (c.usedCount >= c.maxUses) return { ok: false, message: "Cupom esgotado" };
        set({ appliedCoupon: c.code });
        return { ok: true, message: "Cupom aplicado!" };
      },
      removeCoupon: () => set({ appliedCoupon: null }),

      registerCustomer: (c) => {
        const exists = get().customers.find((x) => x.email === c.email);
        if (exists) return { ok: false, message: "E-mail já cadastrado" };
        const newC: Customer = {
          ...c,
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `c_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          customers: [...s.customers, newC],
          currentCustomerId: newC.id,
          sessions: { ...s.sessions, customer: makeSession(newC.id) },
        }));
        cloud.upsertCustomer(newC);
        import("./emails")
          .then((m) => m.sendWelcomeEmail({ email: newC.email, name: newC.name }))
          .catch(() => {});
        return { ok: true, message: "Cadastro realizado!" };
      },
      loginCustomer: (email, password) => {
        const c = get().customers.find((x) => x.email === email && x.password === password);
        if (!c) return { ok: false, message: "Credenciais inválidas" };
        set((s) => ({
          currentCustomerId: c.id,
          sessions: { ...s.sessions, customer: makeSession(c.id) },
        }));
        cloud.logActivity({
          action: "login",
          category: "auth",
          description: `Cliente logou: ${c.name}`,
          userId: c.id,
        });
        return { ok: true, message: "Bem-vinda!" };
      },
      logoutCustomer: () =>
        set((s) => ({ currentCustomerId: null, sessions: { ...s.sessions, customer: null } })),
      updateCustomer: (data) => {
        const id = get().currentCustomerId;
        if (!id) return { ok: false, message: "Não autenticada" };
        set((s) => ({ customers: s.customers.map((c) => (c.id === id ? { ...c, ...data } : c)) }));
        const c = get().customers.find((x) => x.id === id);
        if (c) cloud.upsertCustomer(c);
        return { ok: true, message: "Dados atualizados" };
      },
      addAddress: (address) => {
        const id = get().currentCustomerId;
        if (!id || !address.trim()) return;
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id ? { ...c, addresses: [...(c.addresses || []), address.trim()] } : c,
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
              ? { ...c, addresses: (c.addresses || []).filter((_, i) => i !== index) }
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
      loginAdmin: (email, password) => {
        const AUTHORIZED_ADMINS: Record<string, string> = {
          "lucaspereirabn10@gmail.com": "admin123",
        };
        const normalized = email.trim().toLowerCase();
        const override = get().adminPasswordOverride?.[normalized];
        const expected = override || AUTHORIZED_ADMINS[normalized];
        if (!AUTHORIZED_ADMINS[normalized]) return { ok: false, message: "E-mail não autorizado" };
        if (expected !== password) return { ok: false, message: "Senha incorreta" };
        set((s) => ({
          isAdmin: true,
          sessions: { ...s.sessions, admin: makeSession(normalized) },
        }));
        cloud.logActivity({
          action: "admin_login",
          category: "auth",
          description: `Admin logou: ${normalized}`,
        });
        return { ok: true, message: "Bem-vindo!" };
      },
      logoutAdmin: () => set((s) => ({ isAdmin: false, sessions: { ...s.sessions, admin: null } })),

      loginAffiliate: (email, password) => {
        const normalized = email.trim().toLowerCase();
        const a = get().affiliates.find(
          (x) => x.email.toLowerCase() === normalized && x.password === password,
        );
        if (!a) return { ok: false, message: "Credenciais inválidas" };
        if (!a.active) return { ok: false, message: "Conta desativada. Contate a administradora." };
        set((s) => ({
          currentAffiliateId: a.id,
          sessions: { ...s.sessions, affiliate: makeSession(a.id) },
        }));
        cloud.logActivity({
          action: "affiliate_login",
          category: "auth",
          description: `Afiliada logou: ${a.name}`,
          userId: a.id,
        });
        return { ok: true, message: `Bem-vinda, ${a.name}!` };
      },
      logoutAffiliate: () =>
        set((s) => ({ currentAffiliateId: null, sessions: { ...s.sessions, affiliate: null } })),
      registerAffiliate: (data) => {
        const name = data.name.trim();
        const email = data.email.trim().toLowerCase();
        if (!name || !email || !data.password)
          return { ok: false, message: "Preencha todos os campos" };
        if (data.password.length < 4) return { ok: false, message: "Senha muito curta" };
        const exists = get().affiliates.find((a) => a.email.toLowerCase() === email);
        if (exists) return { ok: false, message: "E-mail já cadastrado" };
        const newA: Affiliate = {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `aff_${Date.now()}`,
          name,
          email,
          password: data.password,
          phone: data.phone.trim(),
          commissionType: "percent",
          commissionValue: 10,
          active: true,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          affiliates: [...s.affiliates, newA],
          currentAffiliateId: newA.id,
          sessions: { ...s.sessions, affiliate: makeSession(newA.id) },
        }));
        cloud.upsertAffiliate(newA);
        return {
          ok: true,
          message: "Cadastro realizado! Aguarde a administradora definir sua comissão.",
        };
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
          aff.commissionType === "percent"
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
          affiliateSales: s.affiliateSales.map((v) => (v.id === id ? { ...v, status } : v)),
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
        set((s) => ({ affiliateSales: s.affiliateSales.filter((v) => v.id !== id) }));
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
          };
        });
        const subtotal = items.reduce((a, b) => a + b.price * b.quantity, 0);
        const coupon = state.coupons.find((c) => c.code === state.appliedCoupon);
        const discount = coupon
          ? coupon.type === "percent"
            ? (subtotal * coupon.value) / 100
            : coupon.value
          : 0;
        const shipping = 0;
        const total = Math.max(0, subtotal - discount) + shipping;
        const order: Order = {
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `PED${Date.now().toString().slice(-6)}`,
          customerId: state.currentCustomerId || "guest",
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          items,
          subtotal,
          discount,
          shipping,
          total,
          paymentMethod: data.paymentMethod,
          deliveryMethod: data.deliveryMethod,
          status: data.paymentMethod === "cash" ? "aguardando_pagamento" : "pago",
          createdAt: new Date().toISOString(),
          address: data.deliveryMethod === "retirada" ? state.settings.address : data.address,
          couponCode: state.appliedCoupon || undefined,
          notes: data.notes?.trim() || undefined,
        };

        // Automatic affiliate registration if referral exists
        if (state.referralId) {
          get().registerAffiliateSale({
            affiliateId: state.referralId,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            productDescription: items.map((i) => `${i.quantity}x ${i.name}`).join(", "),
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
                c.code === coupon.code ? { ...c, usedCount: c.usedCount + 1 } : c,
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
          notif.trigger(
            "pedido_realizado",
            {
              cliente: order.customerName,
              pedido: order.id,
              total: brlFmt(order.total),
            },
            { audience: "cliente", recipientId: order.customerId },
          );
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
            notif.trigger(
              "pagamento_aprovado",
              {
                cliente: order.customerName,
                pedido: order.id,
                total: brlFmt(order.total),
              },
              { audience: "cliente", recipientId: order.customerId },
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
          }
          // Estoque baixo
          get().products.forEach((p) => {
            if (items.find((i) => i.productId === p.id) && p.stock > 0 && p.stock <= 3) {
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
        // Cloud persistence: order + sales transaction (if paid) + stock + coupon
        try {
          const ordRow: any = { // Keep this as any for Supabase upsert flexibility if needed, or use proper type if available
            id: order.id,
            customer_name: order.customerName,
            customer_email: order.customerEmail,
            customer_phone: order.customerPhone,
            delivery_method: order.deliveryMethod,
            address: order.address || null,
            notes: order.notes || null,
            items: order.items as any,
            subtotal: order.subtotal,
            discount: order.discount,
            shipping: order.shipping,
            total: order.total,
            payment_method: order.paymentMethod,
            payment_status: order.status === "pago" ? "paid" : "pending",
          };
          import("@/integrations/supabase/client").then(({ supabase }) => {
            supabase
              .from("orders")
              .upsert(ordRow as any, { onConflict: "id" })
              .then(({ error }) => {
                if (error) console.warn("[cloud:placeOrder]", error);
              });
          });
          if (order.status === "pago") {
            const tx: Transaction = {
              id:
                typeof crypto !== "undefined" && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `tx_${Date.now()}`,
              kind: "entrada",
              category: "venda",
              description: `Pedido ${order.id} — ${order.customerName}`,
              amount: order.total,
              date: order.createdAt,
              productSummary: order.items.map((i) => `${i.quantity}x ${i.name}`).join(", "),
              createdAt: order.createdAt,
            };
            set((s) => ({ transactions: [tx, ...s.transactions] }));
            cloud.upsertTransaction(tx);
          }
          // sync affected products (stock) and coupon
          const updated = get();
          items.forEach((it) => {
            const p = updated.products.find((x) => x.id === it.productId);
            if (p) cloud.upsertProduct(p);
          });
          if (coupon) {
            const c2 = updated.coupons.find((c) => c.code === coupon.code);
            if (c2) cloud.upsertCoupon(c2);
          }
        } catch {
          /* ignore */
        }
        return order;
      },
      updateOrderStatus: (id, status) => {
        const order = get().orders.find((o) => o.id === id);
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) }));
        if (!order) return;
        cloud.updateOrderStatus(id, status === "pago" ? "paid" : status);
        const map: Record<
          string,
          | "pagamento_aprovado"
          | "pedido_em_separacao"
          | "pedido_enviado"
          | "pedido_entregue"
          | "pedido_cancelado"
          | null
        > = {
          pago: "pagamento_aprovado",
          em_separacao: "pedido_em_separacao",
          enviado: "pedido_enviado",
          entregue: "pedido_entregue",
          cancelado: "pedido_cancelado",
          aguardando_pagamento: null,
        };
        const cat = map[status];
        if (cat) {
          try {
            useNotifications.getState().trigger(
              cat,
              {
                cliente: order.customerName,
                pedido: order.id,
                total: brlFmt(order.total),
              },
              { audience: "cliente", recipientId: order.customerId },
            );
          } catch {
            /* ignore */
          }
        }
        if (status === "pago") {
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
              productSummary: order.items.map((i) => `${i.quantity}x ${i.name}`).join(", "),
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
      deleteOrder: (id) => {
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
        cloud.deleteOrder(id);
      },

      upsertProduct: (p) => {
        set((s) => ({
          products: s.products.find((x) => x.id === p.id)
            ? s.products.map((x) => (x.id === p.id ? p : x))
            : [...s.products, p],
        }));
        cloud.upsertProduct(p);
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
    }),
    {
      name: "princesa-store-v1",
      version: 8,
      skipHydration: typeof window === "undefined",
      migrate: (persistedState: any, version: number) => {
        const persisted = persistedState as any;
        if (!persisted) return persisted;
        if (version < 2) {
          persisted.products = initialProducts;
          persisted.categories = initialCategories;
        }
        if (version < 3) {
          persisted.sessions = { admin: null, customer: null, affiliate: null };
        }
        if (version < 4) {
          persisted.adminPasswordOverride = {};
        }
        if (version < 5) {
          persisted.reviews = [];
        }
        if (version < 8) {
          // Force clear to use new static /products/ paths and realistic illustrations
          persisted.products = initialProducts;
        }
        return persisted;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Enforce session expiry on every page load — invalid tokens force re-login.
        const sessions = state.sessions || { admin: null, customer: null, affiliate: null };
        const patch: Partial<AppState> = {};
        const nextSessions = { ...sessions };
        if (!isSessionValid(sessions.admin) && state.isAdmin) {
          patch.isAdmin = false;
          nextSessions.admin = null;
        }
        if (!isSessionValid(sessions.customer) && state.currentCustomerId) {
          patch.currentCustomerId = null;
          nextSessions.customer = null;
        }
        if (!isSessionValid(sessions.affiliate) && state.currentAffiliateId) {
          patch.currentAffiliateId = null;
          nextSessions.affiliate = null;
        }
        useStore.setState({ ...patch, sessions: nextSessions });
      },
      sync: async () => {
        const snap = await fetchCloudSnapshot();
        const cur = get();
        // Smart merge products specifically to keep images if cloud lacks them
        const isPlaceholder = (url: string) => !url || url === "" || url === "null" || url.length < 5;
        const mergedProducts = cur.products.map(p => {
          const remote = snap.products.find(rp => rp.id === p.id);
          if (!remote) return p;
          return { 
            ...remote, 
            image: isPlaceholder(remote.image) ? p.image : remote.image,
            gallery: (remote.gallery && remote.gallery.length > 0 && !isPlaceholder(remote.gallery[0])) ? remote.gallery : p.gallery
          };
        });

        set((s) => ({
          customers: snap.customers,
          products: mergedProducts,
          categories: snap.categories,
          coupons: snap.coupons,
          affiliates: snap.affiliates,
          affiliateSales: snap.affiliateSales,
          transactions: snap.transactions,
          reviews: snap.reviews,
          orders: snap.orders,
          faq: snap.faq,
          waitlist: snap.waitlist,
          activityLogs: snap.activityLogs,
          settings: snap.settings ? { ...s.settings, ...snap.settings } : s.settings,
        }));
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
    Promise.resolve(useStore.persist.rehydrate()).then(markHydrated);
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
      const snap = await fetchCloudSnapshot();
      const cur = useStore.getState();
      // Merge by id: prefer cloud rows, keep any local-only items the cloud doesn't know yet.
      const mergeById = <T extends { id: string }>(local: T[], remote: T[]) => {
        const map = new Map<string, T>();
        local.forEach((x) => map.set(x.id, x));
        remote.forEach((x) => {
          const loc = map.get(x.id);
          if (loc) {
            // Product specific fallback
            const isPlaceholder = (url: string) => !url || url === "" || url === "null" || url.length < 5;
            
            if (isPlaceholder((x as any).image)) {
              (x as any).image = (loc as any).image;
            }
            if (!(x as any).gallery || (x as any).gallery.length === 0 || isPlaceholder((x as any).gallery[0])) {
              (x as any).gallery = (loc as any).gallery;
            }
          }
          map.set(x.id, x);
        });
        return Array.from(map.values());
      };
      const mergeByCode = <T extends { code: string }>(local: T[], remote: T[]) => {
        const map = new Map<string, T>();
        local.forEach((x) => map.set(x.code, x));
        remote.forEach((x) => map.set(x.code, x));
        return Array.from(map.values());
      };
      useStore.setState({
        customers: mergeById(cur.customers, snap.customers),
        products: snap.products.length ? mergeById(cur.products, snap.products) : cur.products,
        categories: snap.categories.length
          ? mergeById(cur.categories, snap.categories)
          : cur.categories,
        coupons: snap.coupons.length ? mergeByCode(cur.coupons, snap.coupons) : cur.coupons,
        affiliates: mergeById(cur.affiliates, snap.affiliates),
        affiliateSales: mergeById(cur.affiliateSales, snap.affiliateSales),
        transactions: mergeById(cur.transactions, snap.transactions),
        reviews: mergeById(cur.reviews, snap.reviews),
        orders: mergeById(cur.orders, snap.orders),
        faq: mergeById(cur.faq, snap.faq),
        waitlist: mergeById(cur.waitlist, snap.waitlist),
        activityLogs: mergeById(cur.activityLogs, snap.activityLogs),
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
      : coupon.value
    : 0;
  const shipping = 0;
  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, shipping, total, coupon };
};

export const selectCartCount = (s: AppState) => s.cart.reduce((a, i) => a + i.quantity, 0);
export const selectCurrentCustomer = (s: AppState) =>
  s.customers.find((c) => c.id === s.currentCustomerId) || null;
