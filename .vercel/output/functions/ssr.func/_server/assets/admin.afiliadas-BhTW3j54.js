import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { u as useStore, h as ShoppingBag, v as brl, a as Search, w as Plus, z as Trash2, t as toast, a8 as Download, A as playBeep, E as Clock, X, o as cn } from "./router-CnaK_EO9.js";
import { A as AdminLayout, U as Users, F as FileText } from "./AdminLayout-De_VAja0.js";
import { P as Pencil, d as downloadCSV, a as downloadPDF } from "./export-dIrrUFh0.js";
import { D as DollarSign } from "./dollar-sign-UAWpRRk1.js";
import { E as Eye } from "./eye-B70HPWO6.js";
import { C as Check } from "./check-C5ju_9og.js";
import { P as Phone } from "./phone-Bi9IGKPo.js";
import { M as Mail } from "./mail-DnoNNbCC.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./adminHelpers.server-BhLg7GIA.js";
import "./client.server-C7GAOqxY.js";
import "./layout-dashboard-TB_mnbRk.js";
import "./shopping-cart-B-gXG7d3.js";
import "./settings-QGrcKFnZ.js";
import "./log-out-DGsS6HUi.js";
import "./jspdf.node.min-LIwg0wSs.js";
import "fs";
import "path";
import "./jspdf.plugin.autotable-rNuKHwSj.js";
const empty = {
  id: "",
  name: "",
  email: "",
  password: "",
  phone: "",
  commissionType: "percent",
  commissionValue: 10,
  active: true,
  createdAt: ""
};
function Page() {
  const affiliates = useStore((s) => s.affiliates);
  const sales = useStore((s) => s.affiliateSales);
  const upsert = useStore((s) => s.upsertAffiliate);
  const remove = useStore((s) => s.deleteAffiliate);
  const updateStatus = useStore((s) => s.updateAffiliateSaleStatus);
  const deleteSale = useStore((s) => s.deleteAffiliateSale);
  const sync = useStore((s) => s.sync);
  const [tab, setTab] = reactExports.useState("afiliadas");
  reactExports.useEffect(() => {
    sync();
  }, [sync]);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewing, setViewing] = reactExports.useState(null);
  const [filterAff, setFilterAff] = reactExports.useState("");
  const [filterStatus, setFilterStatus] = reactExports.useState("");
  const [search, setSearch] = reactExports.useState("");
  const [searchAff, setSearchAff] = reactExports.useState("");
  const [registeringSale, setRegisteringSale] = reactExports.useState(false);
  const totals = reactExports.useMemo(() => {
    const totalRevenue = sales.filter((s) => s.status === "confirmada").reduce((a, s) => a + s.saleValue, 0);
    const totalCommission = sales.filter((s) => s.status === "confirmada").reduce((a, s) => a + s.commissionEarned, 0);
    const paidCount = sales.filter((s) => s.status === "confirmada").length;
    return {
      totalRevenue,
      totalCommission,
      count: sales.length,
      paidCount
    };
  }, [sales]);
  const filteredSales = reactExports.useMemo(() => {
    const q = search.trim().toLowerCase();
    return sales.filter((s) => {
      if (filterAff && s.affiliateId !== filterAff) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      if (q) {
        const aff = affiliates.find((a) => a.id === s.affiliateId);
        const hay = `${s.customerName} ${s.productDescription} ${s.customerPhone || ""} ${aff?.name || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sales, filterAff, filterStatus, search, affiliates]);
  const filteredAffiliates = reactExports.useMemo(() => {
    const q = searchAff.trim().toLowerCase();
    if (!q) return affiliates;
    return affiliates.filter((a) => `${a.name} ${a.email} ${a.phone || ""}`.toLowerCase().includes(q));
  }, [affiliates, searchAff]);
  const save = (e) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name || !editing.email || !editing.password) {
      toast.error("Preencha nome, e-mail e senha");
      return;
    }
    const exists = affiliates.find((a2) => a2.email.toLowerCase() === editing.email.toLowerCase() && a2.id !== editing.id);
    if (exists) {
      toast.error("E-mail já cadastrado para outra afiliada");
      return;
    }
    const a = {
      ...editing,
      id: editing.id || `aff_${Date.now()}`,
      createdAt: editing.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      commissionValue: Number(editing.commissionValue) || 0
    };
    upsert(a);
    toast.success("Afiliada salva!");
    setEditing(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminLayout, { title: "Afiliadas", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { icon: Users, label: "Afiliadas", value: String(affiliates.length) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { icon: ShoppingBag, label: "Vendas pagas", value: String(totals.paidCount) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { icon: DollarSign, label: "Faturado (pago)", value: brl(totals.totalRevenue) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { icon: DollarSign, label: "Comissões pagas", value: brl(totals.totalCommission), colorClass: "text-gold" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "afiliadas", onClick: () => setTab("afiliadas"), children: "Afiliadas" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "vendas", onClick: () => setTab("vendas"), children: "Vendas" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabBtn, { active: tab === "retiradas", onClick: () => setTab("retiradas"), children: "Retiradas" })
    ] }),
    tab === "afiliadas" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Cadastro de afiliadas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: searchAff, onChange: (e) => setSearchAff(e.target.value), placeholder: "Buscar por nome, e-mail...", className: "h-9 pl-8 pr-3 rounded-full bg-background border border-border text-sm w-52" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setEditing({
            ...empty
          }), className: "flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-2 rounded-full whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            " Nova"
          ] })
        ] })
      ] }),
      filteredAffiliates.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: affiliates.length === 0 ? "Nenhuma afiliada cadastrada." : "Nenhum resultado para a busca." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-xs text-muted-foreground border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-2", children: "Nome" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-2", children: "E-mail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-2", children: "Comissão" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-2", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-2", children: "Pagas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-2", children: "Comissão paga" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 pr-2" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredAffiliates.map((a) => {
          const paid = sales.filter((s) => s.affiliateId === a.id && s.status === "confirmada");
          const earned = paid.reduce((acc, s) => acc + s.commissionEarned, 0);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => setViewing(a), className: "border-b border-border last:border-0 cursor-pointer hover:bg-muted/40 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-2 font-medium", children: a.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-2 text-muted-foreground", children: a.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-2", children: a.commissionType === "percent" ? `${a.commissionValue}%` : brl(a.commissionValue) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full ${a.active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`, children: a.active ? "Ativa" : "Inativa" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-2", children: paid.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-2 text-gold font-semibold", children: brl(earned) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-2", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewing(a), title: "Ver detalhes", className: "p-1.5 rounded-lg hover:bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditing({
                ...a
              }), title: "Editar", className: "p-1.5 rounded-lg hover:bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
                const {
                  confirmDialog
                } = await import("./AdminLayout-De_VAja0.js").then((n) => n.C);
                if (await confirmDialog({
                  title: "Excluir afiliada?",
                  description: `${a.name} e todas as vendas dela serão removidas.`,
                  confirmLabel: "Excluir"
                })) {
                  remove(a.id);
                  toast.success("Afiliada removida");
                }
              }, title: "Excluir", className: "p-1.5 rounded-lg hover:bg-destructive/10 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
            ] }) })
          ] }, a.id);
        }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground mt-3", children: [
        "Acesso da afiliada:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-muted px-1 rounded", children: "/afiliada/login" })
      ] })
    ] }),
    tab === "vendas" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold", children: [
            "Vendas",
            " ",
            filterStatus === "confirmada" ? "(pagas)" : "registradas"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setRegisteringSale(true), className: "flex items-center gap-1 text-[11px] bg-success text-success-foreground px-3 py-1 rounded-full font-bold hover:opacity-90 transition-opacity", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
            " Registrar Venda"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Buscar cliente, produto, afiliada...", className: "h-9 pl-8 pr-3 rounded-lg bg-background border border-border text-sm w-64" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), className: "h-9 px-2 rounded-lg bg-background border border-border text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Todos status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "confirmada", children: "Pagas" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pendente", children: "Pendentes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cancelada", children: "Canceladas" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: filterAff, onChange: (e) => setFilterAff(e.target.value), className: "h-9 px-2 rounded-lg bg-background border border-border text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Todas as afiliadas" }),
            affiliates.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: a.id, children: a.name }, a.id))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            if (filteredSales.length === 0) {
              toast.error("Sem dados para exportar");
              return;
            }
            const head = ["Data", "Afiliada", "Cliente", "Telefone", "Produto/Descrição", "Valor (R$)", "Comissão (R$)", "Status"];
            const body = filteredSales.map((s) => {
              const aff = affiliates.find((a) => a.id === s.affiliateId);
              return [new Date(s.createdAt).toLocaleDateString("pt-BR"), aff?.name || "—", s.customerName, s.customerPhone || "", s.productDescription, s.saleValue.toFixed(2).replace(".", ","), s.commissionEarned.toFixed(2).replace(".", ","), s.status];
            });
            downloadCSV(`vendas-afiliadas-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, [head, ...body]);
            toast.success("CSV baixado");
          }, className: "h-9 px-3 rounded-lg bg-muted hover:bg-muted/70 text-xs font-semibold flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
            " CSV"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            if (filteredSales.length === 0) {
              toast.error("Sem dados para exportar");
              return;
            }
            const totalRev = filteredSales.reduce((a, s) => a + s.saleValue, 0);
            const totalCom = filteredSales.reduce((a, s) => a + s.commissionEarned, 0);
            downloadPDF({
              filename: `vendas-afiliadas-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`,
              title: "Vendas de Afiliadas",
              subtitle: `${filteredSales.length} venda(s) · Faturamento ${brl(totalRev)} · Comissão ${brl(totalCom)}`,
              head: ["Data", "Afiliada", "Cliente", "Produto", "Valor", "Comissão", "Status"],
              body: filteredSales.map((s) => {
                const aff = affiliates.find((a) => a.id === s.affiliateId);
                return [new Date(s.createdAt).toLocaleDateString("pt-BR"), aff?.name || "—", s.customerName, s.productDescription, brl(s.saleValue), brl(s.commissionEarned), s.status];
              }),
              foot: ["", "", "", "TOTAIS", brl(totalRev), brl(totalCom), ""]
            });
            toast.success("PDF baixado");
          }, className: "h-9 px-3 rounded-lg bg-foreground text-background text-xs font-semibold flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
            " PDF"
          ] })
        ] })
      ] }),
      filteredSales.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "Nenhuma venda registrada." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: filteredSales.map((s) => {
        const aff = affiliates.find((a) => a.id === s.affiliateId);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "py-3 flex flex-wrap items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[220px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold", children: [
              s.customerName,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-normal", children: [
                "por ",
                aff?.name || "—"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.productDescription }),
            s.customerPhone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              "Tel: ",
              s.customerPhone
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: new Date(s.createdAt).toLocaleString("pt-BR") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: brl(s.saleValue) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gold", children: [
              "Comissão ",
              brl(s.commissionEarned)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: s.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 w-full sm:w-auto justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { onClick: () => {
              updateStatus(s.id, "confirmada");
              playBeep();
              toast.success("Venda confirmada");
            }, title: "Confirmar", cls: "text-success hover:bg-success/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { onClick: () => updateStatus(s.id, "pendente"), title: "Pendente", cls: "text-gold hover:bg-gold/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { onClick: () => updateStatus(s.id, "cancelada"), title: "Cancelar", cls: "text-destructive hover:bg-destructive/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { onClick: async () => {
              const {
                confirmDialog
              } = await import("./AdminLayout-De_VAja0.js").then((n) => n.C);
              if (await confirmDialog({
                title: "Excluir esta venda?",
                confirmLabel: "Excluir"
              })) deleteSale(s.id);
            }, title: "Excluir", cls: "text-destructive hover:bg-destructive/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
          ] })
        ] }, s.id);
      }) })
    ] }),
    tab === "retiradas" && /* @__PURE__ */ jsxRuntimeExports.jsx(ConsignmentsPanel, { affiliates }),
    viewing && /* @__PURE__ */ jsxRuntimeExports.jsx(AffiliateDetailsModal, { affiliate: viewing, sales: sales.filter((s) => s.affiliateId === viewing.id), onClose: () => setViewing(null), onEdit: () => {
      setEditing({
        ...viewing
      });
      setViewing(null);
    }, onViewSales: () => {
      setFilterAff(viewing.id);
      setTab("vendas");
      setViewing(null);
    } }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4 animate-overlay-in", onClick: () => setEditing(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, onClick: (e) => e.stopPropagation(), className: "bg-card rounded-3xl p-5 w-full max-w-md space-y-3 shadow-soft animate-modal-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: editing.id ? "Editar afiliada" : "Nova afiliada" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nome *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: editing.name, onChange: (e) => setEditing({
        ...editing,
        name: e.target.value
      }), className: "input", required: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "E-mail *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: editing.email, onChange: (e) => setEditing({
        ...editing,
        email: e.target.value
      }), className: "input", required: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Senha *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: editing.password, onChange: (e) => setEditing({
        ...editing,
        password: e.target.value
      }), className: "input", required: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "WhatsApp", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: editing.phone, onChange: (e) => setEditing({
        ...editing,
        phone: e.target.value
      }), className: "input" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tipo de comissão", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: editing.commissionType, onChange: (e) => setEditing({
          ...editing,
          commissionType: e.target.value
        }), className: "input", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "percent", children: "% sobre a venda" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fixed", children: "Valor fixo (R$)" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: editing.commissionType === "percent" ? "% por venda" : "R$ por venda", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", value: editing.commissionValue, onChange: (e) => setEditing({
          ...editing,
          commissionValue: parseFloat(e.target.value) || 0
        }), className: "input" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: editing.active, onChange: (e) => setEditing({
          ...editing,
          active: e.target.checked
        }) }),
        "Conta ativa"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setEditing(null), className: "flex-1 h-10 rounded-full border border-border", children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-1 h-10 rounded-full gradient-primary text-primary-foreground font-semibold", children: "Salvar" })
      ] })
    ] }) }),
    registeringSale && /* @__PURE__ */ jsxRuntimeExports.jsx(RegisterSaleModal, { onClose: () => setRegisteringSale(false), affiliates }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `.input{margin-top:4px;width:100%;height:40px;padding:0 12px;border-radius:10px;background:var(--background);border:1px solid var(--border);outline:none}` })
  ] });
}
function ConsignmentsPanel({
  affiliates
}) {
  const [rows, setRows] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [filterAff, setFilterAff] = reactExports.useState("");
  const [creating, setCreating] = reactExports.useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const {
        listConsignmentsFn
      } = await import("./router-CnaK_EO9.js").then((n) => n.af);
      const res = await listConsignmentsFn();
      setRows(res?.consignments || []);
    } catch (e) {
      toast.error(e?.message || "Falha ao carregar retiradas");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    load();
  }, []);
  const filtered = reactExports.useMemo(() => filterAff ? rows.filter((r) => r.affiliate_id === filterAff) : rows, [rows, filterAff]);
  const totalQty = filtered.reduce((a, r) => a + (r.quantity || 0), 0);
  const totalValue = filtered.reduce((a, r) => a + Number(r.total_value || 0), 0);
  const handleDelete = async (id) => {
    const {
      confirmDialog
    } = await import("./AdminLayout-De_VAja0.js").then((n) => n.C);
    if (!await confirmDialog({
      title: "Excluir registro de retirada?",
      confirmLabel: "Excluir"
    })) return;
    try {
      const {
        deleteConsignmentFn
      } = await import("./router-CnaK_EO9.js").then((n) => n.af);
      const res = await deleteConsignmentFn({
        data: {
          id
        }
      });
      if (!res.ok) {
        toast.error(res.message || "Falha ao excluir");
        return;
      }
      toast.success("Retirada excluída");
      load();
    } catch (e) {
      toast.error(e?.message || "Falha ao excluir");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl shadow-card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Retiradas de laços (consignação)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Registro de segurança: quem retirou, quantos laços e valor total." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: filterAff, onChange: (e) => setFilterAff(e.target.value), className: "input !h-9 !w-auto text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Todas as afiliadas" }),
          affiliates.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: a.id, children: a.name }, a.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setCreating(true), className: "h-9 px-3 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          " Nova retirada"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-xl p-2 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase text-muted-foreground", children: "Registros" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: filtered.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-xl p-2 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase text-muted-foreground", children: "Total de laços" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: totalQty })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded-xl p-2 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase text-muted-foreground", children: "Valor total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-gold", children: brl(totalValue) })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground py-8", children: "Carregando..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground py-8", children: "Nenhuma retirada registrada ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: filtered.map((r) => {
      const aff = affiliates.find((a) => a.id === r.affiliate_id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "py-2 flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate", children: aff?.name || "Afiliada removida" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
            new Date(r.picked_up_at).toLocaleString("pt-BR"),
            r.notes ? ` • ${r.notes}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold", children: [
            r.quantity,
            " laços"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gold font-semibold", children: brl(Number(r.total_value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(r.id), className: "p-1.5 hover:bg-destructive/10 rounded-full text-destructive", title: "Excluir", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }, r.id);
    }) }),
    creating && /* @__PURE__ */ jsxRuntimeExports.jsx(NewConsignmentModal, { affiliates, onClose: () => setCreating(false), onSaved: () => {
      setCreating(false);
      load();
    } })
  ] });
}
function NewConsignmentModal({
  affiliates,
  onClose,
  onSaved
}) {
  const upsertAffiliate = useStore((s) => s.upsertAffiliate);
  const [creatingNewAff, setCreatingNewAff] = reactExports.useState(false);
  const [newAffData, setNewAffData] = reactExports.useState({
    name: ""
  });
  const [form, setForm] = reactExports.useState({
    affiliate_id: "",
    quantity: 0,
    total_value: 0,
    picked_up_at: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
    // datetime-local
    notes: ""
  });
  const [saving, setSaving] = reactExports.useState(false);
  const submit = async (e) => {
    e.preventDefault();
    let finalAffId = form.affiliate_id;
    if (creatingNewAff) {
      if (!newAffData.name) {
        toast.error("Preencha o nome da nova afiliada");
        return;
      }
      const newId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `aff_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const newAffObj = {
        id: newId,
        name: newAffData.name,
        email: `${newId}@pendente.com`,
        password: "123",
        phone: "",
        commissionType: "percent",
        commissionValue: 10,
        active: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      setSaving(true);
      upsertAffiliate(newAffObj);
      const {
        cloud
      } = await import("./router-CnaK_EO9.js").then((n) => n.ag);
      await cloud.upsertAffiliate(newAffObj);
      finalAffId = newId;
    }
    if (!finalAffId || form.quantity <= 0) {
      toast.error("Preencha afiliada e quantidade de laços.");
      return;
    }
    setSaving(true);
    try {
      const {
        createConsignmentFn
      } = await import("./router-CnaK_EO9.js").then((n) => n.af);
      const res = await createConsignmentFn({
        data: {
          affiliate_id: finalAffId,
          quantity: form.quantity,
          total_value: form.total_value,
          picked_up_at: new Date(form.picked_up_at).toISOString(),
          notes: form.notes || void 0
        }
      });
      if (!res.ok) {
        toast.error(res.message || "Falha ao registrar");
        return;
      }
      toast.success("Retirada registrada!");
      onSaved();
    } catch (e2) {
      toast.error(e2?.message || "Falha ao registrar");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm grid place-items-center p-4 animate-overlay-in", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, onClick: (e) => e.stopPropagation(), className: "bg-card rounded-3xl p-6 w-full max-w-md space-y-4 shadow-soft animate-modal-in border border-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-xl flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5 text-success" }),
        " Registrar Retirada"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "p-1 hover:bg-muted rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Selecione a Afiliada *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: form.affiliate_id, disabled: creatingNewAff, onChange: (e) => setForm({
          ...form,
          affiliate_id: e.target.value
        }), className: "input disabled:opacity-50", required: !creatingNewAff, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Selecione..." }),
          affiliates.filter((a) => a.active).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: a.id, children: a.name }, a.id))
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          setCreatingNewAff(!creatingNewAff);
          if (!creatingNewAff) setForm({
            ...form,
            affiliate_id: ""
          });
        }, className: cn("h-10 px-3 rounded-xl border border-border text-xs font-bold transition-colors whitespace-nowrap", creatingNewAff ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"), children: creatingNewAff ? "Selecionar Existente" : "+ Nova" })
      ] }),
      creatingNewAff && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-3 animate-in slide-in-from-top-2 duration-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-primary uppercase tracking-wider", children: "Nova Afiliada" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nome da Afiliada *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newAffData.name, onChange: (e) => setNewAffData({
          ...newAffData,
          name: e.target.value
        }), className: "input bg-card", placeholder: "Nome completo", required: true }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Qtd. de laços *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "1", value: form.quantity || "", onChange: (e) => setForm({
        ...form,
        quantity: parseInt(e.target.value) || 0
      }), className: "input font-bold", required: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Valor total (R$)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", min: "0", value: form.total_value || "", onChange: (e) => setForm({
        ...form,
        total_value: parseFloat(e.target.value) || 0
      }), className: "input font-bold" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Data e hora da retirada", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "datetime-local", value: form.picked_up_at, onChange: (e) => setForm({
      ...form,
      picked_up_at: e.target.value
    }), className: "input" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Observações", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: form.notes, onChange: (e) => setForm({
      ...form,
      notes: e.target.value
    }), className: "input min-h-[60px]", placeholder: "Ex: 10 laços G rosa, 5 laços P brancos..." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "flex-1 h-10 rounded-full border border-border", children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: saving, className: "flex-1 h-10 rounded-full gradient-primary text-primary-foreground font-semibold disabled:opacity-50", children: saving ? "Salvando..." : "Registrar" })
    ] })
  ] }) });
}
function RegisterSaleModal({
  onClose,
  affiliates
}) {
  const register = useStore((s) => s.registerAffiliateSale);
  const upsertAffiliate = useStore((s) => s.upsertAffiliate);
  const [creatingNewAff, setCreatingNewAff] = reactExports.useState(false);
  const [newAffData, setNewAffData] = reactExports.useState({
    name: "",
    email: "",
    password: "123",
    // Senha padrão inicial
    phone: "",
    commissionType: "percent",
    commissionValue: 10,
    active: true
  });
  const [data, setData] = reactExports.useState({
    affiliateId: "",
    quantity: "",
    // qtd de laços vendidos (opcional)
    saleValue: 0,
    commissionPercent: 25,
    // editável por venda
    status: "confirmada",
    notes: ""
  });
  const selectedAff = affiliates.find((a) => a.id === data.affiliateId);
  reactExports.useEffect(() => {
    if (creatingNewAff) {
      if (newAffData.commissionType === "percent") {
        setData((d) => ({
          ...d,
          commissionPercent: newAffData.commissionValue
        }));
      }
      return;
    }
    if (selectedAff && selectedAff.commissionType === "percent") {
      setData((d) => ({
        ...d,
        commissionPercent: selectedAff.commissionValue
      }));
    }
  }, [data.affiliateId, creatingNewAff, newAffData.commissionType, newAffData.commissionValue, selectedAff]);
  const estimatedCommission = reactExports.useMemo(() => {
    if (!data.saleValue) return 0;
    return data.saleValue * (Number(data.commissionPercent) || 0) / 100;
  }, [data.saleValue, data.commissionPercent]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalAffId = data.affiliateId;
    if (creatingNewAff) {
      if (!newAffData.name || !newAffData.email) {
        toast.error("Preencha os dados da nova afiliada");
        return;
      }
      const newId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `aff_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const newAffObj = {
        ...newAffData,
        id: newId,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      upsertAffiliate(newAffObj);
      const {
        cloud
      } = await import("./router-CnaK_EO9.js").then((n) => n.ag);
      await cloud.upsertAffiliate(newAffObj);
      finalAffId = newId;
    }
    if (!finalAffId || !data.saleValue) {
      toast.error("Selecione a afiliada e informe o valor total da venda");
      return;
    }
    const affName = creatingNewAff ? newAffData.name : selectedAff?.name ?? "Afiliada";
    const qtyLabel = data.quantity ? `${data.quantity} laços` : "Venda consolidada";
    register({
      affiliateId: finalAffId,
      customerName: affName,
      // venda agregada — usamos o nome da afiliada como referência
      customerPhone: "",
      productDescription: qtyLabel,
      saleValue: data.saleValue,
      commissionOverride: Math.round(estimatedCommission * 100) / 100,
      status: data.status,
      notes: data.notes || void 0
    });
    toast.success("Venda registrada e contabilizada!");
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm grid place-items-center p-4 animate-overlay-in", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, onClick: (e) => e.stopPropagation(), className: "bg-card rounded-3xl p-6 w-full max-w-md space-y-4 shadow-soft animate-modal-in border border-border overflow-y-auto max-h-[95vh]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-xl flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5 text-success" }),
        " Registrar Venda Manual"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "p-1 hover:bg-muted rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Selecione a Afiliada *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: data.affiliateId, disabled: creatingNewAff, onChange: (e) => setData({
          ...data,
          affiliateId: e.target.value
        }), className: "input disabled:opacity-50", required: !creatingNewAff, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Selecione..." }),
          affiliates.filter((a) => a.active).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: a.id, children: [
            a.name,
            " (",
            a.commissionType === "percent" ? `${a.commissionValue}%` : brl(a.commissionValue),
            ")"
          ] }, a.id))
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          setCreatingNewAff(!creatingNewAff);
          if (!creatingNewAff) setData({
            ...data,
            affiliateId: ""
          });
        }, className: cn("h-10 px-3 rounded-xl border border-border text-xs font-bold transition-colors whitespace-nowrap", creatingNewAff ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"), children: creatingNewAff ? "Selecionar Existente" : "+ Nova" })
      ] }),
      creatingNewAff && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-3 animate-in slide-in-from-top-2 duration-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-primary uppercase tracking-wider", children: "Dados da Nova Afiliada" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nome da Afiliada *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newAffData.name, onChange: (e) => setNewAffData({
          ...newAffData,
          name: e.target.value
        }), className: "input bg-card", placeholder: "Nome completo", required: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "E-mail *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: newAffData.email, onChange: (e) => setNewAffData({
            ...newAffData,
            email: e.target.value
          }), className: "input bg-card", placeholder: "email@exemplo.com", required: true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "WhatsApp", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newAffData.phone, onChange: (e) => setNewAffData({
            ...newAffData,
            phone: e.target.value
          }), className: "input bg-card", placeholder: "(00) 00000-0000" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tipo de Comissão", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: newAffData.commissionType, onChange: (e) => setNewAffData({
            ...newAffData,
            commissionType: e.target.value
          }), className: "input bg-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "percent", children: "% por venda" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fixed", children: "Valor fixo" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: newAffData.commissionType === "percent" ? "% Valor" : "R$ Valor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", value: newAffData.commissionValue || "", onChange: (e) => setNewAffData({
            ...newAffData,
            commissionValue: parseFloat(e.target.value) || 0
          }), className: "input bg-card" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Valor Total Vendido (R$) *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", min: "0", value: data.saleValue || "", onChange: (e) => setData({
        ...data,
        saleValue: parseFloat(e.target.value) || 0
      }), className: "input font-bold", placeholder: "0,00", required: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Comissão (%) *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", min: "0", max: "100", value: data.commissionPercent || "", onChange: (e) => setData({
        ...data,
        commissionPercent: parseFloat(e.target.value) || 0
      }), className: "input font-bold", placeholder: "Ex: 25", required: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Qtd. de Laços", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "0", value: data.quantity, onChange: (e) => setData({
        ...data,
        quantity: e.target.value
      }), className: "input", placeholder: "Opcional" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: data.status, onChange: (e) => setData({
      ...data,
      status: e.target.value
    }), className: "input", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "confirmada", children: "Paga (Confirmada)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pendente", children: "Pendente" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Observações", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: data.notes, onChange: (e) => setData({
      ...data,
      notes: e.target.value
    }), className: "input min-h-[60px]", placeholder: "Ex: fechamento da semana, devolveu 3 laços, etc." }) }),
    (selectedAff || creatingNewAff) && data.saleValue > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 p-3 rounded-2xl border border-border space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total vendido" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: brl(data.saleValue) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Comissão",
          " ",
          creatingNewAff ? newAffData.name || "afiliada" : selectedAff?.name,
          " ",
          "(",
          data.commissionPercent,
          "%)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-gold", children: brl(estimatedCommission) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border my-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-sm font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Líquido para a Loja" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-success", children: brl(data.saleValue - estimatedCommission) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "flex-1 h-11 rounded-full border border-border font-medium hover:bg-muted transition-colors", children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-1 h-11 rounded-full gradient-primary text-primary-foreground font-bold shadow-soft active:scale-[0.98] transition-transform", children: creatingNewAff ? "Cadastrar e Vender" : "Registrar Venda" })
    ] })
  ] }) });
}
function Card({
  icon: Icon,
  label,
  value,
  colorClass = "text-primary"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-5 w-5 ${colorClass}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold mt-2", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label })
  ] });
}
function TabBtn({
  active,
  onClick,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: `px-4 py-2 rounded-full text-sm font-medium ${active ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`, children });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: label }),
    children
  ] });
}
function ActionBtn({
  onClick,
  title,
  cls,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick, title, className: `p-1.5 rounded-lg ${cls}`, children });
}
function StatusBadge({
  status
}) {
  const map = {
    pendente: {
      label: "Pendente",
      cls: "bg-gold/20 text-gold"
    },
    confirmada: {
      label: "Confirmada",
      cls: "bg-success/20 text-success"
    },
    cancelada: {
      label: "Cancelada",
      cls: "bg-destructive/20 text-destructive"
    }
  };
  const m = map[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${m.cls}`, children: m.label });
}
function AffiliateDetailsModal({
  affiliate,
  sales,
  onClose,
  onEdit,
  onViewSales
}) {
  const paid = sales.filter((s) => s.status === "confirmada");
  const pending = sales.filter((s) => s.status === "pendente");
  const cancelled = sales.filter((s) => s.status === "cancelada");
  const totalPaid = paid.reduce((a, s) => a + s.saleValue, 0);
  const totalCommission = paid.reduce((a, s) => a + s.commissionEarned, 0);
  const recent = [...sales].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4 animate-overlay-in", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: (e) => e.stopPropagation(), className: "bg-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-soft animate-modal-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative gradient-primary text-primary-foreground p-5 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15 blur-3xl pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-gold/30 blur-3xl pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 transition-colors", "aria-label": "Fechar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-white/20 grid place-items-center text-2xl font-bold backdrop-blur", children: affiliate.name.charAt(0).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl leading-tight truncate", children: affiliate.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1 text-[11px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 rounded-full ${affiliate.active ? "bg-success text-success-foreground" : "bg-white/20"}`, children: affiliate.active ? "● Ativa" : "Inativa" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-90", children: affiliate.commissionType === "percent" ? `${affiliate.commissionValue}% por venda` : `${brl(affiliate.commissionValue)} por venda` })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid grid-cols-2 gap-2 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-white/15 backdrop-blur px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase opacity-80", children: "Faturado (pago)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: brl(totalPaid) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-gold text-gold-foreground px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase opacity-80", children: "Comissão paga" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: brl(totalCommission) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 mb-4", children: [
        affiliate.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `https://wa.me/${affiliate.phone.replace(/\D/g, "")}`, target: "_blank", rel: "noreferrer", className: "h-10 rounded-xl bg-success/10 text-success text-xs font-semibold flex items-center justify-center gap-1 hover:bg-success/20 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
          " WhatsApp"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `mailto:${affiliate.email}`, className: "h-10 rounded-xl bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-1 hover:bg-primary/20 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5" }),
          " E-mail"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          const link = `${window.location.origin}/afiliada/login`;
          navigator.clipboard?.writeText(link);
          toast.success("Link de login copiado!");
        }, className: "h-10 rounded-xl bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1 hover:bg-muted/70 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
          " Copiar link"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mb-3", children: [
        "Cadastrada em",
        " ",
        new Date(affiliate.createdAt).toLocaleDateString("pt-BR")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-success/10 rounded-xl p-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-success", children: paid.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Pagas" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gold/10 rounded-xl p-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-gold", children: pending.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Pendentes" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-destructive/10 rounded-xl p-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-destructive", children: cancelled.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Canceladas" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-muted-foreground mb-2", children: "Últimas vendas" }),
        recent.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground py-2", children: "Nenhuma venda ainda." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: recent.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "py-2 flex justify-between items-center text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: s.customerName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground truncate", children: s.productDescription })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right ml-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: brl(s.saleValue) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: s.status })
          ] })
        ] }, s.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onViewSales, className: "flex-1 h-10 rounded-full border border-border text-sm font-semibold hover:bg-muted/40 transition-colors", children: "Ver todas as vendas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onEdit, className: "flex-1 h-10 rounded-full gradient-primary text-primary-foreground text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform", children: "Editar" })
      ] })
    ] })
  ] }) });
}
export {
  Page as component
};
