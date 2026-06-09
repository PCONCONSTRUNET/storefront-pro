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
