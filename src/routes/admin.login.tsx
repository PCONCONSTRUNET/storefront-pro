import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Crown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const loginAdmin = useStore(s => s.loginAdmin);
  const [pwd, setPwd] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pwd)) { toast.success("Bem-vindo!"); navigate({ to: "/admin" }); }
    else toast.error("Senha incorreta");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-rose/30 to-accent p-4">
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-soft p-6">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full gradient-primary grid place-items-center text-primary-foreground"><Crown className="h-7 w-7" /></div>
          <h1 className="font-display text-2xl text-primary mt-3">Painel Admin</h1>
          <p className="text-xs text-muted-foreground">Princesa de Laços</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Senha de administrador</span>
            <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required autoFocus
              className="mt-1 w-full h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40" />
          </label>
          <button className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold">Entrar</button>
          <p className="text-[11px] text-center text-muted-foreground mt-2">Demo: senha <strong>admin123</strong></p>
        </form>
      </div>
    </div>
  );
}
