import { useEffect, useState } from "react";
import { Bell, BellRing, CheckCircle2, AlertTriangle, Smartphone, Share, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { supabase } from "@/integrations/supabase/client";

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}
function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export function AdminDeviceSyncBanner() {
  const { supported, subscribed, permission, loading, playerId, enable } =
    usePushNotifications({ role: "admin", userId: null });

  const [iosInstallOpen, setIosInstallOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("admin_sync_dismissed_until")) {
        const until = Number(localStorage.getItem("admin_sync_dismissed_until"));
        if (until > Date.now()) setDismissed(true);
      }
    } catch {}
  }, []);

  const handleSync = async () => {
    if (isIOS() && !isStandalone()) {
      setIosInstallOpen(true);
      return;
    }
    if (!supported) {
      toast.error("Este navegador não suporta notificações push.");
      return;
    }
    if (permission === "denied") {
      toast.error("Permissão bloqueada. Vá em ajustes do navegador → Notificações → Permitir.");
      return;
    }
    const ok = await enable();
    if (ok) toast.success("Celular sincronizado! 🎉 Vai receber as notificações.");
    else toast.error("Não foi possível sincronizar. Tente novamente.");
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await supabase.functions.invoke("send-push", {
        body: {
          title: "🔔 Teste de notificação",
          message: "Se você recebeu isso, está tudo certo no seu celular!",
          audience: "admin",
          url: "/admin",
        },
      });
      toast.success("Push de teste enviado para todos os celulares admin!");
    } catch (e) {
      toast.error("Falha ao enviar teste.");
    } finally {
      setTesting(false);
    }
  };

  if (loading) return null;

  // Tudo certo — mostra mini-status com botão de teste
  if (subscribed && playerId) {
    if (dismissed) return null;
    return (
      <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 grid place-items-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
            Celular sincronizado ✨
          </div>
          <div className="text-xs text-emerald-700 dark:text-emerald-300 truncate">
            Você receberá pedidos e pagamentos aqui.
          </div>
        </div>
        <button
          onClick={handleTest}
          disabled={testing}
          className="shrink-0 h-9 px-3 rounded-full bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {testing ? "..." : "Testar"}
        </button>
      </div>
    );
  }

  // Não suportado e não é iOS sem PWA → não mostra
  if (!supported && !(isIOS() && !isStandalone())) {
    return null;
  }

  // Estado: precisa sincronizar
  return (
    <>
      <div className="mb-4 rounded-2xl gradient-primary text-primary-foreground shadow-soft overflow-hidden animate-fade-in">
        <div className="p-4 flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur grid place-items-center shrink-0">
            {permission === "denied" ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <BellRing className="h-6 w-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base leading-tight">
              {permission === "denied"
                ? "Notificações bloqueadas"
                : "Sincronize este celular"}
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              {permission === "denied"
                ? "Libere as notificações nas configurações do navegador para receber alertas."
                : "Receba avisos de pagamento aprovado, novos pedidos e estoque neste aparelho."}
            </div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <button
            onClick={handleSync}
            disabled={loading || permission === "denied"}
            className="w-full h-11 rounded-full bg-white text-primary font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60 shadow-soft"
          >
            <Smartphone className="h-4 w-4" />
            {loading ? "Sincronizando..." : "Sincronizar este celular"}
          </button>
        </div>
      </div>

      {/* Modal iOS: instruções para instalar como PWA */}
      {iosInstallOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIosInstallOpen(false)}
        >
          <div
            className="bg-card rounded-3xl w-full max-w-sm p-5 shadow-2xl animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl gradient-primary grid place-items-center text-primary-foreground">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-foreground">Instalar no iPhone</div>
                <div className="text-xs text-muted-foreground">
                  No iOS o push só funciona no app instalado.
                </div>
              </div>
            </div>
            <ol className="space-y-3 text-sm text-foreground">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold shrink-0">1</span>
                <span>Toque no botão <Share className="inline h-4 w-4 mx-1" /> <b>Compartilhar</b> do Safari.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold shrink-0">2</span>
                <span>Escolha <Plus className="inline h-4 w-4 mx-1" /> <b>Adicionar à Tela de Início</b>.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold shrink-0">3</span>
                <span>Abra pelo ícone instalado, faça login e toque em <b>Sincronizar este celular</b>.</span>
              </li>
            </ol>
            <button
              onClick={() => setIosInstallOpen(false)}
              className="mt-5 w-full h-11 rounded-full gradient-primary text-primary-foreground font-bold text-sm"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
