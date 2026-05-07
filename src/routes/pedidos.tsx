import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore, selectCurrentCustomer, ORDER_STATUS_LABEL, type Order } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { brl, formatDate } from "@/lib/format";
import { Package, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pedidos")({
  head: () => ({ meta: [{ title: "Meus pedidos — Princesa de Laços" }] }),
  component: Page,
});

function Page() {
  const customer = useStore(selectCurrentCustomer);
  const allOrders = useStore(s => s.orders);
  const orders = customer ? allOrders.filter(o => o.customerId === customer.id) : [];

  if (!customer) {
    return (
      <StoreLayout>
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <Package className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-xl font-bold mt-3">Faça login para ver seus pedidos</h1>
          <Link to="/login" className="mt-4 inline-block bg-primary text-primary-foreground rounded-full px-6 py-3 font-semibold">Entrar</Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="max-w-3xl mx-auto px-4 py-5">
        <h1 className="text-2xl font-bold mb-4">Meus pedidos</h1>
        {orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">Você ainda não tem pedidos.</div>
        ) : (
          <ul className="space-y-3">
            {orders.map(o => (
              <li key={o.id}>
                <Link to="/pedido/$id" params={{ id: o.id }} className="block bg-card rounded-2xl p-4 shadow-card hover:shadow-soft transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-muted-foreground">#{o.id} · {formatDate(o.createdAt)}</div>
                      <div className="font-semibold mt-0.5">{o.items.length} {o.items.length === 1 ? "item" : "itens"}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{brl(o.total)}</div>
                      <span className="text-[11px] inline-block mt-1 bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-semibold">{ORDER_STATUS_LABEL[o.status]}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StoreLayout>
  );
}
