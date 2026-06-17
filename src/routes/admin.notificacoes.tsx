import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import {
  Bell,
  Send,
  Settings2,
  History,
  Smartphone,
  Mail,
  MessageSquare,
  Check,
  X,
  RefreshCw,
  Trash2,
  BellRing,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  useNotifications,
  CATEGORY_LABELS,
  AUDIENCE_LABELS,
  type NotificationTemplate,
} from "@/lib/notifications";

export const Route = createFileRoute("/admin/notificacoes")({
  component: Page,
});

type Tab = "enviar" | "modelos" | "historico";

function Page() {
  const {
    templates,
    logs,
    pushPermission,
    pushEnabled,
    updateTemplate,
    resetTemplates,
    sendManual,
    markAllRead,
    clearLogs,
    requestPushPermission,
    disablePush,
  } = useNotifications();

  const [tab, setTab] = useState<Tab>("enviar");
  const adminTemplates = useMemo(
    () => templates.filter((t) => t.audience === "admin"),
    [templates],
  );

  const [form, setForm] = useState({
    title: "",
    body: "",
    channels: { push: true, email: false, inapp: true },
  });

  const stats = useMemo(
    () => ({
      total: logs.length,
      unread: logs.filter((l) => !l.read).length,
      push: logs.filter((l) => l.channels.includes("push")).length,
      activeTemplates: adminTemplates.filter((t) => t.enabled).length,
    }),
    [logs, adminTemplates],
  );

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Preencha título e mensagem");
      return;
    }
    const channels: ("push" | "email" | "inapp")[] = [];
    if (form.channels.push) channels.push("push");
    if (form.channels.email) channels.push("email");
    if (form.channels.inapp) channels.push("inapp");
    if (channels.length === 0) {
      toast.error("Escolha ao menos um canal");
      return;
    }
    sendManual({
      title: form.title,
      body: form.body,
      audience: "admin",
      channels,
    });
    setForm({ ...form, title: "", body: "" });
    toast.success("Notificação enviada para o admin");
  };

  const [togglingPush, setTogglingPush] = useState(false);

  const togglePush = async (enabled: boolean) => {
    setTogglingPush(true);
    try {
      if (enabled) {
        // ATIVAR
        const OS = (window as any).OneSignal;

        // Se permissão já foi concedida, apenas faz optIn
        if (Notification.permission === "granted") {
          const sub = OS?.User?.PushSubscription;
          if (sub && !sub.optedIn) {
            await sub.optIn();
          }
          // Vincula ao admin
          if (OS) {
            await OS.login("admin-user");
            OS.User.addTag("role", "admin");
          }
          toast.success("Notificações reativadas neste dispositivo!");
        } else {
          // Pede permissão via store
          const r = await requestPushPermission();
          if (r === "granted") toast.success("Notificações ativadas!");
          else if (r === "denied") toast.error("Permissão negada. Ative manualmente nas configurações do navegador.");
          else toast.error("Seu navegador não suporta notificações push.");
        }
      } else {
        // DESATIVAR — optOut no OneSignal
        const OS = (window as any).OneSignal;
        const sub = OS?.User?.PushSubscription;

        if (sub?.optedIn) {
          await sub.optOut();
          await disablePush(); // Atualiza o estado no store
          toast.success("Notificações desativadas neste dispositivo.");
        } else {
          await disablePush();
          toast.info("Notificações já estavam desativadas.");
        }
      }
    } catch (e) {
      console.error("[togglePush]", e);
      toast.error("Erro ao alterar as notificações. Tente novamente.");
    } finally {
      setTogglingPush(false);
    }
  };

  const { 
    playerId: osId, 
    subscribed: osActive, 
    loading: syncing, 
    enable: forceSync,
    permission: osPermission
  } = usePushNotifications({ role: 'admin' });

  const nukeServiceWorker = async () => {
    const { confirmDialog } = await import("@/components/ConfirmDialog");
    if (!(await confirmDialog({ title: "Resetar notificações?", description: "Isso vai limpar todas as configurações de notificação e recarregar a página.", confirmLabel: "Continuar" }))) return;
    
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          try {
            // Destrói a inscrição de push nativa travada no aparelho
            if (registration.pushManager) {
              const subscription = await registration.pushManager.getSubscription();
              if (subscription) {
                await subscription.unsubscribe();
                console.log("[push] Inscrição antiga destruída com sucesso!");
              }
            }
          } catch (e) {
            console.error("[push] Erro ao destruir inscrição antiga:", e);
          }
          await registration.unregister();
        }
      }
      
      // Limpa dados do OneSignal no localStorage e IndexedDB
      localStorage.removeItem("push_prompt_accepted");
      localStorage.removeItem("push_prompt_dismissed_at");
      
      // Limpa bancos de dados do OneSignal (IndexedDB)
      const dbs = await window.indexedDB.databases();
      dbs.forEach(db => {
        if (db.name?.includes("OneSignal")) {
          window.indexedDB.deleteDatabase(db.name);
        }
      });

      window.alert("Sistema limpo! A página vai recarregar. Ative as notificações novamente ao voltar.");
      window.location.reload();
    } catch (err) {
      console.error("Erro ao limpar:", err);
      window.location.reload();
    }
  };

  const testNotification = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");

      // Se não tem ID ou tem ID local (offline), envia para todos os admins
      const isRealId = osId && !osId.startsWith("local-");

      const body = isRealId
        ? {
            title: "Teste Admin Push 🚀",
            message: `Recebido! ${new Date().toLocaleTimeString()}`,
            subscriptionIds: [osId],
          }
        : {
            title: "Teste Admin Push 🚀",
            message: `Recebido! ${new Date().toLocaleTimeString()} (broadcast admin)`,
            audience: "admin",
          };

      const { error } = await supabase.functions.invoke("send-push", { body });

      if (error) throw error;

      if (isRealId) {
        toast.success(`Push enviado para o ID: ${osId!.slice(0, 8)}...`);
      } else {
        toast.success("Push enviado para todos os admins! (este dispositivo precisa ressincronizar)");
        toast.info("Toque em 'Limpar Tudo' e depois 'Sincronizar' para registrar este celular.", { duration: 6000 });
      }
    } catch (err) {
      console.error("[push-test]", err);
      toast.error(`Erro: ${(err as Error).message}`);
    }
  };


  return (
    <AdminLayout title="Notificações">
      {/* Barra de Diagnóstico Push - Reforçada para Mobile */}
      <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-2xl border-2 border-indigo-500/20 shadow-lg relative z-[999] pointer-events-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-widest flex items-center gap-2">
            <Bell className="h-3 w-3" /> Status do Push
          </div>
          <div
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${osActive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}
          >
            {osActive ? "CONECTADO" : "DESCONECTADO"}
          </div>
        </div>

        <div className="bg-white/50 dark:bg-black/20 p-2 rounded-xl mb-4 font-mono text-[10px] break-all border border-black/5 dark:border-white/5">
          <span className="opacity-50 block mb-0.5 uppercase text-[8px]">
            Subscription ID
          </span>
          {osId || "Aguardando..."}
        </div>
        
        {/* Nova caixa de Erro para Diagnóstico */}
        <div className="bg-destructive/10 dark:bg-destructive/20 p-2 rounded-xl mb-4 font-mono text-[10px] break-all border border-destructive/20 text-destructive hidden empty:hidden" id="os-debug-log">
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              nukeServiceWorker();
            }}
            className="h-11 bg-destructive/10 text-destructive rounded-xl font-bold text-[10px] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 border border-destructive/20"
          >
            Limpar Tudo
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.alert("Sincronizando... aguarde o aviso de sucesso.");
              forceSync();
            }}
            disabled={syncing}
            className="h-11 bg-white dark:bg-white/10 text-foreground rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 border border-border"
          >
            {syncing ? "..." : "Sincronizar"}
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            testNotification();
          }}
          className="w-full h-11 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <TrendingUp className="h-4 w-4" /> Testar Push
        </button>
      </div>
    </AdminLayout>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-10 px-4 rounded-full text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${active ? "gradient-primary text-primary-foreground shadow-soft" : "bg-card border border-border hover:bg-muted/40"}`}
    >
      <Icon className="h-4 w-4" /> {children}
    </button>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-3 py-2 backdrop-blur ${highlight ? "bg-gold text-gold-foreground" : "bg-white/15"}`}
    >
      <div className="text-[10px] uppercase tracking-wide opacity-90">
        {label}
      </div>
      <div className="font-bold text-base mt-0.5">{value}</div>
    </div>
  );
}

function PushBadge({
  state,
}: {
  state: NotificationPermission | "unsupported";
}) {
  const map = {
    granted: { label: "Push ativo", cls: "bg-success text-success-foreground" },
    denied: {
      label: "Push bloqueado",
      cls: "bg-destructive text-destructive-foreground",
    },
    default: { label: "Push pendente", cls: "bg-white/15" },
    unsupported: { label: "Sem suporte", cls: "bg-white/15" },
  } as const;
  const m = map[state] ?? map.default;
  return (
    <span
      className={`text-[10px] px-2 py-1 rounded-full font-semibold ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function ChannelToggle({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-12 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${active ? "border-primary bg-primary/10 text-primary scale-[1.02]" : "border-border bg-background text-muted-foreground hover:bg-muted/40"}`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
      {active ? (
        <Check className="h-3 w-3" />
      ) : (
        <X className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}

function NotificationPreview({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card border border-border space-y-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        Como aparecerá no celular
      </p>
      <div className="rounded-2xl bg-foreground/95 text-background p-3 shadow-lg">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary grid place-items-center shrink-0">
            <Bell className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] opacity-70 uppercase">
                Princesa de Laços
              </span>
              <span className="text-[10px] opacity-70">agora</span>
            </div>
            <div className="font-semibold text-sm truncate">{title}</div>
            <div className="text-xs opacity-90 line-clamp-2">{body}</div>
          </div>
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        In-app (toast)
      </p>
      <div className="rounded-xl bg-card border border-border p-3 flex items-start gap-2">
        <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{title}</div>
          <div className="text-xs text-muted-foreground line-clamp-2">
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateRow({
  template,
  onChange,
}: {
  template: NotificationTemplate;
  onChange: (p: Partial<NotificationTemplate>) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="relative rounded-xl border border-border bg-background overflow-hidden">
      <div className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-xl" style={{ backgroundColor: template.enabled ? "#22c55e" : "#ef4444" }} />
      <div className="flex items-center gap-3 p-3 ml-1">
        <div className="w-10 h-10 rounded-xl bg-accent/40 grid place-items-center text-xl shrink-0">
          {template.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">
              {CATEGORY_LABELS[template.category]}
            </span>
            {!template.enabled && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                Desativado
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {template.title}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ChannelDot
            icon={Smartphone}
            active={template.sendPush}
            title="Push"
          />
          <ChannelDot icon={Mail} active={template.sendEmail} title="E-mail" />
          <ChannelDot
            icon={MessageSquare}
            active={template.sendInApp}
            title="In-app"
          />
          <Switch
            checked={template.enabled}
            onChange={(v) => onChange({ enabled: v })}
          />
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-xs font-semibold text-primary px-2"
          >
            {open ? "Fechar" : "Editar"}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border p-3 bg-muted/30 space-y-2 animate-fade-in">
          <Field label="Título">
            <input
              value={template.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Mensagem">
            <textarea
              value={template.body}
              onChange={(e) => onChange({ body: e.target.value })}
              rows={3}
              className="input min-h-[80px] py-2"
            />
          </Field>
          <div className="flex flex-wrap gap-3 pt-1">
            <Switch
              label="Push"
              checked={template.sendPush}
              onChange={(v) => onChange({ sendPush: v })}
            />
            <Switch
              label="E-mail"
              checked={template.sendEmail}
              onChange={(v) => onChange({ sendEmail: v })}
            />
            <Switch
              label="In-app"
              checked={template.sendInApp}
              onChange={(v) => onChange({ sendInApp: v })}
            />
          </div>
        </div>
      )}
    </li>
  );
}

function ChannelDot({
  icon: Icon,
  active,
  title,
}: {
  icon: React.ElementType;
  active: boolean;
  title: string;
}) {
  return (
    <span
      title={title}
      className={`w-7 h-7 rounded-lg grid place-items-center ${active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground/40"}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

function Switch({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium select-none">
      <span
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"} ${className || ""}`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`}
        />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
