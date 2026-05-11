import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { toast } from "sonner";

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
        <Card title="Entrega e pagamento">
          <Field
            label="Taxa de entrega"
            type="number"
            value={String(s.shippingFee)}
            onChange={(v) => setS({ ...s, shippingFee: parseFloat(v) || 0 })}
          />
          <Toggle
            label="Aceitar Pix"
            value={s.acceptPix}
            onChange={(v) => setS({ ...s, acceptPix: v })}
          />
          <Toggle
            label="Aceitar Cartão"
            value={s.acceptCard}
            onChange={(v) => setS({ ...s, acceptCard: v })}
          />
          <Toggle
            label="Aceitar Dinheiro na entrega"
            value={s.acceptCash}
            onChange={(v) => setS({ ...s, acceptCash: v })}
          />
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
