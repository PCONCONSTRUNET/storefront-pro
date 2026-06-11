import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  useStore,
  ORDER_STATUS_LABEL,
  normalizeOrderStatus,
  type OrderStatus,
} from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { ReorderModal } from "@/components/ReorderModal";
import { brl, formatDate } from "@/lib/format";
import {
  CheckCircle2,
  ChevronLeft,
  RotateCcw,
  Truck,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/pedido/$id")({
  component: Page,
});

const paymentFlow = ["aguardando_pagamento", "pago"] as const;
const deliveryFlowRetirada = ["pendente", "em_separacao", "saiu_para_entrega", "entregue"] as const;
const deliveryFlowEntrega = ["pendente", "em_separacao", "postado_correios", "saiu_para_entrega", "entregue"] as const;

function Page() {
  const { id } = Route.useParams();
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const [reorderOpen, setReorderOpen] = useState(false);
  const [trackingFetched, setTrackingFetched] = useState(false);

  useEffect(() => {
    if (!order?.id) return;
    supabase
      .rpc("get_order_tracking", { _id: order.id })
      .then(({ data, error }) => {
        if (!error && data) {
          const payload = data as {
            status?: string;
            deliveryStatus?: string;
            trackingCode?: string;
            notes?: string;
          };
          useStore.getState().updateOrderLocally(order.id, {
            status: payload.status as any,
            deliveryStatus: payload.deliveryStatus as any,
            trackingCode: payload.trackingCode,
            notes: payload.notes,
          });
        }
        setTrackingFetched(true);
      })
      .catch(() => { setTrackingFetched(true); });
  }, [order?.id]);

  if (!order) {
    return (
      <StoreLayout>
        <div className="text-center py-20">
          <p>Pedido não encontrado.</p>
          <Link to="/pedidos" className="text-primary font-semibold">
            Voltar
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const status = normalizeOrderStatus(order.status);
  const isPaid = status === "pago" || status === "em_separacao" || status === "concluido" || status === "saiu_para_entrega";
  const deliveryStatus = order.deliveryStatus || "pendente";
  
  const flow = order.deliveryMethod === "retirada" ? deliveryFlowRetirada : deliveryFlowEntrega;
  const currentIdx = flow.indexOf(deliveryStatus as any);
  
  const getStepLabel = (step: string) => {
    switch (step) {
      case "pendente": return isPaid ? "Pagamento aprovado" : "Aguardando pagamento";
      case "em_separacao": return "Em separação";
      case "postado_correios": return "Postado nos Correios";
      case "saiu_para_entrega": return order.deliveryMethod === "retirada" ? "Aguardando retirada" : "Em trânsito";
      case "entregue": return "Entregue";
      default: return step;
    }
  };

  return (
    <StoreLayout>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Link
          to="/pedidos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4" /> Meus pedidos
        </Link>

        <div className="bg-gradient-to-br from-primary to-rose text-primary-foreground rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Pedido confirmado!</span>
          </div>
          <h1 className="text-2xl font-bold mt-2">#{order.id}</h1>
          <p className="text-sm opacity-90">{formatDate(order.createdAt)}</p>
        </div>




        <div className="mt-4 bg-card rounded-2xl p-4 shadow-card">
          <h2 className="font-semibold mb-3">Acompanhamento</h2>
          <ol className="space-y-3">
            {flow.map((s, i) => {
              const isLastStep = i === flow.length - 1;
              const isCompleted = i < currentIdx || (i === 0 && isPaid) || (i === currentIdx && isLastStep);
              const isCurrent = (i === 0 && !isPaid) ? true : (i === currentIdx && currentIdx > 0 && !isLastStep);
              
              return (
              <li key={s} className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${isCompleted && !isCurrent ? "bg-success text-success-foreground" : isCurrent ? "bg-primary text-primary-foreground shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]" : "bg-muted text-muted-foreground"}`}
                >
                  {isCompleted && !isCurrent ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={
                      isCurrent
                        ? "font-bold text-primary"
                        : isCompleted
                        ? "text-foreground text-sm font-medium"
                        : "text-muted-foreground text-sm"
                    }
                  >
                    {getStepLabel(s)}
                  </div>
                  {s === "postado_correios" && isCompleted && (order.trackingCode || order.notes?.match(/\[RASTREIO: (.*?)\]/)) && (
                    <div className="text-xs font-mono mt-0.5 text-primary">
                      Rastreio: {order.trackingCode || order.notes?.match(/\[RASTREIO: (.*?)\]/)?.[1]}
                    </div>
                  )}
                </div>
              </li>
            )})}
          </ol>
        </div>

        {(["postado_correios", "saiu_para_entrega", "entregue"] as string[]).includes(deliveryStatus) && (() => {
          const code = order.trackingCode || order.notes?.match(/\[RASTREIO: (.*?)\]/)?.[1];
          return (
            <div className="mt-4 bg-card rounded-2xl p-4 shadow-card text-sm flex flex-col gap-2 border-2 border-primary/20">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Truck className="h-5 w-5 text-primary" /> Código de Rastreio
              </div>
              {code ? (
                <>
                  <p className="text-muted-foreground text-xs">Acompanhe a sua entrega com o código abaixo:</p>
                  <div className="flex gap-2 mt-1">
                    <div className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-3 flex items-center font-mono font-bold text-primary select-all text-base tracking-widest">
                      {code}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(code);
                        toast.success("Código copiado!");
                      }}
                      className="h-14 px-4 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                    >
                      <Copy className="h-4 w-4" /> Copiar
                    </button>
                  </div>
                  <a
                    href="https://rastreamento.correios.com.br/app/index.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 w-full rounded-xl border-2 border-primary/30 text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all mt-1"
                  >
                    <Truck className="h-4 w-4" /> Rastrear nos Correios
                  </a>
                </>
              ) : (
                <div className="flex items-center gap-3 bg-muted/50 border border-dashed border-border rounded-xl px-4 py-3 mt-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <p className="text-muted-foreground text-sm">Código disponível em breve</p>
                </div>
              )}
            </div>
          );
        })()}

        <div className="mt-4 bg-card rounded-2xl p-4 shadow-card">
          <h2 className="font-semibold mb-3">Itens</h2>
          <ul className="space-y-3">
            {order.items.map((it) => (
              <li key={it.productId} className="flex gap-3">
                <img
                  src={it.image}
                  alt={it.name}
                  className="w-14 h-14 rounded-xl object-cover bg-muted"
                />
                <div className="flex-1 text-sm">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Qtd: {it.quantity} × {brl(it.price)}
                  </div>
                </div>
                <div className="font-semibold text-sm">
                  {brl(it.price * it.quantity)}
                </div>
              </li>
            ))}
          </ul>
          <hr className="my-3 border-border" />
          <dl className="text-sm space-y-1">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{brl(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Desconto</dt>
                <dd>− {brl(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Frete</dt>
              <dd>{brl(order.shipping)}</dd>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border mt-2">
              <dt>Total</dt>
              <dd className="text-primary">{brl(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-4 bg-card rounded-2xl p-4 shadow-card text-sm">
          <h2 className="font-semibold mb-2">
            {order.deliveryMethod === "retirada"
              ? "Retirada no ateliê"
              : "Entrega"}
          </h2>
          <p className="text-muted-foreground">{order.address}</p>
          {(order.notes || "").replace(/\[RASTREIO: .*?\]\n?/g, "").trim() && (
            <div className="mt-3 p-3 rounded-xl bg-gold/10 border border-gold/30">
              <div className="text-[11px] font-bold text-gold uppercase tracking-wide mb-1">
                📝 Observações
              </div>
              <div className="whitespace-pre-wrap">{(order.notes || "").replace(/\[RASTREIO: .*?\]\n?/g, "").trim()}</div>
            </div>
          )}
        </div>

        <button
          onClick={() => setReorderOpen(true)}
          className="mt-4 w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-soft hover:opacity-90 transition-opacity"
        >
          <RotateCcw className="h-4 w-4" /> Comprar de novo
        </button>
      </div>
      {reorderOpen && (
        <ReorderModal order={order} onClose={() => setReorderOpen(false)} />
      )}
    </StoreLayout>
  );
}
