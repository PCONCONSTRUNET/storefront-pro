import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
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
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt={settings.storeName} className="h-10 md:h-12 w-auto object-contain" />
        </Link>

        <form onSubmit={onSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar laços, tiaras..."
            className="w-full h-10 pl-9 pr-3 rounded-full bg-muted text-sm outline-none focus:ring-2 ring-primary/40 placeholder:text-muted-foreground"
          />
        </form>

        <Link
          to="/carrinho"
          className="relative shrink-0 w-10 h-10 grid place-items-center rounded-full hover:bg-muted transition-colors"
          aria-label="Carrinho"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" strokeLinejoin="round" strokeLinecap="round" viewBox="0 0 24 24" strokeWidth={2} fill="none" stroke="currentColor" className="text-foreground">
            <circle r={1} cy={21} cx={9} />
            <circle r={1} cy={21} cx={20} />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:block border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 h-11 text-sm">
          <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">Início</Link>
          <Link to="/categorias" className="text-foreground hover:text-primary transition-colors">Categorias</Link>
          <Link to="/pedidos" className="text-foreground hover:text-primary transition-colors">Meus pedidos</Link>
          <Link to="/perfil" className="text-foreground hover:text-primary transition-colors">Minha conta</Link>
          <span className="ml-auto text-xs text-muted-foreground">📦 Frete fixo R$ {settings.shippingFee.toFixed(2)}</span>
        </div>
      </nav>
    </header>
  );
}
