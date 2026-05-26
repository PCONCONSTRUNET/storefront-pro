import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  ShoppingCart,
  DollarSign,
  FileText,
  CreditCard,
  Webhook,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { getSyncStatusFn } from "@/lib/admin.functions";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/sincronizacao")({
  component: SyncPage,
});

type TableStat = { count: number; lastAt: string | null };
type SyncStatus = {
  serverTime: string;
  tables: {
    orders: TableStat;
    paidOrders: TableStat;
    transactions: TableStat;
    activityLogs: TableStat;
    paymentEvents: TableStat;
  };
  lastWebhook: {
    mpEventId: string;
    mpPaymentId: string | null;
    orderId: string | null;
    eventType: string;
    processedAt: string;
    orderStatus: string | null;
  } | null;
  error?: string;
};


function fmt(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function relative(ts: string | null) {
  if (!ts) return null;
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

function freshness(ts: string | null): "ok" | "warn" | "stale" {
  if (!ts) return "stale";
  const mins = (Date.now() - new Date(ts).getTime()) / 60000;
  if (mins < 60) return "ok";
  if (mins < 60 * 24) return "warn";
  return "stale";
}

function StatusBadge({ ts }: { ts: string | null }) {
  const s = freshness(ts);
  const cfg = {
    ok: { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", label: "Em dia" },
    warn: { color: "bg-amber-500/15 text-amber-700 dark:text-amber-400", label: "Atenção" },
    stale: { color: "bg-rose-500/15 text-rose-700 dark:text-rose-400", label: "Sem atividade" },
  }[s];
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide", cfg.color)}>
      {cfg.label}
    </span>
  );
}

function Card({
  icon: Icon,
  title,
  stat,
}: {
  icon: typeof ShoppingCart;
  title: string;
  stat: TableStat;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div className="font-semibold text-sm">{title}</div>
        </div>
        <StatusBadge ts={stat.lastAt} />
      </div>
      <div className="text-2xl font-bold tabular-nums">{stat.count.toLocaleString("pt-BR")}</div>
      <div className="text-xs text-muted-foreground">
        Último registro: {fmt(stat.lastAt)}
        {stat.lastAt && (
          <span className="ml-1 text-muted-foreground/70">({relative(stat.lastAt)})</span>
        )}
      </div>
    </div>
  );
}

function SyncPage() {
  const [data, setData] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await getSyncStatusFn();
      setData(r as SyncStatus);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(t);
  }, [load]);

  return (
    <AdminLayout title="Sincronização">
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Estado em tempo real do banco — atualiza a cada 15s. Verifique se pedidos,
            pagamentos, financeiro e logs estão chegando.
          </p>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Atualizar
          </button>
        </div>

        {(err || data?.error) && (
          <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-xl p-3 text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="break-all">{err || data?.error}</span>
          </div>
        )}


        {data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Card icon={ShoppingCart} title="Pedidos" stat={data.tables.orders} />
              <Card icon={CheckCircle2} title="Pedidos pagos" stat={data.tables.paidOrders} />
              <Card icon={CreditCard} title="Eventos de pagamento" stat={data.tables.paymentEvents} />
              <Card icon={DollarSign} title="Financeiro (transações)" stat={data.tables.transactions} />
              <Card icon={FileText} title="Logs de auditoria" stat={data.tables.activityLogs} />
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Webhook className="h-4 w-4" />
                  </div>
                  <div className="font-semibold">Último webhook Mercado Pago</div>
                </div>
                {data.lastWebhook && <StatusBadge ts={data.lastWebhook.processedAt} />}
              </div>

              {data.lastWebhook ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <Field label="Tipo" value={data.lastWebhook.eventType} />
                  <Field
                    label="Processado em"
                    value={`${fmt(data.lastWebhook.processedAt)} (${relative(data.lastWebhook.processedAt)})`}
                  />
                  <Field label="ID do evento" value={data.lastWebhook.mpEventId} mono />
                  <Field label="ID pagamento MP" value={data.lastWebhook.mpPaymentId ?? "—"} mono />
                  <Field label="ID pedido" value={data.lastWebhook.orderId ?? "—"} mono />
                  <Field
                    label="Status do pedido"
                    value={data.lastWebhook.orderStatus ?? "—"}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum webhook processado ainda.
                </p>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground text-right">
              Hora do servidor: {fmt(data.serverTime)}
            </p>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">
        {label}
      </div>
      <div className={cn("truncate", mono && "font-mono text-xs")}>{value}</div>
    </div>
  );
}
