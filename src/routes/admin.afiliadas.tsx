import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  useStore,
  type Affiliate,
  type AffiliateSaleStatus,
} from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Clock,
  Users,
  DollarSign,
  ShoppingBag,
  Search,
  Eye,
  Mail,
  Phone,
  Download,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV, downloadPDF } from "@/lib/export";
import { playBeep } from "@/lib/sound";
import { getAdminToken } from "@/lib/adminToken";

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
  const affiliates = useStore((s) => s.affiliates);
  const sales = useStore((s) => s.affiliateSales);
  const upsert = useStore((s) => s.upsertAffiliate);
  const remove = useStore((s) => s.deleteAffiliate);
  const updateStatus = useStore((s) => s.updateAffiliateSaleStatus);
  const deleteSale = useStore((s) => s.deleteAffiliateSale);

  const sync = useStore((s) => s.sync);
  const [tab, setTab] = useState<"afiliadas" | "vendas" | "retiradas">(
    "afiliadas",
  );

  useEffect(() => {
    sync();
  }, [sync]);
  const [editing, setEditing] = useState<Affiliate | null>(null);
  const [viewing, setViewing] = useState<Affiliate | null>(null);
  const [filterAff, setFilterAff] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"" | AffiliateSaleStatus>(
    "",
  );
  const [search, setSearch] = useState("");
  const [searchAff, setSearchAff] = useState("");
  const [registeringSale, setRegisteringSale] = useState(false);

  const totals = useMemo(() => {
    const totalRevenue = sales
      .filter((s) => s.status === "confirmada")
      .reduce((a, s) => a + s.saleValue, 0);
    const totalCommission = sales
      .filter((s) => s.status === "confirmada")
      .reduce((a, s) => a + s.commissionEarned, 0);
    const paidCount = sales.filter((s) => s.status === "confirmada").length;
    return { totalRevenue, totalCommission, count: sales.length, paidCount };
  }, [sales]);

  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sales.filter((s) => {
      if (filterAff && s.affiliateId !== filterAff) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      if (q) {
        const aff = affiliates.find((a) => a.id === s.affiliateId);
        const hay =
          `${s.customerName} ${s.productDescription} ${s.customerPhone || ""} ${aff?.name || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sales, filterAff, filterStatus, search, affiliates]);

  const filteredAffiliates = useMemo(() => {
    const q = searchAff.trim().toLowerCase();
    if (!q) return affiliates;
    return affiliates.filter((a) =>
      `${a.name} ${a.email} ${a.phone || ""}`.toLowerCase().includes(q),
    );
  }, [affiliates, searchAff]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name || !editing.email || !editing.password) {
      toast.error("Preencha nome, e-mail e senha");
      return;
    }
    const exists = affiliates.find(
      (a) =>
        a.email.toLowerCase() === editing.email.toLowerCase() &&
        a.id !== editing.id,
    );
    if (exists) {
      toast.error("E-mail já cadastrado para outra afiliada");
      return;
    }
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
        <Card
          icon={Users}
          label="Afiliadas"
          value={String(affiliates.length)}
        />
        <Card
          icon={ShoppingBag}
          label="Vendas pagas"
          value={String(totals.paidCount)}
        />
        <Card
          icon={DollarSign}
          label="Faturado (pago)"
          value={brl(totals.totalRevenue)}
        />
        <Card
          icon={DollarSign}
          label="Comissões pagas"
          value={brl(totals.totalCommission)}
          colorClass="text-gold"
        />
      </div>

      <div className="flex gap-2 mb-3">
        <TabBtn
          active={tab === "afiliadas"}
          onClick={() => setTab("afiliadas")}
        >
          Afiliadas
        </TabBtn>
        <TabBtn active={tab === "vendas"} onClick={() => setTab("vendas")}>
          Vendas
        </TabBtn>
        <TabBtn
          active={tab === "retiradas"}
          onClick={() => setTab("retiradas")}
        >
          Retiradas
        </TabBtn>
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
                  onChange={(e) => setSearchAff(e.target.value)}
                  placeholder="Buscar por nome, e-mail..."
                  className="h-9 pl-8 pr-3 rounded-full bg-background border border-border text-sm w-52"
                />
              </div>
              <button
                onClick={() => setEditing({ ...empty })}
                className="flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-2 rounded-full whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> Nova
              </button>
            </div>
          </div>

          {filteredAffiliates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {affiliates.length === 0
                ? "Nenhuma afiliada cadastrada."
                : "Nenhum resultado para a busca."}
            </p>
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
                  {filteredAffiliates.map((a) => {
                    const paid = sales.filter(
                      (s) =>
                        s.affiliateId === a.id && s.status === "confirmada",
                    );
                    const earned = paid.reduce(
                      (acc, s) => acc + s.commissionEarned,
                      0,
                    );
                    return (
                      <tr
                        key={a.id}
                        onClick={() => setViewing(a)}
                        className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-2 pr-2 font-medium">{a.name}</td>
                        <td className="py-2 pr-2 text-muted-foreground">
                          {a.email}
                        </td>
                        <td className="py-2 pr-2">
                          {a.commissionType === "percent"
                            ? `${a.commissionValue}%`
                            : brl(a.commissionValue)}
                        </td>
                        <td className="py-2 pr-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${a.active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}
                          >
                            {a.active ? "Ativa" : "Inativa"}
                          </span>
                        </td>
                        <td className="py-2 pr-2">{paid.length}</td>
                        <td className="py-2 pr-2 text-gold font-semibold">
                          {brl(earned)}
                        </td>
                        <td
                          className="py-2 pr-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => setViewing(a)}
                              title="Ver detalhes"
                              className="p-1.5 rounded-lg hover:bg-muted"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditing({ ...a })}
                              title="Editar"
                              className="p-1.5 rounded-lg hover:bg-muted"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Excluir ${a.name}? Vendas dela também serão removidas.`,
                                  )
                                ) {
                                  remove(a.id);
                                  toast.success("Afiliada removida");
                                }
                              }}
                              title="Excluir"
                              className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
            Acesso da afiliada:{" "}
            <code className="bg-muted px-1 rounded">/afiliada/login</code>
          </p>
        </div>
      )}

      {tab === "vendas" && (
        <div className="bg-card rounded-2xl shadow-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              <h2 className="font-bold">
                Vendas{" "}
                {filterStatus === "confirmada" ? "(pagas)" : "registradas"}
              </h2>
              <button
                onClick={() => setRegisteringSale(true)}
                className="flex items-center gap-1 text-[11px] bg-success text-success-foreground px-3 py-1 rounded-full font-bold hover:opacity-90 transition-opacity"
              >
                <Plus className="h-3 w-3" /> Registrar Venda
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar cliente, produto, afiliada..."
                  className="h-9 pl-8 pr-3 rounded-lg bg-background border border-border text-sm w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="h-9 px-2 rounded-lg bg-background border border-border text-sm"
              >
                <option value="">Todos status</option>
                <option value="confirmada">Pagas</option>
                <option value="pendente">Pendentes</option>
                <option value="cancelada">Canceladas</option>
              </select>
              <select
                value={filterAff}
                onChange={(e) => setFilterAff(e.target.value)}
                className="h-9 px-2 rounded-lg bg-background border border-border text-sm"
              >
                <option value="">Todas as afiliadas</option>
                {affiliates.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (filteredSales.length === 0) {
                    toast.error("Sem dados para exportar");
                    return;
                  }
                  const head = [
                    "Data",
                    "Afiliada",
                    "Cliente",
                    "Telefone",
                    "Produto/Descrição",
                    "Valor (R$)",
                    "Comissão (R$)",
                    "Status",
                  ];
                  const body = filteredSales.map((s) => {
                    const aff = affiliates.find((a) => a.id === s.affiliateId);
                    return [
                      new Date(s.createdAt).toLocaleDateString("pt-BR"),
                      aff?.name || "—",
                      s.customerName,
                      s.customerPhone || "",
                      s.productDescription,
                      s.saleValue.toFixed(2).replace(".", ","),
                      s.commissionEarned.toFixed(2).replace(".", ","),
                      s.status,
                    ];
                  });
                  downloadCSV(
                    `vendas-afiliadas-${new Date().toISOString().slice(0, 10)}.csv`,
                    [head, ...body],
                  );
                  toast.success("CSV baixado");
                }}
                className="h-9 px-3 rounded-lg bg-muted hover:bg-muted/70 text-xs font-semibold flex items-center gap-1"
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
              <button
                onClick={() => {
                  if (filteredSales.length === 0) {
                    toast.error("Sem dados para exportar");
                    return;
                  }
                  const totalRev = filteredSales.reduce(
                    (a, s) => a + s.saleValue,
                    0,
                  );
                  const totalCom = filteredSales.reduce(
                    (a, s) => a + s.commissionEarned,
                    0,
                  );
                  downloadPDF({
                    filename: `vendas-afiliadas-${new Date().toISOString().slice(0, 10)}.pdf`,
                    title: "Vendas de Afiliadas",
                    subtitle: `${filteredSales.length} venda(s) · Faturamento ${brl(totalRev)} · Comissão ${brl(totalCom)}`,
                    head: [
                      "Data",
                      "Afiliada",
                      "Cliente",
                      "Produto",
                      "Valor",
                      "Comissão",
                      "Status",
                    ],
                    body: filteredSales.map((s) => {
                      const aff = affiliates.find(
                        (a) => a.id === s.affiliateId,
                      );
                      return [
                        new Date(s.createdAt).toLocaleDateString("pt-BR"),
                        aff?.name || "—",
                        s.customerName,
                        s.productDescription,
                        brl(s.saleValue),
                        brl(s.commissionEarned),
                        s.status,
                      ];
                    }),
                    foot: [
                      "",
                      "",
                      "",
                      "TOTAIS",
                      brl(totalRev),
                      brl(totalCom),
                      "",
                    ],
                  });
                  toast.success("PDF baixado");
                }}
                className="h-9 px-3 rounded-lg bg-foreground text-background text-xs font-semibold flex items-center gap-1"
              >
                <FileText className="h-3.5 w-3.5" /> PDF
              </button>
            </div>
          </div>

          {filteredSales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma venda registrada.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filteredSales.map((s) => {
                const aff = affiliates.find((a) => a.id === s.affiliateId);
                return (
                  <li
                    key={s.id}
                    className="py-3 flex flex-wrap items-start gap-3"
                  >
                    <div className="flex-1 min-w-[220px]">
                      <div className="text-sm font-semibold">
                        {s.customerName}{" "}
                        <span className="text-xs text-muted-foreground font-normal">
                          por {aff?.name || "—"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.productDescription}
                      </div>
                      {s.customerPhone && (
                        <div className="text-[11px] text-muted-foreground">
                          Tel: {s.customerPhone}
                        </div>
                      )}
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(s.createdAt).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {brl(s.saleValue)}
                      </div>
                      <div className="text-xs text-gold">
                        Comissão {brl(s.commissionEarned)}
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="flex gap-1 w-full sm:w-auto justify-end">
                      <ActionBtn
                        onClick={() => {
                          updateStatus(s.id, "confirmada");
                          playBeep();
                          toast.success("Venda confirmada");
                        }}
                        title="Confirmar"
                        cls="text-success hover:bg-success/10"
                      >
                        <Check className="h-4 w-4" />
                      </ActionBtn>
                      <ActionBtn
                        onClick={() => updateStatus(s.id, "pendente")}
                        title="Pendente"
                        cls="text-gold hover:bg-gold/10"
                      >
                        <Clock className="h-4 w-4" />
                      </ActionBtn>
                      <ActionBtn
                        onClick={() => updateStatus(s.id, "cancelada")}
                        title="Cancelar"
                        cls="text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </ActionBtn>
                      <ActionBtn
                        onClick={() => {
                          if (confirm("Excluir esta venda?")) deleteSale(s.id);
                        }}
                        title="Excluir"
                        cls="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </ActionBtn>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {tab === "retiradas" && <ConsignmentsPanel affiliates={affiliates} />}



      {viewing && (
        <AffiliateDetailsModal
          affiliate={viewing}
          sales={sales.filter((s) => s.affiliateId === viewing.id)}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing({ ...viewing });
            setViewing(null);
          }}
          onViewSales={() => {
            setFilterAff(viewing.id);
            setTab("vendas");
            setViewing(null);
          }}
        />
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4 animate-overlay-in"
          onClick={() => setEditing(null)}
        >
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-3xl p-5 w-full max-w-md space-y-3 shadow-soft animate-modal-in"
          >
            <h3 className="font-bold text-lg">
              {editing.id ? "Editar afiliada" : "Nova afiliada"}
            </h3>
            <Field label="Nome *">
              <input
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
                className="input"
                required
              />
            </Field>
            <Field label="E-mail *">
              <input
                type="email"
                value={editing.email}
                onChange={(e) =>
                  setEditing({ ...editing, email: e.target.value })
                }
                className="input"
                required
              />
            </Field>
            <Field label="Senha *">
              <input
                value={editing.password}
                onChange={(e) =>
                  setEditing({ ...editing, password: e.target.value })
                }
                className="input"
                required
              />
            </Field>
            <Field label="WhatsApp">
              <input
                value={editing.phone}
                onChange={(e) =>
                  setEditing({ ...editing, phone: e.target.value })
                }
                className="input"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo de comissão">
                <select
                  value={editing.commissionType}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      commissionType: e.target.value as "percent" | "fixed",
                    })
                  }
                  className="input"
                >
                  <option value="percent">% sobre a venda</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>
              </Field>
              <Field
                label={
                  editing.commissionType === "percent"
                    ? "% por venda"
                    : "R$ por venda"
                }
              >
                <input
                  type="number"
                  step="0.01"
                  value={editing.commissionValue}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      commissionValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="input"
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) =>
                  setEditing({ ...editing, active: e.target.checked })
                }
              />
              Conta ativa
            </label>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex-1 h-10 rounded-full border border-border"
              >
                Cancelar
              </button>
              <button className="flex-1 h-10 rounded-full gradient-primary text-primary-foreground font-semibold">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {registeringSale && (
        <RegisterSaleModal
          onClose={() => setRegisteringSale(false)}
          affiliates={affiliates}
        />
      )}

      <style>{`.input{margin-top:4px;width:100%;height:40px;padding:0 12px;border-radius:10px;background:var(--background);border:1px solid var(--border);outline:none}`}</style>
    </AdminLayout>
  );
}

// =====================================================================
// PAINEL DE RETIRADAS (CONSIGNAÇÕES) — registro de quando a afiliada
// retira laços do ateliê (qtd + valor total) — apenas controle interno.
// =====================================================================
type Consignment = {
  id: string;
  affiliate_id: string;
  quantity: number;
  total_value: number;
  picked_up_at: string;
  notes: string | null;
  created_at: string;
};

function ConsignmentsPanel({ affiliates }: { affiliates: Affiliate[] }) {
  const [rows, setRows] = useState<Consignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAff, setFilterAff] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      if (!token) {
        setRows([]);
        return;
      }
      const { listConsignmentsFn } = await import("@/lib/admin.functions");
      const res = await listConsignmentsFn({ data: { token } });
      setRows((res?.consignments || []) as Consignment[]);
    } catch (e: any) {
      toast.error(e?.message || "Falha ao carregar retiradas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filterAff ? rows.filter((r) => r.affiliate_id === filterAff) : rows),
    [rows, filterAff],
  );

  const totalQty = filtered.reduce((a, r) => a + (r.quantity || 0), 0);
  const totalValue = filtered.reduce((a, r) => a + Number(r.total_value || 0), 0);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este registro de retirada?")) return;
    try {
      const token = getAdminToken();
      if (!token) return;
      const { deleteConsignmentFn } = await import("@/lib/admin.functions");
      const res = await deleteConsignmentFn({ data: { token, id } });
      if (!res.ok) {
        toast.error(res.message || "Falha ao excluir");
        return;
      }
      toast.success("Retirada excluída");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Falha ao excluir");
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-4">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <div>
          <h2 className="font-bold">Retiradas de laços (consignação)</h2>
          <p className="text-xs text-muted-foreground">
            Registro de segurança: quem retirou, quantos laços e valor total.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={filterAff}
            onChange={(e) => setFilterAff(e.target.value)}
            className="input !h-9 !w-auto text-xs"
          >
            <option value="">Todas as afiliadas</option>
            {affiliates.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setCreating(true)}
            className="h-9 px-3 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Nova retirada
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-muted/40 rounded-xl p-2 text-center">
          <div className="text-[10px] uppercase text-muted-foreground">
            Registros
          </div>
          <div className="font-bold">{filtered.length}</div>
        </div>
        <div className="bg-muted/40 rounded-xl p-2 text-center">
          <div className="text-[10px] uppercase text-muted-foreground">
            Total de laços
          </div>
          <div className="font-bold">{totalQty}</div>
        </div>
        <div className="bg-muted/40 rounded-xl p-2 text-center">
          <div className="text-[10px] uppercase text-muted-foreground">
            Valor total
          </div>
          <div className="font-bold text-gold">{brl(totalValue)}</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-8">
          Carregando...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">
          Nenhuma retirada registrada ainda.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((r) => {
            const aff = affiliates.find((a) => a.id === r.affiliate_id);
            return (
              <li
                key={r.id}
                className="py-2 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {aff?.name || "Afiliada removida"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(r.picked_up_at).toLocaleString("pt-BR")}
                    {r.notes ? ` • ${r.notes}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{r.quantity} laços</div>
                  <div className="text-xs text-gold font-semibold">
                    {brl(Number(r.total_value))}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 hover:bg-destructive/10 rounded-full text-destructive"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {creating && (
        <NewConsignmentModal
          affiliates={affiliates}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function NewConsignmentModal({
  affiliates,
  onClose,
  onSaved,
}: {
  affiliates: Affiliate[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    affiliate_id: "",
    quantity: 0,
    total_value: 0,
    picked_up_at: new Date().toISOString().slice(0, 16), // datetime-local
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.affiliate_id || form.quantity <= 0 || form.total_value <= 0) {
      toast.error("Preencha afiliada, quantidade e valor.");
      return;
    }
    setSaving(true);
    try {
      const token = getAdminToken();
      if (!token) throw new Error("Sessão admin ausente");
      const { createConsignmentFn } = await import("@/lib/admin.functions");
      const res = await createConsignmentFn({
        data: {
          token,
          affiliate_id: form.affiliate_id,
          quantity: form.quantity,
          total_value: form.total_value,
          picked_up_at: new Date(form.picked_up_at).toISOString(),
          notes: form.notes || undefined,
        },
      });
      if (!res.ok) {
        toast.error(res.message || "Falha ao registrar");
        return;
      }
      toast.success("Retirada registrada!");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Falha ao registrar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm grid place-items-center p-4 animate-overlay-in"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-3xl p-6 w-full max-w-md space-y-4 shadow-soft animate-modal-in border border-border"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <Plus className="h-5 w-5 text-success" /> Registrar Retirada
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Field label="Afiliada *">
          <select
            value={form.affiliate_id}
            onChange={(e) =>
              setForm({ ...form, affiliate_id: e.target.value })
            }
            className="input"
            required
          >
            <option value="">Selecione...</option>
            {affiliates
              .filter((a) => a.active)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Qtd. de laços *">
            <input
              type="number"
              min="1"
              value={form.quantity || ""}
              onChange={(e) =>
                setForm({ ...form, quantity: parseInt(e.target.value) || 0 })
              }
              className="input font-bold"
              required
            />
          </Field>
          <Field label="Valor total (R$) *">
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.total_value || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  total_value: parseFloat(e.target.value) || 0,
                })
              }
              className="input font-bold"
              required
            />
          </Field>
        </div>

        <Field label="Data e hora da retirada">
          <input
            type="datetime-local"
            value={form.picked_up_at}
            onChange={(e) =>
              setForm({ ...form, picked_up_at: e.target.value })
            }
            className="input"
          />
        </Field>

        <Field label="Observações">
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="input min-h-[60px]"
            placeholder="Ex: 10 laços G rosa, 5 laços P brancos..."
          />
        </Field>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-full border border-border"
          >
            Cancelar
          </button>
          <button
            disabled={saving}
            className="flex-1 h-10 rounded-full gradient-primary text-primary-foreground font-semibold disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  );
}



function RegisterSaleModal({
  onClose,
  affiliates,
}: {
  onClose: () => void;
  affiliates: Affiliate[];
}) {
  const register = useStore((s) => s.registerAffiliateSale);
  const upsertAffiliate = useStore((s) => s.upsertAffiliate);

  const [creatingNewAff, setCreatingNewAff] = useState(false);
  const [newAffData, setNewAffData] = useState<
    Omit<Affiliate, "id" | "createdAt">
  >({
    name: "",
    email: "",
    password: "123", // Senha padrão inicial
    phone: "",
    commissionType: "percent",
    commissionValue: 10,
    active: true,
  });

  const [data, setData] = useState({
    affiliateId: "",
    quantity: "" as string, // qtd de laços vendidos (opcional)
    saleValue: 0,
    commissionPercent: 25, // editável por venda
    status: "confirmada" as AffiliateSaleStatus,
    notes: "",
  });

  const selectedAff = affiliates.find((a) => a.id === data.affiliateId);

  // Sempre que trocar de afiliada (ou criar uma nova), prefilla a % com a dela
  useEffect(() => {
    if (creatingNewAff) {
      if (newAffData.commissionType === "percent") {
        setData((d) => ({ ...d, commissionPercent: newAffData.commissionValue }));
      }
      return;
    }
    if (selectedAff && selectedAff.commissionType === "percent") {
      setData((d) => ({ ...d, commissionPercent: selectedAff.commissionValue }));
    }
  }, [data.affiliateId, creatingNewAff, newAffData.commissionType, newAffData.commissionValue, selectedAff]);

  const estimatedCommission = useMemo(() => {
    if (!data.saleValue) return 0;
    return (data.saleValue * (Number(data.commissionPercent) || 0)) / 100;
  }, [data.saleValue, data.commissionPercent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalAffId = data.affiliateId;

    // Se estiver criando uma nova afiliada agora
    if (creatingNewAff) {
      if (!newAffData.name || !newAffData.email) {
        toast.error("Preencha os dados da nova afiliada");
        return;
      }
      const newId = `aff_${Date.now()}`;
      upsertAffiliate({
        ...newAffData,
        id: newId,
        createdAt: new Date().toISOString(),
      });
      finalAffId = newId;
    }

    if (!finalAffId || !data.saleValue) {
      toast.error("Selecione a afiliada e informe o valor total da venda");
      return;
    }

    const affName = creatingNewAff
      ? newAffData.name
      : (selectedAff?.name ?? "Afiliada");
    const qtyLabel = data.quantity ? `${data.quantity} laços` : "Venda consolidada";

    register({
      affiliateId: finalAffId,
      customerName: affName, // venda agregada — usamos o nome da afiliada como referência
      customerPhone: "",
      productDescription: qtyLabel,
      saleValue: data.saleValue,
      commissionOverride: Math.round(estimatedCommission * 100) / 100,
      status: data.status,
      notes: data.notes || undefined,
    });
    toast.success("Venda registrada e contabilizada!");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm grid place-items-center p-4 animate-overlay-in"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-3xl p-6 w-full max-w-md space-y-4 shadow-soft animate-modal-in border border-border overflow-y-auto max-h-[95vh]"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <Plus className="h-5 w-5 text-success" /> Registrar Venda Manual
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label="Selecione a Afiliada *">
                <select
                  value={data.affiliateId}
                  disabled={creatingNewAff}
                  onChange={(e) =>
                    setData({ ...data, affiliateId: e.target.value })
                  }
                  className="input disabled:opacity-50"
                  required={!creatingNewAff}
                >
                  <option value="">Selecione...</option>
                  {affiliates
                    .filter((a) => a.active)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (
                        {a.commissionType === "percent"
                          ? `${a.commissionValue}%`
                          : brl(a.commissionValue)}
                        )
                      </option>
                    ))}
                </select>
              </Field>
            </div>
            <button
              type="button"
              onClick={() => {
                setCreatingNewAff(!creatingNewAff);
                if (!creatingNewAff) setData({ ...data, affiliateId: "" });
              }}
              className={cn(
                "h-10 px-3 rounded-xl border border-border text-xs font-bold transition-colors whitespace-nowrap",
                creatingNewAff
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {creatingNewAff ? "Selecionar Existente" : "+ Nova"}
            </button>
          </div>

          {creatingNewAff && (
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Dados da Nova Afiliada
              </div>
              <Field label="Nome da Afiliada *">
                <input
                  value={newAffData.name}
                  onChange={(e) =>
                    setNewAffData({ ...newAffData, name: e.target.value })
                  }
                  className="input bg-card"
                  placeholder="Nome completo"
                  required
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="E-mail *">
                  <input
                    type="email"
                    value={newAffData.email}
                    onChange={(e) =>
                      setNewAffData({ ...newAffData, email: e.target.value })
                    }
                    className="input bg-card"
                    placeholder="email@exemplo.com"
                    required
                  />
                </Field>
                <Field label="WhatsApp">
                  <input
                    value={newAffData.phone}
                    onChange={(e) =>
                      setNewAffData({ ...newAffData, phone: e.target.value })
                    }
                    className="input bg-card"
                    placeholder="(00) 00000-0000"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Tipo de Comissão">
                  <select
                    value={newAffData.commissionType}
                    onChange={(e) =>
                      setNewAffData({
                        ...newAffData,
                        commissionType: e.target.value as any,
                      })
                    }
                    className="input bg-card"
                  >
                    <option value="percent">% por venda</option>
                    <option value="fixed">Valor fixo</option>
                  </select>
                </Field>
                <Field
                  label={
                    newAffData.commissionType === "percent"
                      ? "% Valor"
                      : "R$ Valor"
                  }
                >
                  <input
                    type="number"
                    step="0.01"
                    value={newAffData.commissionValue || ""}
                    onChange={(e) =>
                      setNewAffData({
                        ...newAffData,
                        commissionValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input bg-card"
                  />
                </Field>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Valor Total Vendido (R$) *">
            <input
              type="number"
              step="0.01"
              min="0"
              value={data.saleValue || ""}
              onChange={(e) =>
                setData({ ...data, saleValue: parseFloat(e.target.value) || 0 })
              }
              className="input font-bold"
              placeholder="0,00"
              required
            />
          </Field>
          <Field label="Comissão (%) *">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={data.commissionPercent || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  commissionPercent: parseFloat(e.target.value) || 0,
                })
              }
              className="input font-bold"
              placeholder="Ex: 25"
              required
            />
          </Field>
          <Field label="Qtd. de Laços">
            <input
              type="number"
              min="0"
              value={data.quantity}
              onChange={(e) => setData({ ...data, quantity: e.target.value })}
              className="input"
              placeholder="Opcional"
            />
          </Field>
        </div>

        <Field label="Status">
          <select
            value={data.status}
            onChange={(e) =>
              setData({ ...data, status: e.target.value as any })
            }
            className="input"
          >
            <option value="confirmada">Paga (Confirmada)</option>
            <option value="pendente">Pendente</option>
          </select>
        </Field>

        <Field label="Observações">
          <textarea
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            className="input min-h-[60px]"
            placeholder="Ex: fechamento da semana, devolveu 3 laços, etc."
          />
        </Field>

        {(selectedAff || creatingNewAff) && data.saleValue > 0 && (
          <div className="bg-muted/40 p-3 rounded-2xl border border-border space-y-1">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Total vendido</span>
              <span className="font-bold">{brl(data.saleValue)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                Comissão{" "}
                {creatingNewAff
                  ? newAffData.name || "afiliada"
                  : selectedAff?.name}{" "}
                ({data.commissionPercent}%)
              </span>
              <span className="font-bold text-gold">
                {brl(estimatedCommission)}
              </span>
            </div>
            <div className="border-t border-border my-1" />
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Líquido para a Loja</span>
              <span className="text-success">
                {brl(data.saleValue - estimatedCommission)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-full border border-border font-medium hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button className="flex-1 h-11 rounded-full gradient-primary text-primary-foreground font-bold shadow-soft active:scale-[0.98] transition-transform">
            {creatingNewAff ? "Cadastrar e Vender" : "Registrar Venda"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  value,
  colorClass = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  colorClass?: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <Icon className={`h-5 w-5 ${colorClass}`} />
      <div className="text-xl font-bold mt-2">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium ${active ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}
    >
      {children}
    </button>
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
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ActionBtn({
  onClick,
  title,
  cls,
  children,
}: {
  onClick: () => void;
  title: string;
  cls: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg ${cls}`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: AffiliateSaleStatus }) {
  const map = {
    pendente: { label: "Pendente", cls: "bg-gold/20 text-gold" },
    confirmada: { label: "Confirmada", cls: "bg-success/20 text-success" },
    cancelada: {
      label: "Cancelada",
      cls: "bg-destructive/20 text-destructive",
    },
  };
  const m = map[status];
  return (
    <span
      className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function AffiliateDetailsModal({
  affiliate,
  sales,
  onClose,
  onEdit,
  onViewSales,
}: {
  affiliate: Affiliate;
  sales: ReturnType<typeof useStore.getState>["affiliateSales"];
  onClose: () => void;
  onEdit: () => void;
  onViewSales: () => void;
}) {
  const paid = sales.filter((s) => s.status === "confirmada");
  const pending = sales.filter((s) => s.status === "pendente");
  const cancelled = sales.filter((s) => s.status === "cancelada");
  const totalPaid = paid.reduce((a, s) => a + s.saleValue, 0);
  const totalCommission = paid.reduce((a, s) => a + s.commissionEarned, 0);
  const recent = [...sales]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4 animate-overlay-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-soft animate-modal-in"
      >
        {/* Hero header */}
        <div className="relative gradient-primary text-primary-foreground p-5 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-gold/30 blur-3xl pointer-events-none" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 grid place-items-center text-2xl font-bold backdrop-blur">
              {affiliate.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-2xl leading-tight truncate">
                {affiliate.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-[11px]">
                <span
                  className={`px-2 py-0.5 rounded-full ${affiliate.active ? "bg-success text-success-foreground" : "bg-white/20"}`}
                >
                  {affiliate.active ? "● Ativa" : "Inativa"}
                </span>
                <span className="opacity-90">
                  {affiliate.commissionType === "percent"
                    ? `${affiliate.commissionValue}% por venda`
                    : `${brl(affiliate.commissionValue)} por venda`}
                </span>
              </div>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-2 mt-4">
            <div className="rounded-xl bg-white/15 backdrop-blur px-3 py-2">
              <div className="text-[10px] uppercase opacity-80">
                Faturado (pago)
              </div>
              <div className="font-bold">{brl(totalPaid)}</div>
            </div>
            <div className="rounded-xl bg-gold text-gold-foreground px-3 py-2">
              <div className="text-[10px] uppercase opacity-80">
                Comissão paga
              </div>
              <div className="font-bold">{brl(totalCommission)}</div>
            </div>
          </div>
        </div>

        <div className="p-5 overflow-y-auto">
          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {affiliate.phone && (
              <a
                href={`https://wa.me/${affiliate.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="h-10 rounded-xl bg-success/10 text-success text-xs font-semibold flex items-center justify-center gap-1 hover:bg-success/20 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" /> WhatsApp
              </a>
            )}
            <a
              href={`mailto:${affiliate.email}`}
              className="h-10 rounded-xl bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-1 hover:bg-primary/20 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" /> E-mail
            </a>
            <button
              onClick={() => {
                const link = `${window.location.origin}/afiliada/login`;
                navigator.clipboard?.writeText(link);
                toast.success("Link de login copiado!");
              }}
              className="h-10 rounded-xl bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1 hover:bg-muted/70 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" /> Copiar link
            </button>
          </div>

          <div className="text-xs text-muted-foreground mb-3">
            Cadastrada em{" "}
            {new Date(affiliate.createdAt).toLocaleDateString("pt-BR")}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-success/10 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-success">
                {paid.length}
              </div>
              <div className="text-[10px] text-muted-foreground">Pagas</div>
            </div>
            <div className="bg-gold/10 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-gold">
                {pending.length}
              </div>
              <div className="text-[10px] text-muted-foreground">Pendentes</div>
            </div>
            <div className="bg-destructive/10 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-destructive">
                {cancelled.length}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Canceladas
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Últimas vendas
            </div>
            {recent.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                Nenhuma venda ainda.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((s) => (
                  <li
                    key={s.id}
                    className="py-2 flex justify-between items-center text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {s.customerName}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {s.productDescription}
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="font-semibold">{brl(s.saleValue)}</div>
                      <StatusBadge status={s.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onViewSales}
              className="flex-1 h-10 rounded-full border border-border text-sm font-semibold hover:bg-muted/40 transition-colors"
            >
              Ver todas as vendas
            </button>
            <button
              onClick={onEdit}
              className="flex-1 h-10 rounded-full gradient-primary text-primary-foreground text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
