import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Bell, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useStore, selectCartCount } from "@/lib/store";
import logo from "@/assets/logo-princesa.png";

export function StoreHeader() {
  const navigate = useNavigate();
  const count = useStore(selectCartCount);
  const settings = useStore((s) => s.settings);
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/buscar", search: { q: q.trim() } as never });
  };

  return (
    <header className="sticky top-0 z-30 gradient-primary text-primary-foreground shadow-soft">
      {/* Top utility bar - desktop only */}
      <div className="hidden md:block border-b border-white/10 text-[11px]">
        <div className="max-w-6xl mx-auto px-4 h-7 flex items-center justify-between">
          <div className="flex items-center gap-4 opacity-90">
            <Link to="/admin/login" className="hover:underline">Vender na loja</Link>
            <span className="opacity-50">|</span>
            <Link to="/pedidos" className="hover:underline">Acompanhar pedido</Link>
          </div>
          <div className="flex items-center gap-4 opacity-90">
            <Link to="/cadastro" className="hover:underline">Cadastrar</Link>
            <span className="opacity-50">|</span>
            <Link to="/login" className="hover:underline">Entrar</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-4">
        <Link to="/" className="flex items-center shrink-0">
          <img src={logo} alt={settings.storeName} className="h-14 md:h-20 w-auto object-contain" style={{ mixBlendMode: "multiply" }} />
        </Link>

        <form onSubmit={onSearch} className="flex-1 relative">
          <div className="flex items-stretch bg-white rounded-md md:rounded-sm overflow-hidden shadow-sm border-2 border-white">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar laços, tiaras, kits..."
              className="flex-1 h-9 md:h-10 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" aria-label="Buscar" className="px-3 md:px-5 bg-primary hover:opacity-95 active:scale-95 transition-all grid place-items-center">
              <Search className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
        </form>

        <Link to="/perfil" className="hidden md:grid w-10 h-10 place-items-center rounded-full hover:bg-white/15 transition-colors" aria-label="Notificações">
          <Bell className="h-5 w-5" />
        </Link>
        <a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="hidden md:grid w-10 h-10 place-items-center rounded-full hover:bg-white/15 transition-colors" aria-label="Chat">
          <MessageCircle className="h-5 w-5" />
        </a>

        <Link
          to="/carrinho"
          className="relative shrink-0 w-10 h-10 grid place-items-center rounded-full hover:bg-white/15 transition-colors"
          aria-label="Carrinho"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" strokeLinejoin="round" strokeLinecap="round" viewBox="0 0 24 24" strokeWidth={2} fill="none" stroke="currentColor">
            <circle r={1} cy={21} cx={9} />
            <circle r={1} cy={21} cx={20} />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-gold text-gold-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center ring-2 ring-primary">
              {count}
            </span>
          )}
        </Link>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:block bg-white/10 backdrop-blur border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 h-10 text-sm">
          <Link to="/" className="hover:opacity-80 font-semibold">Início</Link>
          <Link to="/categorias" className="hover:opacity-80">Categorias</Link>
          <Link to="/pedidos" className="hover:opacity-80">Meus pedidos</Link>
          <Link to="/perfil" className="hover:opacity-80">Minha conta</Link>
          <span className="ml-auto text-[11px] opacity-90">📦 Frete fixo R$ {settings.shippingFee.toFixed(2)} · ⚡ Envio em 24h</span>
        </div>
      </nav>
    </header>
  );
}
