import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchInstallmentConfig } from "@/lib/mercadopago";
import { useStore, selectCartTotals, selectCurrentCustomer } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { StoreLayout } from "@/components/StoreLayout";
import { CorreiosLogo } from "@/components/CorreiosLogo";
import { brl } from "@/lib/format";
import {
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  
  QrCode,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { playBeep } from "@/lib/sound";
import { sendOrderConfirmationEmail } from "@/lib/emails";
import { calculateShipping, type ShippingQuote } from "@/lib/superfrete";

import { CardPaymentModal } from "@/components/CardPaymentModal";
import { PixPaymentModal } from "@/components/PixPaymentModal";
import type { CreatePixInput } from "@/lib/mercadopago";
import mpIcon from "@/assets/mercadopago-icon.png";
import pixIcon from "@/assets/pix-icon.png";
import cardIcon from "@/assets/card-icon.png";

export const Route = createFileRoute("/checkout")({
  component: Page,
});

const steps = ["Seus dados", "Pagamento", "Revisão"];

function Page() {
  const navigate = useNavigate();
  const { cart, settings, placeOrder, products, appliedCoupon, coupons } = useStore();
  const customer = useStore(selectCurrentCustomer);
  const totals = useStore(useShallow(selectCartTotals));
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [cardModal, setCardModal] = useState<
    null | Parameters<typeof CardPaymentModal>[0]["payload"]
  >(null);
  const [pixModal, setPixModal] = useState<CreatePixInput | null>(null);
  const [showCardMaintenance, setShowCardMaintenance] = useState(false);
  const [form, setForm] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    payment: "pix" as "pix" | "card" | "cash",
    deliveryMethod: (new URLSearchParams(window.location.search).get("delivery") === "entrega" ? "entrega" : "retirada") as "retirada" | "entrega",
    cep: customer?.addressData?.cep || "",
    street: customer?.addressData?.street || "",
    number: customer?.addressData?.number || "",
    complement: customer?.addressData?.complement || "",
    neighborhood: customer?.addressData?.neighborhood || "",
    city: customer?.addressData?.city || "",
    state: customer?.addressData?.state || "",
    cpf: customer?.addressData?.cpf || "",
    notes: "",
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingQuote[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingQuote | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [installmentInfo, setInstallmentInfo] = useState<{
    max: number;
    maxSemJuros: number;
  }>({ max: 1, maxSemJuros: 1 });

  useEffect(() => {
    fetchInstallmentConfig().then((cfg) => {
      const max = Math.max(1, cfg.max_installments || 1);
      let maxSemJuros = 1;
      for (let n = 1; n <= max; n++) {
        const fee = Number(cfg.installment_fees?.[String(n)] ?? 0);
        if (fee === 0) maxSemJuros = n;
      }
      setInstallmentInfo({ max, maxSemJuros });
    });
  }, []);

  useEffect(() => {
    if (form.deliveryMethod !== "entrega") return;
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length === 8) {
      setIsCalculatingShipping(true);
      calculateShipping(cep, totals.subtotal)
        .then(options => {
          setShippingOptions(options);
          if (options.length > 0) {
            setSelectedShipping(options[0]);
          } else {
            setSelectedShipping(null);
          }
        })
        .finally(() => setIsCalculatingShipping(false));
    } else {
      setShippingOptions([]);
      setSelectedShipping(null);
    }
  }, [form.cep, form.deliveryMethod, totals.subtotal]);

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
      
      if (form.deliveryMethod === "entrega" && (!form.cep || !form.street || !form.number || !form.neighborhood || !form.city || !form.state || !form.cpf)) {
        return toast.error("Preencha todos os campos do endereço e o CPF para entrega.");
      }
    }
    setStep((s) => s + 1);
  };

  const coupon = coupons.find(c => c.code === appliedCoupon);
  const isAutoFreeShipping = settings.freeShippingAutoActive && (totals.subtotal >= (settings.freeShippingAutoMinAmount || 0));

  let computedShipping = 0;
  if (form.deliveryMethod === "entrega") {
    if (coupon?.type === "free_shipping" || coupon?.freeShipping || isAutoFreeShipping) {
      computedShipping = 0;
    } else if (shippingOptions.length > 0 && selectedShipping) {
      computedShipping = selectedShipping.discountPrice;
    } else if (settings.shippingFeeActive !== false) {
      computedShipping = settings.shippingFee;
    } else {
      computedShipping = 0; // se o frete for nulo, ainda cobraremos zero temporariamente, mas não mostramos grátis
    }
  }

  const finish = async () => {
    if (submitting) return;

    const total = Math.max(0, totals.subtotal - totals.discount) + computedShipping;
    
    const addressStr = form.deliveryMethod === "entrega" 
      ? `${form.street}, ${form.number}${form.complement ? ` - ${form.complement}` : ''}, ${form.neighborhood}, ${form.city} - ${form.state}, CEP: ${form.cep}`
      : settings.address;

    const sharedPayload = {
      customer: { name: form.name, email: form.email, phone: form.phone, document: form.deliveryMethod === "entrega" ? form.cpf : undefined },
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
        shipping: computedShipping,
        total,
      },
      delivery: form.deliveryMethod,
      address: addressStr,
      notes: form.notes,
    };

    if (saveAddress && customer && form.deliveryMethod === "entrega") {
      useStore.getState().updateCustomer({
        addressData: {
          cep: form.cep,
          street: form.street,
          number: form.number,
          complement: form.complement,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
          cpf: form.cpf,
        }
      });
    }

    // Pix → abre modal com QR + copia e cola + polling
    if (total > 0 && form.payment === "pix") {
      setPixModal(sharedPayload);
      return;
    }

    // Cartão → abre modal próprio (Checkout Transparente Mercado Pago)
    if (total > 0 && form.payment === "card") {
      setCardModal(sharedPayload);
      return;
    }

    // Dinheiro ou pedido Grátis → fluxo local
    const order = placeOrder({
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      customerCpf: form.deliveryMethod === "entrega" ? form.cpf : undefined,
      address: addressStr,
      paymentMethod: form.payment,
      deliveryMethod: form.deliveryMethod,
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
    image?: string;
    enabled: boolean;
  }[] = [
    {
      id: "pix",
      label: "Pix",
      sub: "Aprovação imediata · 5% off",
      icon: QrCode,
      image: pixIcon,
      enabled: settings.acceptPix,
    },
    {
      id: "card",
      label: "Cartão de crédito",
      sub:
        installmentInfo.maxSemJuros > 1
          ? `Em até ${installmentInfo.maxSemJuros}x sem juros · até ${installmentInfo.max}x`
          : `Em até ${installmentInfo.max}x`,
      icon: CreditCard,
      image: cardIcon,
      enabled: settings.acceptCard,
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

              <div className="space-y-2 mt-4">
                <span className="text-xs font-medium text-muted-foreground">Forma de entrega selecionada</span>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left border-primary bg-primary/5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary" />
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        {form.deliveryMethod === "retirada" ? "Retirada no ateliê (Lauro Müller)" : (
                          <>Envio via <CorreiosLogo className="h-4 w-auto" /></>
                        )}
                      </div>
                    </div>
                    <Link to="/carrinho" className="text-xs text-primary underline font-medium">Alterar</Link>
                  </div>
                </div>
              </div>

              {form.deliveryMethod === "retirada" ? (
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
              ) : (
                <div className="space-y-3 mt-4 border border-border rounded-xl p-3 bg-muted/30">
                  <div className="font-semibold text-sm mb-1 flex items-center gap-1.5">Endereço de Entrega <CorreiosLogo className="h-4 w-auto" /></div>
                  <Field
                    label="CPF (Obrigatório para os Correios)"
                    value={form.cpf}
                    placeholder="000.000.000-00"
                    onChange={(v) => setForm({ ...form, cpf: v })}
                  />
                  <Field
                    label="CEP"
                    value={form.cep}
                    placeholder="00000-000"
                    onChange={(v) => {
                      let cep = v.replace(/\D/g, "");
                      if (cep.length > 5) cep = cep.replace(/^(\d{5})(\d)/, "$1-$2");
                      if (cep.length > 9) cep = cep.slice(0, 9);
                      setForm({ ...form, cep });
                    }}
                  />
                  <Field
                    label="Rua / Avenida"
                    value={form.street}
                    onChange={(v) => setForm({ ...form, street: v })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Número"
                      value={form.number}
                      onChange={(v) => setForm({ ...form, number: v })}
                    />
                    <Field
                      label="Complemento"
                      value={form.complement}
                      onChange={(v) => setForm({ ...form, complement: v })}
                    />
                  </div>
                  <Field
                    label="Bairro"
                    value={form.neighborhood}
                    onChange={(v) => setForm({ ...form, neighborhood: v })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Cidade"
                      value={form.city}
                      onChange={(v) => setForm({ ...form, city: v })}
                    />
                    <Field
                      label="Estado (UF)"
                      value={form.state}
                      placeholder="SC"
                      onChange={(v) => setForm({ ...form, state: v })}
                    />
                  </div>
                  
                  {form.cep.replace(/\D/g, "").length === 8 && (
                    <div className="mt-3">
                      <span className="text-xs font-medium text-foreground block mb-1">Opções de Frete</span>
                      {isCalculatingShipping ? (
                        <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Calculando...</div>
                      ) : shippingOptions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          {shippingOptions.map(opt => (
                            <label key={opt.id} className={cn("flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all", selectedShipping?.id === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-background")}>
                              <div className="flex items-center gap-3">
                                <input type="radio" name="shipping" checked={selectedShipping?.id === opt.id} onChange={() => setSelectedShipping(opt)} className="hidden" />
                                <div className={cn("w-4 h-4 rounded-full border-2", selectedShipping?.id === opt.id ? "border-primary bg-primary" : "border-border")} />
                                <div>
                                  <div className="font-semibold text-sm flex items-center gap-2">
                                    {opt.name}
                                    <CorreiosLogo className="h-3 object-contain" />
                                  </div>
                                  <div className="text-[11px] text-muted-foreground">Chega em ~{opt.deliveryTime} dias úteis</div>
                                </div>
                              </div>
                              <div className="font-bold text-sm text-primary">
                                {(coupon?.type === "free_shipping" || coupon?.freeShipping || isAutoFreeShipping) ? "Grátis" : brl(opt.discountPrice)}
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : settings.shippingFeeActive !== false ? (
                        <div className="text-xs text-muted-foreground mt-2">
                          Frete fixo: <span className="font-medium text-foreground">
                            {(coupon?.type === "free_shipping" || coupon?.freeShipping || isAutoFreeShipping) ? "Grátis" : brl(settings.shippingFee)}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-destructive font-semibold mt-2">
                          Informe um CEP válido para calcular
                        </div>
                      )}
                    </div>
                  )}

                  {customer && (
                    <div className="flex items-center gap-2 mt-4">
                      <input 
                        type="checkbox" 
                        id="saveAddress" 
                        checked={saveAddress} 
                        onChange={(e) => setSaveAddress(e.target.checked)} 
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                      />
                      <label htmlFor="saveAddress" className="text-sm font-medium text-foreground select-none cursor-pointer">
                        Salvar este endereço para as próximas compras
                      </label>
                    </div>
                  )}
                </div>
              )}

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
                    onClick={() => {
                      setForm({ ...form, payment: p.id });
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                      form.payment === p.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-muted grid place-items-center overflow-hidden">
                      {p.image ? (
                        <img src={p.image} alt={p.label} className="h-6 w-6 object-contain" />
                      ) : (
                        <p.icon className="h-5 w-5 text-primary" />
                      )}
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
                  <Row label="Entrega" value={form.deliveryMethod === "retirada" ? "Retirada no ateliê" : <span className="flex items-center gap-1">{selectedShipping ? selectedShipping.name : "Correios"} <CorreiosLogo className="h-3.5 w-auto" /></span>} />
                  <Row label={form.deliveryMethod === "retirada" ? "Local" : "Endereço"} value={form.deliveryMethod === "retirada" ? settings.address : `${form.street}, ${form.number} - ${form.city}/${form.state}`} />
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
                  {form.deliveryMethod === "entrega" && (
                    <Row label="Frete" value={computedShipping === 0 ? "Grátis" : brl(computedShipping)} />
                  )}
                  <div className="flex justify-between font-bold text-lg pt-1">
                    <span>Total</span>
                    <span className="text-primary">{brl(total + computedShipping)}</span>
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
                <>
                  <img src={pixIcon} alt="Pix" className="h-5 w-5 object-contain" /> Pagar com Pix
                </>
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
            const p = cardModal;
            setCardModal(null);
            if (result.status === "approved") {
              if (p) {
                useStore.getState().saveRemoteOrder({
                  id: result.order_id,
                  customerName: p.customer.name,
                  customerEmail: p.customer.email,
                  customerPhone: p.customer.phone,
                  items: p.items.map((i) => ({
                    productId: i.productId,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    image: i.image ?? "",
                  })),
                  subtotal: p.totals.subtotal,
                  discount: p.totals.discount,
                  shipping: p.totals.shipping,
                  total: p.totals.total,
                  paymentMethod: "card",
                  deliveryMethod: p.delivery,
                  address: p.address ?? "",
                  notes: p.notes,
                  status: "pago",
                  paidAt: new Date().toISOString(),
                });
                void sendOrderConfirmationEmail({
                  email: p.customer.email,
                  customerName: p.customer.name,
                  orderId: result.order_id,
                  items: p.items.map((i) => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                  })),
                  total: p.totals.total,
                  paymentMethod: "Cartão de crédito",
                });
              }
              useStore.getState().clearCart();
            }
            playBeep();
            navigate({ to: "/pedido/$id", params: { id: result.order_id } });
          }}
        />
      )}

      <PixPaymentModal
        open={!!pixModal}
        payload={pixModal}
        onClose={() => setPixModal(null)}
      />

      {/* Modal de manutenção do cartão */}
      {showCardMaintenance && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setShowCardMaintenance(false)}
        >
          <div
            className="bg-card rounded-3xl p-7 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ícone */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <span className="text-3xl">🔧</span>
              </div>
            </div>

            {/* Título */}
            <h2 className="text-xl font-bold text-center text-foreground mb-2">
              Pagamento com cartão
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-1">
              Em manutenção
            </p>

            {/* Divisor */}
            <hr className="border-border my-4" />

            {/* Mensagem */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-5 text-sm text-center text-foreground">
              Pagamento via cartão está temporariamente indisponível.
              <br />
              <span className="font-semibold text-primary">
                Pague com Pix e ganhe 5% de desconto! 🎉
              </span>
            </div>

            {/* Botão Pix */}
            <button
              onClick={() => {
                setForm((f) => ({ ...f, payment: "pix" }));
                setShowCardMaintenance(false);
              }}
              className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all mb-3"
            >
              <img src={pixIcon} alt="Pix" className="h-5 w-5 object-contain" />
              Pagar com Pix
            </button>

            {/* Fechar */}
            <button
              onClick={() => setShowCardMaintenance(false)}
              className="w-full h-10 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
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
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right flex items-center gap-1">{value}</span>
    </div>
  );
}
