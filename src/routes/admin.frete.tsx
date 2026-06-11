import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { Truck, Settings, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/frete")({
  component: Page,
});

function Page() {
  const { settings, updateSettings } = useStore();
  
  const [defaultFee, setDefaultFee] = useState(settings.shippingFee.toString());
  const [active, setActive] = useState(settings.superfreteActive !== false);
  const [feeActive, setFeeActive] = useState(settings.shippingFeeActive !== false);
  const [cep, setCep] = useState(settings.superfreteCepOrigem || "");

  useEffect(() => {
    setDefaultFee(settings.shippingFee.toString());
    setActive(settings.superfreteActive !== false);
    setFeeActive(settings.shippingFeeActive !== false);
    setCep(settings.superfreteCepOrigem || "");
  }, [settings.shippingFee, settings.superfreteActive, settings.shippingFeeActive, settings.superfreteCepOrigem]);

  const saveSettings = () => {
    const val = parseFloat(defaultFee);
    if (isNaN(val)) return toast.error("Valor do frete fixo inválido");
    
    updateSettings({ 
      ...settings, 
      shippingFee: val,
      superfreteActive: active,
      shippingFeeActive: feeActive,
      superfreteCepOrigem: cep
    });
    
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <AdminLayout title="Configuração de Frete">
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        
        {/* Card SuperFrete */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold">Integração SuperFrete</h2>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Cálculo automático de PAC e SEDEX no checkout.
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
                <div className="text-sm font-semibold text-foreground">Ativar Integração</div>
                <div className="text-[11px] text-muted-foreground leading-tight">Exibe as cotações em tempo real no checkout</div>
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-foreground">CEP de Origem (Sua loja)</span>
              <input 
                type="text" 
                value={cep} 
                onChange={e => setCep(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 88735000"
                maxLength={8}
                className="mt-1 w-full h-11 px-3 rounded-xl bg-muted/50 border border-border outline-none focus:ring-2 ring-primary/40"
              />
            </label>
          </div>
        </div>

        {/* Card Frete de Contingência */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold">Frete Fixo / Contingência</h2>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Usado apenas se a SuperFrete estiver fora do ar ou o CEP for inválido.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
              <input 
                type="checkbox"
                checked={feeActive}
                onChange={e => setFeeActive(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-primary/50 text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">Ativar Frete Fixo</div>
                <div className="text-[11px] text-muted-foreground leading-tight">Cobra um valor fixo se a integração não encontrar opções</div>
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-foreground">Valor do Frete Fixo (R$)</span>
              <input 
                type="number" 
                value={defaultFee} 
                onChange={e => setDefaultFee(e.target.value)}
                placeholder="Ex: 15.90"
                className="mt-1 w-full h-11 px-3 rounded-xl bg-muted/50 border border-border outline-none focus:ring-2 ring-primary/40"
              />
            </label>
          </div>
        </div>

      </div>

      {/* Botão Salvar Geral */}
      <div className="flex justify-end">
        <button 
          onClick={saveSettings}
          className="px-6 h-12 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
        >
          <Settings className="h-4 w-4" />
          Salvar Todas as Configurações
        </button>
      </div>

    </AdminLayout>
  );
}
