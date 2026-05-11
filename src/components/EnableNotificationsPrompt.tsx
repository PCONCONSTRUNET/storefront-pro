import { useEffect, useState } from "react";
import { X, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { getOneSignalSDK } from "@/lib/notifications";

const DISMISS_KEY = "push_prompt_dismissed_at";
const ACCEPTED_KEY = "push_prompt_accepted";
const DISMISS_DAYS = 3;

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export function EnableNotificationsPrompt() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const currentCustomerId = useStore((s) => s.currentCustomerId);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already accepted push? Don't show again.
    try {
      if (localStorage.getItem(ACCEPTED_KEY) === "1") return;
    } catch {}

    // Dismissed recently? Don't show.
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    } catch {}

    // If Notification API is available and permission already granted/denied, skip
    if ("Notification" in window && Notification.permission === "granted") {
      try { localStorage.setItem(ACCEPTED_KEY, "1"); } catch {}
      return;
    }
    if ("Notification" in window && Notification.permission === "denied") return;

    // Show prompt — use a longer delay for PWA to let everything settle
    const delay = isStandalone() ? 4000 : 2000;
    console.log("[push-prompt] Will show in", delay, "ms (PWA:", isStandalone(), ")");

    const t = window.setTimeout(() => {
      // No Android PWA, ignoramos o estado nativo de Notification.permission
      // e confiamos apenas no localStorage para decidir se mostramos o modal.
      console.log("[push-prompt] Showing notification prompt");
      setOpen(true);
    }, delay);

    return () => window.clearTimeout(t);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setOpen(false);
  };

  const enable = async () => {
    let granted = false;
    try {
      setBusy(true);

      const OS = (window as any).OneSignal;
      const sdkReady = OS && typeof OS.Notifications !== "undefined";

      console.log("[push-prompt] SDK ready:", sdkReady);

      if (sdkReady) {
        await OS.Notifications.requestPermission();
        // O OneSignal pode demorar um pouco para atualizar a permissão internamente
        await new Promise(r => setTimeout(r, 1000));
        granted = OS.Notifications.permission === true || Notification.permission === "granted";
      } else if ("Notification" in window) {
        await Notification.requestPermission();
        granted = Notification.permission === "granted";
      }

      if (granted) {
        try { localStorage.setItem(ACCEPTED_KEY, "1"); } catch {}
        // Força o opt-in no OneSignal
        if (sdkReady && OS.User?.PushSubscription) {
          await OS.User.PushSubscription.optIn();
        }
      }
    } catch (err) {
      console.warn("[push-prompt] Error:", err);
    } finally {
      setBusy(false);
      dismiss();
    }

    if (granted) {
      // Notificação de boas-vindas imediata para o Admin
      const sendWelcome = async () => {
        try {
          // Identifica se é admin ou cliente
          const isAdmin = window.location.pathname.includes("/admin");
          
          await supabase.functions.invoke("send-push", {
            body: {
              title: "Notificações ativadas! 🔔",
              message: isAdmin 
                ? "Admin: Você receberá avisos de novos pedidos e pagamentos 💰" 
                : "Pronto! Você vai receber avisos de seus pedidos e novidades 💖",
              externalUserIds: currentCustomerId ? [currentCustomerId] : undefined,
              audience: isAdmin ? "admin" : "cliente",
            },
          });
          console.log("[push-prompt] Welcome push sent to audience:", isAdmin ? "admin" : "cliente");
        } catch (e) {
          console.warn("[push-prompt] Welcome push failed", e);
        }
      };
      window.setTimeout(sendWelcome, 3000);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-4 pointer-events-none" style={{ marginBottom: "60px" }}>
      <div className="pointer-events-auto max-w-sm mx-auto bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="relative p-4">
          <button
            onClick={dismiss}
            aria-label="Fechar"
            className="absolute right-2 top-2 w-7 h-7 grid place-items-center rounded-full hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary grid place-items-center text-primary-foreground shrink-0">
              <Bell className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <div className="font-bold text-sm text-foreground">Ativar notificações</div>
              <div className="text-xs text-muted-foreground">
                Receba avisos de pedidos, pagamentos e novidades 💖
              </div>
            </div>
          </div>
          <button
            onClick={enable}
            disabled={busy}
            className="mt-3 w-full h-10 rounded-full gradient-primary text-primary-foreground font-semibold text-sm shadow-soft active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {busy ? "Ativando..." : "Ativar agora"}
          </button>
          <button
            onClick={dismiss}
            className="mt-2 w-full h-8 rounded-full text-muted-foreground text-xs"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
