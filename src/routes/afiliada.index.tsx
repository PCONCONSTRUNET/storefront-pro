import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { brl } from "@/lib/format";
import { DollarSign, ShoppingBag, TrendingUp, Plus, LogOut, Home, Check, X, Clock, LayoutDashboard, ListOrdered } from "lucide-react";
import { toast } from "sonner";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/afiliada/")({
  component: Page,
});

type View = "registrar" | "vendas" | "resumo";

function Page() {
  const navigate = useNavigate();
  const currentId = useStore(s => s.currentAffiliateId);
  const affiliates = useStore(s => s.affiliates);
  const sales = useStore(s => s.affiliateSales);
  const registerSale = useStore(s => s.registerAffiliateSale);
  const logout = useStore(s => s.logoutAffiliate);

  const me = useMemo(() => affiliates.find(a => a.id === currentId) || null, [affiliates, currentId]);

  useEffect(() => { if (!currentId) navigate({ to: "/afiliada/login" }); }, [currentId, navigate]);

  const [view, setView] = useState<View>("registrar");

  if (!me) return null;

  const mySales = sales.filter(s => s.affiliateId === me.id);
  const now = new Date();
  const monthSales = mySales.filter(s => {
    const d = new Date(s.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const confirmed = mySales.filter(s => s.status === "confirmada");
  const totalConfirmedCommission = confirmed.reduce((a, s) => a + s.commissionEarned, 0);
  const monthCommission = monthSales.reduce((a, s) => a + (s.status !== "cancelada" ? s.commissionEarned : 0), 0);
  const monthRevenue = monthSales.reduce((a, s) => a + (s.status !== "cancelada" ? s.saleValue : 0), 0);

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
              <Summary
                cards={[
                  { label: "Vendas no mês", value: String(monthSales.length), sub: brl(monthRevenue), icon: ShoppingBag, color: "text-primary" },
                  { label: "Comissão do mês", value: brl(monthCommission), sub: "calculada", icon: TrendingUp, color: "text-gold" },
                  { label: "Comissão confirmada", value: brl(totalConfirmedCommission), sub: `${confirmed.length} vendas`, icon: DollarSign, color: "text-success" },
                ]}
              />
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
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <h2 className="font-bold mb-1">Registrar nova venda</h2>
      <p className="text-xs text-muted-foreground mb-4">Preencha os dados da venda. A comissão é calculada automaticamente.</p>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
        <Field label="Nome da cliente *">
          <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} required className="input" autoFocus />
        </Field>
        <Field label="WhatsApp da cliente">
          <input value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} className="input" />
        </Field>
        <Field label="Produto(s) vendido(s) *" full>
          <input value={form.productDescription} onChange={e => setForm(f => ({ ...f, productDescription: e.target.value }))} required placeholder="Ex: 2 laços rosa + 1 tiara" className="input" />
        </Field>
        <Field label="Valor total da venda (R$) *">
          <input type="text" inputMode="decimal" value={form.saleValue} onChange={e => setForm(f => ({ ...f, saleValue: e.target.value }))} required placeholder="0,00" className="input" />
        </Field>
        <Field label="Observações">
          <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input" />
        </Field>
        <button className="sm:col-span-2 h-11 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-1">
          <Plus className="h-4 w-4" /> Registrar venda
        </button>
      </form>
      <style>{`.input{margin-top:4px;width:100%;height:40px;padding:0 12px;border-radius:10px;background:var(--background);border:1px solid var(--border);outline:none}.input:focus{box-shadow:0 0 0 2px color-mix(in oklab,var(--primary) 50%,transparent)}`}</style>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
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

function Summary({ cards }: { cards: { label: string; value: string; sub: string; icon: React.ElementType; color: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map(c => (
        <div key={c.label} className="bg-card rounded-2xl p-4 shadow-card">
          <c.icon className={`h-5 w-5 ${c.color}`} />
          <div className="text-xl font-bold mt-2">{c.value}</div>
          <div className="text-xs text-muted-foreground">{c.label}</div>
          <div className="text-[11px] text-muted-foreground mt-1">{c.sub}</div>
        </div>
      ))}
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
