import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { toast } from "sonner";
import { X } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const loginCustomer = useStore(s => s.loginCustomer);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = loginCustomer(email, password);
    if (r.ok) { toast.success(r.message); navigate({ to: "/perfil" }); }
    else toast.error(r.message);
  };

  const close = () => navigate({ to: "/" });

  return (
    <StoreLayout>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={close}>
        <div
          className="w-full max-w-[340px] sm:max-w-sm bg-card rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="gradient-primary text-primary-foreground px-4 pt-4 pb-5 relative">
            <button
              onClick={close}
              className="absolute right-3 top-3 w-7 h-7 grid place-items-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Fechar"
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <h2 className="font-display text-2xl">Bem-vinda</h2>
            <p className="text-primary-foreground/90 text-xs">Entre na sua conta.</p>
          </div>

          <form onSubmit={submit} className="px-4 py-4 space-y-3">
            <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" />
            <Field label="Senha" type="password" value={password} onChange={setPassword} placeholder="Sua senha" />
            <button className="w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold mt-1 shadow-soft hover:opacity-95 active:scale-[0.99] transition-all text-sm">
              Entrar
            </button>
            <p className="text-center text-xs text-muted-foreground pt-0.5">
              Não tem conta? <Link to="/cadastro" className="text-primary font-semibold">Cadastre-se</Link>
            </p>
          </form>
        </div>
      </div>
    </StoreLayout>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        placeholder={placeholder}
        className="mt-1 w-full h-10 px-3 rounded-lg bg-background text-sm text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      />
    </label>
  );
}
