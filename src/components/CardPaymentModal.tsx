import { useEffect, useMemo, useRef, useState } from "react";
import {
  CreditCard,
  Loader2,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  createCardPayment,
  type CreateCardInput,
  type CreateCardResult,
} from "@/lib/mercadopago";
import { toast } from "sonner";
import mpIcon from "@/assets/mercadopago-icon.png";

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

const MP_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY as
  | string
  | undefined;
const SDK_URL = "https://sdk.mercadopago.com/js/v2";

let sdkPromise: Promise<void> | null = null;
function loadMpSdk() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.MercadoPago) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Falha ao carregar SDK Mercado Pago"));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

const onlyDigits = (v: string) => v.replace(/\D/g, "");

const formatCard = (v: string) =>
  onlyDigits(v)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
const formatExp = (v: string) => {
  const d = onlyDigits(v).slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
};
const formatCpf = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (result: CreateCardResult) => void;
  payload: Omit<CreateCardInput, "card">;
};

export function CardPaymentModal({ open, onClose, onSuccess, payload }: Props) {
  const total = payload.totals.total;
  const SANDBOX = !MP_PUBLIC_KEY;
  const [mp, setMp] = useState<any>(null);
  const [sdkErr, setSdkErr] = useState<string | null>(null);

  const [card, setCard] = useState({
    number: "",
    name: "",
    exp: "",
    cvv: "",
    doc: "",
    installments: 1,
  });
  const [pmId, setPmId] = useState<string | null>(null);
  const [issuerId, setIssuerId] = useState<string | null>(null);
  const [brand, setBrand] = useState<{ name: string; thumb: string } | null>(
    null,
  );
  const [installmentsList, setInstallmentsList] = useState<
    Array<{ installments: number; recommended_message: string }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const lastBin = useRef<string>("");

  // Load SDK (somente fora do sandbox)
  useEffect(() => {
    if (!open || SANDBOX) return;
    loadMpSdk()
      .then(() =>
        setMp(new window.MercadoPago!(MP_PUBLIC_KEY!, { locale: "pt-BR" })),
      )
      .catch((e) => setSdkErr(e.message));
  }, [open, SANDBOX]);

  // Detect brand + installments by BIN
  useEffect(() => {
    if (!mp) return;
    const digits = onlyDigits(card.number);
    const bin = digits.slice(0, 8);
    if (bin.length < 6) {
      setPmId(null);
      setBrand(null);
      setInstallmentsList([]);
      return;
    }
    if (bin === lastBin.current) return;
    lastBin.current = bin;

    (async () => {
      try {
        const pm = await mp.getPaymentMethods({ bin });
        const m = pm?.results?.[0];
        if (!m) return;
        setPmId(m.id);
        setBrand({ name: m.name, thumb: m.thumb });

        const inst = await mp.getInstallments({
          amount: String(total.toFixed(2)),
          bin,
          paymentTypeId: "credit_card",
        });
        const list = inst?.[0]?.payer_costs ?? [];
        setInstallmentsList(list);
        if (
          list.length &&
          !list.find((x: any) => x.installments === card.installments)
        ) {
          setCard((c) => ({ ...c, installments: list[0].installments }));
        }
        const issuers = inst?.[0]?.issuer ?? null;
        if (issuers?.id) setIssuerId(String(issuers.id));
      } catch (e) {
        console.warn("[mp] bin lookup falhou", e);
      }
    })();
  }, [card.number, mp, total]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSubmit = useMemo(() => {
    const baseFilled =
      onlyDigits(card.number).length >= 13 &&
      card.name.trim().length >= 2 &&
      onlyDigits(card.exp).length === 4 &&
      onlyDigits(card.cvv).length >= 3 &&
      onlyDigits(card.doc).length === 11;
    if (SANDBOX) return baseFilled && !submitting;
    return mp && pmId && baseFilled && !submitting;
  }, [SANDBOX, mp, pmId, card, submitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      // SANDBOX: pula geração de token, manda direto pro backend que aprova auto
      if (SANDBOX) {
        const result = await createCardPayment({
          ...payload,
          card: {
            token: "SANDBOX_TOKEN",
            payment_method_id: "sandbox",
            installments: card.installments,
            payer: {
              identification: { type: "CPF", number: onlyDigits(card.doc) },
            },
          },
        });
        toast.success("Pagamento simulado com sucesso! 🎉");
        onSuccess(result);
        return;
      }

      const [mm, yy] = card.exp.split("/");
      const tokenRes = await mp.createCardToken({
        cardNumber: onlyDigits(card.number),
        cardholderName: card.name.trim(),
        cardExpirationMonth: mm,
        cardExpirationYear: `20${yy}`,
        securityCode: onlyDigits(card.cvv),
        identificationType: "CPF",
        identificationNumber: onlyDigits(card.doc),
      });
      if (!tokenRes?.id)
        throw new Error("Não foi possível validar o cartão. Confira os dados.");

      const result = await createCardPayment({
        ...payload,
        card: {
          token: tokenRes.id,
          payment_method_id: pmId!,
          issuer_id: issuerId ?? undefined,
          installments: card.installments,
          payer: {
            identification: { type: "CPF", number: onlyDigits(card.doc) },
          },
        },
      });

      if (result.status === "approved") {
        toast.success("Pagamento aprovado! 🎉");
        onSuccess(result);
      } else if (result.status === "pending") {
        toast.message("Pagamento em análise. Avisaremos por WhatsApp.");
        onSuccess(result);
      } else {
        setErrorMsg(
          detailMsg(result.status_detail) ||
            "Pagamento recusado pelo emissor. Tente outro cartão.",
        );
      }
    } catch (e: any) {
      const msg = e?.message || String(e);
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full gradient-primary grid place-items-center">
              <CreditCard className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Pagamento com cartão</h2>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" /> Conexão segura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted grid place-items-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sdkErr && !SANDBOX && (
          <div className="m-5 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {sdkErr}
          </div>
        )}

        {SANDBOX && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 text-xs text-amber-900 dark:text-amber-200">
            <div className="font-bold flex items-center gap-1">
              🧪 MODO SANDBOX (TESTE)
            </div>
            <div className="mt-1">
              Mercado Pago não configurado. Qualquer cartão será aceito e o
              pagamento será aprovado automaticamente para testar as
              notificações.
            </div>
          </div>
        )}

        {/* Card preview */}
        <div className="px-5 pt-5">
          <div className="relative rounded-2xl p-5 text-white shadow-elegant overflow-hidden bg-gradient-to-br from-primary via-rose to-primary/70">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="relative flex items-start justify-between">
              <div className="w-10 h-7 rounded-md bg-yellow-300/80 border border-yellow-200/50" />
              {brand?.thumb && (
                <img
                  src={brand.thumb}
                  alt={brand.name}
                  className="h-8 w-auto bg-white/95 rounded p-1"
                />
              )}
            </div>
            <div className="relative mt-6 font-mono text-lg tracking-widest">
              {(card.number || "•••• •••• •••• ••••")
                .padEnd(19, "•")
                .slice(0, 19)}
            </div>
            <div className="relative mt-3 flex justify-between text-[11px] uppercase opacity-90">
              <div>
                <div className="opacity-70 text-[9px]">Titular</div>
                <div className="font-semibold tracking-wide truncate max-w-[180px]">
                  {card.name || "NOME NO CARTÃO"}
                </div>
              </div>
              <div>
                <div className="opacity-70 text-[9px]">Validade</div>
                <div className="font-semibold tracking-wide">
                  {card.exp || "MM/AA"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <Field
            label="Número do cartão"
            value={card.number}
            onChange={(v) => setCard({ ...card, number: formatCard(v) })}
            placeholder="0000 0000 0000 0000"
            inputMode="numeric"
            autoComplete="cc-number"
          />
          <Field
            label="Nome impresso no cartão"
            value={card.name}
            onChange={(v) => setCard({ ...card, name: v.toUpperCase() })}
            placeholder="COMO ESTÁ NO CARTÃO"
            autoComplete="cc-name"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Validade"
              value={card.exp}
              onChange={(v) => setCard({ ...card, exp: formatExp(v) })}
              placeholder="MM/AA"
              inputMode="numeric"
              autoComplete="cc-exp"
            />
            <Field
              label="CVV"
              value={card.cvv}
              onChange={(v) =>
                setCard({ ...card, cvv: onlyDigits(v).slice(0, 4) })
              }
              placeholder="123"
              inputMode="numeric"
              autoComplete="cc-csc"
            />
          </div>
          <Field
            label="CPF do titular"
            value={card.doc}
            onChange={(v) => setCard({ ...card, doc: formatCpf(v) })}
            placeholder="000.000.000-00"
            inputMode="numeric"
          />

          {installmentsList.length > 0 && (
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                Parcelas
              </span>
              <select
                value={card.installments}
                onChange={(e) =>
                  setCard({ ...card, installments: Number(e.target.value) })
                }
                className="mt-1 w-full h-11 px-3 rounded-xl bg-muted/70 border border-border text-foreground outline-none focus:ring-2 focus:ring-primary/50"
              >
                {installmentsList.map((i) => (
                  <option key={i.installments} value={i.installments}>
                    {i.recommended_message}
                  </option>
                ))}
              </select>
            </label>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "w-full h-12 rounded-full font-semibold flex items-center justify-center gap-2 transition-all",
              canSubmit
                ? "gradient-primary text-primary-foreground active:scale-95"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Pagar {brl(total)}
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 pt-1">
            <img
              src={mpIcon}
              alt="Mercado Pago"
              className="h-4 w-4 object-contain"
            />
            <span className="text-[10px] text-muted-foreground">
              Pagamento criptografado por{" "}
              <span className="font-semibold text-foreground">
                Mercado Pago
              </span>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "text";
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="mt-1 w-full h-11 px-3 rounded-xl bg-muted/70 border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 focus:bg-background transition-all"
      />
    </label>
  );
}

function detailMsg(detail?: string) {
  if (!detail) return null;
  const map: Record<string, string> = {
    cc_rejected_insufficient_amount: "Cartão sem limite suficiente.",
    cc_rejected_bad_filled_card_number: "Número do cartão incorreto.",
    cc_rejected_bad_filled_date: "Data de validade incorreta.",
    cc_rejected_bad_filled_security_code: "CVV incorreto.",
    cc_rejected_bad_filled_other: "Confira os dados do cartão.",
    cc_rejected_call_for_authorize:
      "Você precisa autorizar o pagamento com o banco emissor.",
    cc_rejected_high_risk:
      "Pagamento recusado por análise de risco. Tente outro cartão ou Pix.",
    cc_rejected_other_reason: "Pagamento recusado. Tente outro cartão.",
  };
  return map[detail] ?? null;
}
