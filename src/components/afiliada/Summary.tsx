import { useMemo, useState } from "react";
import { type AffiliateSale } from "@/lib/store";
import { brl } from "@/lib/format";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Check,
  Clock,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Period = "diario" | "semanal" | "mensal" | "personalizado";

export default function Summary({
  sales,
  affiliateName,
  commissionLabel,
}: {
  sales: AffiliateSale[];
  affiliateName: string;
  commissionLabel: string;
}) {
  const [period, setPeriod] = useState<Period>("semanal");
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 6);
  defaultFrom.setHours(0, 0, 0, 0);
  const [from, setFrom] = useState<string>(
    defaultFrom.toISOString().slice(0, 10),
  );
  const [to, setTo] = useState<string>(today.toISOString().slice(0, 10));

  const range = useMemo(() => {
    const now = new Date();
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
    const s = new Date(from + "T00:00:00");
    const e = new Date(to + "T23:59:59");
    return { start: s, end: e };
  }, [period, from, to]);

  const filtered = useMemo(
    () =>
      sales.filter((s) => {
        const d = new Date(s.createdAt);
        return d >= range.start && d <= range.end && s.status !== "cancelada";
      }),
    [sales, range],
  );

  const totals = useMemo(
    () => ({
      count: filtered.length,
      revenue: filtered.reduce((a, s) => a + s.saleValue, 0),
      commission: filtered.reduce((a, s) => a + s.commissionEarned, 0),
      confirmed: filtered.filter((s) => s.status === "confirmada").length,
      pending: filtered.filter((s) => s.status === "pendente").length,
    }),
    [filtered],
  );

  const series = useMemo(() => {
    const map = new Map<
      string,
      { label: string; vendas: number; comissao: number; faturamento: number }
    >();
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.max(
      1,
      Math.ceil((range.end.getTime() - range.start.getTime()) / dayMs),
    );
    for (let i = 0; i < days; i++) {
      const d = new Date(range.start.getTime() + i * dayMs);
      const key = d.toISOString().slice(0, 10);
      map.set(key, {
        label: d.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        vendas: 0,
        comissao: 0,
        faturamento: 0,
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

  const statusData = useMemo(
    () =>
      [
        {
          name: "Confirmadas",
          value: totals.confirmed,
          color: "hsl(142 70% 45%)",
        },
        { name: "Pendentes", value: totals.pending, color: "hsl(45 90% 55%)" },
      ].filter((x) => x.value > 0),
    [totals],
  );

  const topClients = useMemo(() => {
    const m = new Map<string, { name: string; total: number }>();
    filtered.forEach((s) => {
      const k = s.customerName.trim().toLowerCase();
      const cur = m.get(k) || { name: s.customerName, total: 0 };
      cur.total += s.saleValue;
      m.set(k, cur);
    });
    return Array.from(m.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filtered]);

  const downloadPdf = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const doc = new jsPDF();
    const periodLabel =
      period === "personalizado"
        ? `${new Date(from).toLocaleDateString("pt-BR")} a ${new Date(to).toLocaleDateString("pt-BR")}`
        : period.charAt(0).toUpperCase() + period.slice(1);

    doc.setFontSize(18);
    doc.text("Relatório de Vendas — Afiliada", 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`${affiliateName} • ${commissionLabel}`, 14, 26);
    doc.text(`Período: ${periodLabel}`, 14, 32);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 38);

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
        ["Pendentes", String(totals.pending)],
      ],
      theme: "striped",
      headStyles: { fillColor: [209, 119, 168] },
    });

    const finalY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;
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
        s.status,
      ]),
      theme: "grid",
      headStyles: { fillColor: [209, 119, 168] },
      styles: { fontSize: 9 },
    });

    doc.save(
      `relatorio-${affiliateName.replace(/\s+/g, "_")}-${new Date().toISOString().slice(0, 10)}.pdf`,
    );
    toast.success("PDF baixado!");
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {(["diario", "semanal", "mensal", "personalizado"] as Period[]).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${period === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
                >
                  {p}
                </button>
              ),
            )}
          </div>
          <button
            onClick={downloadPdf}
            className="flex items-center gap-1 text-xs bg-foreground text-background px-3 py-2 rounded-full hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" /> Baixar PDF
          </button>
        </div>
        {period === "personalizado" && (
          <div className="flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-border">
            <label className="text-xs">
              <span className="text-muted-foreground">De</span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="block mt-1 h-9 px-2 rounded-lg bg-background border border-border"
              />
            </label>
            <label className="text-xs">
              <span className="text-muted-foreground">Até</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="block mt-1 h-9 px-2 rounded-lg bg-background border border-border"
              />
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card
          icon={ShoppingBag}
          label="Vendas"
          value={String(totals.count)}
          color="text-primary"
        />
        <Card
          icon={DollarSign}
          label="Faturamento"
          value={brl(totals.revenue)}
          color="text-success"
        />
        <Card
          icon={TrendingUp}
          label="Comissão"
          value={brl(totals.commission)}
          color="text-gold"
        />
        <Card
          icon={Check}
          label="Confirmadas"
          value={String(totals.confirmed)}
          sub={`${totals.pending} pendentes`}
          color="text-success"
        />
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-card">
        <h3 className="font-bold mb-2 text-sm">
          Faturamento ao longo do período
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={series}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gFat" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="label"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={(v: number) => `R$${v}`}
              />
              <Tooltip
                formatter={(v: number) => brl(v)}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="faturamento"
                stroke="hsl(var(--primary))"
                fill="url(#gFat)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="font-bold mb-2 text-sm">Vendas e comissão por dia</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={series}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="label"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="vendas"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="comissao"
                  fill="hsl(45 90% 55%)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h3 className="font-bold mb-2 text-sm">Status das vendas</h3>
          <div className="h-64">
            {statusData.length === 0 ? (
              <div className="h-full grid place-items-center text-xs text-muted-foreground">
                Sem dados no período
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {statusData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-card">
        <h3 className="font-bold mb-2 text-sm">Top clientes do período</h3>
        {topClients.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">
            Sem clientes no período.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {topClients.map((c, i) => (
              <li
                key={c.name}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 grid place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {i + 1}
                  </span>
                  {c.name}
                </span>
                <span className="font-semibold">{brl(c.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <Icon className={`h-5 w-5 ${color}`} />
      <div className="text-xl font-bold mt-2">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {sub && (
        <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
      )}
    </div>
  );
}

export { Clock };
