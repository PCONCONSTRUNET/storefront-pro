import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/afiliada/login")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const login = useStore(s => s.loginAffiliate);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = login(email, pwd);
    if (r.ok) { toast.success(r.message); navigate({ to: "/afiliada" }); }
    else toast.error(r.message);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-rose/30 to-accent p-4">
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-soft p-6">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full gradient-primary grid place-items-center text-primary-foreground"><Sparkles className="h-7 w-7" /></div>
          <h1 className="font-display text-2xl text-primary mt-3">Painel da Afiliada</h1>
          <p className="text-xs text-muted-foreground">Acesse com seu e-mail e senha</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">E-mail</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
              className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Senha</span>
            <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required
              className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50" />
          </label>
          <button className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold">Entrar</button>
          <p className="text-[11px] text-muted-foreground text-center pt-2">
            Ainda não é afiliada? Fale com a administradora da loja.
          </p>
        </form>
      </div>
    </div>
  );
}
