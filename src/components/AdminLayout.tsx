import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, DollarSign, Tag, Settings, Bell, LogOut, Menu, X, Sparkles, Search } from "lucide-react";
import { useStore, useStoreHydrated } from "@/lib/store";
import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/afiliadas", label: "Afiliadas", icon: Sparkles },
  { to: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
  { to: "/admin/cupons", label: "Cupons", icon: Tag },
  { to: "/admin/notificacoes", label: "Notificações", icon: Bell },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const navigate = useNavigate();
  const hydrated = useStoreHydrated();
  const isAdmin = useStore(s => s.isAdmin);
  const logout = useStore(s => s.logoutAdmin);
  const path = useRouterState({ select: r => r.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => { if (hydrated && !isAdmin) navigate({ to: "/admin/login" }); }, [hydrated, isAdmin, navigate]);
  if (!isAdmin) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Carregando...</div>;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 bg-card border-r border-border flex-col sticky top-0 h-screen">
        <div className="p-5 border-b border-border">
          <div className="font-display text-xl text-primary">Admin</div>
          <div className="text-xs text-muted-foreground">Princesa de Laços</div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(it => {
            const active = it.exact ? path === it.to : path.startsWith(it.to);
            return (
              <Link key={it.to} to={it.to} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground")}>
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link to="/" className="block text-xs text-center text-muted-foreground hover:text-primary py-2">Ver loja</Link>
          <button onClick={() => { logout(); navigate({ to: "/" }); }} className="w-full flex items-center justify-center gap-2 text-sm text-destructive py-2 hover:bg-destructive/10 rounded-xl">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card p-3 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-2 mb-2">
              <div className="font-display text-lg text-primary">Admin</div>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto">
              {nav.map(it => {
                const active = it.exact ? path === it.to : path.startsWith(it.to);
                return (
                  <Link key={it.to} to={it.to} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                    <it.icon className="h-4 w-4" /> {it.label}
                  </Link>
                );
              })}
            </nav>
            <button onClick={() => { logout(); navigate({ to: "/" }); }} className="flex items-center justify-center gap-2 text-sm text-destructive py-2 mt-2">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-card border-b border-border h-14 flex items-center px-4 sticky top-0 z-30 gap-3">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu className="h-5 w-5" /></button>
          <h1 className="text-lg font-bold truncate">{title}</h1>
          <div className="ml-auto"><GlobalSearch /></div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const navigate = useNavigate();
  const orders = useStore(s => s.orders);
  const customers = useStore(s => s.customers);
  const products = useStore(s => s.products);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return { orders: [], customers: [], products: [] };
    const digits = term.replace(/\D/g, "");
    return {
      orders: orders.filter(o =>
        o.id.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        (digits && o.customerPhone.replace(/\D/g, "").includes(digits))
      ).slice(0, 5),
      customers: customers.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (digits && c.phone.replace(/\D/g, "").includes(digits))
      ).slice(0, 5),
      products: products.filter(p => p.name.toLowerCase().includes(term)).slice(0, 5),
    };
  }, [q, orders, customers, products]);

  const total = results.orders.length + results.customers.length + results.products.length;

  return (
    <div ref={ref} className="relative w-44 sm:w-72">
      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar pedido, cliente, produto..."
        className="w-full h-9 pl-9 pr-3 rounded-full bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      {open && q.trim() && (
        <div className="absolute right-0 left-0 mt-2 bg-card border border-border rounded-2xl shadow-soft overflow-hidden max-h-96 overflow-y-auto z-50">
          {total === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">Nada encontrado para "{q}"</div>
          ) : (
            <>
              {results.orders.length > 0 && (
                <div>
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wide">Pedidos</div>
                  {results.orders.map(o => (
                    <button key={o.id} onClick={() => { setOpen(false); setQ(""); navigate({ to: "/admin/pedidos", search: { q: o.id } }); }}
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm">
                      <div className="font-semibold">#{o.id}</div>
                      <div className="text-xs text-muted-foreground">{o.customerName} · {o.customerPhone}</div>
                    </button>
                  ))}
                </div>
              )}
              {results.customers.length > 0 && (
                <div className="border-t border-border">
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wide">Clientes</div>
                  {results.customers.map(c => (
                    <button key={c.id} onClick={() => { setOpen(false); setQ(""); navigate({ to: "/admin/clientes" }); }}
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm">
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.email} · {c.phone}</div>
                    </button>
                  ))}
                </div>
              )}
              {results.products.length > 0 && (
                <div className="border-t border-border">
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wide">Produtos</div>
                  {results.products.map(p => (
                    <button key={p.id} onClick={() => { setOpen(false); setQ(""); navigate({ to: "/admin/produtos" }); }}
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2">
                      {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                      <div className="flex-1"><div className="font-semibold">{p.name}</div></div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
