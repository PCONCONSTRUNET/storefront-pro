import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
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
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import {
  useNotifications,
  CATEGORY_LABELS,
  AUDIENCE_LABELS,
  type NotificationAudience,
  type NotificationTemplate,
} from "@/lib/notifications";

export const Route = createFileRoute("/admin/notificacoes")({
  component: Page,
});

type Tab = "enviar" | "modelos" | "historico";

function Page() {
  const customers = useStore((s) => s.customers);
  const affiliates = useStore((s) => s.affiliates);
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
  const [form, setForm] = useState({
    title: "",
    body: "",
    audience: "cliente" as NotificationAudience,
    channels: { push: true, email: false, inapp: true },
  });

  const stats = useMemo(
    () => ({
      total: logs.length,
      unread: logs.filter((l) => !l.read).length,
      push: logs.filter((l) => l.channels.includes("push")).length,
      activeTemplates: templates.filter((t) => t.enabled).length,
    }),
    [logs, templates],
  );

  const audienceCount = (a: NotificationAudience) =>
    a === "cliente"
      ? customers.length
      : a === "afiliada"
        ? affiliates.length
        : 1;

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
      audience: form.audience,
      channels,
    });
    setForm({ ...form, title: "", body: "" });
    toast.success(
      `Notificação enviada para ${audienceCount(form.audience)} ${form.audience === "cliente" ? "cliente(s)" : form.audience === "afiliada" ? "afiliada(s)" : "destinatário(s)"}`,
    );
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

  return (
    <AdminLayout title="Notificações">
      {/* Hero / status */}
      <div className="relative overflow-hidden rounded-3xl gradient-primary text-primary-foreground shadow-soft mb-4 animate-fade-in">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-gold/30 blur-3xl pointer-events-none" />
        <div className="relative p-5 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur grid place-items-center">
              <BellRing className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl leading-tight">
                Central de notificações
              </h2>
              <p className="text-xs opacity-90">
                Push, e-mail e in-app — tudo em um só lugar.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur px-4 py-2 rounded-2xl border border-white/10">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase opacity-70">
                Status do Push
              </span>
              <PushBadge state={pushPermission} />
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase opacity-70 mb-1">
                Notificações
              </span>
              <Switch
                checked={pushEnabled}
                onChange={togglePush}
                className={`bg-white/20 ${togglingPush ? "opacity-50 pointer-events-none" : ""}`}
              />
            </div>
          </div>
        </div>
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2 px-5 pb-5">
          <Stat label="Enviadas" value={stats.total} />
          <Stat label="Não lidas" value={stats.unread} highlight />
          <Stat label="Via push" value={stats.push} />
          <Stat
            label="Modelos ativos"
            value={`${stats.activeTemplates}/${templates.length}`}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <TabBtn
          active={tab === "enviar"}
          onClick={() => setTab("enviar")}
          icon={Send}
        >
          Enviar
        </TabBtn>
        <TabBtn
          active={tab === "modelos"}
          onClick={() => setTab("modelos")}
          icon={Settings2}
        >
          Modelos ({templates.length})
        </TabBtn>
        <TabBtn
          active={tab === "historico"}
          onClick={() => setTab("historico")}
          icon={History}
        >
          Histórico ({logs.length})
        </TabBtn>
      </div>

      {tab === "enviar" && (
        <div className="grid lg:grid-cols-[1fr_360px] gap-4 animate-fade-in">
          <form
            onSubmit={send}
            className="bg-card rounded-2xl p-5 shadow-card space-y-4"
          >
            <h3 className="font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Notificação manual
            </h3>

            <Field label="Título">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={60}
                className="input"
                placeholder="Ex: Promoção relâmpago 🎀"
              />
              <span className="text-[10px] text-muted-foreground">
                {form.title.length}/60
              </span>
            </Field>

            <Field label="Mensagem">
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={4}
                maxLength={160}
                className="input min-h-[96px] py-2"
                placeholder="Escreva uma mensagem curta e direta..."
              />
              <span className="text-[10px] text-muted-foreground">
                {form.body.length}/160
              </span>
            </Field>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Público
              </span>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {(
                  ["cliente", "afiliada", "admin"] as NotificationAudience[]
                ).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setForm({ ...form, audience: a })}
                    className={`h-14 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all ${form.audience === a ? "border-primary bg-primary/10 text-primary scale-[1.02]" : "border-border bg-background text-muted-foreground hover:bg-muted/40"}`}
                  >
                    <span className="capitalize">{AUDIENCE_LABELS[a]}s</span>
                    <span className="text-[10px] opacity-80">
                      {audienceCount(a)} dest.
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Canais
              </span>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                <ChannelToggle
                  icon={Smartphone}
                  label="Push"
                  active={form.channels.push}
                  onClick={() =>
                    setForm({
                      ...form,
                      channels: { ...form.channels, push: !form.channels.push },
                    })
                  }
                />
                <ChannelToggle
                  icon={Mail}
                  label="E-mail"
                  active={form.channels.email}
                  onClick={() =>
                    setForm({
                      ...form,
                      channels: {
                        ...form.channels,
                        email: !form.channels.email,
                      },
                    })
                  }
                />
                <ChannelToggle
                  icon={MessageSquare}
                  label="In-app"
                  active={form.channels.inapp}
                  onClick={() =>
                    setForm({
                      ...form,
                      channels: {
                        ...form.channels,
                        inapp: !form.channels.inapp,
                      },
                    })
                  }
                />
              </div>
            </div>

            <button className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-transform">
              <Send className="h-4 w-4" /> Enviar agora
            </button>
            <p className="text-[11px] text-muted-foreground text-center">
              Push via OneSignal ativo ✅ — notificações serão entregues aos
              dispositivos cadastrados.
            </p>
          </form>

          {/* Preview */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm">Pré-visualização</h3>
            <NotificationPreview
              title={form.title || "Título da notificação"}
              body={form.body || "A mensagem aparece aqui..."}
            />
          </div>
        </div>
      )}

      {tab === "modelos" && (
        <div className="bg-card rounded-2xl shadow-card p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-bold">Modelos automáticos</h3>
              <p className="text-xs text-muted-foreground">
                Disparados pelos eventos da loja. Use {"{cliente}"},{" "}
                {"{pedido}"}, {"{total}"}, {"{afiliada}"}, {"{comissao}"},{" "}
                {"{produto}"}, {"{estoque}"} como variáveis.
              </p>
            </div>
            <button
              onClick={() => {
                resetTemplates();
                toast.success("Modelos restaurados");
              }}
              className="h-9 px-3 rounded-full bg-muted hover:bg-muted/70 text-xs font-semibold flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Restaurar padrão
            </button>
          </div>

          <ul className="space-y-3">
            {templates.map((t) => (
              <TemplateRow
                key={t.id}
                template={t}
                onChange={(patch) => updateTemplate(t.id, patch)}
              />
            ))}
          </ul>
        </div>
      )}

      {tab === "historico" && (
        <div className="bg-card rounded-2xl shadow-card p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 className="font-bold">Histórico de envios</h3>
            <div className="flex gap-2">
              <button
                onClick={markAllRead}
                className="h-9 px-3 rounded-full bg-muted hover:bg-muted/70 text-xs font-semibold flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" /> Marcar todas como lidas
              </button>
              <button
                onClick={async () => {
                  const { confirmDialog } = await import("@/components/ConfirmDialog");
                  if (await confirmDialog({ title: "Limpar histórico?", description: "Todas as notificações serão removidas.", confirmLabel: "Limpar" })) {
                    clearLogs();
                    toast.success("Histórico limpo");
                  }
                }}
                className="h-9 px-3 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Limpar
              </button>
            </div>
          </div>

          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Nenhuma notificação enviada ainda.
            </p>
          ) : (
            <ul className="space-y-2">
              {logs.map((l) => (
                <li
                  key={l.id}
                  className={`rounded-xl p-3 border transition-colors ${l.read ? "bg-background border-border" : "bg-primary/5 border-primary/30"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{l.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {CATEGORY_LABELS[l.category]}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/40 text-foreground capitalize">
                          {AUDIENCE_LABELS[l.audience]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {l.body}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                        <span>
                          {new Date(l.sentAt).toLocaleString("pt-BR")}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          {l.channels.includes("push") && (
                            <Smartphone className="h-3 w-3" />
                          )}
                          {l.channels.includes("email") && (
                            <Mail className="h-3 w-3" />
                          )}
                          {l.channels.includes("inapp") && (
                            <MessageSquare className="h-3 w-3" />
                          )}
                        </span>
                      </div>
                    </div>
                    {!l.read && (
                      <span className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <style>{`.input{margin-top:4px;width:100%;height:44px;padding:0 14px;border-radius:14px;background:var(--background);border:1px solid var(--border);outline:none;transition:all .2s ease;font-size:14px}.input:focus{border-color:color-mix(in oklab,var(--primary) 60%,transparent);box-shadow:0 0 0 4px color-mix(in oklab,var(--primary) 15%,transparent)}.input::placeholder{color:color-mix(in oklab,var(--muted-foreground) 70%,transparent)}`}</style>
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
    <li className="rounded-xl border border-border bg-background overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <div className="w-10 h-10 rounded-xl bg-accent/40 grid place-items-center text-xl shrink-0">
          {template.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">
              {CATEGORY_LABELS[template.category]}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted capitalize">
              {AUDIENCE_LABELS[template.audience]}
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
