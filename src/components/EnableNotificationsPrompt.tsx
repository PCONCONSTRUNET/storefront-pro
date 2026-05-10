import { useEffect, useState } from "react";
import { X, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";

const DISMISS_KEY = "push_prompt_dismissed_at";
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
  const currentCustomerId = useStore(s => s.currentCustomerId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isStandalone()) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const fresh = Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    if (fresh) return;

    const t = window.setTimeout(() => setOpen(true), 1500);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setOpen(false);
  };

  const enable = async () => {
    setBusy(true);
    let granted = false;
    try {
      const OneSignal = (window as any).OneSignal;
      if (OneSignal?.Notifications?.requestPermission) {
        await OneSignal.Notifications.requestPermission();
      } else if ("Notification" in window) {
        await Notification.requestPermission();
      }
      granted = typeof Notification !== "undefined" && Notification.permission === "granted";
    } catch {
      try {
        await Notification.requestPermission();
        granted = Notification.permission === "granted";
      } catch {}
    } finally {
      setBusy(false);
      dismiss();
    }

    if (granted) {
      // Aguarda OneSignal registrar a subscription antes de enviar boas-vindas
      const sendWelcome = async () => {
        try {
          await supabase.functions.invoke("send-push", {
            body: {
              title: "Notificações ativadas! 🔔",
              message: "Pronto! Você vai receber avisos de pedidos, pagamentos e novidades 💖",
              externalUserIds: currentCustomerId ? [currentCustomerId] : undefined,
              audience: currentCustomerId ? undefined : "customer",
            },
          });
        } catch (e) {
          console.warn("[push] welcome falhou", e);
        }
      };
      window.setTimeout(sendWelcome, 3500);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 pointer-events-none">
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
