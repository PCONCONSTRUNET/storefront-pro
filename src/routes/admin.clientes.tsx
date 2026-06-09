import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl, formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/clientes")({
  component: Page,
});

function Page() {
  const { customers, orders } = useStore();
  const [viewingCustomer, setViewingCustomer] = useState<any>(null);
  return (
    <AdminLayout title="Clientes">
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {customers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Nenhum cliente cadastrado.
          </div>
        ) : (
          <ul className="p-2 space-y-2">
            {customers.map((c) => {
              const cOrders = orders.filter((o) => o.customerId === c.id);
              const spent = cOrders.reduce((a, o) => a + o.total, 0);
              const last = cOrders[0]?.createdAt;
              return (
                <li
                  key={c.id}
                  onClick={() => setViewingCustomer(c)}
                  className="cursor-pointer relative overflow-hidden rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors shadow-sm p-4 flex flex-wrap items-center gap-3"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-xl bg-primary" />
                  <div className="w-10 h-10 rounded-full gradient-primary text-primary-foreground grid place-items-center font-bold ml-1">
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.email} · {c.phone}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-primary font-bold">{brl(spent)}</div>
                    <div className="text-muted-foreground">
                      {cOrders.length} pedidos
                    </div>
                    {last && (
                      <div className="text-muted-foreground">
                        Último: {formatDate(last)}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {viewingCustomer && (
        <CustomerDetailsModal
          customer={viewingCustomer}
          orders={orders.filter((o) => o.customerId === viewingCustomer.id)}
          onClose={() => setViewingCustomer(null)}
        />
      )}
    </AdminLayout>
  );
}

function CustomerDetailsModal({
  customer,
  orders,
  onClose,
}: {
  customer: any;
  orders: any[];
  onClose: () => void;
}) {
  const spent = orders.reduce((a, o) => a + o.total, 0);
  const addressList = [customer.address, ...(customer.addresses || [])].filter(
    Boolean,
  );
  // Remove duplicate addresses
  const uniqueAddresses = Array.from(new Set(addressList));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4 animate-overlay-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-3xl p-5 w-full max-w-md space-y-4 shadow-soft animate-modal-in relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
        <div className="flex items-center justify-between pt-1">
          <h3 className="font-bold text-lg">Detalhes do Cliente</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full gradient-primary text-primary-foreground grid place-items-center font-bold text-2xl shrink-0">
              {customer.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">
                {customer.name}
              </div>
              <div className="text-sm text-muted-foreground">
                Cadastrado em {formatDate(customer.createdAt)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-2xl border border-border">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                Total Gasto
              </div>
              <div className="font-bold text-primary">{brl(spent)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                Pedidos
              </div>
              <div className="font-bold">{orders.length}</div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                Contato
              </div>
              <div>{customer.email}</div>
              <div>{customer.phone}</div>
            </div>
            {uniqueAddresses.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                  Endereços
                </div>
                <div className="space-y-1">
                  {uniqueAddresses.map((addr: string, i) => (
                    <div
                      key={i}
                      className="bg-muted/50 p-2 rounded-lg text-xs border border-border/50"
                    >
                      {addr}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-11 rounded-full bg-muted font-semibold mt-2 hover:bg-muted/80 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
