import { createFileRoute } from "@tanstack/react-router";
import { normalizeOrderStatus, useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { useEffect, useMemo } from "react";
import { brl } from "@/lib/format";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, Package, AlertTriangle, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/admin/bi")({
  component: Page,
});

const STOCK_COLORS = ["#10b981", "#f59e0b", "#ef4444"];

function Page() {
  const { orders, products, customers, sync } = useStore();

  useEffect(() => {
    sync();
  }, [sync]);

  const metrics = useMemo(() => {
    const paidOrders = orders.filter((o) =>
      ["pago", "em_separacao", "saiu_para_entrega", "concluido"].includes(
        normalizeOrderStatus(o.status),
      ),
    );
    const totalRev = paidOrders.reduce((a, o) => a + o.total, 0);
    const avgTicket = paidOrders.length > 0 ? totalRev / paidOrders.length : 0;
    const stockCritical = products.filter(
      (p) => p.stock <= (p.minStock ?? 5),
    ).length;
    const activeCustomers = customers.length;

    return { totalRev, avgTicket, stockCritical, activeCustomers };
  }, [orders, products, customers]);

  const stockHealth = useMemo(() => {
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const lowStock = products.filter(
      (p) => p.stock > 0 && p.stock <= (p.minStock ?? 5),
    ).length;
    const healthy = products.length - outOfStock - lowStock;

    return [
      { name: "Saudável", value: healthy },
      { name: "Baixo", value: lowStock },
      { name: "Esgotado", value: outOfStock },
    ];
  }, [products]);

  const salesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      o.items.forEach((it) => {
        const p = products.find((prod) => prod.id === it.productId);
        const cat = p?.category || "Outros";
        map.set(cat, (map.get(cat) || 0) + it.price * it.quantity);
      });
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [orders, products]);

  return (
    <AdminLayout title="Business Intelligence">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <BIStat
          label="Faturamento Total"
          value={brl(metrics.totalRev)}
          icon={TrendingUp}
          color="text-emerald-500 bg-emerald-500/10"
        />
        <BIStat
          label="Ticket Médio"
          value={brl(metrics.avgTicket)}
          icon={Activity}
          color="text-primary bg-primary/10"
        />
        <BIStat
          label="Estoque Crítico"
          value={metrics.stockCritical}
          icon={AlertTriangle}
          color="text-amber-500 bg-amber-500/10"
        />
        <BIStat
          label="Base de Clientes"
          value={metrics.activeCustomers}
          icon={Package}
          color="text-fuchsia-500 bg-fuchsia-500/10"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <h3 className="font-bold mb-4">Saúde do Estoque</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stockHealth}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stockHealth.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STOCK_COLORS[index % STOCK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {stockHealth.map((entry, index) => (
              <div
                key={entry.name}
                className="flex items-center gap-1.5 text-xs font-medium"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: STOCK_COLORS[index % STOCK_COLORS.length] }}
                />
                <span>
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card">
          <h3 className="font-bold mb-4">Faturamento por Categoria</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={salesByCategory}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function BIStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border/40 hover:shadow-lg transition-all group">
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-2xl font-black tracking-tight mt-3">{value}</div>
      <div className="text-xs text-muted-foreground font-medium mt-1">{label}</div>
    </div>
  );
}
