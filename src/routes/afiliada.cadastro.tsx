import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, useStoreHydrated } from "@/lib/store";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/afiliada/cadastro")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const hydrated = useStoreHydrated();
  const currentId = useStore(s => s.currentAffiliateId);
  const register = useStore(s => s.registerAffiliate);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  useEffect(() => {
    if (hydrated && currentId) navigate({ to: "/afiliada" });
  }, [hydrated, currentId, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = register(form);
    if (r.ok) { toast.success(r.message); navigate({ to: "/afiliada" }); }
    else toast.error(r.message);
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-rose/30 to-accent p-4">
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-soft p-6">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full gradient-primary grid place-items-center text-primary-foreground"><Sparkles className="h-7 w-7" /></div>
          <h1 className="font-display text-2xl text-primary mt-3">Seja uma afiliada</h1>
          <p className="text-xs text-muted-foreground">Crie sua conta para registrar suas vendas</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <Field label="Nome completo *">
            <input value={form.name} onChange={set("name")} required autoFocus className="input" />
          </Field>
          <Field label="E-mail *">
            <input type="email" value={form.email} onChange={set("email")} required className="input" />
          </Field>
          <Field label="WhatsApp">
            <input value={form.phone} onChange={set("phone")} className="input" />
          </Field>
          <Field label="Senha *">
            <input type="password" value={form.password} onChange={set("password")} required minLength={4} className="input" />
          </Field>
          <button className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold">Criar conta</button>
          <p className="text-[11px] text-muted-foreground text-center pt-2">
            Já tem cadastro? <Link to="/afiliada/login" className="text-primary underline">Entrar</Link>
          </p>
          <p className="text-[10px] text-muted-foreground text-center">
            Sua comissão será definida pela administradora após o cadastro.
          </p>
        </form>
      </div>
      <style>{`.input{margin-top:4px;width:100%;height:44px;padding:0 12px;border-radius:12px;background:var(--background);border:1px solid var(--border);outline:none}.input:focus{box-shadow:0 0 0 2px color-mix(in oklab, var(--primary) 50%, transparent)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
