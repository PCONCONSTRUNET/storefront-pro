import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { Settings, Gift } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/frete-automatico")({
  component: Page,
});

function Page() {
  const { settings, updateSettings } = useStore();
  
  const [active, setActive] = useState(settings.freeShippingAutoActive || false);
  const [minAmount, setMinAmount] = useState(
    (settings.freeShippingAutoMinAmount || 0).toString()
  );

  useEffect(() => {
    setActive(settings.freeShippingAutoActive || false);
    setMinAmount((settings.freeShippingAutoMinAmount || 0).toString());
  }, [settings.freeShippingAutoActive, settings.freeShippingAutoMinAmount]);

  const saveSettings = () => {
    const val = parseFloat(minAmount);
    if (isNaN(val) || val < 0) return toast.error("Valor mínimo inválido");
    
    updateSettings({ 
      ...settings, 
      freeShippingAutoActive: active,
      freeShippingAutoMinAmount: val
    });
    
    toast.success("Promoção de Frete salva com sucesso!");
  };

  return (
    <AdminLayout title="Promoção de Frete Grátis">
      <div className="max-w-2xl">
        <div className="bg-card rounded-2xl p-5 shadow-card border border-primary/20 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold">Frete Grátis Automático</h2>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Se o cliente atingir esse valor em produtos, o frete fica grátis no checkout sem precisar de cupom.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
              <input 
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-primary/50 text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">Ativar Promoção</div>
                <div className="text-[11px] text-muted-foreground leading-tight">Quando ativado, os clientes que atingirem o valor mínimo terão frete grátis.</div>
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-foreground">Valor Mínimo do Carrinho (R$)</span>
              <input 
                type="number" 
                value={minAmount} 
                onChange={e => setMinAmount(e.target.value)}
                placeholder="Ex: 200.00"
                min="0"
                step="0.01"
                className="mt-1 w-full h-11 px-3 rounded-xl bg-muted/50 border border-border outline-none focus:ring-2 ring-primary/40"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={saveSettings}
            className="px-6 h-12 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            <Settings className="h-4 w-4" />
            Salvar Configuração
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
