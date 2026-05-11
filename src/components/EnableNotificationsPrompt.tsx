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

// Executa uma Promise com timeout máximo
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

export function EnableNotificationsPrompt() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const isAdmin = useStore((s) => s.isAdmin);
  const currentCustomerId = useStore((s) => s.currentCustomerId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("Notification" in window && Notification.permission === "denied") return;

    // Se dismissed recentemente, não mostra
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    } catch {}

    // Delay curto — 1.5s normal, 2.5s no PWA
    const delay = isStandalone() ? 2500 : 1500;

    const t = window.setTimeout(async () => {
      // Se permissão já concedida, tenta registrar silenciosamente (máx 3s)
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const OS = (window as any).OneSignal;
          const sub = OS?.User?.PushSubscription;

          if (sub?.id) {
            // Já registrado — marca e sai sem mostrar modal
            try { localStorage.setItem(ACCEPTED_KEY, "1"); } catch {}
            return;
          }

          if (sub && !sub.id) {
            // Tenta optIn com timeout de 3s
            await withTimeout(sub.optIn(), 3000);
            // Espera 1s para o ID aparecer
            await new Promise(r => setTimeout(r, 1000));
            if (OS?.User?.PushSubscription?.id) {
              try { localStorage.setItem(ACCEPTED_KEY, "1"); } catch {}
              return; // Registrado com sucesso, sem precisar do modal
            }
          }
        } catch {
          // optIn falhou ou timeout — vai mostrar o modal
        }

        // Permissão já dada mas OneSignal não registrou — mostra modal
        setOpen(true);
        return;
      }

      // Permissão ainda não solicitada — verifica se já aceitou via nosso modal
      try {
        if (localStorage.getItem(ACCEPTED_KEY) === "1") return;
      } catch {}

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

      // Pede permissão se ainda não foi concedida
      if (Notification.permission !== "granted") {
        if (sdkReady) {
          await withTimeout(OS.Notifications.requestPermission(), 15000);
        } else {
          await withTimeout(Notification.requestPermission(), 15000);
        }
      }

      granted = Notification.permission === "granted";

      if (granted && sdkReady) {
        try { localStorage.setItem(ACCEPTED_KEY, "1"); } catch {}

        // Vincula ao usuário correto (admin ou cliente)
        const osUserId = isAdmin ? "admin-user" : currentCustomerId;
        if (osUserId) {
          await withTimeout(OS.login(osUserId), 5000);
          OS.User.addTag("role", isAdmin ? "admin" : "cliente");
        }

        // Registra a assinatura (máx 5s)
        const sub = OS.User?.PushSubscription;
        if (sub && !sub.id) {
          await withTimeout(sub.optIn(), 5000);
        }
      }
    } catch (err) {
      console.warn("[push-prompt] Error in enable:", err);
      // Mesmo com erro, fecha o modal e tenta enviar welcome
      granted = Notification.permission === "granted";
    } finally {
      setBusy(false);
      dismiss(); // Sempre fecha o modal
    }

    // Push de boas-vindas em background
    if (granted) {
      (async () => {
        try {
          // Espera até 8s pelo subscription ID
          const OS = (window as any).OneSignal;
          let subId: string | null = null;
          for (let i = 0; i < 8; i++) {
            subId = OS?.User?.PushSubscription?.id;
            if (subId) break;
            await new Promise(r => setTimeout(r, 1000));
          }

          await supabase.functions.invoke("send-push", {
            body: {
              title: "Notificações ativadas! 🔔",
              message: isAdmin
                ? "Admin: você receberá avisos de pedidos e pagamentos 💰"
                : "Pronto! Você vai receber avisos dos seus pedidos 💖",
              subscriptionIds: subId ? [subId] : undefined,
              externalUserIds: isAdmin
                ? ["admin-user"]
                : currentCustomerId ? [currentCustomerId] : undefined,
            },
          });
        } catch (e) {
          console.warn("[push-prompt] Welcome push failed:", e);
        }
      })();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-4 pointer-events-none"
      style={{ marginBottom: "60px" }}
    >
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
              <div className="font-bold text-sm text-foreground">
                Ativar notificações
              </div>
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
