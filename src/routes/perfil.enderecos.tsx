import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore, useStoreHydrated, selectCurrentCustomer } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { ChevronLeft, MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil/enderecos")({
  head: () => ({ meta: [{ title: "Endereços — Princesa de Laços" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const hydrated = useStoreHydrated();
  const customer = useStore(selectCurrentCustomer);
  const addAddress = useStore(s => s.addAddress);
  const removeAddress = useStore(s => s.removeAddress);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (hydrated && !customer) navigate({ to: "/login" });
  }, [hydrated, customer, navigate]);

  if (!customer) return null;
  const list = customer.addresses || [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    addAddress(value);
    setValue("");
    toast.success("Endereço adicionado");
  };

  return (
    <StoreLayout>
      <div className="max-w-2xl mx-auto px-4 py-5">
        <Link to="/perfil" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3"><ChevronLeft className="h-4 w-4" /> Voltar</Link>
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Endereços</h1>

        <form onSubmit={submit} className="bg-card rounded-2xl shadow-card p-4 space-y-2 mb-4">
          <label className="text-xs font-medium text-muted-foreground">Novo endereço</label>
          <div className="flex gap-2">
            <input value={value} onChange={e => setValue(e.target.value)} placeholder="Rua, nº, bairro, cidade/UF" className="flex-1 h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/40" />
            <button className="h-11 px-4 rounded-xl gradient-primary text-primary-foreground font-semibold inline-flex items-center gap-1"><Plus className="h-4 w-4" /> Adicionar</button>
          </div>
        </form>

        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Nenhum endereço cadastrado.</p>
        ) : (
          <ul className="bg-card rounded-2xl shadow-card divide-y divide-border overflow-hidden">
            {list.map((a, i) => (
              <li key={i} className="flex items-center gap-3 p-4">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="flex-1 text-sm">{a}</span>
                <button onClick={() => { removeAddress(i); toast.success("Removido"); }} className="text-destructive p-1.5 rounded-md hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StoreLayout>
  );
}
