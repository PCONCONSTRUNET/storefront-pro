import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { Modal } from "./admin.produtos";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/lib/data";

export const Route = createFileRoute("/admin/categorias")({
  component: Page,
});

function Page() {
  const { categories, upsertCategory, deleteCategory } = useStore();
  const [editing, setEditing] = useState<Category | null>(null);

  return (
    <AdminLayout title="Categorias">
      <div className="flex justify-end mb-4">
        <button
          onClick={() =>
            setEditing({
              id: `cat_${Date.now()}`,
              name: "",
              image: "🎀",
              order: categories.length + 1,
            })
          }
          className="px-4 h-10 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Nova
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories
          .sort((a, b) => a.order - b.order)
          .map((c) => (
            <div key={c.id} className="bg-card rounded-2xl p-4 shadow-card text-center">
              <div className="text-4xl">{c.image}</div>
              <div className="font-semibold mt-2">{c.name}</div>
              <div className="text-xs text-muted-foreground">Ordem: {c.order}</div>
              <div className="flex gap-1 justify-center mt-3">
                <button
                  onClick={() => setEditing(c)}
                  className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Excluir?")) {
                      deleteCategory(c.id);
                      toast.success("Excluída");
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
        <Modal onClose={() => setEditing(null)} title="Categoria">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              upsertCategory(editing);
              toast.success("Salva!");
              setEditing(null);
            }}
            className="space-y-3"
          >
            <Field
              label="Nome"
              value={editing.name}
              onChange={(v) => setEditing({ ...editing, name: v })}
            />
            <Field
              label="Emoji / ícone"
              value={editing.image}
              onChange={(v) => setEditing({ ...editing, image: v })}
            />
            <Field
              label="Ordem"
              type="number"
              value={String(editing.order)}
              onChange={(v) => setEditing({ ...editing, order: parseInt(v) || 0 })}
            />
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
        required
        className="mt-1 w-full h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40"
      />
    </label>
  );
}
