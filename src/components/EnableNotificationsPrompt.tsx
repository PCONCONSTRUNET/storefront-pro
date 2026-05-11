import { useEffect, useState } from "react";
import { X, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";

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
  const isAdmin = useStore((s) => s.isAdmin);
  const currentCustomerId = useStore((s) => s.currentCustomerId);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If permission denied — nothing we can do
    if ("Notification" in window && Notification.permission === "denied") return;

    // If dismissed recently — skip
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    } catch {}

    const delay = isStandalone() ? 4000 : 2500;

    const t = window.setTimeout(async () => {
      // If permission already granted, try silent optIn first
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const OS = (window as any).OneSignal;
          const sub = OS?.User?.PushSubscription;

          if (sub?.id) {
            // Already properly registered — mark as accepted and done
            console.log("[push-prompt] Already registered:", sub.id);
            try { localStorage.setItem(ACCEPTED_KEY, "1"); } catch {}
            return;
          }

          if (sub && !sub.id) {
            // Permission granted but OneSignal has no subscription for this app
            // This happens when switching App IDs — silently call optIn()
            console.log("[push-prompt] Permission granted but no sub — calling optIn()");
            await sub.optIn();

            // Wait up to 5s for ID to appear
            let waited = 0;
            while (!OS?.User?.PushSubscription?.id && waited < 5000) {
              await new Promise(r => setTimeout(r, 500));
              waited += 500;
            }

            if (OS?.User?.PushSubscription?.id) {
              console.log("[push-prompt] Silent registration OK:", OS.User.PushSubscription.id);
              try { localStorage.setItem(ACCEPTED_KEY, "1"); } catch {}
              return;
            }
          }
        } catch (e) {
          console.warn("[push-prompt] Silent optIn failed:", e);
        }

        // Silent registration failed — show modal so user can try manually
        console.log("[push-prompt] Silent optIn failed, showing modal");
        setOpen(true);
        return;
      }

      // Permission not yet requested — check if already accepted before
      try {
        if (localStorage.getItem(ACCEPTED_KEY) === "1") return;
      } catch {}

      // Show modal to ask for permission
      console.log("[push-prompt] Showing notification prompt");
      setOpen(true);
    }, delay);

    return () => window.clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setOpen(false);
  };

  const enable = async () => {
    setBusy(true);
    let granted = false;

    try {
      const OS = (window as any).OneSignal;
      const sdkReady = OS && typeof OS.Notifications !== "undefined";

      if (sdkReady) {
        // If permission not yet granted, request it
        if (Notification.permission !== "granted") {
          await OS.Notifications.requestPermission();
          await new Promise(r => setTimeout(r, 1000));
        }

        granted = Notification.permission === "granted";

        if (granted) {
          try { localStorage.setItem(ACCEPTED_KEY, "1"); } catch {}

          // Login with correct ID
          const osUserId = isAdmin ? "admin-user" : currentCustomerId;
          if (osUserId) {
            await OS.login(osUserId);
            OS.User.addTag("role", isAdmin ? "admin" : "cliente");
          }

          // Register subscription
          if (OS.User?.PushSubscription && !OS.User.PushSubscription.id) {
            await OS.User.PushSubscription.optIn();
          }
        }
      } else if ("Notification" in window) {
        await Notification.requestPermission();
        granted = Notification.permission === "granted";
        if (granted) try { localStorage.setItem(ACCEPTED_KEY, "1"); } catch {}
      }
    } catch (err) {
      console.warn("[push-prompt] Error:", err);
    } finally {
      setBusy(false);
      dismiss();
    }

    // Send welcome push after registration
    if (granted) {
      window.setTimeout(async () => {
        try {
          const OS = (window as any).OneSignal;

          // Wait for subscription ID
          let waited = 0;
          while (!OS?.User?.PushSubscription?.id && waited < 10000) {
            await new Promise(r => setTimeout(r, 1000));
            waited += 1000;
          }

          const subId = OS?.User?.PushSubscription?.id;
          console.log("[push-prompt] Sending welcome push. SubID:", subId);

          await supabase.functions.invoke("send-push", {
            body: {
              title: "Notificações ativadas! 🔔",
              message: isAdmin
                ? "Admin: você receberá avisos de pedidos e pagamentos 💰"
                : "Pronto! Você vai receber avisos dos seus pedidos 💖",
              subscriptionIds: subId ? [subId] : undefined,
              externalUserIds: isAdmin ? ["admin-user"] : (currentCustomerId ? [currentCustomerId] : undefined),
            },
          });
          console.log("[push-prompt] Welcome push sent!");
        } catch (e) {
          console.warn("[push-prompt] Welcome push failed:", e);
        }
      }, 1000);
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
                {isAdmin
                  ? "Receba avisos de pedidos, pagamentos e estoque 💰"
                  : "Receba avisos de pedidos, pagamentos e novidades 💖"}
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
