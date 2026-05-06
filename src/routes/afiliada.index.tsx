import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { brl } from "@/lib/format";
import { DollarSign, ShoppingBag, TrendingUp, Plus, LogOut, Home, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/afiliada/")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const currentId = useStore(s => s.currentAffiliateId);
  const affiliates = useStore(s => s.affiliates);
  const sales = useStore(s => s.affiliateSales);
  const registerSale = useStore(s => s.registerAffiliateSale);
  const logout = useStore(s => s.logoutAffiliate);

  const me = useMemo(() => affiliates.find(a => a.id === currentId) || null, [affiliates, currentId]);

  useEffect(() => { if (!currentId) navigate({ to: "/afiliada/login" }); }, [currentId, navigate]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", productDescription: "", saleValue: "", notes: "" });

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(form.saleValue.replace(",", "."));
    if (!form.customerName || !form.productDescription || !value || value <= 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    const r = registerSale({
      affiliateId: me.id,
      customerName: form.customerName,
      customerPhone: form.customerPhone || undefined,
      productDescription: form.productDescription,
      saleValue: value,
      notes: form.notes || undefined,
    });
    if (r) {
      toast.success(`Venda registrada! Comissão: ${brl(r.commissionEarned)}`);
      setForm({ customerName: "", customerPhone: "", productDescription: "", saleValue: "", notes: "" });
      setShowForm(false);
    }
  };

  const commissionLabel = me.commissionType === "percent"
    ? `${me.commissionValue}% por venda`
    : `${brl(me.commissionValue)} por venda`;

  const cards = [
    { label: "Vendas no mês", value: monthSales.length, sub: brl(monthRevenue), icon: ShoppingBag, color: "text-primary" },
    { label: "Comissão do mês", value: brl(monthCommission), sub: "calculada", icon: TrendingUp, color: "text-gold" },
    { label: "Comissão confirmada", value: brl(totalConfirmedCommission), sub: `${confirmed.length} vendas`, icon: DollarSign, color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <div className="font-display text-primary leading-none">{me.name}</div>
            <div className="text-[11px] text-muted-foreground">{commissionLabel}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"><Home className="h-3.5 w-3.5" /> Loja</Link>
            <button onClick={() => { logout(); navigate({ to: "/" }); }} className="text-xs text-destructive flex items-center gap-1 hover:bg-destructive/10 px-2 py-1 rounded-lg">
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
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

        <div className="bg-card rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Minhas vendas</h2>
            <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-2 rounded-full">
              <Plus className="h-4 w-4" /> {showForm ? "Cancelar" : "Nova venda"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-muted/40 border border-border">
              <label className="block sm:col-span-1">
                <span className="text-xs text-muted-foreground">Nome da cliente *</span>
                <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} required className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50" />
              </label>
              <label className="block sm:col-span-1">
                <span className="text-xs text-muted-foreground">WhatsApp da cliente</span>
                <input value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-muted-foreground">Produto(s) vendido(s) *</span>
                <input value={form.productDescription} onChange={e => setForm(f => ({ ...f, productDescription: e.target.value }))} required placeholder="Ex: 2 laços rosa + 1 tiara" className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50" />
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">Valor total da venda (R$) *</span>
                <input type="text" inputMode="decimal" value={form.saleValue} onChange={e => setForm(f => ({ ...f, saleValue: e.target.value }))} required placeholder="0,00" className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50" />
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">Observações</span>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1 w-full h-10 px-3 rounded-lg bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50" />
              </label>
              <button className="sm:col-span-2 h-11 rounded-full gradient-primary text-primary-foreground font-semibold">Registrar venda</button>
            </form>
          )}

          {mySales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma venda registrada ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {mySales.map(s => (
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
      </main>
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
