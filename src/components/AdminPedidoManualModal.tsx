/**
 * AdminPedidoManualModal — Registro de pedidos direto pelo painel administrativo.
 *
 * Fluxo em 3 etapas:
 *  1. Selecionar produtos com controle de estoque e carrinho
 *  2. Preencher dados da cliente (ou selecionar cadastrada), entrega, status (Pago/Pendente) e pagamento
 *  3. Confirmação do pedido com opções de WhatsApp, recibo para impressão e visualização
 */

import { useState, useMemo } from "react";
import { useStore, type Order } from "@/lib/store";
import { brl } from "@/lib/format";
import { createManualAdminOrderFn } from "@/lib/admin.functions";
import { printOrderReceipt } from "@/lib/printReceipt";
import { toast } from "sonner";
import {
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  User,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  MessageCircle,
  Printer,
  ShoppingBag,
  DollarSign,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Sparkles,
  FileCheck,
} from "lucide-react";
import pixIcon from "@/assets/pix-icon.png";

type CartLine = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
};

interface AdminPedidoManualModalProps {
  onClose: () => void;
  onOrderCreated?: (orderId: string) => void;
}

export function AdminPedidoManualModal({
  onClose,
  onOrderCreated,
}: AdminPedidoManualModalProps) {
  const { products, customers, settings, sync } = useStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);

  // Dados da cliente
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteDocumento, setClienteDocumento] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [clienteObs, setClienteObs] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Entrega e Pagamento
  const [tipoEntrega, setTipoEntrega] = useState<"entrega" | "retirada">("entrega");
  const [statusPagamento, setStatusPagamento] = useState<"pago" | "aguardando_pagamento">("pago");
  const [metodoPagamento, setMetodoPagamento] = useState<"dinheiro" | "cartao" | "pix" | "outro">("dinheiro");
  const [frete, setFrete] = useState<string>("");
  const [desconto, setDesconto] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.active !== false &&
        (p.stock ?? 0) > 0 &&
        (!term || p.name.toLowerCase().includes(term))
    );
  }, [products, search]);

  const sugestoes = useMemo(() => {
    if (!clienteNome.trim() || !showSuggestions) return [];
    const term = clienteNome.toLowerCase();
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.phone?.includes(term)
      )
      .slice(0, 5);
  }, [customers, clienteNome, showSuggestions]);

  const subtotal = cart.reduce((s, l) => s + l.price * l.quantity, 0);
  const numFrete = Math.max(0, parseFloat(frete.replace(",", ".")) || 0);
  const numDesconto = Math.max(0, parseFloat(desconto.replace(",", ".")) || 0);
  const total = Math.max(0, subtotal + numFrete - numDesconto);

  const addToCart = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        if (existing.quantity >= (p.stock ?? 0)) {
          toast.error("Estoque insuficiente para este produto");
          return prev;
        }
        return prev.map((l) =>
          l.productId === productId ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          price: p.price,
          quantity: 1,
          image: p.image,
          stock: p.stock ?? 0,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.productId !== productId) return l;
          const newQty = l.quantity + delta;
          if (newQty <= 0) return null as any;
          if (newQty > l.stock) {
            toast.error("Estoque insuficiente");
            return l;
          }
          return { ...l, quantity: newQty };
        })
        .filter(Boolean)
    );
  };

  const selecionarCliente = (c: (typeof customers)[number]) => {
    setClienteNome(c.name);
    setClienteEmail(c.email || "");
    setClienteTelefone(c.phone || "");
    setClienteDocumento(c.addressData?.cpf || "");
    setClienteEndereco(c.address || "");
    setCustomerId(c.id);
    setShowSuggestions(false);
  };

  const registrarPedido = async () => {
    if (cart.length === 0) {
      toast.error("Adicione ao menos um produto.");
      return;
    }
    if (!clienteNome.trim()) {
      toast.error("Informe o nome da cliente.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createManualAdminOrderFn({
        data: {
          customer: {
            name: clienteNome.trim(),
            email: clienteEmail.trim() || undefined,
            phone: clienteTelefone.trim() || undefined,
            document: clienteDocumento.trim() || undefined,
            customerId: customerId || undefined,
          },
          items: cart.map((l) => ({
            productId: l.productId,
            name: l.name,
            price: l.price,
            quantity: l.quantity,
            image: l.image,
          })),
          totals: {
            subtotal,
            discount: numDesconto,
            shipping: numFrete,
            total,
          },
          delivery: tipoEntrega,
          address:
            tipoEntrega === "retirada"
              ? "Retirada no balcão"
              : clienteEndereco.trim() || undefined,
          notes: clienteObs.trim() || undefined,
          paymentStatus: statusPagamento,
          paymentMethod: metodoPagamento,
        },
      });

      if (!res.ok) {
        throw new Error((res as any).message || "Falha ao registrar pedido");
      }

      // Decrementa o estoque imediatamente no estado do Zustand para UI instantânea
      useStore.setState((s) => ({
        products: s.products.map((p) => {
          const it = cart.find((c) => c.productId === p.id);
          return it ? { ...p, stock: Math.max(0, (p.stock ?? 0) - it.quantity) } : p;
        }),
      }));

      const newOrderObj: Order = {
        id: res.orderId,
        customerId: customerId || "guest",
        customerName: clienteNome.trim(),
        customerEmail: clienteEmail.trim() || "cliente@sem-email.local",
        customerPhone: clienteTelefone.trim() || "",
        customerCpf: clienteDocumento.trim() || undefined,
        items: cart.map((l) => ({
          productId: l.productId,
          name: l.name,
          price: l.price,
          quantity: l.quantity,
          image: l.image,
        })),
        subtotal,
        discount: numDesconto,
        shipping: numFrete,
        total,
        paymentMethod:
          metodoPagamento === "cartao"
            ? "card"
            : metodoPagamento === "pix"
              ? "pix"
              : "cash",
        deliveryMethod: tipoEntrega,
        status: statusPagamento === "pago" ? "pago" : "aguardando_pagamento",
        deliveryStatus: "pendente",
        createdAt: new Date().toISOString(),
        address:
          tipoEntrega === "retirada"
            ? settings?.address || "Retirada no balcão"
            : clienteEndereco.trim(),
        notes: clienteObs.trim() || undefined,
        paidAt: statusPagamento === "pago" ? new Date().toISOString() : undefined,
      };

      setCreatedOrder(newOrderObj);
      setStep(3);
      toast.success("Pedido registrado com sucesso!");
      sync();
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar pedido");
    } finally {
      setSubmitting(false);
    }
  };

  const abrirWhatsApp = () => {
    if (!createdOrder) return;
    const phone = clienteTelefone.replace(/\D/g, "");
    const nome = clienteNome.split(" ")[0] || "Cliente";
    const statusLabel = statusPagamento === "pago" ? "Pago ✅" : "Aguardando Pagamento ⏳";
    const paymentLabel =
      metodoPagamento === "dinheiro"
        ? "Dinheiro"
        : metodoPagamento === "cartao"
          ? "Cartão"
          : metodoPagamento === "pix"
            ? "Pix"
            : "A combinar";

    const msg = encodeURIComponent(
      `Olá ${nome}! Seu pedido na ${settings?.storeName || "Princesa de Laços"} foi registrado com sucesso! ✨\n\n` +
      `📋 *Pedido #${createdOrder.id}*\n` +
      `Status: *${statusLabel}* (${paymentLabel})\n\n` +
      `🛍️ *Itens:*\n` +
      cart.map((l) => `• ${l.quantity}x ${l.name} — ${brl(l.price * l.quantity)}`).join("\n") +
      `\n\n` +
      `Subtotal: ${brl(subtotal)}\n` +
      (numFrete > 0 ? `Frete: ${brl(numFrete)}\n` : "") +
      (numDesconto > 0 ? `Desconto: -${brl(numDesconto)}\n` : "") +
      `💰 *Total:* ${brl(total)}\n` +
      `📦 *Entrega:* ${tipoEntrega === "entrega" ? `Entrega (${clienteEndereco || "Endereço a confirmar"})` : "Retirada no local"}\n\n` +
      `Muito obrigada pela preferência! 💕`
    );

    window.open(
      phone ? `https://wa.me/55${phone}?text=${msg}` : `https://wa.me/?text=${msg}`,
      "_blank"
    );
  };

  const handlePrint = () => {
    if (createdOrder) {
      printOrderReceipt(createdOrder, settings);
    }
  };

  const handleFinish = () => {
    onClose();
    if (onOrderCreated && createdOrder) {
      onOrderCreated(createdOrder.id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-overlay-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-3xl shadow-soft w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-modal-in"
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-emerald-500 via-primary to-emerald-400" />
          <div className="flex items-center gap-3 pt-1">
            <div className="h-9 w-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Registrar Pedido Manual</h2>
              <p className="text-xs text-muted-foreground">
                {step === 1 && "Selecione os produtos e quantidades"}
                {step === 2 && "Cliente, entrega e status do pagamento"}
                {step === 3 && "Pedido salvo com sucesso!"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1.5 px-5 pb-3 shrink-0">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? "bg-emerald-600" : "bg-muted"
              } ${s === step ? "flex-1" : "w-6"}`}
            />
          ))}
        </div>

        {/* ── ETAPA 1: Seleção de Produtos */}
        {step === 1 && (
          <div className="flex flex-col flex-1 min-h-0 px-5 pb-5 gap-3 overflow-hidden">
            {/* Busca */}
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto por nome..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-muted border border-border text-sm outline-none focus:ring-2 ring-primary/30"
              />
            </div>

            {/* Lista + Carrinho desktop */}
            <div className="flex gap-3 flex-1 min-h-0 overflow-hidden">
              {/* Lista de Produtos */}
              <div className="flex flex-col flex-1 min-h-0">
                <p className="text-xs text-muted-foreground mb-2 shrink-0">
                  Clique no produto para adicionar ao pedido.
                </p>
                <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
                  {filteredProducts.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-12">
                      Nenhum produto com estoque encontrado.
                    </div>
                  )}
                  {filteredProducts.map((p) => {
                    const inCart = cart.find((l) => l.productId === p.id);
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                          inCart
                            ? "border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-950/20"
                            : "border-border bg-background hover:bg-muted/40"
                        }`}
                        onClick={() => addToCart(p.id)}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-11 w-11 rounded-lg object-cover shrink-0 bg-muted"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-foreground">
                              {brl(p.price)}
                            </span>
                            <span>•</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[11px] font-medium ${
                                (p.stock ?? 0) <= 2
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              Estoque: {p.stock ?? 0}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                            inCart
                              ? "bg-emerald-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {inCart ? inCart.quantity : <Plus className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Carrinho Lateral — Desktop */}
              {cart.length > 0 && (
                <div className="hidden md:flex flex-col w-56 shrink-0 min-h-0 bg-muted/25 rounded-2xl border border-border p-3">
                  <div className="font-semibold text-sm mb-2 shrink-0 flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4 text-emerald-600" />
                    Carrinho
                    <span className="ml-auto text-xs bg-emerald-600 text-white rounded-full px-2 py-0.5 font-bold">
                      {cart.reduce((s, l) => s + l.quantity, 0)}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-0.5">
                    {cart.map((l) => (
                      <div
                        key={l.productId}
                        className="flex items-center gap-2 bg-card border border-border rounded-xl p-2 shadow-xs"
                      >
                        <img
                          src={l.image}
                          alt={l.name}
                          className="h-8 w-8 rounded-lg object-cover shrink-0 bg-muted"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{l.name}</div>
                          <div className="text-[11px] text-muted-foreground font-semibold">
                            {brl(l.price)}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => changeQty(l.productId, +1)}
                            className="h-4 w-4 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-xs cursor-pointer"
                            title="Aumentar"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                          <span className="text-xs font-bold leading-none">{l.quantity}</span>
                          <button
                            onClick={() => changeQty(l.productId, -1)}
                            className="h-4 w-4 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-xs cursor-pointer"
                            title="Diminuir"
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(l.productId)}
                          className="h-5 w-5 rounded-full text-destructive hover:bg-destructive/10 flex items-center justify-center shrink-0 cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 shrink-0 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-sm font-bold mb-3">
                      <span>Subtotal</span>
                      <span className="text-emerald-600 text-base">{brl(subtotal)}</span>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="w-full h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      Avançar <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Faixa carrinho — Mobile */}
            {cart.length > 0 && (
              <div className="md:hidden shrink-0 border-t border-border pt-3">
                <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
                  {cart.map((l) => (
                    <div key={l.productId} className="relative shrink-0">
                      <img
                        src={l.image}
                        alt={l.name}
                        className="h-10 w-10 rounded-lg object-cover bg-muted"
                      />
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                        {l.quantity}
                      </div>
                    </div>
                  ))}
                  <div className="ml-auto shrink-0 text-right">
                    <div className="text-xs text-muted-foreground">Subtotal</div>
                    <div className="font-bold text-emerald-600 text-sm">{brl(subtotal)}</div>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Avançar <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── ETAPA 2: Dados da Cliente, Entrega e Pagamento */}
        {step === 2 && (
          <div className="px-5 pb-5 overflow-y-auto flex-1 space-y-4">
            <p className="text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2 border border-border">
              Digite o nome da cliente para buscar no cadastro ou digite os dados manualmente.
              O pedido descontará do estoque automaticamente.
            </p>

            {/* Nome da cliente com busca/sugestões */}
            <div className="relative">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                Nome da cliente <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  value={clienteNome}
                  onChange={(e) => {
                    setClienteNome(e.target.value);
                    setCustomerId(null);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Ex: Maria Silva..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 ring-emerald-500/30"
                />
                {customerId && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Cadastrada
                  </div>
                )}
              </div>

              {sugestoes.length > 0 && (
                <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-soft overflow-hidden">
                  {sugestoes.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={() => selecionarCliente(c)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 text-left transition-colors cursor-pointer"
                    >
                      <div className="h-8 w-8 rounded-full bg-emerald-600 text-white grid place-items-center font-bold text-sm shrink-0">
                        {c.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {c.phone || c.email || "Sem contato extra"}
                          {c.address ? ` • ${c.address}` : ""}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Email e Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  value={clienteEmail}
                  onChange={(e) => setClienteEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 ring-emerald-500/30"
                />
              </div>
            </div>

            {/* CPF e Tipo de Entrega */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                  CPF (opcional)
                </label>
                <input
                  value={clienteDocumento}
                  onChange={(e) => setClienteDocumento(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                  Tipo de Entrega
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoEntrega("entrega")}
                    className={`h-10 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      tipoEntrega === "entrega"
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Truck className="h-3.5 w-3.5" /> Entrega
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoEntrega("retirada")}
                    className={`h-10 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      tipoEntrega === "retirada"
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Store className="h-3.5 w-3.5" /> Retirada
                  </button>
                </div>
              </div>
            </div>

            {/* Endereço de Entrega */}
            {tipoEntrega === "entrega" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                  Endereço de entrega
                </label>
                <input
                  value={clienteEndereco}
                  onChange={(e) => setClienteEndereco(e.target.value)}
                  placeholder="Rua, número, complemento, bairro, cidade..."
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 ring-emerald-500/30"
                />
              </div>
            )}

            {/* SEÇÃO DE PAGAMENTO: STATUS E FORMA */}
            <div className="bg-muted/30 border border-border rounded-2xl p-3.5 space-y-3">
              <div className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Definições de Pagamento
              </div>

              {/* Status do Pagamento (Pago vs Aguardando Pagamento) */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Status do Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusPagamento("pago")}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                      statusPagamento === "pago"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs dark:bg-emerald-950/40 dark:text-emerald-200"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                        statusPagamento === "pago"
                          ? "bg-emerald-600 text-white"
                          : "border border-muted-foreground/40"
                      }`}
                    >
                      {statusPagamento === "pago" && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold">Pago</div>
                      <div className="text-[11px] opacity-80">Já recebido / aprovado</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusPagamento("aguardando_pagamento")}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                      statusPagamento === "aguardando_pagamento"
                        ? "bg-amber-50 border-amber-500 text-amber-900 shadow-xs dark:bg-amber-950/40 dark:text-amber-200"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                        statusPagamento === "aguardando_pagamento"
                          ? "bg-amber-600 text-white"
                          : "border border-muted-foreground/40"
                      }`}
                    >
                      {statusPagamento === "aguardando_pagamento" && (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold">Pendente</div>
                      <div className="text-[11px] opacity-80">Aguardando pagamento</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "dinheiro", label: "Dinheiro", icon: Banknote },
                    { id: "cartao", label: "Cartão", icon: CreditCard },
                    { id: "pix", label: "Pix", icon: pixIcon, isImg: true },
                    { id: "outro", label: "Outro", icon: Sparkles },
                  ].map((m) => {
                    const isSelected = metodoPagamento === m.id;
                    const Icon = m.icon as any;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMetodoPagamento(m.id as any)}
                        className={`h-9 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-100/80 border-emerald-600 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "bg-background border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {m.isImg ? (
                          <img src={m.icon as string} alt="Pix" className="h-3.5 w-3.5 object-contain" />
                        ) : (
                          <Icon className="h-3.5 w-3.5" />
                        )}
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Frete e Desconto adicionais */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">
                    Valor do Frete (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={frete}
                    onChange={(e) => setFrete(e.target.value)}
                    placeholder="0,00"
                    className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs outline-none focus:ring-2 ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase mb-1 block">
                    Desconto (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={desconto}
                    onChange={(e) => setDesconto(e.target.value)}
                    placeholder="0,00"
                    className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs outline-none focus:ring-2 ring-emerald-500/30"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                Observações do Pedido (opcional)
              </label>
              <textarea
                value={clienteObs}
                onChange={(e) => setClienteObs(e.target.value)}
                rows={2}
                placeholder="Ex: Embalagem para presente, entregar no período da tarde, etc..."
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 ring-emerald-500/30 resize-none"
              />
            </div>

            {/* Resumo com totais */}
            <div className="bg-muted/40 rounded-2xl border border-border p-3.5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex justify-between">
                <span>Resumo ({cart.reduce((s, l) => s + l.quantity, 0)} itens)</span>
                <span className="font-semibold text-foreground">
                  Status: {statusPagamento === "pago" ? "Pago ✅" : "Pendente ⏳"}
                </span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 mb-2 pr-1">
                {cart.map((l) => (
                  <div key={l.productId} className="flex justify-between text-xs py-0.5">
                    <span className="truncate max-w-[65%]">
                      {l.name} <span className="text-muted-foreground">x{l.quantity}</span>
                    </span>
                    <span className="font-medium">{brl(l.price * l.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-2 border-t border-border text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{brl(subtotal)}</span>
                </div>
                {numFrete > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frete</span>
                    <span>+{brl(numFrete)}</span>
                  </div>
                )}
                {numDesconto > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Desconto</span>
                    <span>-{brl(numDesconto)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-border text-foreground">
                  <span>Total Final</span>
                  <span className="text-emerald-600 text-base">{brl(total)}</span>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-11 px-4 rounded-full bg-muted font-semibold text-sm flex items-center gap-1.5 hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              <button
                type="button"
                onClick={registrarPedido}
                disabled={submitting || !clienteNome.trim()}
                className="flex-1 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Registrando pedido...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Salvar e Registrar Pedido
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── ETAPA 3: Sucesso e Ações */}
        {step === 3 && createdOrder && (
          <div className="px-5 pb-6 overflow-y-auto flex-1 space-y-4">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-white/20 grid place-items-center shrink-0">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg leading-tight">Pedido registrado com sucesso!</div>
                <div className="text-xs opacity-90 mt-0.5">
                  Pedido <span className="font-mono font-bold">#{createdOrder.id}</span> •{" "}
                  {brl(createdOrder.total)} •{" "}
                  {statusPagamento === "pago" ? "Status: Pago ✅" : "Status: Pendente ⏳"}
                </div>
              </div>
            </div>

            {/* Detalhes rápidos */}
            <div className="bg-muted/30 border border-border rounded-2xl p-3.5 text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground block">Cliente:</span>
                  <span className="font-semibold text-foreground text-sm">
                    {createdOrder.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Telefone:</span>
                  <span className="font-semibold text-foreground">
                    {clienteTelefone || "Não informado"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <div>
                  <span className="text-muted-foreground block">Entrega:</span>
                  <span className="font-semibold text-foreground">
                    {tipoEntrega === "entrega" ? "Entrega a domicílio" : "Retirada no local"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Pagamento:</span>
                  <span className="font-semibold text-foreground capitalize">
                    {metodoPagamento} ({statusPagamento === "pago" ? "Pago" : "Pendente"})
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground block mb-1">Itens do pedido:</span>
                <div className="space-y-0.5">
                  {cart.map((l) => (
                    <div key={l.productId} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {l.quantity}x {l.name}
                      </span>
                      <span className="font-medium">{brl(l.price * l.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ações pós-pedido */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={abrirWhatsApp}
                className="w-full h-11 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <MessageCircle className="h-4 w-4" />
                {clienteTelefone
                  ? "Enviar comprovante pelo WhatsApp"
                  : "Compartilhar resumo via WhatsApp"}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full h-11 rounded-full bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm flex items-center justify-center gap-2 border border-border transition-colors cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Imprimir Recibo / Comprovante
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileCheck className="h-4 w-4" />
                Concluir e Ver Pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
