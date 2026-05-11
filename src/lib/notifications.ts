// Notification system — integrated with OneSignal for real push delivery.
// Persists templates/logs locally and dispatches push via Supabase edge
// function → OneSignal REST API. In-app toasts are shown in parallel.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/integrations/supabase/client";
import { cloud } from "./cloud";

/**
 * Resolve the OneSignal SDK instance using the deferred queue.
 * This guarantees the SDK is fully initialised before we use it,
 * which is critical on Android / iOS where the script may still be
 * loading when the user taps the toggle.
 */
function getOneSignalSDK(timeoutMs = 8000): Promise<any | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    // If SDK is already ready (has Notifications namespace) return immediately
    const existing = (window as any).OneSignal;
    if (existing && typeof existing.Notifications !== "undefined") {
      resolve(existing);
      return;
    }
    // Otherwise wait via the deferred queue
    const q =
      (window as any).OneSignalDeferred ||
      ((window as any).OneSignalDeferred = []);
    let resolved = false;
    q.push((os: any) => {
      if (!resolved) {
        resolved = true;
        resolve(os);
      }
    });
    // Safety timeout so we never hang forever
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, timeoutMs);
  });
}

export type NotificationCategory =
  | "pedido_realizado" // cliente fez um pedido
  | "pagamento_aprovado" // pagamento confirmado
  | "pedido_em_separacao" // separando produtos
  | "pedido_enviado" // saiu para entrega
  | "pedido_entregue" // pedido entregue
  | "pedido_cancelado" // pedido cancelado
  | "novo_pedido_admin" // admin: novo pedido entrou
  | "afiliada_nova_venda" // admin: afiliada registrou venda
  | "afiliada_venda_confirmada" // afiliada: comissão liberada
  | "promo" // marketing / cupom
  | "carrinho_abandonado" // remarketing
  | "estoque_baixo" // admin: estoque baixo
  | "manual"; // disparado pelo painel

export type NotificationAudience = "cliente" | "admin" | "afiliada";

const AUDIENCE_TAG: Record<
  NotificationAudience,
  "customer" | "admin" | "affiliate"
> = {
  cliente: "customer",
  admin: "admin",
  afiliada: "affiliate",
};

async function dispatchPush(args: {
  title: string;
  body: string;
  audience: NotificationAudience;
  externalUserIds?: string[];
}) {
  try {
    const payload: Record<string, unknown> = {
      title: args.title,
      message: args.body,
    };
    if (args.externalUserIds && args.externalUserIds.length > 0) {
      payload.externalUserIds = args.externalUserIds;
    } else {
      payload.audience = AUDIENCE_TAG[args.audience];
    }
    const { data, error } = await supabase.functions.invoke("send-push", {
      body: payload,
    });
    if (error) console.warn("[push] send-push erro:", error.message);
    else console.log("[push] enviado:", data);
  } catch (e) {
    console.warn("[push] falhou", e);
  }
}

export interface NotificationTemplate {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string; // pode usar {placeholders}
  icon: string; // emoji/ícone para o card
  audience: NotificationAudience;
  enabled: boolean;
  sendPush: boolean; // canal: push (futuro)
  sendEmail: boolean; // canal: e-mail (futuro)
  sendInApp: boolean; // canal: in-app (toast + bell)
}

export interface NotificationLog {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  audience: NotificationAudience;
  recipientId?: string; // customerId / affiliateId / "admin"
  channels: ("push" | "email" | "inapp")[];
  sentAt: string;
  read: boolean;
  data?: Record<string, string | number>;
}

const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  // Cliente
  {
    id: "t_pedido_realizado",
    category: "pedido_realizado",
    audience: "cliente",
    title: "Pedido recebido! 🎀",
    body: "Olá {cliente}, recebemos seu pedido #{pedido} no valor de {total}. Estamos preparando com carinho!",
    icon: "🎀",
    enabled: true,
    sendPush: true,
    sendEmail: true,
    sendInApp: true,
  },
  {
    id: "t_pagamento_aprovado",
    category: "pagamento_aprovado",
    audience: "cliente",
    title: "Pagamento aprovado ✨",
    body: "Seu pagamento do pedido #{pedido} foi confirmado. Já estamos separando!",
    icon: "💳",
    enabled: true,
    sendPush: true,
    sendEmail: true,
    sendInApp: true,
  },
  {
    id: "t_pedido_em_separacao",
    category: "pedido_em_separacao",
    audience: "cliente",
    title: "Separando seu pedido 📦",
    body: "Seu pedido #{pedido} entrou em produção/separação.",
    icon: "📦",
    enabled: true,
    sendPush: true,
    sendEmail: false,
    sendInApp: true,
  },
  {
    id: "t_pedido_enviado",
    category: "pedido_enviado",
    audience: "cliente",
    title: "Saiu para entrega 🚚",
    body: "Seu pedido #{pedido} já está a caminho! Em breve chega aí.",
    icon: "🚚",
    enabled: true,
    sendPush: true,
    sendEmail: true,
    sendInApp: true,
  },
  {
    id: "t_pedido_entregue",
    category: "pedido_entregue",
    audience: "cliente",
    title: "Pedido entregue 💖",
    body: "Pedido #{pedido} entregue! Que tal nos contar o que achou? ⭐⭐⭐⭐⭐",
    icon: "💖",
    enabled: true,
    sendPush: true,
    sendEmail: false,
    sendInApp: true,
  },
  {
    id: "t_pedido_cancelado",
    category: "pedido_cancelado",
    audience: "cliente",
    title: "Pedido cancelado",
    body: "O pedido #{pedido} foi cancelado. Em caso de dúvidas, fale com a gente.",
    icon: "❌",
    enabled: true,
    sendPush: false,
    sendEmail: true,
    sendInApp: true,
  },
  {
    id: "t_carrinho_abandonado",
    category: "carrinho_abandonado",
    audience: "cliente",
    title: "Esqueceu algo no carrinho? 🛒",
    body: "Olá {cliente}, ainda dá tempo de finalizar! Use o cupom VOLTEI10 e ganhe 10% off.",
    icon: "🛒",
    enabled: false,
    sendPush: true,
    sendEmail: true,
    sendInApp: false,
  },
  {
    id: "t_promo",
    category: "promo",
    audience: "cliente",
    title: "Novidade na loja! ✨",
    body: "Acabou de chegar coleção nova de laços. Corre antes de acabar!",
    icon: "🎉",
    enabled: true,
    sendPush: true,
    sendEmail: false,
    sendInApp: true,
  },

  // Admin
  {
    id: "t_novo_pedido_admin",
    category: "novo_pedido_admin",
    audience: "admin",
    title: "🛍️ Novo pedido!",
    body: "{cliente} fez um pedido de {total} (#{pedido}).",
    icon: "🛍️",
    enabled: true,
    sendPush: true,
    sendEmail: false,
    sendInApp: true,
  },
  {
    id: "t_estoque_baixo",
    category: "estoque_baixo",
    audience: "admin",
    title: "⚠️ Estoque baixo",
    body: 'O produto "{produto}" está com apenas {estoque} unidades.',
    icon: "⚠️",
    enabled: true,
    sendPush: false,
    sendEmail: false,
    sendInApp: true,
  },
  {
    id: "t_afiliada_nova_venda_admin",
    category: "afiliada_nova_venda",
    audience: "admin",
    title: "💼 Venda de afiliada",
    body: "{afiliada} registrou uma venda de {total} para {cliente}.",
    icon: "💼",
    enabled: true,
    sendPush: true,
    sendEmail: false,
    sendInApp: true,
  },
  {
    id: "t_pagamento_aprovado_admin",
    category: "pagamento_aprovado",
    audience: "admin",
    title: "Pagamento aprovado ✨",
    body: "Pagamento do pedido #{pedido} de {cliente} ({total}) foi confirmado.",
    icon: "💳",
    enabled: true,
    sendPush: true,
    sendEmail: false,
    sendInApp: true,
  },

  // Afiliada
  {
    id: "t_afiliada_venda_confirmada",
    category: "afiliada_venda_confirmada",
    audience: "afiliada",
    title: "Comissão liberada! 💰",
    body: "Sua venda para {cliente} foi confirmada. Comissão: {comissao}.",
    icon: "💰",
    enabled: true,
    sendPush: true,
    sendEmail: true,
    sendInApp: true,
  },
];

interface NotificationState {
  templates: NotificationTemplate[];
  logs: NotificationLog[];
  pushPermission: NotificationPermission | "unsupported";
  pushEnabled: boolean;
  // actions
  updateTemplate: (id: string, patch: Partial<NotificationTemplate>) => void;
  resetTemplates: () => void;
  trigger: (
    category: NotificationCategory,
    vars: Record<string, string | number>,
    opts?: { recipientId?: string; audience?: NotificationAudience },
  ) => NotificationLog | null;
  sendManual: (data: {
    title: string;
    body: string;
    audience: NotificationAudience;
    channels: ("push" | "email" | "inapp")[];
  }) => NotificationLog;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearLogs: () => void;
  requestPushPermission: () => Promise<NotificationPermission | "unsupported">;
  disablePush: () => Promise<void>;
}

function applyVars(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`,
  );
}

export const useNotifications = create<NotificationState>()(
  persist(
    (set, get) => ({
      templates: DEFAULT_TEMPLATES,
      logs: [],
      pushPermission:
        typeof window !== "undefined" && "Notification" in window
          ? Notification.permission
          : "unsupported",
      pushEnabled: false, // Default to false until we know or they enable it

      updateTemplate: (id, patch) =>
        set((s) => ({
          templates: s.templates.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),

      resetTemplates: () => set({ templates: DEFAULT_TEMPLATES }),

      trigger: (category, vars, opts) => {
        const tpls = get().templates.filter(
          (t) =>
            t.category === category &&
            t.enabled &&
            (opts?.audience ? t.audience === opts.audience : true),
        );
        if (tpls.length === 0) return null;
        let firstLog: NotificationLog | null = null;
        for (const tpl of tpls) {
          const channels: ("push" | "email" | "inapp")[] = [];
          if (tpl.sendPush) channels.push("push");
          if (tpl.sendEmail) channels.push("email");
          if (tpl.sendInApp) channels.push("inapp");

          const log: NotificationLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            category,
            title: applyVars(tpl.title, vars),
            body: applyVars(tpl.body, vars),
            audience: tpl.audience,
            recipientId: opts?.recipientId,
            channels,
            sentAt: new Date().toISOString(),
            read: false,
            data: vars,
          };
          set((s) => ({ logs: [log, ...s.logs].slice(0, 200) }));
          cloud.upsertNotificationLog(log);

          if (tpl.sendPush) {
            void dispatchPush({
              title: log.title,
              body: log.body,
              audience: tpl.audience,
              externalUserIds: opts?.recipientId
                ? [opts.recipientId]
                : undefined,
            });
          }
          if (!firstLog) firstLog = log;
        }
        return firstLog;
      },

      sendManual: (data) => {
        const log: NotificationLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          category: "manual",
          title: data.title,
          body: data.body,
          audience: data.audience,
          channels: data.channels,
          sentAt: new Date().toISOString(),
          read: false,
        };
        set((s) => ({ logs: [log, ...s.logs].slice(0, 200) }));
        cloud.upsertNotificationLog(log);
        if (data.channels.includes("push")) {
          void dispatchPush({
            title: data.title,
            body: data.body,
            audience: data.audience,
          });
        }
        return log;
      },

      markAllRead: () =>
        set((s) => ({ logs: s.logs.map((l) => ({ ...l, read: true })) })),
      markRead: (id) =>
        set((s) => ({
          logs: s.logs.map((l) => (l.id === id ? { ...l, read: true } : l)),
        })),
      clearLogs: () => set({ logs: [] }),

      requestPushPermission: async () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
          set({ pushPermission: "unsupported" });
          return "unsupported";
        }

        // CRITICAL: Check OneSignal synchronously — do NOT await anything
        // before calling requestPermission(). On Android/iOS, the browser
        // requires the permission request to happen in the SAME user-gesture
        // (click/tap) microtask. Any await before it breaks the gesture chain
        // and the native dialog will NOT appear.
        const OS = (window as any).OneSignal;
        const sdkReady = OS && typeof OS.Notifications !== "undefined";

        try {
          if (sdkReady) {
            console.log("[push] requestPermission via OneSignal SDK");
            await OS.Notifications.requestPermission();
          } else {
            console.log("[push] requestPermission via API nativa");
            await Notification.requestPermission();
          }
        } catch (e) {
          console.warn("[push] requestPermission falhou:", e);
          try {
            await Notification.requestPermission();
          } catch {}
        }

        const result = Notification.permission;
        set({ pushPermission: result });
        console.log("[push] Permissão final:", result);

        // AFTER permission is granted, register with OneSignal (async is OK now)
        if (result === "granted") {
          try {
            const sdk = sdkReady ? OS : await getOneSignalSDK(3000);
            if (sdk?.User?.PushSubscription?.optIn) {
              await sdk.User.PushSubscription.optIn();
              console.log("[push] OneSignal optIn OK");
            }
          } catch {}
          set({ pushEnabled: true });
        }

        return result;
      },

      disablePush: async () => {
        if (typeof window === "undefined") return;
        try {
          // Check synchronously first, then fallback to deferred
          const OS = (window as any).OneSignal;
          const sdkReady = OS && typeof OS.Notifications !== "undefined";
          const sdk = sdkReady ? OS : await getOneSignalSDK(3000);

          if (sdk?.User?.PushSubscription?.optOut) {
            await sdk.User.PushSubscription.optOut();
            console.log("[push] optOut OK");
          } else if (sdk?.setSubscription) {
            await sdk.setSubscription(false);
          }
          set({ pushEnabled: false });
        } catch (e) {
          console.warn("[push] disablePush failed", e);
        }
      },
    }),
    {
      name: "princesa-notifications-v2",
      partialize: (s) => ({
        templates: s.templates,
        logs: s.logs,
        pushEnabled: s.pushEnabled,
      }),
    },
  ),
);

// ---- Sync pushEnabled with actual OneSignal state on page load ----
if (typeof window !== "undefined") {
  getOneSignalSDK(10000).then((OS) => {
    if (!OS) return;
    try {
      const permission =
        "Notification" in window ? Notification.permission : "unsupported";
      const isOptedIn = OS?.User?.PushSubscription?.optedIn === true;
      console.log(
        "[push] Sync inicial — permission:",
        permission,
        "optedIn:",
        isOptedIn,
      );
      useNotifications.setState({
        pushPermission: permission,
        pushEnabled: isOptedIn && permission === "granted",
      });
    } catch (e) {
      console.warn("[push] Sync inicial falhou:", e);
    }
  });
}

export { getOneSignalSDK };

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  pedido_realizado: "Pedido realizado",
  pagamento_aprovado: "Pagamento aprovado",
  pedido_em_separacao: "Pedido em separação",
  pedido_enviado: "Pedido enviado",
  pedido_entregue: "Pedido entregue",
  pedido_cancelado: "Pedido cancelado",
  novo_pedido_admin: "Novo pedido (admin)",
  afiliada_nova_venda: "Venda de afiliada (admin)",
  afiliada_venda_confirmada: "Comissão de afiliada confirmada",
  promo: "Promoção / novidade",
  carrinho_abandonado: "Carrinho abandonado",
  estoque_baixo: "Estoque baixo",
  manual: "Manual",
};

export const AUDIENCE_LABELS: Record<NotificationAudience, string> = {
  cliente: "Cliente",
  admin: "Admin",
  afiliada: "Afiliada",
};
