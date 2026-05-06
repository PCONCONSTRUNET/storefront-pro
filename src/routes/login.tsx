import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { X } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const loginCustomer = useStore(s => s.loginCustomer);
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = loginCustomer(email, password);
    if (r.ok) { toast.success(r.message); navigate({ to: "/perfil" }); }
    else toast.error(r.message);
  };

  const close = (v: boolean) => {
    setOpen(v);
    if (!v) navigate({ to: "/" });
  };

  return (
    <StoreLayout>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="w-[88vw] max-w-[340px] sm:max-w-sm p-0 overflow-hidden border-0 shadow-2xl rounded-2xl [&>button]:hidden">
          <div className="gradient-primary text-primary-foreground px-4 pt-4 pb-5 relative">
            <button
              onClick={() => close(false)}
              className="absolute right-3 top-3 w-7 h-7 grid place-items-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <DialogHeader className="text-left space-y-0.5">
              <DialogTitle className="font-display text-2xl text-primary-foreground">Bem-vinda</DialogTitle>
              <DialogDescription className="text-primary-foreground/90 text-xs">
                Entre na sua conta.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={submit} className="bg-card px-4 py-4 space-y-3">
            <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" />
            <Field label="Senha" type="password" value={password} onChange={setPassword} placeholder="Sua senha" />
            <button className="w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold mt-1 shadow-soft hover:opacity-95 active:scale-[0.99] transition-all text-sm">
              Entrar
            </button>
            <p className="text-center text-xs text-muted-foreground pt-0.5">
              Não tem conta? <Link to="/cadastro" className="text-primary font-semibold">Cadastre-se</Link>
            </p>
          </form>
        </DialogContent>
      </Dialog>
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
