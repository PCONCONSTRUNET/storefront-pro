import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl } from "@/lib/format";
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, Bell } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
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
    const today = new Date().toDateString();
    const ordersToday = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
    const monthRev = orders
      .filter((o) => o.status !== "cancelado")
      .reduce((a, o) => a + o.total, 0);
    const ticket = orders.length ? monthRev / orders.length : 0;
    return { ordersToday: ordersToday.length, monthRev, ticket, customers: customers.length };
  }, [orders, customers]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString("pt-BR", { weekday: "short" });
      const total = orders
        .filter((o) => new Date(o.createdAt).toDateString() === d.toDateString())
        .reduce((a, o) => a + o.total, 0);
      return { day: label, total: Math.round(total) };
    });
    return days;
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) =>
      o.items.forEach((it) => map.set(it.name, (map.get(it.name) || 0) + it.quantity)),
    );
    return Array.from(map.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders]);

  const cards = [
    { label: "Faturamento", value: brl(stats.monthRev), icon: DollarSign, color: "text-success" },
    { label: "Pedidos hoje", value: stats.ordersToday, icon: ShoppingCart, color: "text-primary" },
    { label: "Ticket médio", value: brl(stats.ticket), icon: TrendingUp, color: "text-gold" },
    { label: "Clientes", value: stats.customers, icon: Users, color: "text-primary" },
  ];

  const [osId, setOsId] = useState<string>("Aguardando...");
  const [osActive, setOsActive] = useState<boolean>(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const check = () => {
      const OS = (window as any).OneSignal;
      if (OS?.User?.PushSubscription) {
        setOsId(OS.User.PushSubscription.id || "Não registrado");
        setOsActive(OS.User.PushSubscription.optedIn);
      }
    };
    const interval = setInterval(check, 3000);
    check();
    return () => clearInterval(interval);
  }, []);

  const forceSync = async () => {
    setSyncing(true);
    try {
      const OS = (window as any).OneSignal;
      const currentCustomerId = useStore.getState().currentCustomerId;
      if (!OS || !currentCustomerId) return;

      console.log("[Push] Forçando sincronismo...");
      await OS.logout();
      await new Promise(r => setTimeout(r, 1000));
      await OS.login(currentCustomerId);
      
      if (OS.User?.PushSubscription) {
        await OS.User.PushSubscription.optIn();
      }
      
      OS.User.addTag("role", "admin");
      
      import("sonner").then(({ toast }) => toast.success("Dispositivo sincronizado!"));
    } catch (err) {
      console.error("[Push-Sync]", err);
      import("sonner").then(({ toast }) => toast.error("Falha ao sincronizar."));
    } finally {
      setSyncing(false);
    }
  };

  const testNotification = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const currentCustomerId = useStore.getState().currentCustomerId;
      const OS = (window as any).OneSignal;
      const subId = OS?.User?.PushSubscription?.id;
      
      const { data, error } = await supabase.functions.invoke("send-push", {
        body: {
          title: "Teste de Push Direto 🚀",
          message: `Enviado para ${subId ? "este aparelho" : "seu usuário"}. Hora: ${new Date().toLocaleTimeString()}`,
          externalUserIds: currentCustomerId ? [currentCustomerId] : undefined,
          subscriptionIds: subId ? [subId] : undefined,
        },
      });

      if (error) throw error;
      import("sonner").then(({ toast }) => toast.success(`Push enviado! (ID: ${subId?.slice(0,8)}...)`));
    } catch (err) {
      console.error("[push-test]", err);
      import("sonner").then(({ toast }) => toast.error(`Erro no teste: ${err.message || "Verifique o console"}`));
    }
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Barra de Diagnóstico Push - Reforçada para Mobile */}
      <div className="mb-6 bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-2xl border-2 border-indigo-500/20 shadow-lg relative z-[999] pointer-events-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-widest flex items-center gap-2">
            <Bell className="h-3 w-3" /> Status do Push
          </div>
          <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${osActive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
            {osActive ? "CONECTADO" : "DESCONECTADO"}
          </div>
        </div>
        
        <div className="bg-white/50 dark:bg-black/20 p-2 rounded-xl mb-4 font-mono text-[10px] break-all border border-black/5 dark:border-white/5">
          <span className="opacity-50 block mb-0.5 uppercase text-[8px]">Subscription ID</span>
          {osId}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              window.alert("Sincronizando... aguarde o aviso de sucesso.");
              forceSync();
            }}
            disabled={syncing}
            className="h-11 bg-white dark:bg-white/10 text-foreground rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 border border-border"
          >
            {syncing ? "..." : "Sincronizar"}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              testNotification();
            }}
            className="h-11 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp className="h-4 w-4" /> Testar Push
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between">
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div className="text-xl md:text-2xl font-bold mt-2">{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h2 className="font-bold mb-3">Faturamento — últimos 7 dias</h2>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ fill: "var(--primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h2 className="font-bold mb-3">Mais vendidos</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sem vendas ainda.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={topProducts} layout="vertical">
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="qty" fill="var(--primary)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
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
                    <div className="text-[11px] text-muted-foreground">Mínimo: {min} un.</div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${out ? "bg-destructive/15 text-destructive" : "bg-gold/15 text-gold"}`}
                  >
                    {out ? "Esgotado" : `${p.stock} un.`}
                  </span>
                </li>
              );
            })}
          {products.filter((p) => p.stock <= (p.minStock ?? 5)).length === 0 && (
            <li className="text-sm text-muted-foreground py-4">Tudo ok!</li>
          )}
        </ul>
      </div>
    </AdminLayout>
  );
}
