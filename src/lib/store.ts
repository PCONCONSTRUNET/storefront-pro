import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialProducts, initialCategories, initialCoupons, type Product, type Category, type Coupon } from "./data";

export type CartItem = { productId: string; quantity: number; variation?: string };

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
  status: OrderStatus;
  createdAt: string;
  address: string;
  couponCode?: string;
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

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
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

  addToCart: (productId: string, quantity?: number, variation?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;

  registerCustomer: (c: Omit<Customer, "id" | "createdAt">) => { ok: boolean; message: string };
  loginCustomer: (email: string, password: string) => { ok: boolean; message: string };
  logoutCustomer: () => void;
  loginAdmin: (email: string, password: string) => { ok: boolean; message: string };
  logoutAdmin: () => void;

  loginAffiliate: (email: string, password: string) => { ok: boolean; message: string };
  logoutAffiliate: () => void;
  upsertAffiliate: (a: Affiliate) => void;
  deleteAffiliate: (id: string) => void;
  registerAffiliateSale: (s: Omit<AffiliateSale, "id" | "createdAt" | "commissionEarned" | "status"> & { status?: AffiliateSaleStatus }) => AffiliateSale | null;
  updateAffiliateSaleStatus: (id: string, status: AffiliateSaleStatus) => void;
  deleteAffiliateSale: (id: string) => void;

  placeOrder: (data: {
    customerName: string; customerEmail: string; customerPhone: string;
    address: string; paymentMethod: "pix" | "card" | "cash";
  }) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  upsertCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  upsertCoupon: (c: Coupon) => void;
  deleteCoupon: (code: string) => void;
  updateSettings: (s: Partial<StoreSettings>) => void;
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

      addToCart: (productId, quantity = 1, variation) =>
        set((s) => {
          const existing = s.cart.find((i) => i.productId === productId && i.variation === variation);
          if (existing) {
            return { cart: s.cart.map((i) => i === existing ? { ...i, quantity: i.quantity + quantity } : i) };
          }
          return { cart: [...s.cart, { productId, quantity, variation }] };
        }),
      removeFromCart: (productId) => set((s) => ({ cart: s.cart.filter((i) => i.productId !== productId) })),
      updateCartQty: (productId, qty) =>
        set((s) => ({ cart: qty <= 0 ? s.cart.filter(i => i.productId !== productId) : s.cart.map((i) => i.productId === productId ? { ...i, quantity: qty } : i) })),
      clearCart: () => set({ cart: [], appliedCoupon: null }),

      applyCoupon: (code) => {
        const c = get().coupons.find((x) => x.code.toUpperCase() === code.toUpperCase() && x.active);
        if (!c) return { ok: false, message: "Cupom inválido" };
        const subtotal = computeSubtotal(get());
        if (subtotal < c.minOrder) return { ok: false, message: `Pedido mínimo R$ ${c.minOrder.toFixed(2)}` };
        if (c.usedCount >= c.maxUses) return { ok: false, message: "Cupom esgotado" };
        set({ appliedCoupon: c.code });
        return { ok: true, message: "Cupom aplicado!" };
      },
      removeCoupon: () => set({ appliedCoupon: null }),

      registerCustomer: (c) => {
        const exists = get().customers.find((x) => x.email === c.email);
        if (exists) return { ok: false, message: "E-mail já cadastrado" };
        const newC: Customer = { ...c, id: `c_${Date.now()}`, createdAt: new Date().toISOString() };
        set((s) => ({ customers: [...s.customers, newC], currentCustomerId: newC.id }));
        return { ok: true, message: "Cadastro realizado!" };
      },
      loginCustomer: (email, password) => {
        const c = get().customers.find((x) => x.email === email && x.password === password);
        if (!c) return { ok: false, message: "Credenciais inválidas" };
        set({ currentCustomerId: c.id });
        return { ok: true, message: "Bem-vinda!" };
      },
      logoutCustomer: () => set({ currentCustomerId: null }),
      loginAdmin: (email, password) => {
        const AUTHORIZED_ADMINS: Record<string, string> = {
          "lucaspereirabn10@gmail.com": "admin123",
        };
        const normalized = email.trim().toLowerCase();
        const expected = AUTHORIZED_ADMINS[normalized];
        if (!expected) return { ok: false, message: "E-mail não autorizado" };
        if (expected !== password) return { ok: false, message: "Senha incorreta" };
        set({ isAdmin: true });
        return { ok: true, message: "Bem-vindo!" };
      },
      logoutAdmin: () => set({ isAdmin: false }),

      placeOrder: (data) => {
        const state = get();
        const items = state.cart.map((ci) => {
          const p = state.products.find((x) => x.id === ci.productId)!;
          return { productId: p.id, name: p.name, price: p.price, quantity: ci.quantity, image: p.image };
        });
        const subtotal = items.reduce((a, b) => a + b.price * b.quantity, 0);
        const coupon = state.coupons.find((c) => c.code === state.appliedCoupon);
        const discount = coupon ? (coupon.type === "percent" ? subtotal * coupon.value / 100 : coupon.value) : 0;
        const shipping = state.settings.shippingFee;
        const total = Math.max(0, subtotal - discount) + shipping;
        const order: Order = {
          id: `PED${Date.now().toString().slice(-6)}`,
          customerId: state.currentCustomerId || "guest",
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          items, subtotal, discount, shipping, total,
          paymentMethod: data.paymentMethod,
          status: data.paymentMethod === "cash" ? "aguardando_pagamento" : "pago",
          createdAt: new Date().toISOString(),
          address: data.address,
          couponCode: state.appliedCoupon || undefined,
        };
        set((s) => ({
          orders: [order, ...s.orders],
          cart: [],
          appliedCoupon: null,
          coupons: coupon ? s.coupons.map(c => c.code === coupon.code ? { ...c, usedCount: c.usedCount + 1 } : c) : s.coupons,
          products: s.products.map(p => {
            const it = items.find(i => i.productId === p.id);
            return it ? { ...p, stock: Math.max(0, p.stock - it.quantity) } : p;
          }),
        }));
        return order;
      },
      updateOrderStatus: (id, status) => set((s) => ({ orders: s.orders.map(o => o.id === id ? { ...o, status } : o) })),

      upsertProduct: (p) => set((s) => ({
        products: s.products.find(x => x.id === p.id) ? s.products.map(x => x.id === p.id ? p : x) : [...s.products, p],
      })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter(p => p.id !== id) })),
      upsertCategory: (c) => set((s) => ({
        categories: s.categories.find(x => x.id === c.id) ? s.categories.map(x => x.id === c.id ? c : x) : [...s.categories, c],
      })),
      deleteCategory: (id) => set((s) => ({ categories: s.categories.filter(c => c.id !== id) })),
      upsertCoupon: (c) => set((s) => ({
        coupons: s.coupons.find(x => x.code === c.code) ? s.coupons.map(x => x.code === c.code ? c : x) : [...s.coupons, c],
      })),
      deleteCoupon: (code) => set((s) => ({ coupons: s.coupons.filter(c => c.code !== code) })),
      updateSettings: (s2) => set((s) => ({ settings: { ...s.settings, ...s2 } })),
    }),
    { name: "princesa-store-v1" },
  ),
);

function computeSubtotal(s: AppState) {
  return s.cart.reduce((a, ci) => {
    const p = s.products.find(x => x.id === ci.productId);
    return p ? a + p.price * ci.quantity : a;
  }, 0);
}

export const selectCartTotals = (s: AppState) => {
  const subtotal = computeSubtotal(s);
  const coupon = s.coupons.find(c => c.code === s.appliedCoupon);
  const discount = coupon ? (coupon.type === "percent" ? subtotal * coupon.value / 100 : coupon.value) : 0;
  const shipping = s.cart.length > 0 ? s.settings.shippingFee : 0;
  const total = Math.max(0, subtotal - discount) + shipping;
  return { subtotal, discount, shipping, total, coupon };
};

export const selectCartCount = (s: AppState) => s.cart.reduce((a, i) => a + i.quantity, 0);
export const selectCurrentCustomer = (s: AppState) => s.customers.find(c => c.id === s.currentCustomerId) || null;
