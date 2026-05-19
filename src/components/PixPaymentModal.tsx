import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Copy,
  Loader2,
  X,
  FlaskConical,
} from "lucide-react";
import { toast } from "sonner";
import { brl } from "@/lib/format";
import {
  createPixPayment,
  fetchOrder,
  isSandboxOrder,
  simulateApprove,
  type CreatePixInput,
  type CreatePixResult,
  type OrderRow,
} from "@/lib/mercadopago";
import { playBeep } from "@/lib/sound";
import pixIcon from "@/assets/pix-icon.png";

type Props = {
  open: boolean;
  payload: CreatePixInput | null;
  onClose: () => void;
};

export function PixPaymentModal({ open, payload, onClose }: Props) {
  const navigate = useNavigate();
  const createRequestId = useRef(0);
  const [creating, setCreating] = useState(false);
  const [pix, setPix] = useState<CreatePixResult | null>(null);
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  // 1) Cria o Pix quando o modal abre
  useEffect(() => {
    if (!open || !payload) return;
    const requestId = createRequestId.current + 1;
    createRequestId.current = requestId;
    setCreating(true);
    setError(null);
    setPix(null);
    setOrder(null);
    createPixPayment(payload)
      .then((r) => {
        if (createRequestId.current !== requestId) return;
        setPix(r);
      })
      .catch((e) => {
        if (createRequestId.current !== requestId) return;
        setError(e instanceof Error ? e.message : "Falha ao gerar Pix");
      })
      .finally(() => {
        if (createRequestId.current === requestId) setCreating(false);
      });
  }, [open, payload]);

  // 2) Polling do status
  useEffect(() => {
    if (!open || !pix) return;
    let cancelled = false;
    let timer: any;

    const tick = async () => {
      try {
        const o = await fetchOrder(pix.order_id);
        if (cancelled) return;
        if (!o) {
          timer = setTimeout(tick, 4000);
          return;
        }
        setOrder(o);
        if (o.payment_status === "approved") {
          playBeep();
          toast.success("Pagamento aprovado! 🎉");
          setTimeout(() => {
            if (cancelled) return;
            onClose();
            navigate({ to: "/pedido/$id", params: { id: o.id } });
          }, 1500);
          return;
        }
        if (["rejected", "cancelled", "expired"].includes(o.payment_status)) {
          return;
        }
        timer = setTimeout(tick, 4000);
      } catch {
        timer = setTimeout(tick, 6000);
      }
    };
    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [open, pix, navigate, onClose]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      createRequestId.current += 1;
      setPix(null);
      setOrder(null);
      setError(null);
      setCreating(false);
    }
  }, [open]);

  const handleSimulate = async () => {
    if (!pix) return;
    setSimulating(true);
    try {
      await simulateApprove(pix.order_id);
      toast.success("Pagamento simulado! Aguardando confirmação...");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSimulating(false);
    }
  };

  const copyCode = () => {
    const code = order?.pix_qr_code ?? pix?.qr_code;
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success("Código Pix copiado!");
  };

  if (!open) return null;

  const status = order?.payment_status ?? "pending";
  const qrCode = order?.pix_qr_code ?? pix?.qr_code ?? "";
  const qrBase64 = order?.pix_qr_code_base64 ?? pix?.qr_code_base64 ?? "";
  const total = order?.total ?? pix?.total ?? 0;
  const sandbox = isSandboxOrder(order ?? (pix ? ({ pix_qr_code: pix.qr_code } as any) : null));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-soft w-full max-w-md my-auto relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5">
          {/* Loading inicial */}
          {creating && !pix && (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-3 text-muted-foreground text-sm">
                Gerando seu Pix...
              </p>
            </div>
          )}

          {/* Erro */}
          {error && !pix && (
            <div className="py-8 text-center">
              <p className="text-destructive font-semibold">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 h-11 rounded-full bg-muted font-semibold"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Aprovado */}
          {pix && status === "approved" && (
            <div className="py-8 text-center">
              <div className="mx-auto h-16 w-16 grid place-items-center rounded-full bg-success/10 text-success mb-3">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold">Pagamento aprovado!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Redirecionando para seu pedido...
              </p>
            </div>
          )}

          {/* Rejeitado/expirado */}
          {pix && ["rejected", "cancelled", "expired"].includes(status) && (
            <div className="py-8 text-center">
              <h2 className="text-lg font-bold text-destructive">
                Pagamento {status === "expired" ? "expirado" : "não aprovado"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Você pode tentar novamente.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 h-11 rounded-full gradient-primary text-primary-foreground font-semibold"
              >
                Voltar
              </button>
            </div>
          )}

          {/* Pendente — QR + copia/cola */}
          {pix && status === "pending" && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <img src={pixIcon} alt="Pix" className="h-7 w-7 object-contain" />
                <div>
                  <h2 className="font-bold text-lg leading-tight">
                    Pague com Pix
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {brl(Number(total))} · Confirmação automática
                  </p>
                </div>
              </div>

              {sandbox && (
                <div className="mb-3 rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                    <FlaskConical className="h-3 w-3" /> MODO SANDBOX
                  </div>
                  <button
                    onClick={handleSimulate}
                    disabled={simulating}
                    className="mt-2 w-full h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {simulating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" /> Simulando...
                      </>
                    ) : (
                      "Simular pagamento aprovado"
                    )}
                  </button>
                </div>
              )}

              {qrBase64 ? (
                <div className="grid place-items-center bg-white rounded-xl p-3">
                  <img
                    src={`data:image/png;base64,${qrBase64}`}
                    alt="QR Code Pix"
                    className="w-56 h-56"
                  />
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  QR Code indisponível
                </div>
              )}

              <div className="mt-3">
                <label className="text-xs font-medium text-muted-foreground">
                  Pix Copia e Cola
                </label>
                <textarea
                  readOnly
                  value={qrCode}
                  className="mt-1 w-full h-20 px-3 py-2 rounded-xl bg-muted border border-border text-xs font-mono outline-none resize-none"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  onClick={copyCode}
                  className="mt-2 w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4" /> Copiar código Pix
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 justify-center text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                Aguardando confirmação do pagamento...
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
