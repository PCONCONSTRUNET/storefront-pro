import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl, formatDate } from "@/lib/format";
import { cloud } from "@/lib/cloud";
import { toast } from "sonner";

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
              const cEmail = c.email?.trim().toLowerCase();
              const cOrders = orders.filter((o) => 
                o.customerId === c.id || 
                (cEmail && (o.customerEmail || "").trim().toLowerCase() === cEmail)
              );
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
                    {c.name?.[0]?.toUpperCase() || "C"}
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
          orders={orders.filter((o) => {
            const cEmail = viewingCustomer.email?.trim().toLowerCase();
            return o.customerId === viewingCustomer.id || 
              (cEmail && (o.customerEmail || "").trim().toLowerCase() === cEmail);
          })}
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

  const handleDelete = async () => {
    if (!window.confirm("ATENÇÃO: Deseja realmente excluir este cliente? Isso pode afetar ou excluir seus pedidos e histórico na loja. Esta ação é irreversível.")) return;
    
    const tId = toast.loading("Excluindo cliente...");
    try {
      await cloud.deleteCustomer(customer.id);
      useStore.setState((s) => ({ customers: s.customers.filter((c) => c.id !== customer.id) }));
      toast.success("Cliente excluído com sucesso!", { id: tId });
      onClose();
    } catch (e: any) {
      toast.error("Erro ao excluir: " + e.message, { id: tId });
    }
  };

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
              {customer.name?.[0]?.toUpperCase() || "C"}
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

        <div className="flex gap-3 mt-2">
          <button
            onClick={handleDelete}
            className="w-11 h-11 rounded-full border border-red-200 bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors shrink-0"
            title="Excluir cliente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-full bg-muted font-semibold hover:bg-muted/80 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
