import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, useStoreHydrated, selectCurrentCustomer } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { ChevronLeft, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Princesa de Laços" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const hydrated = useStoreHydrated();
  const customer = useStore(selectCurrentCustomer);
  const updateCustomer = useStore((s) => s.updateCustomer);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    if (hydrated && !customer) navigate({ to: "/login" });
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
    }
  }, [hydrated, customer, navigate]);

  if (!customer) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: { name: string; phone: string; password?: string } = {
      name,
      phone,
    };
    if (pwd) data.password = pwd;
    const r = await updateCustomer(data);
    if (r.ok) {
      toast.success(r.message);
      setPwd("");
    } else toast.error(r.message);
  };

  return (
    <StoreLayout>
      <div className="max-w-2xl mx-auto px-4 py-5">
        <Link
          to="/perfil"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" /> Configurações
        </h1>

        <form
          onSubmit={save}
          className="bg-card rounded-2xl shadow-card p-4 space-y-3"
        >
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              Nome
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              E-mail
            </span>
            <input
              value={customer.email}
              disabled
              className="mt-1 w-full h-11 px-3 rounded-xl bg-muted border border-border text-muted-foreground"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              Telefone
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              Nova senha (opcional)
            </span>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Deixe em branco para manter"
              className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <button className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold">
            Salvar alterações
          </button>
        </form>
      </div>
    </StoreLayout>
  );
}
