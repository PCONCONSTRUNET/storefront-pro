import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { X } from "lucide-react";

export const Route = createFileRoute("/cadastro")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const registerCustomer = useStore(s => s.registerCustomer);
  const [open, setOpen] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = registerCustomer(form);
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
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-3xl [&>button]:hidden">
          <div className="gradient-primary text-primary-foreground px-6 pt-6 pb-8 relative">
            <button
              onClick={() => close(false)}
              className="absolute right-4 top-4 w-8 h-8 grid place-items-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="font-display text-3xl text-primary-foreground">Crie sua conta</DialogTitle>
              <DialogDescription className="text-primary-foreground/90 text-sm">
                Preencha os dados para começar a comprar.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={submit} className="bg-card px-6 py-6 space-y-4">
            <Field label="Nome completo" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Como devemos te chamar?" />
            <Field label="E-mail" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="seu@email.com" />
            <Field label="Telefone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="(11) 99999-9999" />
            <Field label="Senha" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="Mínimo 6 caracteres" />
            <button className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold mt-2 shadow-soft hover:opacity-95 active:scale-[0.99] transition-all">
              Criar conta
            </button>
            <p className="text-center text-sm text-muted-foreground pt-1">
              Já tem conta? <Link to="/login" className="text-primary font-semibold">Entrar</Link>
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
        className="mt-1.5 w-full h-12 px-4 rounded-xl bg-background text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      />
    </label>
  );
}
