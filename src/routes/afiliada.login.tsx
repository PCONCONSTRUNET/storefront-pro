import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, useStoreHydrated } from "@/lib/store";
import logo from "@/assets/logo-princesa.png";
import { toast } from "sonner";

export const Route = createFileRoute("/afiliada/login")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const hydrated = useStoreHydrated();
  const currentId = useStore((s) => s.currentAffiliateId);
  const login = useStore((s) => s.loginAffiliate);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && currentId) navigate({ to: "/afiliada", replace: true });
  }, [hydrated, currentId, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const r = login(email, pwd);
    if (r.ok) {
      toast.success(r.message);
      navigate({ to: "/afiliada", replace: true });
    } else {
      setError(r.message);
      toast.error(r.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-rose/30 to-accent p-4">
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-soft p-6">
        <div className="text-center">
          <img
            src={logo}
            alt="Princesa de Laços"
            className="h-20 w-auto mx-auto object-contain"
            style={{ mixBlendMode: "multiply" }}
          />
          <h1 className="font-display text-2xl text-primary mt-3">Painel da Afiliada</h1>
          <p className="text-xs text-muted-foreground">Acesse com seu e-mail e senha</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Senha</span>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
              className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50"
            />
          </label>
          <button
            disabled={submitting}
            className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70"
          >
            Entrar
          </button>
          <p className="text-[11px] text-muted-foreground text-center pt-1">
            <Link to="/esqueci-senha" className="text-primary underline">Esqueci minha senha</Link>
          </p>
          <p className="text-[11px] text-muted-foreground text-center pt-2">
            Ainda não é afiliada?{" "}
            <Link to="/afiliada/cadastro" className="text-primary underline">
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
