import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, selectCartTotals, selectCurrentCustomer } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { StoreLayout } from "@/components/StoreLayout";
import { brl } from "@/lib/format";
import {
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Banknote,
  QrCode,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { playBeep } from "@/lib/sound";
import { createPixPayment } from "@/lib/mercadopago";
import { CardPaymentModal } from "@/components/CardPaymentModal";
import mpIcon from "@/assets/mercadopago-icon.png";

export const Route = createFileRoute("/checkout")({
  component: Page,
});

const steps = ["Seus dados", "Pagamento", "Revisão"];

function Page() {
  const navigate = useNavigate();
  const { cart, settings, placeOrder, products } = useStore();
  const customer = useStore(selectCurrentCustomer);
  const totals = useStore(useShallow(selectCartTotals));
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [cardModal, setCardModal] = useState<
    null | Parameters<typeof CardPaymentModal>[0]["payload"]
  >(null);
  const [form, setForm] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    payment: "pix" as "pix" | "card" | "cash",
    notes: "",
  });

  if (cart.length === 0 && step < 4) {
    return (
      <StoreLayout>
        <div className="text-center py-20">
          <p>Carrinho vazio.</p>
          <Link to="/" className="text-primary font-semibold">
            Voltar
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const next = () => {
    if (step === 0) {
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim())
        return toast.error("Preencha todos os campos");
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
        return toast.error("E-mail inválido");
      const digits = form.phone.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 13)
        return toast.error("WhatsApp inválido — informe DDD + número");
    }
    setStep((s) => s + 1);
  };

  const finish = async () => {
    if (submitting) return;

    // Pix → Mercado Pago (gera QR Code real)
    if (form.payment === "pix") {
      setSubmitting(true);
      try {
        const shipping = 0;
        const total = Math.max(0, totals.subtotal - totals.discount);
        const result = await createPixPayment({
          customer: { name: form.name, email: form.email, phone: form.phone },
          items: cart.map((it) => {
            const p = products.find((x) => x.id === it.productId);
            return {
              productId: it.productId,
              name: p?.name ?? "Produto",
              price: p?.price ?? 0,
              quantity: it.quantity,
              image: (p as any)?.image,
            };
          }),
          totals: {
            subtotal: totals.subtotal,
            discount: totals.discount,
            shipping,
            total,
          },
          delivery: "retirada",
          address: settings.address,
          notes: form.notes,
        });
        playBeep();
        navigate({ to: "/checkout/pix/$id", params: { id: result.order_id } });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Falha ao gerar Pix");
        setSubmitting(false);
      }
      return;
    }

    const shipping = 0;
    const total = Math.max(0, totals.subtotal - totals.discount);
    const sharedPayload = {
      customer: { name: form.name, email: form.email, phone: form.phone },
      items: cart.map((it) => {
        const p = products.find((x) => x.id === it.productId);
        return {
          productId: it.productId,
          name: p?.name ?? "Produto",
          price: p?.price ?? 0,
          quantity: it.quantity,
          image: (p as any)?.image,
        };
      }),
      totals: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping,
        total,
      },
      delivery: "retirada" as const,
      address: settings.address,
      notes: form.notes,
    };

    // Cartão → abre modal próprio (Checkout Transparente Mercado Pago)
    if (form.payment === "card") {
      setCardModal(sharedPayload);
      return;
    }

    // Dinheiro → fluxo local
    const order = placeOrder({
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      address: settings.address,
      paymentMethod: form.payment,
      deliveryMethod: "retirada",
      notes: form.notes,
    });
    playBeep();
    toast.success("Pedido realizado!");
    navigate({ to: "/pedido/$id", params: { id: order.id } });
  };

  const paymentOptions: {
    id: "pix" | "card" | "cash";
    label: string;
    sub: string;
    icon: typeof QrCode;
    enabled: boolean;
  }[] = [
    {
      id: "pix",
      label: "Pix",
      sub: "Aprovação imediata · 5% off",
      icon: QrCode,
      enabled: settings.acceptPix,
    },
    {
      id: "card",
      label: "Cartão de crédito",
      sub: "Em até 3x sem juros",
      icon: CreditCard,
      enabled: settings.acceptCard,
    },
    {
      id: "cash",
      label: "Dinheiro na retirada",
      sub: "Pague ao retirar no ateliê",
      icon: Banknote,
      enabled: settings.acceptCash,
    },
  ];

  return (
    <StoreLayout>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Link
          to="/carrinho"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>

        {/* Stepper */}
        <ol className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full grid place-items-center text-xs font-bold shrink-0",
                  i <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <div
                className={cn(
                  "h-0.5 flex-1 rounded",
                  i < step ? "bg-primary" : "bg-muted",
                )}
              />
            </li>
          ))}
        </ol>

        <div className="bg-card rounded-2xl p-5 shadow-card">
          {step === 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold">Seus dados</h2>
              <Field
                label="Nome completo"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Field
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
              <Field
                label="WhatsApp (com DDD) — obrigatório para avisos"
                type="tel"
                value={form.phone}
                placeholder="(11) 91234-5678"
                onChange={(v) => setForm({ ...form, phone: v })}
              />
              <p className="text-[11px] text-muted-foreground -mt-1">
                Enviaremos o lembrete de pagamento, confirmação de compra
                aprovada e aviso quando o pedido estiver pronto pelo WhatsApp.
              </p>

              <div className="rounded-xl bg-accent/40 border border-accent p-3 text-sm mt-2">
                <div className="font-semibold text-accent-foreground mb-0.5">
                  📍 Retirada no ateliê
                </div>
                <div className="text-muted-foreground">{settings.address}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Avisaremos pelo WhatsApp quando o pedido estiver pronto para
                  retirada.
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">
                  Observações (opcional)
                </span>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  maxLength={300}
                  placeholder='Ex.: "É um presente, embale com cuidado" ou "Vou retirar na sexta de tarde"'
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-muted/70 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 focus:bg-background transition-all resize-none"
                />
                <span className="text-[10px] text-muted-foreground">
                  {form.notes.length}/300
                </span>
              </label>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="font-semibold">Forma de pagamento</h2>
              {paymentOptions
                .filter((p) => p.enabled)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setForm({ ...form, payment: p.id })}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                      form.payment === p.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-muted grid place-items-center">
                      <p.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{p.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.sub}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2",
                        form.payment === p.id
                          ? "border-primary bg-primary"
                          : "border-border",
                      )}
                    />
                  </button>
                ))}
              <div className="mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-muted/50 border border-border/50">
                <img
                  src={mpIcon}
                  alt="Mercado Pago"
                  className="h-5 w-5 object-contain"
                />
                <span className="text-[11px] text-muted-foreground">
                  Pagamentos processados por{" "}
                  <span className="font-semibold text-foreground">
                    Mercado Pago
                  </span>{" "}
                  · 100% seguro
                </span>
              </div>
            </div>
          )}
          {step === 2 &&
            (() => {
              const total = Math.max(0, totals.subtotal - totals.discount);
              return (
                <div className="space-y-3">
                  <h2 className="font-semibold">Revise seu pedido</h2>
                  <Row label="Cliente" value={form.name} />
                  <Row
                    label="Contato"
                    value={`${form.email} · ${form.phone}`}
                  />
                  <Row label="Retirada" value="No ateliê" />
                  <Row label="Local" value={settings.address} />
                  {form.notes.trim() && (
                    <Row label="Observações" value={form.notes} />
                  )}
                  <Row
                    label="Pagamento"
                    value={
                      paymentOptions.find((p) => p.id === form.payment)
                        ?.label || ""
                    }
                  />
                  <hr className="border-border" />
                  <Row label="Subtotal" value={brl(totals.subtotal)} />
                  {totals.discount > 0 && (
                    <Row label="Desconto" value={`− ${brl(totals.discount)}`} />
                  )}
                  <div className="flex justify-between font-bold text-lg pt-1">
                    <span>Total</span>
                    <span className="text-primary">{brl(total)}</span>
                  </div>
                </div>
              );
            })()}
        </div>

        <div className="flex gap-3 mt-4">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 h-12 rounded-full border-2 border-border font-semibold"
            >
              Voltar
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={next}
              className="flex-1 h-12 rounded-full gradient-primary text-primary-foreground font-semibold active:scale-95 transition-all"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={submitting}
              className="flex-1 h-12 rounded-full gradient-primary text-primary-foreground font-semibold active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Gerando Pix...
                </>
              ) : form.payment === "pix" ? (
                "Pagar com Pix"
              ) : (
                "Confirmar pedido"
              )}
            </button>
          )}
        </div>
      </div>

      {cardModal && (
        <CardPaymentModal
          open={!!cardModal}
          payload={cardModal}
          onClose={() => setCardModal(null)}
          onSuccess={(result) => {
            setCardModal(null);
            playBeep();
            navigate({ to: "/pedido/$id", params: { id: result.order_id } });
          }}
        />
      )}
    </StoreLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 px-3 rounded-xl bg-muted/70 border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 focus:bg-background transition-all"
      />
    </label>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
