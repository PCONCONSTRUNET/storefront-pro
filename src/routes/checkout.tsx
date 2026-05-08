import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, selectCartTotals, selectCurrentCustomer } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { StoreLayout } from "@/components/StoreLayout";
import { brl } from "@/lib/format";
import { CheckCircle2, ChevronLeft, CreditCard, Banknote, QrCode, Truck, Store } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { playBeep } from "@/lib/sound";
import mpIcon from "@/assets/mercadopago-icon.png";


export const Route = createFileRoute("/checkout")({
  component: Page,
});

const steps = ["Seus dados", "Entrega", "Pagamento", "Revisão"];

function Page() {
  const navigate = useNavigate();
  const { cart, settings, placeOrder } = useStore();
  const customer = useStore(selectCurrentCustomer);
  const totals = useStore(useShallow(selectCartTotals));
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: customer?.name || "", email: customer?.email || "", phone: customer?.phone || "",
    address: customer?.address || "", payment: "pix" as "pix" | "card" | "cash",
    delivery: "entrega" as "entrega" | "retirada",
    notes: "",
  });

  if (cart.length === 0 && step < 4) {
    return (
      <StoreLayout><div className="text-center py-20">
        <p>Carrinho vazio.</p>
        <Link to="/" className="text-primary font-semibold">Voltar</Link>
      </div></StoreLayout>
    );
  }

  const next = () => {
    if (step === 0 && (!form.name || !form.email || !form.phone)) return toast.error("Preencha todos os campos");
    if (step === 1 && form.delivery === "entrega" && !form.address) return toast.error("Informe o endereço de entrega");
    setStep(s => s + 1);
  };

  const finish = () => {
    const order = placeOrder({
      customerName: form.name, customerEmail: form.email, customerPhone: form.phone,
      address: form.address, paymentMethod: form.payment,
      deliveryMethod: form.delivery, notes: form.notes,
    });
    playBeep();
    toast.success("Pedido realizado!");
    navigate({ to: "/pedido/$id", params: { id: order.id } });
  };

  const paymentOptions: { id: "pix" | "card" | "cash"; label: string; sub: string; icon: typeof QrCode; enabled: boolean }[] = [
    { id: "pix", label: "Pix", sub: "Aprovação imediata · 5% off", icon: QrCode, enabled: settings.acceptPix },
    { id: "card", label: "Cartão de crédito", sub: "Em até 3x sem juros", icon: CreditCard, enabled: settings.acceptCard },
    { id: "cash", label: "Dinheiro na entrega", sub: "Pague ao receber", icon: Banknote, enabled: settings.acceptCash },
  ];

  return (
    <StoreLayout>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Link to="/carrinho" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>

        {/* Stepper */}
        <ol className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2 flex-1">
              <div className={cn("w-7 h-7 rounded-full grid place-items-center text-xs font-bold shrink-0",
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <div className={cn("h-0.5 flex-1 rounded", i < step ? "bg-primary" : "bg-muted")} />
            </li>
          ))}
        </ol>

        <div className="bg-card rounded-2xl p-5 shadow-card">
          {step === 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold">Seus dados</h2>
              <Field label="Nome completo" value={form.name} onChange={v => setForm({ ...form, name: v })} />
              <Field label="E-mail" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
              <Field label="Telefone / WhatsApp" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="font-semibold">Como você quer receber?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {([
                  { id: "entrega", label: "Entrega no endereço", sub: `Frete ${brl(settings.shippingFee)}`, icon: Truck },
                  { id: "retirada", label: "Retirar no ateliê", sub: "Sem custo de frete", icon: Store },
                ] as const).map(opt => (
                  <button key={opt.id} type="button" onClick={() => setForm({ ...form, delivery: opt.id })}
                    className={cn("flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                      form.delivery === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                    <div className="w-10 h-10 rounded-full bg-muted grid place-items-center shrink-0"><opt.icon className="h-5 w-5 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{opt.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{opt.sub}</div>
                    </div>
                    <div className={cn("w-5 h-5 rounded-full border-2 shrink-0", form.delivery === opt.id ? "border-primary bg-primary" : "border-border")} />
                  </button>
                ))}
              </div>

              {form.delivery === "entrega" ? (
                <Field label="Endereço completo (rua, número, bairro, cidade)" value={form.address} onChange={v => setForm({ ...form, address: v })} />
              ) : (
                <div className="rounded-xl bg-accent/40 border border-accent p-3 text-sm">
                  <div className="font-semibold text-accent-foreground mb-0.5">📍 Retirada no ateliê</div>
                  <div className="text-muted-foreground">{settings.address}</div>
                  <div className="text-xs text-muted-foreground mt-1">Avisaremos pelo WhatsApp quando o pedido estiver pronto.</div>
                </div>
              )}

              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Observações (opcional)</span>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  maxLength={300}
                  placeholder='Ex.: "É um presente, não inclua nota fiscal" ou "Entregar depois das 18h"'
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-muted/70 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 focus:bg-background transition-all resize-none"
                />
                <span className="text-[10px] text-muted-foreground">{form.notes.length}/300</span>
              </label>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <h2 className="font-semibold">Forma de pagamento</h2>
              {paymentOptions.filter(p => p.enabled).map(p => (
                <button key={p.id} onClick={() => setForm({ ...form, payment: p.id })}
                  className={cn("w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                    form.payment === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                  <div className="w-10 h-10 rounded-full bg-muted grid place-items-center"><p.icon className="h-5 w-5 text-primary" /></div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{p.label}</div>
                    <div className="text-xs text-muted-foreground">{p.sub}</div>
                  </div>
                  <div className={cn("w-5 h-5 rounded-full border-2", form.payment === p.id ? "border-primary bg-primary" : "border-border")} />
                </button>
              ))}
            </div>
          )}
          {step === 3 && (() => {
            const shipping = form.delivery === "retirada" ? 0 : totals.shipping;
            const total = Math.max(0, totals.subtotal - totals.discount) + shipping;
            return (
              <div className="space-y-3">
                <h2 className="font-semibold">Revise seu pedido</h2>
                <Row label="Cliente" value={form.name} />
                <Row label="Contato" value={`${form.email} · ${form.phone}`} />
                <Row label="Entrega" value={form.delivery === "retirada" ? "Retirar no ateliê" : "Entrega no endereço"} />
                <Row label={form.delivery === "retirada" ? "Local" : "Endereço"} value={form.delivery === "retirada" ? settings.address : form.address} />
                {form.notes.trim() && <Row label="Observações" value={form.notes} />}
                <Row label="Pagamento" value={paymentOptions.find(p => p.id === form.payment)?.label || ""} />
                <hr className="border-border" />
                <Row label="Subtotal" value={brl(totals.subtotal)} />
                {totals.discount > 0 && <Row label="Desconto" value={`− ${brl(totals.discount)}`} />}
                <Row label="Frete" value={shipping === 0 ? "Grátis" : brl(shipping)} />
                <div className="flex justify-between font-bold text-lg pt-1"><span>Total</span><span className="text-primary">{brl(total)}</span></div>
              </div>
            );
          })()}
        </div>

        <div className="flex gap-3 mt-4">
          {step > 0 && <button onClick={() => setStep(s => s - 1)} className="flex-1 h-12 rounded-full border-2 border-border font-semibold">Voltar</button>}
          {step < 3 ? (
            <button onClick={next} className="flex-1 h-12 rounded-full gradient-primary text-primary-foreground font-semibold active:scale-95 transition-all">Continuar</button>
          ) : (
            <button onClick={finish} className="flex-1 h-12 rounded-full gradient-primary text-primary-foreground font-semibold active:scale-95 transition-all">Confirmar pedido</button>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="mt-1 w-full h-11 px-3 rounded-xl bg-muted/70 border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 focus:bg-background transition-all" />
    </label>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-sm gap-3"><span className="text-muted-foreground shrink-0">{label}</span><span className="font-medium text-right">{value}</span></div>;
}
