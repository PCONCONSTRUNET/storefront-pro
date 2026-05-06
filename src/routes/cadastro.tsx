import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/cadastro")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const registerCustomer = useStore(s => s.registerCustomer);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = registerCustomer(form);
    if (r.ok) { toast.success(r.message); navigate({ to: "/perfil" }); }
    else toast.error(r.message);
  };

  return (
    <StoreLayout>
      <div className="max-w-sm mx-auto px-4 py-8">
        <h1 className="font-display text-3xl text-center text-primary">Crie sua conta</h1>
        <p className="text-center text-sm text-muted-foreground mt-1 mb-6">Vamos começar?</p>
        <form onSubmit={submit} className="bg-card rounded-2xl p-5 shadow-card space-y-3">
          <Field label="Nome completo" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <Field label="E-mail" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
          <Field label="Telefone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          <Field label="Senha" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} />
          <button className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold mt-2">Criar conta</button>
        </form>
        <p className="text-center text-sm mt-4 text-muted-foreground">
          Já tem conta? <Link to="/login" className="text-primary font-semibold">Entrar</Link>
        </p>
      </div>
    </StoreLayout>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        className="mt-1.5 w-full h-12 px-4 rounded-xl bg-background text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      />
    </label>
  );
}
