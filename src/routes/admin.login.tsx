import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, useStoreHydrated } from "@/lib/store";
import { Crown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const hydrated = useStoreHydrated();
  const isAdmin = useStore(s => s.isAdmin);
  const loginAdmin = useStore(s => s.loginAdmin);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    if (hydrated && isAdmin) navigate({ to: "/admin" });
  }, [hydrated, isAdmin, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = loginAdmin(email, pwd);
    if (r.ok) { toast.success(r.message); navigate({ to: "/admin" }); }
    else toast.error(r.message);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-rose/30 to-accent p-4">
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-soft p-6">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full gradient-primary grid place-items-center text-primary-foreground"><Crown className="h-7 w-7" /></div>
          <h1 className="font-display text-2xl text-primary mt-3">Painel Admin</h1>
          <p className="text-xs text-muted-foreground">Acesso restrito a e-mails autorizados</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">E-mail autorizado</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="seu@email.com"
              className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Senha</span>
            <input
              type="password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              required
              placeholder="Sua senha"
              className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </label>
          <button className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold">Entrar</button>
        </form>
      </div>
    </div>
  );
}
