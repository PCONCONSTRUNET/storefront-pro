import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { Modal } from "@/components/AdminModal";
import { Plus, Edit, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/admin/frete")({
  component: Page,
});

type ShippingRule = {
  id: string;
  state: string;
  city: string;
  fee: number;
};

function Page() {
  const { settings, updateSettings } = useStore();
  const rules = settings.shippingRules || [];
  
  const [editing, setEditing] = useState<ShippingRule | null>(null);
  const [defaultFee, setDefaultFee] = useState(settings.shippingFee.toString());

  const saveDefaultFee = () => {
    const val = parseFloat(defaultFee);
    if (isNaN(val)) return toast.error("Valor inválido");
    updateSettings({ ...settings, shippingFee: val });
    toast.success("Frete padrão salvo!");
  };

  const deleteRule = async (id: string) => {
    const { confirmDialog } = await import("@/components/ConfirmDialog");
    if (await confirmDialog({ title: "Excluir regra?", description: "Esta regra de frete será removida.", confirmLabel: "Excluir" })) {
      const newRules = rules.filter(r => r.id !== id);
      updateSettings({ ...settings, shippingRules: newRules });
      toast.success("Regra excluída");
    }
  };

  const saveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    
    if (!editing.state.trim()) return toast.error("O Estado é obrigatório");
    
    const newRules = [...rules];
    const idx = newRules.findIndex(r => r.id === editing.id);
    
    if (idx >= 0) {
      newRules[idx] = editing;
    } else {
      newRules.push({ ...editing, id: `ship_${Date.now()}` });
    }
    
    updateSettings({ ...settings, shippingRules: newRules });
    toast.success("Regra salva!");
    setEditing(null);
  };

  return (
    <AdminLayout title="Configuração de Frete">
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h2 className="font-bold mb-3 flex items-center gap-2"><Truck className="h-4 w-4" /> Frete Padrão</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Usado quando o endereço de entrega do cliente não corresponder a nenhuma das regras específicas abaixo.
          </p>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={defaultFee} 
              onChange={e => setDefaultFee(e.target.value)}
              placeholder="Ex: 15.90"
              className="flex-1 h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40"
            />
            <button 
              onClick={saveDefaultFee}
              className="px-4 h-11 rounded-xl gradient-primary text-primary-foreground font-semibold"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Regras Específicas</h2>
        <button
          onClick={() =>
            setEditing({
              id: "",
              state: "",
              city: "",
              fee: 0,
            })
          }
          className="px-4 h-10 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Nova Regra
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
          Nenhuma regra específica cadastrada.<br/>
          Todos os pedidos usarão o Frete Padrão.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          {rules.map((r) => (
            <div
              key={r.id}
              className="bg-card rounded-2xl p-4 shadow-card flex items-start gap-3 border border-border/50"
            >
              <div className="flex-1">
                <div className="font-bold">{r.state.toUpperCase()} {r.city ? `- ${r.city}` : '(Todo o estado)'}</div>
                <div className="text-primary font-bold text-lg mt-1">
                  {r.fee === 0 ? "Grátis" : brl(r.fee)}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditing(r)}
                  className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteRule(r.id)}
                  className="w-8 h-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title="Regra de Frete">
          <form onSubmit={saveRule} className="space-y-3">
            <Field
              label="Estado (UF)"
              placeholder="Ex: SC, SP, RJ..."
              value={editing.state}
              onChange={(v) => setEditing({ ...editing, state: v.toUpperCase() })}
            />
            <Field
              label="Cidade (Opcional)"
              placeholder="Ex: Lauro Müller"
              value={editing.city}
              onChange={(v) => setEditing({ ...editing, city: v })}
            />
            <p className="text-[10px] text-muted-foreground -mt-2 mb-2 leading-tight">
              Deixe em branco para aplicar ao estado inteiro.
            </p>
            <Field
              label="Valor do Frete (R$)"
              type="number"
              value={String(editing.fee)}
              onChange={(v) =>
                setEditing({ ...editing, fee: parseFloat(v) || 0 })
              }
            />
            <button className="w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold mt-4">
              Salvar Regra
            </button>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={type !== "text" && !placeholder?.includes("Opcional")}
        className="mt-1 w-full h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40"
      />
    </label>
  );
}
