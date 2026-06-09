import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl } from "@/lib/format";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Crown,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/admin/dashboard")({
  component: Page,
});

function Page() {
  const { orders, customers, products, sync } = useStore();

  useEffect(() => {
    sync();
  }, [sync]);

  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    const yest = new Date();
    yest.setDate(today.getDate() - 1);
    const yestStr = yest.toDateString();

    const valid = orders.filter(
      (o) => !["cancelado", "reembolsado"].includes(normalizeOrderStatus(o.status)),
    );
    const ordersToday = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === todayStr,
    );
    const ordersYest = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === yestStr,
    );
    const revToday = ordersToday.reduce((a, o) => a + o.total, 0);
    const revYest = ordersYest.reduce((a, o) => a + o.total, 0);
    const monthRev = valid.reduce((a, o) => a + o.total, 0);
    const ticket = orders.length ? monthRev / orders.length : 0;

    const deltaPct = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      ordersToday: ordersToday.length,
      ordersDelta: ordersToday.length - ordersYest.length,
      monthRev,
      revDelta: deltaPct(revToday, revYest),
      ticket,
      customers: customers.length,
    };
  }, [orders, customers]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString("pt-BR", { weekday: "short" });
      const total = orders
        .filter(
          (o) => new Date(o.createdAt).toDateString() === d.toDateString(),
        )
        .reduce((a, o) => a + o.total, 0);
      return { day: label.replace(".", ""), total: Number(total.toFixed(2)) };
    });
    return days;
  }, [orders]);

  const weekTotal = useMemo(
    () => chartData.reduce((a, d) => a + d.total, 0),
    [chartData],
  );
  const peakDay = useMemo(
    () => chartData.reduce((max, d) => (d.total > max.total ? d : max), chartData[0] || { day: "-", total: 0 }),
    [chartData],
  );

  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) =>
      o.items.forEach((it) =>
        map.set(it.name, (map.get(it.name) || 0) + it.quantity),
      ),
    );
    return Array.from(map.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders]);

  const topQty = topProducts[0]?.qty ?? 0;
  const barColors = ["var(--primary)", "var(--gold)", "var(--accent)", "#a855f7", "#0ea5e9"];

  const cards = [
    {
      label: "Faturamento total",
      value: brl(stats.monthRev),
      icon: DollarSign,
      tint: "from-emerald-500/20 to-emerald-500/0",
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      delta: stats.revDelta,
      deltaLabel: "vs ontem",
      isPct: true,
    },
    {
      label: "Pedidos hoje",
      value: String(stats.ordersToday),
      icon: ShoppingCart,
      tint: "from-primary/20 to-primary/0",
      iconBg: "bg-primary/15 text-primary",
      delta: stats.ordersDelta,
      deltaLabel: "vs ontem",
      isPct: false,
    },
    {
      label: "Ticket médio",
      value: brl(stats.ticket),
      icon: TrendingUp,
      tint: "from-amber-500/20 to-amber-500/0",
      iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      delta: null as number | null,
      deltaLabel: "média geral",
      isPct: false,
    },
    {
      label: "Clientes",
      value: String(stats.customers),
      icon: Users,
      tint: "from-fuchsia-500/20 to-fuchsia-500/0",
      iconBg: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
      delta: null as number | null,
      deltaLabel: "cadastrados",
      isPct: false,
    },
  ];

  return (
    <AdminLayout title="Dashboard">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {cards.map((c) => {
          const positive = c.delta != null && c.delta >= 0;
          const DeltaIcon = positive ? TrendingUp : TrendingDown;
          return (
            <div
              key={c.label}
              className={`relative overflow-hidden bg-card rounded-2xl p-4 shadow-card border border-border/40 hover:shadow-lg transition-all group`}
            >
              <div
                className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${c.tint} blur-2xl opacity-70 group-hover:opacity-100 transition-opacity`}
              />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                    <c.icon className="h-5 w-5" />
                  </div>
                  {c.delta != null && (
                    <div
                      className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-full ${
                        positive
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      <DeltaIcon className="h-3 w-3" />
                      {c.isPct ? `${positive ? "+" : ""}${c.delta}%` : `${positive ? "+" : ""}${c.delta}`}
                    </div>
                  )}
                </div>
                <div className="text-xl md:text-2xl font-black mt-3 tracking-tight">{c.value}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-[11px] text-muted-foreground font-medium">{c.label}</div>
                  <div className="text-[10px] text-muted-foreground/70">{c.deltaLabel}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="relative overflow-hidden bg-card rounded-2xl p-5 shadow-card border border-border/40">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                    <Activity className="h-4 w-4" />
                  </div>
                  <h2 className="font-bold text-base">Faturamento — 7 dias</h2>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black tracking-tight">{brl(weekTotal)}</span>
                  <span className="text-[11px] text-muted-foreground">total da semana</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Pico</div>
                <div className="text-sm font-bold text-primary mt-0.5">{peakDay?.day}</div>
                <div className="text-[10px] text-muted-foreground">{brl(peakDay?.total || 0)}</div>
              </div>
            </div>
            <div className="h-52 mt-3 -mx-2">
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "3 3" }}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                      boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                    }}
                    formatter={(v: number) => [brl(v), "Faturamento"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#revGradient)"
                    dot={{ fill: "var(--primary)", r: 3, strokeWidth: 2, stroke: "var(--card)" }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-card rounded-2xl p-5 shadow-card border border-border/40">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-gold/10 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gold/15 text-gold flex items-center justify-center">
                  <Crown className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base">Mais vendidos</h2>
                  <p className="text-[10px] text-muted-foreground">Top 5 produtos</p>
                </div>
              </div>
              {topProducts.length > 0 && (
                <div className="flex items-center gap-1 text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  {topProducts.reduce((a, p) => a + p.qty, 0)} un.
                </div>
              )}
            </div>
            {topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Sem vendas ainda</p>
                <p className="text-[11px] text-muted-foreground/70">Os campeões vão aparecer aqui</p>
              </div>
            ) : (
              <div className="space-y-2.5 mt-1">
                {topProducts.map((p, i) => {
                  const pct = topQty ? (p.qty / topQty) * 100 : 0;
                  const color = barColors[i] || "var(--primary)";
                  return (
                    <div key={p.name} className="group/row">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="text-[10px] font-black w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
                            style={{ background: color }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-xs font-semibold truncate">{p.name}</span>
                        </div>
                        <span className="text-xs font-bold tabular-nums ml-2 shrink-0">{p.qty}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 60%, white))`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>


      <div className="mt-4 bg-card rounded-2xl p-4 shadow-card">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <Package className="h-4 w-4" /> Estoque crítico
        </h2>
        <ul className="divide-y divide-border">
          {products
            .filter((p) => p.stock <= (p.minStock ?? 5))
            .slice(0, 8)
            .map((p) => {
              const min = p.minStock ?? 5;
              const out = p.stock <= 0;
              return (
                <li key={p.id} className="flex items-center gap-3 py-2">
                  <img
                    src={p.image}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Mínimo: {min} un.
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${out ? "bg-destructive/15 text-destructive" : "bg-gold/15 text-gold"}`}
                  >
                    {out ? "Esgotado" : `${p.stock} un.`}
                  </span>
                </li>
              );
            })}
          {products.filter((p) => p.stock <= (p.minStock ?? 5)).length ===
            0 && (
            <li className="text-sm text-muted-foreground py-4">Tudo ok!</li>
          )}
        </ul>
      </div>
    </AdminLayout>
  );
}
