import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { a8 as Download, h as ShoppingBag, v as brl, t as toast } from "./router-CbsSSRKz.js";
import { E } from "./router-CbsSSRKz.js";
import { D as DollarSign } from "./dollar-sign-Dr-4p57q.js";
import { T as TrendingUp } from "./trending-up-D6tJUjsr.js";
import { C as Check } from "./check-Dt2f_uGi.js";
import { R as ResponsiveContainer, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, N as Legend, B as Bar, p as Cell } from "./generateCategoricalChart-Bzk7-bPo.js";
import { A as AreaChart, a as Area } from "./AreaChart-BilQMIKj.js";
import { B as BarChart, P as PieChart, a as Pie } from "./PieChart-CQDtn8Bd.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./adminHelpers.server-BhLg7GIA.js";
import "./client.server-C7GAOqxY.js";
function Summary({
  sales,
  affiliateName,
  commissionLabel
}) {
  const [period, setPeriod] = reactExports.useState("semanal");
  const today = /* @__PURE__ */ new Date();
  today.setHours(23, 59, 59, 999);
  const defaultFrom = /* @__PURE__ */ new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 6);
  defaultFrom.setHours(0, 0, 0, 0);
  const [from, setFrom] = reactExports.useState(
    defaultFrom.toISOString().slice(0, 10)
  );
  const [to, setTo] = reactExports.useState(today.toISOString().slice(0, 10));
  const range = reactExports.useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    if (period === "diario") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { start, end: new Date(now.getTime()) };
    }
    if (period === "semanal") {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }
    if (period === "mensal") {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }
    const s = /* @__PURE__ */ new Date(from + "T00:00:00");
    const e = /* @__PURE__ */ new Date(to + "T23:59:59");
    return { start: s, end: e };
  }, [period, from, to]);
  const filtered = reactExports.useMemo(
    () => sales.filter((s) => {
      const d = new Date(s.createdAt);
      return d >= range.start && d <= range.end && s.status !== "cancelada";
    }),
    [sales, range]
  );
  const totals = reactExports.useMemo(
    () => ({
      count: filtered.length,
      revenue: filtered.reduce((a, s) => a + s.saleValue, 0),
      commission: filtered.reduce((a, s) => a + s.commissionEarned, 0),
      confirmed: filtered.filter((s) => s.status === "confirmada").length,
      pending: filtered.filter((s) => s.status === "pendente").length
    }),
    [filtered]
  );
  const series = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    const dayMs = 24 * 60 * 60 * 1e3;
    const days = Math.max(
      1,
      Math.ceil((range.end.getTime() - range.start.getTime()) / dayMs)
    );
    for (let i = 0; i < days; i++) {
      const d = new Date(range.start.getTime() + i * dayMs);
      const key = d.toISOString().slice(0, 10);
      map.set(key, {
        label: d.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit"
        }),
        vendas: 0,
        comissao: 0,
        faturamento: 0
      });
    }
    filtered.forEach((s) => {
      const key = new Date(s.createdAt).toISOString().slice(0, 10);
      const cur = map.get(key);
      if (cur) {
        cur.vendas += 1;
        cur.comissao += s.commissionEarned;
        cur.faturamento += s.saleValue;
      }
    });
    return Array.from(map.values());
  }, [filtered, range]);
  const statusData = reactExports.useMemo(
    () => [
      {
        name: "Confirmadas",
        value: totals.confirmed,
        color: "hsl(142 70% 45%)"
      },
      { name: "Pendentes", value: totals.pending, color: "hsl(45 90% 55%)" }
    ].filter((x) => x.value > 0),
    [totals]
  );
  const topClients = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    filtered.forEach((s) => {
      const k = s.customerName.trim().toLowerCase();
      const cur = m.get(k) || { name: s.customerName, total: 0 };
      cur.total += s.saleValue;
      m.set(k, cur);
    });
    return Array.from(m.values()).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [filtered]);
  const downloadPdf = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("./jspdf.node.min-LIwg0wSs.js").then((n) => n.j),
      import("./jspdf.plugin.autotable-rNuKHwSj.js")
    ]);
    const doc = new jsPDF();
    const periodLabel = period === "personalizado" ? `${new Date(from).toLocaleDateString("pt-BR")} a ${new Date(to).toLocaleDateString("pt-BR")}` : period.charAt(0).toUpperCase() + period.slice(1);
    doc.setFontSize(18);
    doc.text("Relatório de Vendas — Afiliada", 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`${affiliateName} • ${commissionLabel}`, 14, 26);
    doc.text(`Período: ${periodLabel}`, 14, 32);
    doc.text(`Gerado em: ${(/* @__PURE__ */ new Date()).toLocaleString("pt-BR")}`, 14, 38);
    doc.setTextColor(0);
    doc.setFontSize(13);
    doc.text("Resumo", 14, 50);
    autoTable(doc, {
      startY: 54,
      head: [["Métrica", "Valor"]],
      body: [
        ["Vendas", String(totals.count)],
        ["Faturamento", brl(totals.revenue)],
        ["Comissão", brl(totals.commission)],
        ["Confirmadas", String(totals.confirmed)],
        ["Pendentes", String(totals.pending)]
      ],
      theme: "striped",
      headStyles: { fillColor: [209, 119, 168] }
    });
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.text("Vendas no período", 14, finalY);
    autoTable(doc, {
      startY: finalY + 4,
      head: [["Data", "Cliente", "Produto", "Valor", "Comissão", "Status"]],
      body: filtered.map((s) => [
        new Date(s.createdAt).toLocaleDateString("pt-BR"),
        s.customerName,
        s.productDescription,
        brl(s.saleValue),
        brl(s.commissionEarned),
        s.status
      ]),
      theme: "grid",
      headStyles: { fillColor: [209, 119, 168] },
      styles: { fontSize: 9 }
    });
    doc.save(
      `relatorio-${affiliateName.replace(/\s+/g, "_")}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`
    );
    toast.success("PDF baixado!");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: ["diario", "semanal", "mensal", "personalizado"].map(
          (p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setPeriod(p),
              className: `px-3 py-1.5 rounded-full text-xs font-medium capitalize ${period === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`,
              children: p
            },
            p
          )
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: downloadPdf,
            className: "flex items-center gap-1 text-xs bg-foreground text-background px-3 py-2 rounded-full hover:opacity-90",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
              " Baixar PDF"
            ]
          }
        )
      ] }),
      period === "personalizado" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "De" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "date",
              value: from,
              onChange: (e) => setFrom(e.target.value),
              className: "block mt-1 h-9 px-2 rounded-lg bg-background border border-border"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Até" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "date",
              value: to,
              onChange: (e) => setTo(e.target.value),
              className: "block mt-1 h-9 px-2 rounded-lg bg-background border border-border"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          icon: ShoppingBag,
          label: "Vendas",
          value: String(totals.count),
          color: "text-primary"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          icon: DollarSign,
          label: "Faturamento",
          value: brl(totals.revenue),
          color: "text-success"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          icon: TrendingUp,
          label: "Comissão",
          value: brl(totals.commission),
          color: "text-gold"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          icon: Check,
          label: "Confirmadas",
          value: String(totals.confirmed),
          sub: `${totals.pending} pendentes`,
          color: "text-success"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2 text-sm", children: "Faturamento ao longo do período" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        AreaChart,
        {
          data: series,
          margin: { top: 10, right: 10, left: 0, bottom: 0 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "gFat", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "stop",
                {
                  offset: "5%",
                  stopColor: "hsl(var(--primary))",
                  stopOpacity: 0.5
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "stop",
                {
                  offset: "95%",
                  stopColor: "hsl(var(--primary))",
                  stopOpacity: 0
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CartesianGrid,
              {
                strokeDasharray: "3 3",
                stroke: "hsl(var(--border))"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              XAxis,
              {
                dataKey: "label",
                stroke: "hsl(var(--muted-foreground))",
                fontSize: 11
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              YAxis,
              {
                stroke: "hsl(var(--muted-foreground))",
                fontSize: 11,
                tickFormatter: (v) => `R$${v}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tooltip,
              {
                formatter: (v) => brl(v),
                contentStyle: {
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Area,
              {
                type: "monotone",
                dataKey: "faturamento",
                stroke: "hsl(var(--primary))",
                fill: "url(#gFat)",
                strokeWidth: 2
              }
            )
          ]
        }
      ) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2 text-sm", children: "Vendas e comissão por dia" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          BarChart,
          {
            data: series,
            margin: { top: 10, right: 10, left: 0, bottom: 0 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                CartesianGrid,
                {
                  strokeDasharray: "3 3",
                  stroke: "hsl(var(--border))"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                XAxis,
                {
                  dataKey: "label",
                  stroke: "hsl(var(--muted-foreground))",
                  fontSize: 11
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "hsl(var(--muted-foreground))", fontSize: 11 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Tooltip,
                {
                  contentStyle: {
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: { fontSize: 11 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Bar,
                {
                  dataKey: "vendas",
                  fill: "hsl(var(--primary))",
                  radius: [6, 6, 0, 0]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Bar,
                {
                  dataKey: "comissao",
                  fill: "hsl(45 90% 55%)",
                  radius: [6, 6, 0, 0]
                }
              )
            ]
          }
        ) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2 text-sm", children: "Status das vendas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64", children: statusData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full grid place-items-center text-xs text-muted-foreground", children: "Sem dados no período" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Pie,
            {
              data: statusData,
              dataKey: "value",
              nameKey: "name",
              cx: "50%",
              cy: "50%",
              innerRadius: 50,
              outerRadius: 85,
              paddingAngle: 3,
              children: statusData.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: e.color }, i))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tooltip,
            {
              contentStyle: {
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { wrapperStyle: { fontSize: 11 } })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2 text-sm", children: "Top clientes do período" }),
      topClients.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground py-6 text-center", children: "Sem clientes no período." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: topClients.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "flex items-center justify-between py-2 text-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 h-6 grid place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold", children: i + 1 }),
              c.name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: brl(c.total) })
          ]
        },
        c.name
      )) })
    ] })
  ] });
}
function Card({
  icon: Icon,
  label,
  value,
  sub,
  color
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-2xl p-4 shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-5 w-5 ${color}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold mt-2", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-1", children: sub })
  ] });
}
export {
  E as Clock,
  Summary as default
};
