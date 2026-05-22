import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  useStore,
  useStoreHydrated,
  selectCurrentCustomer,
  getOrderStatusLabel,
  type Order,
} from "@/lib/store";
import {
  getDeliveryStatusLabel,
  normalizeDeliveryStatus,
  normalizeOrderStatus,
} from "@/lib/orderStatus";
import { StoreLayout } from "@/components/StoreLayout";
import { OrderListSkeleton } from "@/components/Skeleton";
import { ReorderModal } from "@/components/ReorderModal";
import { OrderAccentBar } from "@/components/OrderAccentBar";
import { brl, formatDate } from "@/lib/format";
import {
  Package,
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  CreditCard,
  QrCode,
  Banknote,
  MapPin,
  Sparkles,
  Receipt,
} from "lucide-react";


export const Route = createFileRoute("/pedidos")({
  head: () => ({ meta: [{ title: "Meus pedidos — Princesa de Laços" }] }),
  component: Page,
});

function Page() {
  const customer = useStore(selectCurrentCustomer);
  const hydrated = useStoreHydrated();
  const allOrders = useStore((s) => s.orders);
  const orders = customer
    ? allOrders.filter((o) => {
        if (o.customerId === customer.id) return true;
        const email = (customer.email || "").trim().toLowerCase();
        return (
          !!email &&
          (o.customerEmail || "").trim().toLowerCase() === email
        );
      })
    : [];

  const [reorderOrder, setReorderOrder] = useState<Order | null>(null);

  if (hydrated && !customer) {
    return (
      <StoreLayout>
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <Package className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-xl font-bold mt-3">
            Faça login para ver seus pedidos
          </h1>
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

  const openReorder = (e: React.MouseEvent, o: Order) => {
    e.preventDefault();
    e.stopPropagation();
    setReorderOrder(o);
  };

  return (
    <StoreLayout>
      <div className="max-w-3xl mx-auto px-4 py-5">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold leading-tight">Meus pedidos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Acompanhe cada laço da sua história ✨
            </p>
          </div>
          {hydrated && orders.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1.5">
              <Receipt className="h-3.5 w-3.5" />
              {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
            </div>
          )}
        </div>

        {!hydrated ? (
          <OrderListSkeleton />
        ) : orders.length === 0 ? (
          <div className="text-center py-20 px-4 bg-card rounded-2xl shadow-card">
            <div className="w-16 h-16 mx-auto rounded-full gradient-soft grid place-items-center">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mt-3 font-bold">Nenhum pedido por aqui</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Que tal escolher o seu primeiro lacinho?
            </p>
            <Link
              to="/"
              className="mt-5 inline-block bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-semibold"
            >
              Explorar produtos
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => {
              const totalQty = o.items.reduce((s, i) => s + i.quantity, 0);
              const isPaid = o.paymentStatus === "approved";
              const status = normalizeOrderStatus(o.status);
              const delivery = normalizeDeliveryStatus(o.deliveryStatus);
              const statusMeta = getStatusMeta(status, delivery, isPaid);
              const payMeta = getPaymentMeta(o.paymentMethod);
              const stepIdx = getStepIndex(status, delivery);

              return (
                <li key={o.id}>
                  <Link
                    to="/pedido/$id"
                    params={{ id: o.id }}
                    className="group relative block bg-card rounded-2xl shadow-card hover:shadow-soft hover:-translate-y-0.5 transition-all overflow-hidden border border-border/50"
                  >
                    <OrderAccentBar className="top-4 bottom-4" />

                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 px-4 pl-5 pt-4 pb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] font-semibold text-foreground/80 bg-muted px-2 py-0.5 rounded-md">
                            #{o.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDate(o.createdAt)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                          {o.deliveryMethod === "retirada" ? (
                            <MapPin className="h-3.5 w-3.5 text-primary/70" />
                          ) : (
                            <Truck className="h-3.5 w-3.5 text-primary/70" />
                          )}
                          <span className="truncate">
                            {o.deliveryMethod === "retirada"
                              ? "Retirada no ateliê"
                              : "Entrega"}
                          </span>
                          <span className="text-border">•</span>
                          <payMeta.Icon className="h-3.5 w-3.5 text-primary/70" />
                          <span>{payMeta.label}</span>
                        </div>
                      </div>

                      <div
                        className={`shrink-0 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusMeta.badgeClass}`}
                      >
                        <statusMeta.Icon className="h-3 w-3" />
                        {statusMeta.label}
                      </div>
                    </div>

                    {/* Progress steps */}
                    <div className="px-5 pb-3">
                      <div className="flex items-center gap-1">
                        {STEPS.map((s, i) => {
                          const active = i <= stepIdx;
                          const current = i === stepIdx;
                          return (
                            <div
                              key={s.key}
                              className={`h-1.5 flex-1 rounded-full transition-colors ${
                                active
                                  ? "bg-gradient-to-r from-primary to-accent"
                                  : "bg-muted"
                              } ${current ? "ring-2 ring-primary/20" : ""}`}
                            />
                          );
                        })}
                      </div>
                      <div className="mt-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        {STEPS[Math.min(stepIdx, STEPS.length - 1)]?.label}
                      </div>
                    </div>

                    {/* Items preview — stacked thumbs */}
                    <div className="px-5 pb-3 flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {o.items.slice(0, 4).map((it, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 rounded-xl bg-muted overflow-hidden ring-2 ring-card shadow-sm"
                            style={{ zIndex: 10 - idx }}
                          >
                            {it.image ? (
                              <img
                                src={it.image}
                                alt={it.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full grid place-items-center text-primary/40">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        ))}
                        {o.items.length > 4 && (
                          <div className="w-12 h-12 rounded-xl bg-primary/10 ring-2 ring-card grid place-items-center text-[11px] font-bold text-primary">
                            +{o.items.length - 4}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">
                          {o.items[0]?.name}
                          {o.items.length > 1 && (
                            <span className="text-muted-foreground font-normal">
                              {" "}
                              e mais {o.items.length - 1}{" "}
                              {o.items.length - 1 === 1 ? "item" : "itens"}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {totalQty} {totalQty === 1 ? "peça" : "peças"} no total
                        </div>
                      </div>
                    </div>

                    {/* Footer — total + breakdown */}
                    <div className="px-5 py-3.5 bg-gradient-to-r from-primary/5 via-accent/10 to-transparent border-t border-border/40 flex items-end justify-between gap-3">
                      <div>
                        {o.discount > 0 && (
                          <div className="text-[10px] text-success font-semibold uppercase tracking-wide">
                            Economizou {brl(o.discount)} ✨
                          </div>
                        )}
                        <div className="text-[11px] text-muted-foreground">
                          Total do pedido
                        </div>
                      </div>
                      <div className="text-xl font-extrabold text-primary leading-none">
                        {brl(o.total)}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="px-5 py-3 flex items-center gap-2">
                      <button
                        onClick={(e) => openReorder(e, o)}
                        className="flex-1 h-11 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" /> Comprar de novo
                      </button>
                      <span className="h-11 px-4 rounded-full bg-gradient-to-r from-primary to-rose text-primary-foreground text-sm font-semibold flex items-center gap-1.5 shadow-soft">
                        Ver detalhes
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {reorderOrder && (
        <ReorderModal
          order={reorderOrder}
          onClose={() => setReorderOrder(null)}
        />
      )}
    </StoreLayout>
  );
}

// ---------- helpers ----------

const STEPS = [
  { key: "pending", label: "Aguardando pagamento" },
  { key: "paid", label: "Pagamento confirmado" },
  { key: "preparing", label: "Em separação" },
  { key: "shipping", label: "Aguardando retirada" },
  { key: "done", label: "Concluído" },
] as const;

function getStepIndex(
  status: ReturnType<typeof normalizeOrderStatus>,
  delivery: ReturnType<typeof normalizeDeliveryStatus>,
) {
  if (status === "cancelado" || status === "reembolsado") return 0;
  if (delivery === "entregue" || status === "concluido") return 4;
  if (delivery === "saiu_para_entrega") return 3;
  if (delivery === "em_separacao" || status === "em_separacao") return 2;
  if (status === "pago") return 1;
  return 0;
}

function getStatusMeta(
  status: ReturnType<typeof normalizeOrderStatus>,
  delivery: ReturnType<typeof normalizeDeliveryStatus>,
  isPaid: boolean,
) {
  if (status === "cancelado")
    return {
      label: "Cancelado",
      Icon: XCircle,
      badgeClass: "bg-destructive/10 text-destructive",
    };
  if (status === "reembolsado")
    return {
      label: "Reembolsado",
      Icon: XCircle,
      badgeClass: "bg-muted text-muted-foreground",
    };
  if (delivery === "entregue" || status === "concluido")
    return {
      label: "Entregue",
      Icon: PackageCheck,
      badgeClass: "bg-success/15 text-success",
    };
  if (delivery === "saiu_para_entrega")
    return {
      label: "A caminho",
      Icon: Truck,
      badgeClass: "bg-blue-500/15 text-blue-600",
    };
  if (delivery === "em_separacao" || status === "em_separacao")
    return {
      label: "Em separação",
      Icon: Package,
      badgeClass: "bg-purple-500/15 text-purple-600",
    };
  if (isPaid || status === "pago")
    return {
      label: "Pago",
      Icon: CheckCircle2,
      badgeClass: "bg-success/15 text-success",
    };
  return {
    label: getOrderStatusLabel(status),
    Icon: Clock,
    badgeClass: "bg-amber-500/15 text-amber-600",
  };
}

function getPaymentMeta(method: Order["paymentMethod"]) {
  if (method === "pix") return { label: "Pix", Icon: QrCode };
  if (method === "card") return { label: "Cartão", Icon: CreditCard };
  return { label: "Dinheiro", Icon: Banknote };
}

