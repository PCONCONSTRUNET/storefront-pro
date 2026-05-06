import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, selectCurrentCustomer } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { User, LogOut, Package, Settings, Heart, MapPin, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Minha conta — Princesa de Laços" }] }),
  component: Page,
});

function Page() {
  const customer = useStore(selectCurrentCustomer);
  const logoutCustomer = useStore(s => s.logoutCustomer);

  if (!customer) {
    return (
      <StoreLayout>
        <div className="max-w-md mx-auto text-center py-20 px-4">
          <div className="w-20 h-20 mx-auto rounded-full gradient-soft grid place-items-center"><User className="h-9 w-9 text-primary" /></div>
          <h1 className="text-xl font-bold mt-4">Bem-vinda à Princesa de Laços</h1>
          <p className="text-sm text-muted-foreground mt-1">Entre ou crie sua conta para acompanhar pedidos.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link to="/login" className="h-12 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center">Entrar</Link>
            <Link to="/cadastro" className="h-12 rounded-full border-2 border-primary text-primary font-semibold flex items-center justify-center">Cadastrar</Link>
          </div>
          <Link to="/admin/login" className="mt-8 inline-block text-xs text-muted-foreground underline">​</Link>
        </div>
      </StoreLayout>
    );
  }

  const items = [
    { to: "/pedidos", icon: Package, label: "Meus pedidos" },
    { to: "/perfil", icon: MapPin, label: "Endereços" },
    { to: "/perfil", icon: Heart, label: "Favoritos" },
    { to: "/perfil", icon: Settings, label: "Configurações" },
  ] as const;

  return (
    <StoreLayout>
      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="bg-gradient-to-br from-primary to-rose text-primary-foreground rounded-2xl p-5 flex items-center gap-4 shadow-soft">
          <div className="w-14 h-14 rounded-full bg-white/20 grid place-items-center text-2xl font-bold">{customer.name[0]?.toUpperCase()}</div>
          <div>
            
            <div className="font-bold text-lg">{customer.name}</div>
            <div className="text-xs opacity-90">{customer.email}</div>
          </div>
        </div>

        <ul className="mt-4 bg-card rounded-2xl shadow-card divide-y divide-border overflow-hidden">
          {items.map((it, i) => (
            <li key={i}>
              <Link to={it.to} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                <it.icon className="h-5 w-5 text-primary" />
                <span className="flex-1 font-medium text-sm">{it.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>

        <button onClick={logoutCustomer} className="mt-4 w-full h-12 rounded-full border-2 border-destructive/30 text-destructive font-semibold flex items-center justify-center gap-2">
          <LogOut className="h-4 w-4" /> Sair
        </button>

        <Link to="/admin/login" className="mt-6 block text-center text-xs text-muted-foreground underline">​</Link>
      </div>
    </StoreLayout>
  );
}
