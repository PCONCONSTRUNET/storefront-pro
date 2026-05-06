import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, DollarSign, Tag, Settings, Bell, LogOut, Menu, X, Sparkles } from "lucide-react";
import { useStore, useStoreHydrated } from "@/lib/store";
import { useState, useEffect } from "react";
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
  if (!hydrated || !isAdmin) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Carregando...</div>;

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
        <header className="bg-card border-b border-border h-14 flex items-center px-4 sticky top-0 z-30">
          <button className="md:hidden mr-2" onClick={() => setOpen(true)} aria-label="Menu"><Menu className="h-5 w-5" /></button>
          <h1 className="text-lg font-bold">{title}</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
