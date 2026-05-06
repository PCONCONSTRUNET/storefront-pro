import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, type Affiliate, type AffiliateSaleStatus } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl } from "@/lib/format";
import { Plus, Pencil, Trash2, Check, X, Clock, Users, DollarSign, ShoppingBag, Search, Eye, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/afiliadas")({
  component: Page,
});

const empty: Affiliate = {
  id: "",
  name: "",
  email: "",
  password: "",
  phone: "",
  commissionType: "percent",
  commissionValue: 10,
  active: true,
  createdAt: "",
};

function Page() {
  const affiliates = useStore(s => s.affiliates);
  const sales = useStore(s => s.affiliateSales);
  const upsert = useStore(s => s.upsertAffiliate);
  const remove = useStore(s => s.deleteAffiliate);
  const updateStatus = useStore(s => s.updateAffiliateSaleStatus);
  const deleteSale = useStore(s => s.deleteAffiliateSale);

  const [tab, setTab] = useState<"afiliadas" | "vendas">("afiliadas");
  const [editing, setEditing] = useState<Affiliate | null>(null);
  const [viewing, setViewing] = useState<Affiliate | null>(null);
  const [filterAff, setFilterAff] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"" | AffiliateSaleStatus>("");
  const [search, setSearch] = useState("");
  const [searchAff, setSearchAff] = useState("");

  const totals = useMemo(() => {
    const totalRevenue = sales.filter(s => s.status === "confirmada").reduce((a, s) => a + s.saleValue, 0);
    const totalCommission = sales.filter(s => s.status === "confirmada").reduce((a, s) => a + s.commissionEarned, 0);
    const paidCount = sales.filter(s => s.status === "confirmada").length;
    return { totalRevenue, totalCommission, count: sales.length, paidCount };
  }, [sales]);

  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sales.filter(s => {
      if (filterAff && s.affiliateId !== filterAff) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      if (q) {
        const aff = affiliates.find(a => a.id === s.affiliateId);
        const hay = `${s.customerName} ${s.productDescription} ${s.customerPhone || ""} ${aff?.name || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sales, filterAff, filterStatus, search, affiliates]);

  const filteredAffiliates = useMemo(() => {
    const q = searchAff.trim().toLowerCase();
    if (!q) return affiliates;
    return affiliates.filter(a => `${a.name} ${a.email} ${a.phone || ""}`.toLowerCase().includes(q));
  }, [affiliates, searchAff]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name || !editing.email || !editing.password) {
      toast.error("Preencha nome, e-mail e senha");
      return;
    }
    const exists = affiliates.find(a => a.email.toLowerCase() === editing.email.toLowerCase() && a.id !== editing.id);
    if (exists) { toast.error("E-mail já cadastrado para outra afiliada"); return; }
    const a: Affiliate = {
      ...editing,
      id: editing.id || `aff_${Date.now()}`,
      createdAt: editing.createdAt || new Date().toISOString(),
      commissionValue: Number(editing.commissionValue) || 0,
    };
    upsert(a);
    toast.success("Afiliada salva!");
    setEditing(null);
  };

  return (
    <AdminLayout title="Afiliadas">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card icon={Users} label="Afiliadas" value={String(affiliates.length)} />
        <Card icon={ShoppingBag} label="Vendas pagas" value={String(totals.paidCount)} />
        <Card icon={DollarSign} label="Faturado (pago)" value={brl(totals.totalRevenue)} />
        <Card icon={DollarSign} label="Comissões pagas" value={brl(totals.totalCommission)} colorClass="text-gold" />
      </div>

      <div className="flex gap-2 mb-3">
        <TabBtn active={tab === "afiliadas"} onClick={() => setTab("afiliadas")}>Afiliadas</TabBtn>
        <TabBtn active={tab === "vendas"} onClick={() => setTab("vendas")}>Vendas</TabBtn>
      </div>

      {tab === "afiliadas" && (
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
            <h2 className="font-bold">Cadastro de afiliadas</h2>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchAff}
                  onChange={e => setSearchAff(e.target.value)}
                  placeholder="Buscar por nome, e-mail..."
                  className="h-9 pl-8 pr-3 rounded-full bg-background border border-border text-sm w-52"
                />
              </div>
              <button onClick={() => setEditing({ ...empty })} className="flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-2 rounded-full whitespace-nowrap">
                <Plus className="h-4 w-4" /> Nova
              </button>
            </div>
          </div>

          {filteredAffiliates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{affiliates.length === 0 ? "Nenhuma afiliada cadastrada." : "Nenhum resultado para a busca."}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="py-2 pr-2">Nome</th>
                    <th className="py-2 pr-2">E-mail</th>
                    <th className="py-2 pr-2">Comissão</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2 pr-2">Pagas</th>
                    <th className="py-2 pr-2">Comissão paga</th>
                    <th className="py-2 pr-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAffiliates.map(a => {
                    const paid = sales.filter(s => s.affiliateId === a.id && s.status === "confirmada");
                    const earned = paid.reduce((acc, s) => acc + s.commissionEarned, 0);
                    return (
                      <tr key={a.id} onClick={() => setViewing(a)} className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/40 transition-colors">
                        <td className="py-2 pr-2 font-medium">{a.name}</td>
                        <td className="py-2 pr-2 text-muted-foreground">{a.email}</td>
                        <td className="py-2 pr-2">
                          {a.commissionType === "percent" ? `${a.commissionValue}%` : brl(a.commissionValue)}
                        </td>
                        <td className="py-2 pr-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                            {a.active ? "Ativa" : "Inativa"}
                          </span>
                        </td>
                        <td className="py-2 pr-2">{paid.length}</td>
                        <td className="py-2 pr-2 text-gold font-semibold">{brl(earned)}</td>
                        <td className="py-2 pr-2" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => setViewing(a)} title="Ver detalhes" className="p-1.5 rounded-lg hover:bg-muted"><Eye className="h-4 w-4" /></button>
                            <button onClick={() => setEditing({ ...a })} title="Editar" className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => { if (confirm(`Excluir ${a.name}? Vendas dela também serão removidas.`)) { remove(a.id); toast.success("Afiliada removida"); } }} title="Excluir" className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground mt-3">
            Acesso da afiliada: <code className="bg-muted px-1 rounded">/afiliada/login</code>
          </p>
        </div>
      )}

      {tab === "vendas" && (
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="font-bold">Vendas {filterStatus === "confirmada" ? "(pagas)" : "registradas"}</h2>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar cliente, produto, afiliada..."
                  className="h-9 pl-8 pr-3 rounded-lg bg-background border border-border text-sm w-64"
                />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="h-9 px-2 rounded-lg bg-background border border-border text-sm">
                <option value="">Todos status</option>
                <option value="confirmada">Pagas</option>
                <option value="pendente">Pendentes</option>
                <option value="cancelada">Canceladas</option>
              </select>
              <select value={filterAff} onChange={e => setFilterAff(e.target.value)} className="h-9 px-2 rounded-lg bg-background border border-border text-sm">
                <option value="">Todas as afiliadas</option>
                {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          {filteredSales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma venda registrada.</p>
          ) : (
            <ul className="divide-y divide-border">
              {filteredSales.map(s => {
                const aff = affiliates.find(a => a.id === s.affiliateId);
                return (
                  <li key={s.id} className="py-3 flex flex-wrap items-start gap-3">
                    <div className="flex-1 min-w-[220px]">
                      <div className="text-sm font-semibold">{s.customerName} <span className="text-xs text-muted-foreground font-normal">por {aff?.name || "—"}</span></div>
                      <div className="text-xs text-muted-foreground">{s.productDescription}</div>
                      {s.customerPhone && <div className="text-[11px] text-muted-foreground">Tel: {s.customerPhone}</div>}
                      <div className="text-[11px] text-muted-foreground">{new Date(s.createdAt).toLocaleString("pt-BR")}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{brl(s.saleValue)}</div>
                      <div className="text-xs text-gold">Comissão {brl(s.commissionEarned)}</div>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="flex gap-1 w-full sm:w-auto justify-end">
                      <ActionBtn onClick={() => updateStatus(s.id, "confirmada")} title="Confirmar" cls="text-success hover:bg-success/10"><Check className="h-4 w-4" /></ActionBtn>
                      <ActionBtn onClick={() => updateStatus(s.id, "pendente")} title="Pendente" cls="text-gold hover:bg-gold/10"><Clock className="h-4 w-4" /></ActionBtn>
                      <ActionBtn onClick={() => updateStatus(s.id, "cancelada")} title="Cancelar" cls="text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /></ActionBtn>
                      <ActionBtn onClick={() => { if (confirm("Excluir esta venda?")) deleteSale(s.id); }} title="Excluir" cls="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></ActionBtn>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={e => e.stopPropagation()} className="bg-card rounded-2xl p-5 w-full max-w-md space-y-3">
            <h3 className="font-bold text-lg">{editing.id ? "Editar afiliada" : "Nova afiliada"}</h3>
            <Field label="Nome *"><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="input" required /></Field>
            <Field label="E-mail *"><input type="email" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} className="input" required /></Field>
            <Field label="Senha *"><input value={editing.password} onChange={e => setEditing({ ...editing, password: e.target.value })} className="input" required /></Field>
            <Field label="WhatsApp"><input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="input" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo de comissão">
                <select value={editing.commissionType} onChange={e => setEditing({ ...editing, commissionType: e.target.value as "percent" | "fixed" })} className="input">
                  <option value="percent">% sobre a venda</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>
              </Field>
              <Field label={editing.commissionType === "percent" ? "% por venda" : "R$ por venda"}>
                <input type="number" step="0.01" value={editing.commissionValue} onChange={e => setEditing({ ...editing, commissionValue: parseFloat(e.target.value) || 0 })} className="input" />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} />
              Conta ativa
            </label>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 h-10 rounded-full border border-border">Cancelar</button>
              <button className="flex-1 h-10 rounded-full gradient-primary text-primary-foreground font-semibold">Salvar</button>
            </div>
          </form>
        </div>
      )}

      <style>{`.input{margin-top:4px;width:100%;height:40px;padding:0 12px;border-radius:10px;background:var(--background);border:1px solid var(--border);outline:none}`}</style>
    </AdminLayout>
  );
}

function Card({ icon: Icon, label, value, colorClass = "text-primary" }: { icon: React.ElementType; label: string; value: string; colorClass?: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <Icon className={`h-5 w-5 ${colorClass}`} />
      <div className="text-xl font-bold mt-2">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-medium ${active ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ActionBtn({ onClick, title, cls, children }: { onClick: () => void; title: string; cls: string; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} title={title} className={`p-1.5 rounded-lg ${cls}`}>{children}</button>;
}

function StatusBadge({ status }: { status: AffiliateSaleStatus }) {
  const map = {
    pendente: { label: "Pendente", cls: "bg-gold/20 text-gold" },
    confirmada: { label: "Confirmada", cls: "bg-success/20 text-success" },
    cancelada: { label: "Cancelada", cls: "bg-destructive/20 text-destructive" },
  };
  const m = map[status];
  return <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${m.cls}`}>{m.label}</span>;
}
