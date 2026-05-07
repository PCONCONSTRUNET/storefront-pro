import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { brl, formatDate } from "@/lib/format";
import { CheckCircle2, ChevronLeft, Copy, QrCode } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pedido/$id")({
  component: Page,
});

const flow: OrderStatus[] = ["aguardando_pagamento", "pago", "em_separacao", "saiu_para_entrega", "concluido"];

function Page() {
  const { id } = Route.useParams();
  const order = useStore(s => s.orders.find(o => o.id === id));

  if (!order) {
    return <StoreLayout><div className="text-center py-20"><p>Pedido não encontrado.</p><Link to="/pedidos" className="text-primary font-semibold">Voltar</Link></div></StoreLayout>;
  }

  const currentIdx = flow.indexOf(order.status);

  return (
    <StoreLayout>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Link to="/pedidos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ChevronLeft className="h-4 w-4" /> Meus pedidos
        </Link>

        <div className="bg-gradient-to-br from-primary to-rose text-primary-foreground rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /><span className="font-semibold">Pedido confirmado!</span></div>
          <h1 className="text-2xl font-bold mt-2">#{order.id}</h1>
          <p className="text-sm opacity-90">{formatDate(order.createdAt)}</p>
        </div>

        {order.paymentMethod === "pix" && order.status === "pago" && (
          <div className="mt-4 bg-card rounded-2xl p-4 shadow-card">
            <h2 className="font-semibold flex items-center gap-2"><QrCode className="h-4 w-4" /> Pix simulado</h2>
            <div className="mt-3 grid place-items-center bg-muted rounded-xl p-6">
              <div className="w-32 h-32 bg-foreground/90" style={{ backgroundImage: "repeating-conic-gradient(var(--foreground) 0 25%, transparent 0 50%)", backgroundSize: "12px 12px" }} />
            </div>
            <button onClick={() => { navigator.clipboard.writeText("00020126...PIXSIMULADO" + order.id); toast.success("Código copiado"); }}
              className="mt-3 w-full h-10 rounded-full bg-muted text-sm font-semibold flex items-center justify-center gap-2"><Copy className="h-4 w-4" /> Copiar código Pix</button>
          </div>
        )}

        <div className="mt-4 bg-card rounded-2xl p-4 shadow-card">
          <h2 className="font-semibold mb-3">Acompanhamento</h2>
          <ol className="space-y-3">
            {flow.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${i <= currentIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i <= currentIdx ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className={i === currentIdx ? "font-semibold" : "text-muted-foreground text-sm"}>{ORDER_STATUS_LABEL[s]}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 bg-card rounded-2xl p-4 shadow-card">
          <h2 className="font-semibold mb-3">Itens</h2>
          <ul className="space-y-3">
            {order.items.map(it => (
              <li key={it.productId} className="flex gap-3">
                <img src={it.image} alt={it.name} className="w-14 h-14 rounded-xl object-cover bg-muted" />
                <div className="flex-1 text-sm">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-muted-foreground">Qtd: {it.quantity} × {brl(it.price)}</div>
                </div>
                <div className="font-semibold text-sm">{brl(it.price * it.quantity)}</div>
              </li>
            ))}
          </ul>
          <hr className="my-3 border-border" />
          <dl className="text-sm space-y-1">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{brl(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-success"><dt>Desconto</dt><dd>− {brl(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted-foreground">Frete</dt><dd>{brl(order.shipping)}</dd></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border mt-2"><dt>Total</dt><dd className="text-primary">{brl(order.total)}</dd></div>
          </dl>
        </div>

        <div className="mt-4 bg-card rounded-2xl p-4 shadow-card text-sm">
          <h2 className="font-semibold mb-2">Entrega</h2>
          <p className="text-muted-foreground">{order.address}</p>
          {order.notes && (
            <div className="mt-3 p-3 rounded-xl bg-gold/10 border border-gold/30">
              <div className="text-[11px] font-bold text-gold uppercase tracking-wide mb-1">📝 Observações</div>
              <div className="whitespace-pre-wrap">{order.notes}</div>
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}
