import { useEffect } from "react";
import { X, Bell } from "lucide-react";
import { useStore } from "@/lib/store";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function EnableNotificationsPrompt() {
  const isAdmin = useStore((s) => s.isAdmin);
  const currentCustomerId = useStore((s) => s.currentCustomerId);

  const role = isAdmin ? "admin" : "cliente";
  const userId = isAdmin ? null : currentCustomerId;

  const { supported, subscribed, permission, loading, enable } =
    usePushNotifications({ role, userId });

  // Mostra o prompt automaticamente se:
  // - Suportado
  // - Permissão ainda não foi pedida (default)
  // - Não está inscrito ainda
  const shouldShow =
    supported &&
    !subscribed &&
    permission === "default" &&
    !loading;

  // Se já tem permissão mas não está inscrito (caso pós-troca de App ID),
  // o hook já tenta o optIn silencioso automaticamente — não exibimos modal.

  if (!shouldShow) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-4 pointer-events-none"
      style={{ marginBottom: "60px" }}
    >
      <div className="pointer-events-auto max-w-sm mx-auto bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="relative p-4">
          <button
            onClick={() => {/* dismiss — não temos estado de open aqui, componente some ao inscrever */}}
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
            disabled={loading}
            className="mt-3 w-full h-10 rounded-full gradient-primary text-primary-foreground font-semibold text-sm shadow-soft active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {loading ? "Ativando..." : "Ativar agora"}
          </button>
        </div>
      </div>
    </div>
  );
}
