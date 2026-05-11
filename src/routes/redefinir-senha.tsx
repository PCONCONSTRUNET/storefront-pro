import {
  createFileRoute,
  useNavigate,
  useSearch,
  Link,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useStore } from "@/lib/store";
import { consumeResetToken, type ResetSubject } from "@/lib/passwordReset";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

const searchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/redefinir-senha")({
  validateSearch: searchSchema,
  component: Page,
});

function Page() {
  const { token } = useSearch({ from: "/redefinir-senha" });
  const navigate = useNavigate();
  const resetPasswordFor = useStore((s) => s.resetPasswordFor);

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<{
    subjectType: ResetSubject;
    subjectEmail: string;
  } | null>(null);
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      const r = await consumeResetToken(token);
      if (!active) return;
      setAccount(r);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [token]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    if (pwd !== pwd2) {
      toast.error("As senhas não conferem");
      return;
    }
    setSubmitting(true);
    const r = resetPasswordFor(account.subjectType, account.subjectEmail, pwd);
    if (r.ok) {
      toast.success(r.message);
      setDone(true);
    } else {
      toast.error(r.message);
      setSubmitting(false);
    }
  };

  const loginPath =
    account?.subjectType === "admin"
      ? "/admin/login"
      : account?.subjectType === "affiliate"
        ? "/afiliada/login"
        : "/login";

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-rose/30 to-accent p-4">
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-soft p-6">
        <h1 className="font-display text-2xl text-primary text-center">
          Redefinir senha
        </h1>

        {loading ? (
          <div className="mt-6 grid place-items-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : !token || !account ? (
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Link inválido ou expirado.
            </p>
            <Link
              to="/esqueci-senha"
              className="inline-block text-sm text-primary underline"
            >
              Solicitar novo link
            </Link>
          </div>
        ) : done ? (
          <div className="mt-6 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 mx-auto text-primary" />
            <p className="text-sm text-foreground">
              Senha redefinida com sucesso!
            </p>
            <button
              onClick={() => navigate({ to: loginPath, replace: true })}
              className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold"
            >
              Ir para o login
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              Conta:{" "}
              <span className="font-medium text-foreground">
                {account.subjectEmail}
              </span>
            </p>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                Nova senha
              </span>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                required
                minLength={4}
                autoFocus
                className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                Confirmar senha
              </span>
              <input
                type="password"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                required
                minLength={4}
                className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50"
              />
            </label>
            <button
              disabled={submitting}
              className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Redefinir senha
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
