import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useStore, useStoreHydrated } from "@/lib/store";
import { brl } from "@/lib/format";
import {
  Plus,
  LogOut,
  Home,
  Check,
  X,
  Clock,
  LayoutDashboard,
  ListOrdered,
  User,
  Phone,
  ShoppingBag,
  DollarSign,
  MessageCircle,
  Sparkles,
  Trash2,
  Instagram,
  Store,
  Globe,
  QrCode,
  CreditCard,
  Banknote,
  TrendingUp,
  Target,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { playBeep } from "@/lib/sound";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const Summary = lazy(() => import("@/components/afiliada/Summary"));
import pixIconSrc from "@/assets/pix-icon.png";

export const Route = createFileRoute("/afiliada/")({
  component: Page,
});

type View = "registrar" | "vendas" | "resumo" | "links";

function Page() {
  const navigate = useNavigate();
  const hydrated = useStoreHydrated();
  const currentId = useStore((s) => s.currentAffiliateId);
  const affiliates = useStore((s) => s.affiliates);
  const sales = useStore((s) => s.affiliateSales);
  const registerSale = useStore((s) => s.registerAffiliateSale);
  const logout = useStore((s) => s.logoutAffiliate);

  const me = useMemo(
    () => affiliates.find((a) => a.id === currentId) || null,
    [affiliates, currentId],
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!currentId) {
      navigate({ to: "/afiliada/login" });
      return;
    }
    if (!me) {
      logout();
      navigate({ to: "/afiliada/login" });
    }
  }, [hydrated, currentId, me, navigate, logout]);

  const [view, setView] = useState<View>("registrar");

  if (!me) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  const mySales = sales.filter((s) => s.affiliateId === me.id);

  const commissionLabel =
    me.commissionType === "percent"
      ? `${me.commissionValue}% por venda`
      : `${brl(me.commissionValue)} por venda`;

  const items: { id: View; title: string; icon: React.ElementType }[] = [
    { id: "registrar", title: "Registrar venda", icon: Plus },
    { id: "vendas", title: "Minhas vendas", icon: ListOrdered },
    { id: "links", title: "Meus links", icon: MessageCircle },
    { id: "resumo", title: "Resumo", icon: LayoutDashboard },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="px-2 py-1">
              <div className="font-display text-primary leading-none truncate">{me.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{commissionLabel}</div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Painel</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((it) => (
                    <SidebarMenuItem key={it.id}>
                      <SidebarMenuButton onClick={() => setView(it.id)} isActive={view === it.id}>
                        <it.icon className="h-4 w-4" />
                        <span>{it.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    <span>Voltar à loja</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    logout();
                    navigate({ to: "/" });
                  }}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border bg-card px-2 sticky top-0 z-30">
            <SidebarTrigger />
            <h1 className="ml-2 font-semibold text-sm">
              {items.find((i) => i.id === view)?.title}
            </h1>
          </header>
          <main className="flex-1 p-4 max-w-4xl w-full mx-auto space-y-4">
            <AffiliateHero name={me.name} commissionLabel={commissionLabel} sales={mySales} />
            {view === "registrar" && (
              <RegisterSale
                affiliateId={me.id}
                onDone={() => {
                  setView("vendas");
                }}
                registerSale={registerSale}
              />
            )}
            {view === "vendas" && <SalesList sales={mySales} />}
            {view === "links" && <LinkGenerator affiliateId={me.id} />}
            {view === "resumo" && (
              <Suspense
                fallback={
                  <div className="text-sm text-muted-foreground py-10 text-center">
                    Carregando resumo...
                  </div>
                }
              >
                <Summary
                  sales={mySales}
                  affiliateName={me.name}
                  commissionLabel={commissionLabel}
                />
              </Suspense>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function RegisterSale({
  affiliateId,
  onDone,
  registerSale,
}: {
  affiliateId: string;
  onDone: () => void;
  registerSale: ReturnType<typeof useStore.getState>["registerAffiliateSale"];
}) {
  const { setOpenMobile } = useSidebar();
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    productDescription: "",
    saleValue: "",
    notes: "",
    channel: "WhatsApp" as "WhatsApp" | "Instagram" | "Presencial" | "Outro",
    payment: "Pix" as "Pix" | "Cartão" | "Dinheiro" | "Outro",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(form.saleValue.replace(",", "."));
    if (!form.customerName || !form.productDescription || !value || value <= 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    const meta = `[${form.channel} · ${form.payment}]`;
    const fullNotes = form.notes ? `${meta} ${form.notes}` : meta;
    const r = registerSale({
      affiliateId,
      customerName: form.customerName,
      customerPhone: form.customerPhone || undefined,
      productDescription: form.productDescription,
      saleValue: value,
      notes: fullNotes,
    });
    if (r) {
      playBeep();
      toast.success(`Venda registrada! Comissão: ${brl(r.commissionEarned)}`);
      setForm({
        customerName: "",
        customerPhone: "",
        productDescription: "",
        saleValue: "",
        notes: "",
        channel: form.channel,
        payment: form.payment,
      });
      setOpenMobile(false);
      onDone();
    }
  };

  const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
  );

  const channels: { id: typeof form.channel; icon: React.ElementType }[] = [
    { id: "WhatsApp", icon: WhatsAppIcon },
    { id: "Instagram", icon: Instagram },
    { id: "Presencial", icon: Store },
    { id: "Outro", icon: Globe },
  ];
  const PixIcon = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={pixIconSrc} alt="Pix" {...props} />
  );

  const payments: { id: typeof form.payment; icon: React.ElementType }[] = [
    { id: "Pix", icon: PixIcon },
    { id: "Cartão", icon: CreditCard },
    { id: "Dinheiro", icon: Banknote },
    { id: "Outro", icon: DollarSign },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl p-[1.5px] gradient-primary shadow-soft animate-fade-in">
      <div className="relative bg-card rounded-[calc(1.5rem-1.5px)] p-5">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-accent/40 blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl gradient-primary grid place-items-center text-primary-foreground shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl text-primary leading-tight">Nova venda</h2>
            <p className="text-[11px] text-muted-foreground">
              A comissão é calculada automaticamente ✨
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="relative grid sm:grid-cols-2 gap-3">
          <Field label="Nome da cliente" required icon={User}>
            <input
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              required
              className="input"
              placeholder="Ex: Maria Silva"
            />
          </Field>
          <Field label="WhatsApp" icon={Phone}>
            <input
              value={form.customerPhone}
              onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
              className="input"
              placeholder="(11) 99999-9999"
            />
          </Field>
          <Field label="Produto(s) vendido(s)" required full icon={ShoppingBag}>
            <input
              value={form.productDescription}
              onChange={(e) => setForm((f) => ({ ...f, productDescription: e.target.value }))}
              required
              placeholder="Ex: 2 laços rosa + 1 tiara"
              className="input"
            />
          </Field>
          <Field label="Valor total (R$)" required icon={DollarSign}>
            <input
              type="text"
              inputMode="decimal"
              value={form.saleValue}
              onChange={(e) => setForm((f) => ({ ...f, saleValue: e.target.value }))}
              required
              placeholder="0,00"
              className="input"
            />
          </Field>
          <Field label="Observações" icon={MessageCircle}>
            <input
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="input"
              placeholder="Opcional"
            />
          </Field>

          <div className="sm:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Canal de venda
            </span>
            <div className="grid grid-cols-4 gap-2 mt-1.5">
              {channels.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, channel: c.id }))}
                  className={`h-12 rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-all ${form.channel === c.id ? "border-primary bg-primary/10 text-primary scale-[1.02]" : "border-border bg-background text-muted-foreground hover:bg-muted/40"}`}
                >
                  <c.icon className="h-4 w-4" />
                  {c.id}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Forma de pagamento
            </span>
            <div className="grid grid-cols-4 gap-2 mt-1.5">
              {payments.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, payment: p.id }))}
                  className={`h-12 rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-all ${form.payment === p.id ? "border-primary bg-primary/10 text-primary scale-[1.02]" : "border-border bg-background text-muted-foreground hover:bg-muted/40"}`}
                >
                  <p.icon className="h-4 w-4" />
                  {p.id}
                </button>
              ))}
            </div>
          </div>

          <button className="sm:col-span-2 group relative h-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-transform overflow-hidden">
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <Plus className="h-5 w-5" /> Registrar venda
          </button>
        </form>
        <style>{`.input{margin-top:4px;width:100%;height:44px;padding:0 14px 0 38px;border-radius:14px;background:var(--background);border:1px solid var(--border);outline:none;transition:all .2s ease;font-size:14px}.input:focus{border-color:color-mix(in oklab,var(--primary) 60%,transparent);box-shadow:0 0 0 4px color-mix(in oklab,var(--primary) 15%,transparent);background:var(--card)}.input::placeholder{color:color-mix(in oklab,var(--muted-foreground) 70%,transparent)}`}</style>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
  required,
  icon: Icon,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  required?: boolean;
  icon?: React.ElementType;
}) {
  return (
    <label className={`block group ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 mt-[2px] h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
        )}
        {children}
      </div>
    </label>
  );
}

function SalesList({ sales }: { sales: ReturnType<typeof useStore.getState>["affiliateSales"] }) {
  const deleteSale = useStore((s) => s.deleteAffiliateSale);
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Excluir a venda de "${name}"? Esta ação não pode ser desfeita.`)) {
      deleteSale(id);
      toast.success("Venda excluída");
    }
  };
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <h2 className="font-bold mb-3">Minhas vendas</h2>
      {sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhuma venda registrada ainda.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {sales.map((s) => (
            <li key={s.id} className="py-3 flex items-start gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="text-sm font-semibold">{s.customerName}</div>
                <div className="text-xs text-muted-foreground">{s.productDescription}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {new Date(s.createdAt).toLocaleString("pt-BR")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{brl(s.saleValue)}</div>
                <div className="text-xs text-success">+ {brl(s.commissionEarned)}</div>
                <StatusBadge status={s.status} />
              </div>
              <button
                onClick={() => handleDelete(s.id, s.customerName)}
                className="h-8 w-8 grid place-items-center rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Excluir venda"
                title="Excluir venda"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "pendente" | "confirmada" | "cancelada" }) {
  const map = {
    pendente: { label: "Pendente", icon: Clock, cls: "bg-gold/20 text-gold" },
    confirmada: { label: "Confirmada", icon: Check, cls: "bg-success/20 text-success" },
    cancelada: { label: "Cancelada", icon: X, cls: "bg-destructive/20 text-destructive" },
  } as const;
  const m = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full mt-1 ${m.cls}`}
    >
      <m.icon className="h-3 w-3" /> {m.label}
    </span>
  );
}

function AffiliateHero({
  name,
  commissionLabel,
  sales,
}: {
  name: string;
  commissionLabel: string;
  sales: ReturnType<typeof useStore.getState>["affiliateSales"];
}) {
  const stats = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const monthKey = new Date().toISOString().slice(0, 7);
    const today = sales.filter(
      (s) => s.createdAt.slice(0, 10) === todayKey && s.status !== "cancelada",
    );
    const month = sales.filter(
      (s) => s.createdAt.slice(0, 7) === monthKey && s.status !== "cancelada",
    );
    const paid = sales.filter((s) => s.status === "confirmada");
    return {
      todayCount: today.length,
      todayCommission: today.reduce((a, s) => a + s.commissionEarned, 0),
      monthRevenue: month.reduce((a, s) => a + s.saleValue, 0),
      monthCommission: month.reduce((a, s) => a + s.commissionEarned, 0),
      lifetimeCommission: paid.reduce((a, s) => a + s.commissionEarned, 0),
    };
  }, [sales]);

  const monthCount = sales.filter(
    (s) =>
      s.createdAt.slice(0, 7) === new Date().toISOString().slice(0, 7) && s.status !== "cancelada",
  ).length;
  const goal = Math.max(10, Math.ceil(Math.max(monthCount, 1) / 10) * 10);
  const progress = Math.min(100, Math.round((monthCount / goal) * 100));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="relative overflow-hidden rounded-3xl gradient-primary text-primary-foreground shadow-soft animate-fade-in">
      <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-gold/30 blur-3xl pointer-events-none" />
      <div className="relative p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider opacity-80">
              {greeting}, princesa ✨
            </div>
            <h2 className="font-display text-2xl md:text-3xl leading-tight">{name}</h2>
            <div className="text-xs opacity-90 mt-0.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> {commissionLabel}
            </div>
          </div>
          <div className="hidden sm:grid w-14 h-14 rounded-2xl bg-white/15 backdrop-blur place-items-center">
            <Trophy className="h-6 w-6 text-gold" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5">
          <HeroStat icon={ShoppingBag} label="Hoje" value={String(stats.todayCount)} sub="vendas" />
          <HeroStat
            icon={DollarSign}
            label="Comissão hoje"
            value={brl(stats.todayCommission)}
            sub=""
            highlight
          />
          <HeroStat
            icon={TrendingUp}
            label="No mês"
            value={brl(stats.monthRevenue)}
            sub="faturado"
          />
          <HeroStat
            icon={Trophy}
            label="Comissão total"
            value={brl(stats.lifetimeCommission)}
            sub="acumulada"
          />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] opacity-90 mb-1.5">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" /> Meta do mês: {monthCount}/{goal} vendas
            </span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-gold transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-3 py-2.5 backdrop-blur ${highlight ? "bg-gold text-gold-foreground" : "bg-white/15"}`}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide opacity-90">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="font-bold text-base mt-0.5 leading-tight">{value}</div>
      {sub && <div className="text-[10px] opacity-80">{sub}</div>}
    </div>
  );
}
function LinkGenerator({ affiliateId }: { affiliateId: string }) {
  const products = useStore((s) => s.products);
  const [selectedProduct, setSelectedProduct] = useState("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const mainLink = `${baseUrl}/?ref=${affiliateId}`;

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success("Link copiado!");
  };

  const productLink = selectedProduct ? `${baseUrl}/produto/${selectedProduct}?ref=${affiliateId}` : "";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h2 className="font-display text-xl text-primary mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5" /> Link da Loja
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Divulgue o link geral da loja. Qualquer compra feita através dele será atribuída a você.
        </p>
        <div className="flex gap-2">
          <input readOnly value={mainLink} className="flex-1 h-11 px-3 rounded-xl bg-muted text-xs border border-border" />
          <button onClick={() => copy(mainLink)} className="h-11 px-4 rounded-xl gradient-primary text-white font-semibold">
            Copiar
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 shadow-card">
        <h2 className="font-display text-xl text-primary mb-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" /> Deep Links (Produtos)
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Gere um link direto para um produto específico para aumentar suas conversões.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Selecione o produto
            </label>
            <select 
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full h-11 mt-1 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Selecione um produto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {productLink && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 animate-scale-in">
              <div className="flex gap-2 items-center">
                <input readOnly value={productLink} className="flex-1 h-10 px-3 rounded-lg bg-white/50 text-xs border border-primary/10" />
                <button onClick={() => copy(productLink)} className="h-10 px-4 rounded-lg bg-primary text-white text-xs font-bold">
                  Copiar Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
