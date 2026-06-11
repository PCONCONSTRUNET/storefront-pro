import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/configuracoes")({
  component: Page,
});

function Page() {
  const { settings, updateSettings } = useStore();
  const [s, setS] = useState(settings);

  const save = () => {
    updateSettings(s);
    toast.success("Configurações salvas!");
  };

  const handleLimpezaGeral = async () => {
    if (!window.confirm("ATENÇÃO: Isso irá apagar todos os clientes, pedidos, transações e histórico (exceto gateway e produtos). ESSA AÇÃO É IRREVERSÍVEL. Tem certeza?")) {
      return;
    }
    
    const tId = toast.loading("Limpando o sistema...");
    try {
      const { error } = await supabase.functions.invoke("admin-limpeza-geral");
      if (error) throw error;
      toast.success("Sistema limpo com sucesso!", { id: tId });
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao limpar o sistema: " + e.message, { id: tId });
    }
  };

  return (
    <AdminLayout title="Configurações da loja">
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Banner principal">
          <Field
            label="Título"
            value={s.bannerTitle}
            onChange={(v) => setS({ ...s, bannerTitle: v })}
          />
          <Field
            label="Subtítulo"
            value={s.bannerSubtitle}
            onChange={(v) => setS({ ...s, bannerSubtitle: v })}
          />
        </Card>
        <Card title="Contato">
          <Field
            label="WhatsApp"
            value={s.whatsapp || ""}
            onChange={(v) => setS({ ...s, whatsapp: v })}
          />
          <Field
            label="E-mail"
            value={s.email || ""}
            onChange={(v) => setS({ ...s, email: v })}
          />
        </Card>
        <Card title="Endereço Remetente (SuperFrete)">
          <Field
            label="CEP"
            value={s.superfreteCepOrigem || ""}
            onChange={(v) => setS({ ...s, superfreteCepOrigem: v })}
          />
          <Field
            label="Rua"
            value={s.superfreteAddressStreet || ""}
            onChange={(v) => setS({ ...s, superfreteAddressStreet: v })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Número"
              value={s.superfreteAddressNumber || ""}
              onChange={(v) => setS({ ...s, superfreteAddressNumber: v })}
            />
            <Field
              label="Bairro"
              value={s.superfreteAddressNeighborhood || ""}
              onChange={(v) => setS({ ...s, superfreteAddressNeighborhood: v })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Cidade"
              value={s.superfreteAddressCity || ""}
              onChange={(v) => setS({ ...s, superfreteAddressCity: v })}
            />
            <Field
              label="Estado (Sigla)"
              value={s.superfreteAddressState || ""}
              onChange={(v) => setS({ ...s, superfreteAddressState: v })}
            />
          </div>
        </Card>
        <Card title="Sistema">
          <div className="text-sm text-muted-foreground mb-3">
            Se o sistema foi atualizado recentemente e as mudanças não apareceram, você pode forçar a atualização limpando o cache do navegador.
          </div>
          <button
            onClick={async () => {
              try {
                if ("serviceWorker" in navigator) {
                  const regs = await navigator.serviceWorker.getRegistrations();
                  for (let r of regs) {
                    await r.unregister();
                  }
                }
                if ("caches" in window) {
                  const keys = await caches.keys();
                  for (let k of keys) {
                    await caches.delete(k);
                  }
                }
              } catch (e) {}
              window.location.reload();
            }}
            className="w-full h-11 rounded-full border border-border flex items-center justify-center gap-2 hover:bg-muted font-semibold text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            Forçar atualização
          </button>
        </Card>
        <Card title="Zona de Perigo">
          <div className="text-sm text-red-500 mb-3">
            <strong>Cuidado:</strong> Limpeza geral do painel. Apaga todos os pedidos, clientes e dashboard financeiro. O gateway, produtos e categorias ficam intactos.
          </div>
          <button
            onClick={handleLimpezaGeral}
            className="w-full h-11 rounded-full border border-red-200 bg-red-50 text-red-600 flex items-center justify-center gap-2 hover:bg-red-100 font-semibold text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            Fazer Limpeza Geral
          </button>
        </Card>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={save}
          className="px-6 h-11 rounded-full gradient-primary text-primary-foreground font-semibold"
        >
          Salvar tudo
        </button>
      </div>
    </AdminLayout>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <h2 className="font-bold mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40"
      />
    </label>
  );
}
function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 cursor-pointer">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-primary" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 ${value ? "left-5" : "left-0.5"} w-5 h-5 rounded-full bg-white shadow transition-all`}
        />
      </button>
    </label>
  );
}
