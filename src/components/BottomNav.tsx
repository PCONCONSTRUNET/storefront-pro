import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Grid3x3, ShoppingBag, Package, User } from "lucide-react";
import { useStore, selectCartCount } from "@/lib/store";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Home; exact?: boolean; badge?: boolean };
const items: NavItem[] = [
  { to: "/", label: "Início", icon: Home, exact: true },
  { to: "/categorias", label: "Categorias", icon: Grid3x3 },
  { to: "/carrinho", label: "Carrinho", icon: ShoppingBag, badge: true },
  { to: "/pedidos", label: "Pedidos", icon: Package },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const count = useStore(selectCartCount);
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border safe-bottom">
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const active = it.exact ? path === it.to : path.startsWith(it.to);
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium relative transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5", active && "scale-110")} strokeWidth={active ? 2.5 : 2} />
                  {it.badge && count > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </div>
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
