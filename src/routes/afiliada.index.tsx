import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useStore, useStoreHydrated } from "@/lib/store";
import { brl } from "@/lib/format";
import { Plus, LogOut, Home, Check, X, Clock, LayoutDashboard, ListOrdered, User, Phone, ShoppingBag, DollarSign, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const Summary = lazy(() => import("@/components/afiliada/Summary"));

export const Route = createFileRoute("/afiliada/")({
  component: Page,
});

type View = "registrar" | "vendas" | "resumo";

function Page() {
  const navigate = useNavigate();
  const hydrated = useStoreHydrated();
  const currentId = useStore(s => s.currentAffiliateId);
  const affiliates = useStore(s => s.affiliates);
  const sales = useStore(s => s.affiliateSales);
  const registerSale = useStore(s => s.registerAffiliateSale);
  const logout = useStore(s => s.logoutAffiliate);

  const me = useMemo(() => affiliates.find(a => a.id === currentId) || null, [affiliates, currentId]);

  useEffect(() => {
    if (!hydrated) return;
    if (!currentId) { navigate({ to: "/afiliada/login" }); return; }
    if (!me) { logout(); navigate({ to: "/afiliada/login" }); }
  }, [hydrated, currentId, me, navigate, logout]);

  const [view, setView] = useState<View>("registrar");

  if (!me) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Carregando...</div>;
  }

  const mySales = sales.filter(s => s.affiliateId === me.id);

  const commissionLabel = me.commissionType === "percent"
    ? `${me.commissionValue}% por venda`
    : `${brl(me.commissionValue)} por venda`;

  const items: { id: View; title: string; icon: React.ElementType }[] = [
    { id: "registrar", title: "Registrar venda", icon: Plus },
    { id: "vendas", title: "Minhas vendas", icon: ListOrdered },
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
                  {items.map(it => (
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
                  <Link to="/"><Home className="h-4 w-4" /><span>Voltar à loja</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => { logout(); navigate({ to: "/" }); }} className="text-destructive">
                  <LogOut className="h-4 w-4" /><span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border bg-card px-2 sticky top-0 z-30">
            <SidebarTrigger />
            <h1 className="ml-2 font-semibold text-sm">
              {items.find(i => i.id === view)?.title}
            </h1>
          </header>
          <main className="flex-1 p-4 max-w-4xl w-full mx-auto">
            {view === "registrar" && (
              <RegisterSale
                affiliateId={me.id}
                onDone={() => { setView("vendas"); }}
                registerSale={registerSale}
              />
            )}
            {view === "vendas" && <SalesList sales={mySales} />}
            {view === "resumo" && (
              <Suspense fallback={<div className="text-sm text-muted-foreground py-10 text-center">Carregando resumo...</div>}>
                <Summary sales={mySales} affiliateName={me.name} commissionLabel={commissionLabel} />
              </Suspense>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function RegisterSale({ affiliateId, onDone, registerSale }: {
  affiliateId: string;
  onDone: () => void;
  registerSale: ReturnType<typeof useStore.getState>["registerAffiliateSale"];
}) {
  const { setOpenMobile } = useSidebar();
  const [form, setForm] = useState({ customerName: "", customerPhone: "", productDescription: "", saleValue: "", notes: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(form.saleValue.replace(",", "."));
    if (!form.customerName || !form.productDescription || !value || value <= 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    const r = registerSale({
      affiliateId,
      customerName: form.customerName,
      customerPhone: form.customerPhone || undefined,
      productDescription: form.productDescription,
      saleValue: value,
      notes: form.notes || undefined,
    });
    if (r) {
      toast.success(`Venda registrada! Comissão: ${brl(r.commissionEarned)}`);
      setForm({ customerName: "", customerPhone: "", productDescription: "", saleValue: "", notes: "" });
      setOpenMobile(false);
      onDone();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-[1.5px] gradient-primary shadow-soft">
      <div className="relative bg-card rounded-[calc(1.5rem-1.5px)] p-5">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-accent/40 blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl gradient-primary grid place-items-center text-primary-foreground shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl text-primary leading-tight">Nova venda</h2>
            <p className="text-[11px] text-muted-foreground">A comissão é calculada automaticamente ✨</p>
          </div>
        </div>

        <form onSubmit={submit} className="relative grid sm:grid-cols-2 gap-3">
          <Field label="Nome da cliente" required icon={User}>
            <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} required className="input" placeholder="Ex: Maria Silva" />
          </Field>
          <Field label="WhatsApp" icon={Phone}>
            <input value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} className="input" placeholder="(11) 99999-9999" />
          </Field>
          <Field label="Produto(s) vendido(s)" required full icon={ShoppingBag}>
            <input value={form.productDescription} onChange={e => setForm(f => ({ ...f, productDescription: e.target.value }))} required placeholder="Ex: 2 laços rosa + 1 tiara" className="input" />
          </Field>
          <Field label="Valor total (R$)" required icon={DollarSign}>
            <input type="text" inputMode="decimal" value={form.saleValue} onChange={e => setForm(f => ({ ...f, saleValue: e.target.value }))} required placeholder="0,00" className="input" />
          </Field>
          <Field label="Observações" icon={MessageCircle}>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input" placeholder="Opcional" />
          </Field>
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

function Field({ label, children, full, required, icon: Icon }: { label: string; children: React.ReactNode; full?: boolean; required?: boolean; icon?: React.ElementType }) {
  return (
    <label className={`block group ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 mt-[2px] h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />}
        {children}
      </div>
    </label>
  );
}

function SalesList({ sales }: { sales: ReturnType<typeof useStore.getState>["affiliateSales"] }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <h2 className="font-bold mb-3">Minhas vendas</h2>
      {sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma venda registrada ainda.</p>
      ) : (
        <ul className="divide-y divide-border">
          {sales.map(s => (
            <li key={s.id} className="py-3 flex items-start gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="text-sm font-semibold">{s.customerName}</div>
                <div className="text-xs text-muted-foreground">{s.productDescription}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{new Date(s.createdAt).toLocaleString("pt-BR")}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{brl(s.saleValue)}</div>
                <div className="text-xs text-success">+ {brl(s.commissionEarned)}</div>
                <StatusBadge status={s.status} />
              </div>
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
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full mt-1 ${m.cls}`}>
      <m.icon className="h-3 w-3" /> {m.label}
    </span>
  );
}
