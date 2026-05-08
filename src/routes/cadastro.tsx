import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

export const Route = createFileRoute("/cadastro")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const router = useRouter();
  const registerCustomer = useStore(s => s.registerCustomer);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    router.preloadRoute({ to: "/perfil" }).catch(() => {});
  }, [router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const r = registerCustomer(form);
    if (r.ok) {
      // Dispara e-mail de boas-vindas (não bloqueia o fluxo se falhar)
      supabase.functions
        .invoke("send-welcome-email", { body: { email: form.email, name: form.name } })
        .catch(err => console.warn("welcome email failed", err));
      navigate({ to: "/perfil" });
      toast.success(r.message);
    } else {
      toast.error(r.message);
      setSubmitting(false);
    }
  };

  const close = () => navigate({ to: "/" });

  return (
    <StoreLayout>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-overlay-in" onClick={close}>
        <div
          className="w-full max-w-[340px] sm:max-w-sm bg-card rounded-2xl overflow-hidden shadow-2xl animate-modal-in"
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
            <h2 className="font-display text-2xl">Crie sua conta</h2>
            <p className="text-primary-foreground/90 text-xs">Preencha os dados para começar.</p>
          </div>

          <form onSubmit={submit} className="px-4 py-4 space-y-3">
            <Field label="Nome completo" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Como devemos te chamar?" />
            <Field label="E-mail" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="seu@email.com" />
            <Field label="Telefone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="(11) 99999-9999" />
            <Field label="Senha" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="Mínimo 6 caracteres" />
            <button disabled={submitting} className="w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold mt-1 shadow-soft hover:opacity-95 active:scale-[0.99] transition-all text-sm disabled:opacity-70">
              {submitting ? "Criando..." : "Criar conta"}
            </button>
            <p className="text-center text-xs text-muted-foreground pt-0.5">
              Já tem conta? <Link to="/login" className="text-primary font-semibold">Entrar</Link>
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
