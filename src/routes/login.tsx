import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { toast } from "sonner";

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

  return (
    <StoreLayout>
      <div className="max-w-sm mx-auto px-4 py-8">
        <h1 className="font-display text-3xl text-center text-primary">Bem-vinda</h1>
        <p className="text-center text-sm text-muted-foreground mt-1 mb-6">Entre na sua conta</p>
        <form onSubmit={submit} className="bg-card rounded-2xl p-5 shadow-card space-y-3">
          <Field label="E-mail" type="email" value={email} onChange={setEmail} />
          <Field label="Senha" type="password" value={password} onChange={setPassword} />
          <button className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold mt-2">Entrar</button>
        </form>
        <p className="text-center text-sm mt-4 text-muted-foreground">
          Não tem conta? <Link to="/cadastro" className="text-primary font-semibold">Cadastre-se</Link>
        </p>
      </div>
    </StoreLayout>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required className="mt-1 w-full h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40" />
    </label>
  );
}
