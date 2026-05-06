import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl, formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/clientes")({
  component: Page,
});

function Page() {
  const { customers, orders } = useStore();
  return (
    <AdminLayout title="Clientes">
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {customers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">Nenhum cliente cadastrado.</div>
        ) : (
          <ul className="divide-y divide-border">
            {customers.map(c => {
              const cOrders = orders.filter(o => o.customerId === c.id);
              const spent = cOrders.reduce((a, o) => a + o.total, 0);
              const last = cOrders[0]?.createdAt;
              return (
                <li key={c.id} className="p-4 flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary text-primary-foreground grid place-items-center font-bold">{c.name[0]?.toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.email} · {c.phone}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-primary font-bold">{brl(spent)}</div>
                    <div className="text-muted-foreground">{cOrders.length} pedidos</div>
                    {last && <div className="text-muted-foreground">Último: {formatDate(last)}</div>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}
