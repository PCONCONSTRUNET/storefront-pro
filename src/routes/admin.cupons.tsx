import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { Modal } from "@/components/AdminModal";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Coupon } from "@/lib/data";

export const Route = createFileRoute("/admin/cupons")({
  component: Page,
});

function Page() {
  const { coupons, upsertCoupon, deleteCoupon } = useStore();
  const [editing, setEditing] = useState<Coupon | null>(null);

  return (
    <AdminLayout title="Cupons">
      <div className="flex justify-end mb-4">
        <button
          onClick={() =>
            setEditing({
              code: "",
              type: "percent",
              value: 10,
              validUntil: "2026-12-31",
              maxUses: 100,
              usedCount: 0,
              minOrder: 0,
              active: true,
              freeShipping: false,
            })
          }
          className="px-4 h-10 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Novo cupom
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {coupons.map((c) => (
          <div
            key={c.code}
            className="bg-card rounded-2xl p-4 shadow-card flex items-start gap-3"
          >
            <div className="w-14 h-14 rounded-xl gradient-primary text-primary-foreground grid place-items-center font-bold text-xl">
              %
            </div>
            <div className="flex-1">
              <div className="font-bold">{c.code}</div>
              <div className="text-xs text-muted-foreground">
                {c.type === "free_shipping" ? "Frete grátis" : c.type === "percent" ? `${c.value}% off` : `R$ ${c.value} off`}
                {c.freeShipping && c.type !== "free_shipping" ? " + Frete grátis" : ""}
                {" "}· Mín {c.minOrder}
              </div>
              <div className="text-xs text-muted-foreground">
                Usos: {c.usedCount}/{c.maxUses} · Até {c.validUntil ? new Date(c.validUntil).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : ""}
              </div>
              <span
                className={`text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full font-semibold ${c.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
              >
                {c.active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setEditing(c)}
                className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={async () => {
                  const { confirmDialog } = await import("@/components/ConfirmDialog");
                  if (await confirmDialog({ title: "Excluir cupom?", description: `“${c.code}” será removido.`, confirmLabel: "Excluir" })) {
                    deleteCoupon(c.code);
                    toast.success("Excluído");
                  }
                }}
                className="w-8 h-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)} title="Cupom">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              upsertCoupon({
                ...editing,
                code: editing.code.toUpperCase(),
                value: parseFloat(editing.value as any) || 0,
                minOrder: parseFloat(editing.minOrder as any) || 0,
                maxUses: parseInt(editing.maxUses as any) || 0,
              });
              toast.success("Salvo!");
              setEditing(null);
            }}
            className="space-y-3"
          >
            <Field
              label="Código"
              value={editing.code}
              onChange={(v) =>
                setEditing({ ...editing, code: v.toUpperCase() })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">
                  Tipo
                </span>
                <select
                  value={editing.type}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      type: e.target.value as "percent" | "fixed" | "free_shipping",
                    })
                  }
                  className="mt-1 w-full h-11 px-3 rounded-xl bg-muted"
                >
                  <option value="percent">Percentual</option>
                  <option value="fixed">Valor fixo</option>
                  <option value="free_shipping">Frete grátis</option>
                </select>
              </label>
              {editing.type !== "free_shipping" && (
                <Field
                  label="Valor"
                  type="number"
                  value={editing.value as any ?? ""}
                  onChange={(v) => setEditing({ ...editing, value: v as any })}
                  step="0.01"
                />
              )}
              <Field
                label="Pedido mínimo"
                type="number"
                value={editing.minOrder as any ?? ""}
                onChange={(v) => setEditing({ ...editing, minOrder: v as any })}
                step="0.01"
              />
              <Field
                label="Máx. usos"
                type="number"
                value={editing.maxUses as any ?? ""}
                onChange={(v) => setEditing({ ...editing, maxUses: v as any })}
              />
              <Field
                label="Validade"
                type="date"
                value={editing.validUntil ? editing.validUntil.split('T')[0] : ""}
                onChange={(v) => setEditing({ ...editing, validUntil: v })}
              />
              <label className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) =>
                    setEditing({ ...editing, active: e.target.checked })
                  }
                />
                <span className="text-sm">Ativo</span>
              </label>
              {editing.type !== "free_shipping" && (
                <label className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={editing.freeShipping || false}
                    onChange={(e) =>
                      setEditing({ ...editing, freeShipping: e.target.checked })
                    }
                  />
                  <span className="text-sm">+ Frete Grátis</span>
                </label>
              )}
            </div>
            <button className="w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold">
              Salvar
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
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        step={step}
        className="mt-1 w-full h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40"
      />
    </label>
  );
}
