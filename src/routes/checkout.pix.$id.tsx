import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StoreLayout } from "@/components/StoreLayout";
import { fetchOrder, isSandboxOrder, simulateApprove, type OrderRow } from "@/lib/mercadopago";
import { brl } from "@/lib/format";
import { CheckCircle2, ChevronLeft, Copy, FlaskConical, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { playBeep } from "@/lib/sound";

export const Route = createFileRoute("/checkout/pix/$id")({
  component: PixPage,
});

function PixPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Polling do status a cada 4s até aprovar/expirar
  useEffect(() => {
    let cancelled = false;
    let timer: any;

    const tick = async () => {
      try {
        const o = await fetchOrder(id);
        if (cancelled) return;
        if (!o) { setError("Pedido não encontrado."); setLoading(false); return; }
        setOrder(o);
        setLoading(false);

        if (o.payment_status === "approved") {
          playBeep();
          toast.success("Pagamento aprovado! 🎉");
          setTimeout(() => navigate({ to: "/pedido/$id", params: { id: o.id } }), 1500);
          return;
        }
        if (["rejected", "cancelled", "expired"].includes(o.payment_status)) {
          return;
        }
        timer = setTimeout(tick, 4000);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    };
    tick();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [id, navigate]);

  const copyCode = () => {
    if (!order?.pix_qr_code) return;
    navigator.clipboard.writeText(order.pix_qr_code);
    toast.success("Código Pix copiado!");
  };

  if (loading) {
    return <StoreLayout><div className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-3 text-muted-foreground">Gerando seu Pix...</p></div></StoreLayout>;
  }
  if (error || !order) {
    return <StoreLayout><div className="text-center py-20"><p className="text-destructive">{error ?? "Pedido não encontrado."}</p><Link to="/" className="text-primary font-semibold">Voltar</Link></div></StoreLayout>;
  }

  const status = order.payment_status;

  return (
    <StoreLayout>
      <div className="max-w-md mx-auto px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ChevronLeft className="h-4 w-4" /> Início
        </Link>

        {status === "approved" ? (
          <div className="bg-gradient-to-br from-success to-success/70 text-white rounded-2xl p-6 text-center shadow-soft">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
            <h1 className="text-xl font-bold">Pagamento aprovado!</h1>
            <p className="text-sm opacity-90 mt-1">Redirecionando para seu pedido...</p>
          </div>
        ) : ["rejected", "cancelled", "expired"].includes(status) ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6 text-center">
            <h1 className="text-lg font-bold text-destructive">Pagamento {status === "expired" ? "expirado" : "não aprovado"}</h1>
            <p className="text-sm text-muted-foreground mt-1">Você pode tentar novamente.</p>
            <Link to="/carrinho" className="inline-block mt-4 px-6 h-11 leading-[2.75rem] rounded-full gradient-primary text-primary-foreground font-semibold">Voltar ao carrinho</Link>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-primary to-rose text-primary-foreground rounded-2xl p-5 shadow-soft">
              <div className="flex items-center gap-2"><QrCode className="h-5 w-5" /><span className="font-semibold">Pague com Pix</span></div>
              <p className="text-sm opacity-90 mt-1">Escaneie o QR Code ou copie o código abaixo. A confirmação é automática.</p>
              <div className="text-2xl font-bold mt-3">{brl(Number(order.total))}</div>
            </div>

            <div className="mt-4 bg-card rounded-2xl p-5 shadow-card">
              {order.pix_qr_code_base64 ? (
                <div className="grid place-items-center">
                  <img src={`data:image/png;base64,${order.pix_qr_code_base64}`} alt="QR Code Pix" className="w-64 h-64 rounded-xl border border-border" />
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">QR Code indisponível</div>
              )}

              <div className="mt-4">
                <label className="text-xs font-medium text-muted-foreground">Pix Copia e Cola</label>
                <textarea
                  readOnly
                  value={order.pix_qr_code ?? ""}
                  className="mt-1 w-full h-20 px-3 py-2 rounded-xl bg-muted border border-border text-xs font-mono outline-none resize-none"
                  onFocus={(e) => e.target.select()}
                />
                <button onClick={copyCode} className="mt-2 w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
                  <Copy className="h-4 w-4" /> Copiar código Pix
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 justify-center text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Aguardando confirmação do pagamento...
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">Pedido <span className="font-mono">#{order.id.slice(0, 8)}</span> · Pagamento processado por Mercado Pago</p>
          </>
        )}
      </div>
    </StoreLayout>
  );
}
