import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, useStoreHydrated, selectCurrentCustomer } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { supabase } from "@/integrations/supabase/client";
import { brl, formatDate } from "@/lib/format";
import {
  Receipt,
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Copy,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

type Tx = {
  id: string;
  created_at: string;
  paid_at: string | null;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  payment_method: string;
  payment_status: string;
  mp_payment_id: string | null;
  items: Array<{ name?: string; quantity?: number; price?: number }>;
  customer_name: string;
  customer_email: string;
};

export const Route = createFileRoute("/perfil/transacoes")({
  head: () => ({ meta: [{ title: "Histórico de transações — Princesa de Laços" }] }),
  component: Page,
});

const STATUS: Record<string, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  approved: { label: "Aprovado", cls: "bg-green-100 text-green-700", Icon: CheckCircle2 },
  pending: { label: "Pendente", cls: "bg-amber-100 text-amber-700", Icon: Clock },
  rejected: { label: "Recusado", cls: "bg-destructive/10 text-destructive", Icon: XCircle },
  cancelled: { label: "Cancelado", cls: "bg-muted text-muted-foreground", Icon: XCircle },
  refunded: { label: "Reembolsado", cls: "bg-blue-100 text-blue-700", Icon: RefreshCw },
};

type FilterKey = "all" | "approved" | "pending" | "rejected";

function Page() {
  const customer = useStore(selectCurrentCustomer);
  const hydrated = useStoreHydrated();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    if (!customer) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, created_at, paid_at, total, subtotal, discount, shipping, payment_method, payment_status, mp_payment_id, items, customer_name, customer_email",
      )
      .eq("customer_email", customer.email)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) setError(error.message);
    else setTxs((data ?? []) as Tx[]);
    setLoading(false);
  };

  useEffect(() => {
    if (hydrated && customer) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, customer?.email]);

  if (hydrated && !customer) {
    return (
      <StoreLayout>
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <Receipt className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-xl font-bold mt-3">Faça login para ver suas transações</h1>
          <Link
            to="/login"
            className="mt-4 inline-block bg-primary text-primary-foreground rounded-full px-6 py-3 font-semibold"
          >
            Entrar
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const filtered = txs.filter((t) => (filter === "all" ? true : t.payment_status === filter));
  const totalApproved = txs
    .filter((t) => t.payment_status === "approved")
    .reduce((s, t) => s + Number(t.total), 0);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado`);
    } catch {
      toast.error("Falha ao copiar");
    }
  };

  return (
    <StoreLayout>
      <div className="max-w-3xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary" /> Histórico de transações
            </h1>
            <p className="text-sm text-muted-foreground">Pagamentos via Pix e Cartão.</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="h-10 px-3 rounded-full bg-muted hover:bg-muted/70 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar
          </button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <SummaryCard label="Total" value={String(txs.length)} />
          <SummaryCard
            label="Aprovadas"
            value={String(txs.filter((t) => t.payment_status === "approved").length)}
          />
          <SummaryCard label="Pago" value={brl(totalApproved)} />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {(
            [
              ["all", "Todas"],
              ["approved", "Aprovadas"],
              ["pending", "Pendentes"],
              ["rejected", "Recusadas"],
            ] as Array<[FilterKey, string]>
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`h-9 px-4 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === k
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="bg-destructive/10 text-destructive rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="text-sm">
              <div className="font-semibold">Não foi possível carregar suas transações</div>
              <div className="text-xs opacity-90 mt-0.5">{error}</div>
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl">
            <Receipt className="h-10 w-10 mx-auto mb-2 opacity-50" />
            Nenhuma transação encontrada.
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((t) => {
              const meta = STATUS[t.payment_status] ?? {
                label: t.payment_status,
                cls: "bg-muted text-muted-foreground",
                Icon: Clock,
              };
              const isCard = t.payment_method === "card";
              const isOpen = openId === t.id;
              return (
                <li key={t.id} className="bg-card rounded-2xl shadow-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : t.id)}
                    className="w-full text-left p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${isCard ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}
                      >
                        {isCard ? (
                          <CreditCard className="h-5 w-5" />
                        ) : (
                          <QrCode className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            {isCard ? "Cartão de crédito" : "Pix"}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${meta.cls}`}
                          >
                            <meta.Icon className="h-3 w-3" /> {meta.label}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          #{t.id.slice(0, 8)} · {formatDate(t.created_at)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-primary">{brl(Number(t.total))}</div>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto mt-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto mt-1" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-border pt-3 space-y-3 text-sm">
                      <DetailRow
                        label="ID do pedido"
                        value={t.id}
                        mono
                        onCopy={() => copy(t.id, "ID do pedido")}
                      />
                      <DetailRow
                        label="ID do pagamento (MP)"
                        value={t.mp_payment_id ?? "—"}
                        mono
                        onCopy={
                          t.mp_payment_id
                            ? () => copy(t.mp_payment_id!, "ID do pagamento")
                            : undefined
                        }
                      />
                      <DetailRow label="Criado em" value={formatDate(t.created_at)} />
                      <DetailRow label="Pago em" value={t.paid_at ? formatDate(t.paid_at) : "—"} />
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                        <Mini label="Subtotal" value={brl(Number(t.subtotal))} />
                        <Mini label="Desconto" value={`- ${brl(Number(t.discount))}`} />
                        <Mini label="Frete" value={brl(Number(t.shipping))} />
                      </div>
                      {Array.isArray(t.items) && t.items.length > 0 && (
                        <div className="pt-2 border-t border-border">
                          <div className="text-xs font-semibold text-muted-foreground mb-1">
                            Itens
                          </div>
                          <ul className="space-y-1">
                            {t.items.map((it, i) => (
                              <li key={i} className="flex justify-between text-xs">
                                <span className="truncate pr-2">
                                  {it.quantity ?? 1}x {it.name ?? "Item"}
                                </span>
                                <span className="font-medium">
                                  {brl(Number(it.price ?? 0) * Number(it.quantity ?? 1))}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <Link
                        to="/pedido/$id"
                        params={{ id: t.id }}
                        className="inline-block text-xs font-semibold text-primary underline mt-1"
                      >
                        Ver detalhes do pedido
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </StoreLayout>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-2xl p-3 shadow-card">
      <div className="text-[11px] text-muted-foreground font-medium">{label}</div>
      <div className="font-bold text-sm mt-0.5 truncate">{value}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  onCopy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs font-semibold text-muted-foreground shrink-0">{label}</div>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-xs ${mono ? "font-mono" : ""} truncate`}>{value}</span>
        {onCopy && (
          <button
            onClick={onCopy}
            type="button"
            className="h-6 w-6 grid place-items-center rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Copiar"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
      <div className="text-xs font-semibold">{value}</div>
    </div>
  );
}
