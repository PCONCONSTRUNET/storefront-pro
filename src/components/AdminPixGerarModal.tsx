/**
 * AdminPixGerarModal — Gerador de Pix Manual pelo painel admin.
 *
 * Fluxo em 3 etapas:
 *  1. Selecionar produtos (multiplos diferentes, com quantidade)
 *  2. Preencher dados da cliente (todos opcionais, autocomplete de clientes cadastradas)
 *  3. Exibir QR Code + copia-e-cola + link compartilhavel via WhatsApp
 */
import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { brl } from "@/lib/format";
import { createPixPayment } from "@/lib/mercadopago";
import { toast } from "sonner";
import {
  Search, X, Plus, Minus, Trash2, Copy, QrCode, User,
  ChevronRight, ChevronLeft, Loader2, CheckCircle2, MessageCircle, Link2,
} from "lucide-react";
import pixIcon from "@/assets/pix-icon.png";

type CartLine = {
  productId: string; name: string; price: number;
  quantity: number; image: string; stock: number;
};
type PixResult = {
  order_id: string; qr_code: string; qr_code_base64: string;
  total: number; ticket_url?: string;
};

export function AdminPixGerarModal({ onClose }: { onClose: () => void }) {
  const { products, customers } = useStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteDocumento, setClienteDocumento] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [clienteObs, setClienteObs] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<"entrega" | "retirada">("entrega");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pixResult, setPixResult] = useState<PixResult | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter(
      (p) => p.active !== false && (p.stock ?? 0) > 0 && (!term || p.name.toLowerCase().includes(term))
    );
  }, [products, search]);

  const sugestoes = useMemo(() => {
    if (!clienteNome.trim() || !showSuggestions) return [];
    const term = clienteNome.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term) || c.phone?.includes(term)
    ).slice(0, 5);
  }, [customers, clienteNome, showSuggestions]);

  const subtotal = cart.reduce((s, l) => s + l.price * l.quantity, 0);
  const total = subtotal;

  const addToCart = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        if (existing.quantity >= (p.stock ?? 0)) { toast.error("Estoque insuficiente"); return prev; }
        return prev.map((l) => l.productId === productId ? { ...l, quantity: l.quantity + 1 } : l);
      }
      return [...prev, { productId: p.id, name: p.name, price: p.price, quantity: 1, image: p.image, stock: p.stock ?? 0 }];
    });
  };

  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((l) => l.productId !== productId));

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((l) => {
        if (l.productId !== productId) return l;
        const newQty = l.quantity + delta;
        if (newQty <= 0) return null as any;
        if (newQty > l.stock) { toast.error("Estoque insuficiente"); return l; }
        return { ...l, quantity: newQty };
      }).filter(Boolean)
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

  const gerarPix = async () => {
    if (cart.length === 0) { toast.error("Adicione ao menos um produto."); return; }
    if (!clienteNome.trim()) { toast.error("Informe ao menos o nome da cliente."); return; }
    setGenerating(true);
    try {
      const result = await createPixPayment({
        customer: {
          name: clienteNome.trim(),
          email: clienteEmail.trim() || undefined,
          phone: clienteTelefone.trim() || undefined,
          document: clienteDocumento.trim() || undefined,
          // @ts-ignore
          customer_id: customerId || undefined,
        },
        items: cart.map((l) => ({ productId: l.productId, name: l.name, price: l.price, quantity: l.quantity, image: l.image })),
        totals: { subtotal, discount: 0, shipping: 0, total },
        delivery: tipoEntrega,
        address: clienteEndereco.trim() || undefined,
        notes: clienteObs.trim() || undefined,
        // @ts-ignore
        manual: true,
      });
      setPixResult(result);
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar Pix");
    } finally {
      setGenerating(false);
    }
  };

  const copiarCodigo = () => {
    if (!pixResult?.qr_code) return;
    navigator.clipboard.writeText(pixResult.qr_code);
    setCopied(true);
    toast.success("Codigo Pix copiado!");
    setTimeout(() => setCopied(false), 2500);
  };

  const pixLink = pixResult ? `${window.location.origin}/checkout/pix/${pixResult.order_id}` : "";

  const copiarLink = () => { navigator.clipboard.writeText(pixLink); toast.success("Link copiado!"); };

  const abrirWhatsApp = () => {
    const phone = clienteTelefone.replace(/\D/g, "");
    const nome = clienteNome.split(" ")[0];
    const msg = encodeURIComponent(`Ola ${nome}! Segue o link para pagar o seu pedido via Pix:\n${pixLink}\n\nValor: ${brl(pixResult!.total)}`);
    window.open(phone ? `https://wa.me/55${phone}?text=${msg}` : `https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-overlay-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-3xl shadow-soft w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-modal-in">

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-primary via-rose-400 to-primary" />
          <div className="flex items-center gap-2.5 pt-1">
            <img src={pixIcon} alt="Pix" className="h-6 w-6 object-contain" />
            <div>
              <h2 className="font-bold text-base leading-tight">Gerar Pix Manual</h2>
              <p className="text-xs text-muted-foreground">
                {step === 1 && "Selecione os produtos"}
                {step === 2 && "Dados da cliente (opcionais)"}
                {step === 3 && "Pix gerado com sucesso!"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1.5 px-5 pb-3 shrink-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? "bg-primary" : "bg-muted"} ${s === step ? "flex-1" : "w-6"}`} />
          ))}
        </div>

        {/* ── Step 1 */}
        {step === 1 && (
          <div className="flex flex-col flex-1 min-h-0 px-5 pb-5 gap-3 overflow-hidden">
            {/* Busca */}
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-muted border border-border text-sm outline-none focus:ring-2 ring-primary/30" />
            </div>

            {/* Lista + carrinho desktop */}
            <div className="flex gap-3 flex-1 min-h-0 overflow-hidden">
              {/* Lista */}
              <div className="flex flex-col flex-1 min-h-0">
                <p className="text-xs text-muted-foreground mb-2 shrink-0">Clique para adicionar — pode selecionar produtos diferentes.</p>
                <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                  {filteredProducts.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">Nenhum produto com estoque encontrado.</div>
                  )}
                  {filteredProducts.map((p) => {
                    const inCart = cart.find((l) => l.productId === p.id);
                    return (
                      <div key={p.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors cursor-pointer select-none ${inCart ? "border-primary/40 bg-primary/5" : "border-border bg-background hover:bg-muted/40"}`}
                        onClick={() => addToCart(p.id)}>
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover shrink-0 bg-muted" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{brl(p.price)} · estoque: {p.stock ?? 0}</div>
                        </div>
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${inCart ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {inCart ? inCart.quantity : <Plus className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Carrinho lateral — so desktop */}
              {cart.length > 0 && (
                <div className="hidden md:flex flex-col w-52 shrink-0 min-h-0">
                  <div className="font-semibold text-sm mb-2 shrink-0 flex items-center gap-1.5">
                    <QrCode className="h-4 w-4 text-primary" />
                    Carrinho
                    <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                      {cart.reduce((s, l) => s + l.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                    {cart.map((l) => (
                      <div key={l.productId} className="flex items-center gap-1.5 bg-muted/40 border border-border rounded-xl p-2">
                        <img src={l.image} alt={l.name} className="h-8 w-8 rounded-lg object-cover shrink-0 bg-muted" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{l.name}</div>
                          <div className="text-xs text-muted-foreground">{brl(l.price)}</div>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 shrink-0">
                          <button onClick={() => changeQty(l.productId, +1)} className="h-5 w-5 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center"><Plus className="h-2.5 w-2.5" /></button>
                          <span className="text-xs font-bold leading-none">{l.quantity}</span>
                          <button onClick={() => changeQty(l.productId, -1)} className="h-5 w-5 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center"><Minus className="h-2.5 w-2.5" /></button>
                        </div>
                        <button onClick={() => removeFromCart(l.productId)} className="h-5 w-5 rounded-full text-destructive hover:bg-destructive/10 flex items-center justify-center shrink-0">
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 shrink-0">
                    <div className="flex items-center justify-between text-sm font-bold py-2 border-t border-border">
                      <span>Total</span><span className="text-primary">{brl(total)}</span>
                    </div>
                    <button onClick={() => setStep(2)} className="w-full h-10 rounded-full gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5">
                      Proximo <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Faixa carrinho — somente mobile */}
            {cart.length > 0 && (
              <div className="md:hidden shrink-0 border-t border-border pt-3">
                <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
                  {cart.map((l) => (
                    <div key={l.productId} className="relative shrink-0">
                      <img src={l.image} alt={l.name} className="h-10 w-10 rounded-lg object-cover bg-muted" />
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
                        {l.quantity}
                      </div>
                    </div>
                  ))}
                  <div className="ml-auto shrink-0 text-right">
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="font-bold text-primary text-sm">{brl(total)}</div>
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="w-full h-10 rounded-full gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5">
                  Proximo <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2 */}
        {step === 2 && (
          <div className="px-5 pb-5 overflow-y-auto flex-1">
            <p className="text-xs text-muted-foreground mb-4 bg-muted/40 rounded-xl px-3 py-2 border border-border">
              Todos os campos sao <strong>opcionais</strong>. Se selecionar uma cliente cadastrada, o pedido sera vinculado ao perfil dela automaticamente.
            </p>

            <div className="relative mb-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Nome da cliente</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input value={clienteNome}
                  onChange={(e) => { setClienteNome(e.target.value); setCustomerId(null); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Ex: Maria Silva"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 ring-primary/30" />
                {customerId && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 font-semibold">cadastrada</div>
                )}
              </div>
              {sugestoes.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-soft overflow-hidden">
                  {sugestoes.map((c) => (
                    <button key={c.id} onMouseDown={() => selecionarCliente(c)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 text-left transition-colors">
                      <div className="h-8 w-8 rounded-full gradient-primary text-primary-foreground grid place-items-center font-bold text-sm shrink-0">{c.name[0]?.toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{c.email} · {c.phone}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">E-mail (opcional)</label>
                <input type="email" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} placeholder="email@exemplo.com"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Telefone / WhatsApp</label>
                <input type="tel" value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} placeholder="(48) 99999-9999"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 ring-primary/30" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">CPF (opcional)</label>
                <input value={clienteDocumento} onChange={(e) => setClienteDocumento(e.target.value)} placeholder="000.000.000-00"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Tipo de entrega</label>
                <select value={tipoEntrega} onChange={(e) => setTipoEntrega(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 ring-primary/30">
                  <option value="entrega">Entrega</option>
                  <option value="retirada">Retirada</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Endereco de entrega</label>
              <input value={clienteEndereco} onChange={(e) => setClienteEndereco(e.target.value)} placeholder="Rua, numero, bairro, cidade..."
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 ring-primary/30" />
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Observacoes</label>
              <textarea value={clienteObs} onChange={(e) => setClienteObs(e.target.value)} rows={2} placeholder="Algum detalhe especial sobre o pedido..."
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 ring-primary/30 resize-none" />
            </div>

            <div className="bg-muted/40 rounded-2xl border border-border p-3 mb-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Resumo do pedido</div>
              {cart.map((l) => (
                <div key={l.productId} className="flex justify-between text-sm py-0.5">
                  <span className="truncate max-w-[60%]">{l.name} <span className="text-muted-foreground">x{l.quantity}</span></span>
                  <span className="font-medium">{brl(l.price * l.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t border-border mt-1">
                <span>Total</span><span className="text-primary">{brl(total)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="h-11 px-4 rounded-full bg-muted font-semibold text-sm flex items-center gap-1.5 hover:bg-muted/70 transition-colors">
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              <button onClick={gerarPix} disabled={generating || !clienteNome.trim()}
                className="flex-1 h-11 rounded-full gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando Pix...</> : <><img src={pixIcon} alt="Pix" className="h-4 w-4 object-contain" /> Gerar Pix</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 */}
        {step === 3 && pixResult && (
          <div className="px-5 pb-5 overflow-y-auto flex-1 space-y-4">
            <div className="bg-gradient-to-br from-primary to-rose-500 text-primary-foreground rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 className="h-9 w-9 shrink-0" />
              <div>
                <div className="font-bold text-base">Pix gerado com sucesso!</div>
                <div className="text-sm opacity-90">Pedido <span className="font-mono">#{pixResult.order_id.slice(0, 8)}</span> · {brl(pixResult.total)}</div>
              </div>
            </div>

            {pixResult.qr_code_base64 && (
              <div className="flex justify-center">
                <img src={`data:image/png;base64,${pixResult.qr_code_base64}`} alt="QR Code Pix"
                  className="w-52 h-52 rounded-2xl border-4 border-primary/20 shadow-soft" />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Pix Copia e Cola</label>
              <textarea readOnly value={pixResult.qr_code} onFocus={(e) => e.target.select()} rows={4}
                className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-xs font-mono outline-none resize-none" />
              <button onClick={copiarCodigo}
                className={`mt-2 w-full h-10 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all ${copied ? "bg-emerald-500 text-white" : "gradient-primary text-primary-foreground"}`}>
                {copied ? <><CheckCircle2 className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar codigo Pix</>}
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Link da pagina de pagamento</label>
              <div className="flex gap-2">
                <input readOnly value={pixLink} onFocus={(e) => e.target.select()}
                  className="flex-1 h-10 px-3 rounded-xl bg-muted border border-border text-xs font-mono outline-none" />
                <button onClick={copiarLink} className="h-10 px-3 rounded-xl bg-muted border border-border hover:bg-muted/70 transition-colors" title="Copiar link">
                  <Link2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button onClick={abrirWhatsApp}
              className="w-full h-11 rounded-full bg-[#25D366] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#1da851] transition-colors">
              <MessageCircle className="h-4 w-4" />
              {clienteTelefone ? "Enviar link pelo WhatsApp" : "Compartilhar link via WhatsApp"}
            </button>

            <button onClick={onClose} className="w-full h-11 rounded-full bg-muted font-semibold text-sm hover:bg-muted/70 transition-colors">
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
