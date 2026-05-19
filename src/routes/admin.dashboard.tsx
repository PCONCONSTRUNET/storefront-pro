import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { normalizeOrderStatus, useStore } from "@/lib/store";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { AdminLayout } from "@/components/AdminLayout";
import { brl } from "@/lib/format";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
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
    const ordersToday = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === today,
    );
    const monthRev = orders
      .filter((o) => !["cancelado", "reembolsado"].includes(normalizeOrderStatus(o.status)))
      .reduce((a, o) => a + o.total, 0);
    const ticket = orders.length ? monthRev / orders.length : 0;
    return {
      ordersToday: ordersToday.length,
      monthRev,
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
      return { day: label, total: Math.round(total) };
    });
    return days;
  }, [orders]);

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

  const cards = [
    {
      label: "Faturamento",
      value: brl(stats.monthRev),
      icon: DollarSign,
      color: "text-success",
    },
    {
      label: "Pedidos hoje",
      value: stats.ordersToday,
      icon: ShoppingCart,
      color: "text-primary",
    },
    {
      label: "Ticket médio",
      value: brl(stats.ticket),
      icon: TrendingUp,
      color: "text-gold",
    },
    {
      label: "Clientes",
      value: stats.customers,
      icon: Users,
      color: "text-primary",
    },
  ];

  const { 
    playerId: osId, 
    subscribed: osActive, 
    loading: syncing, 
    enable: forceSync,
    permission: osPermission
  } = usePushNotifications({ role: 'admin' });

  const nukeServiceWorker = async () => {
    const { confirmDialog } = await import("@/components/ConfirmDialog");
    if (!(await confirmDialog({ title: "Resetar notificações?", description: "Isso vai limpar todas as configurações de notificação e recarregar a página.", confirmLabel: "Continuar" }))) return;
    
    try {
      // Desregistra todos os Service Workers
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      
      // Limpa dados do OneSignal no localStorage e IndexedDB
      localStorage.removeItem("push_prompt_accepted");
      localStorage.removeItem("push_prompt_dismissed_at");
      
      // Limpa bancos de dados do OneSignal (IndexedDB)
      const dbs = await window.indexedDB.databases();
      dbs.forEach(db => {
        if (db.name?.includes("OneSignal")) {
          window.indexedDB.deleteDatabase(db.name);
        }
      });

      window.alert("Sistema limpo! A página vai recarregar. Ative as notificações novamente ao voltar.");
      window.location.reload();
    } catch (err) {
      console.error("Erro ao limpar:", err);
      window.location.reload();
    }
  };

  const testNotification = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      if (!osId) {
        toast.error("Dispositivo não registrado ainda.");
        return;
      }

      const { error } = await supabase.functions.invoke("send-push", {
        body: {
          title: "Teste Admin Push 🚀",
          message: `Recebido! ${new Date().toLocaleTimeString()}`,
          subscriptionIds: [osId],
          externalUserIds: ["admin-user"],
        },
      });

      if (error) throw error;
      toast.success(`Push enviado para o ID: ${osId.slice(0, 8)}...`);
    } catch (err) {
      console.error("[push-test]", err);
      toast.error(`Erro: ${(err as Error).message}`);
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
          <div
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${osActive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}
          >
            {osActive ? "CONECTADO" : "DESCONECTADO"}
          </div>
        </div>

        <div className="bg-white/50 dark:bg-black/20 p-2 rounded-xl mb-4 font-mono text-[10px] break-all border border-black/5 dark:border-white/5">
          <span className="opacity-50 block mb-0.5 uppercase text-[8px]">
            Subscription ID
          </span>
          {osId}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              nukeServiceWorker();
            }}
            className="h-11 bg-destructive/10 text-destructive rounded-xl font-bold text-[10px] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 border border-destructive/20"
          >
            Limpar Tudo
          </button>
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
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            testNotification();
          }}
          className="w-full h-11 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <TrendingUp className="h-4 w-4" /> Testar Push
        </button>
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
                <XAxis
                  dataKey="day"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />
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
            <p className="text-sm text-muted-foreground py-8 text-center">
              Sem vendas ainda.
            </p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={topProducts} layout="vertical">
                  <XAxis
                    type="number"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                  />
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
                  <Bar
                    dataKey="qty"
                    fill="var(--primary)"
                    radius={[0, 8, 8, 0]}
                  />
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
