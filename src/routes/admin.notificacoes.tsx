import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Bell, Send } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/notificacoes")({
  component: Page,
});

type Notif = { id: string; title: string; body: string; audience: "all" | "customers"; sentAt: string };

function Page() {
  const customers = useStore(s => s.customers);
  const [history, setHistory] = useState<Notif[]>([
    { id: "n1", title: "Bem-vinda à Princesa de Laços!", body: "Use o cupom PRIMEIRA10 e ganhe 10% off", audience: "all", sentAt: new Date().toISOString() },
  ]);
  const [form, setForm] = useState({ title: "", body: "", audience: "all" as "all" | "customers" });

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setHistory([{ id: `n_${Date.now()}`, ...form, sentAt: new Date().toISOString() }, ...history]);
    setForm({ title: "", body: "", audience: "all" });
    toast.success("Notificação enviada (simulada)");
  };

  return (
    <AdminLayout title="Notificações">
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <form onSubmit={send} className="bg-card rounded-2xl p-4 shadow-card space-y-3">
          <h2 className="font-bold flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Nova notificação</h2>
          <Field label="Título" value={form.title} onChange={v => setForm({ ...form, title: v })} />
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Mensagem</span>
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={4} required
              className="mt-1 w-full px-3 py-2 rounded-xl bg-muted outline-none" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Público</span>
            <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value as "all" | "customers" })} className="mt-1 w-full h-11 px-3 rounded-xl bg-muted">
              <option value="all">Todos</option>
              <option value="customers">Clientes cadastrados ({customers.length})</option>
            </select>
          </label>
          <button className="w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
            <Send className="h-4 w-4" /> Enviar
          </button>
          <p className="text-[11px] text-muted-foreground text-center">Estrutura preparada para integração futura com Push (FCM/OneSignal).</p>
        </form>

        <div className="bg-card rounded-2xl p-4 shadow-card">
          <h2 className="font-bold mb-3">Histórico</h2>
          <ul className="space-y-2">
            {history.map(n => (
              <li key={n.id} className="bg-muted/50 rounded-xl p-3">
                <div className="font-semibold text-sm">{n.title}</div>
                <div className="text-xs text-muted-foreground">{n.body}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.sentAt).toLocaleString("pt-BR")}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} required
        className="mt-1 w-full h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40" />
    </label>
  );
}
