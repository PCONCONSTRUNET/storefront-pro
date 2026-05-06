import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, selectCurrentCustomer } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { User, LogOut, Package, Settings, Heart, MapPin, ChevronRight, Instagram } from "lucide-react";

export const Route = createFileRoute("/perfil/")({
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

        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground">Siga a gente</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://www.instagram.com/princesadelacos58/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="group relative w-12 h-12 rounded-2xl flex items-center justify-center text-white overflow-hidden shadow-lg transition-all hover:scale-110 hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
            >
              <Instagram className="h-6 w-6 relative z-10" />
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-colors" />
            </a>
            <a
              href="https://wa.me/554888644474"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="group relative w-12 h-12 rounded-2xl flex items-center justify-center text-white overflow-hidden shadow-lg transition-all hover:scale-110 hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #25d366, #128c7e)" }}
            >
              <svg viewBox="0 0 32 32" className="h-6 w-6 relative z-10" fill="currentColor" aria-hidden="true">
                <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.464-1.32.057-.16.057-.327.057-.487 0-.484-.156-.612-.602-.84-.473-.235-.93-.488-1.404-.738zM16.044 26.27a9.93 9.93 0 0 1-5.4-1.586l-3.866 1.234 1.255-3.74a9.917 9.917 0 0 1-1.916-5.876c0-5.486 4.464-9.95 9.952-9.95s9.95 4.464 9.95 9.95c0 5.485-4.466 9.967-9.975 9.967zm0-21.95C9.39 4.32 4 9.708 4 16.346c0 2.28.626 4.408 1.722 6.224L3.66 28.66l6.32-2.02a11.94 11.94 0 0 0 6.064 1.65c6.66 0 12.054-5.41 12.054-12.05 0-6.633-5.394-12.018-12.06-12.018z"/>
              </svg>
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-colors" />
            </a>
          </div>
        </div>

        <Link to="/admin/login" className="mt-6 block text-center text-xs text-muted-foreground underline">​</Link>
      </div>
    </StoreLayout>
  );
}
