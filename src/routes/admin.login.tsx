import {
  createFileRoute,
  useNavigate,
  useRouter,
  Link,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, useStoreHydrated } from "@/lib/store";
import { Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const router = useRouter();
  const hydrated = useStoreHydrated();
  const isAdmin = useStore((s) => s.isAdmin);
  const loginAdmin = useStore((s) => s.loginAdmin);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    router.preloadRoute({ to: "/admin/dashboard" }).catch(() => {});
  }, [router]);

  useEffect(() => {
    if (hydrated && isAdmin) navigate({ to: "/admin/dashboard" });
  }, [hydrated, isAdmin, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const r = loginAdmin(email, pwd);
    if (r.ok) {
      window.history.replaceState(null, "", "/admin/dashboard");
      navigate({ to: "/admin/dashboard", replace: true });
      toast.success(r.message);
    } else {
      toast.error(r.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-rose/30 to-accent p-4">
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-soft p-6">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full gradient-primary grid place-items-center text-primary-foreground">
            <Crown className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl text-primary mt-3">
            Painel Admin
          </h1>
          <p className="text-xs text-muted-foreground">
            Acesso restrito a e-mails autorizados
          </p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              E-mail autorizado
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="seu@email.com"
              className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              Senha
            </span>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
              placeholder="Sua senha"
              className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </label>
          <button
            disabled={submitting}
            className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Entrando..." : "Entrar"}
          </button>
          <p className="text-[11px] text-muted-foreground text-center pt-2">
            <Link to="/esqueci-senha" className="text-primary underline">
              Esqueci minha senha
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
