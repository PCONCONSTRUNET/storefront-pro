import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { Modal } from "@/components/AdminModal";
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
            <div
              key={c.id}
              className="bg-card rounded-2xl p-4 shadow-card text-center"
            >
              <div className="text-4xl h-12 flex items-center justify-center">
                {c.image?.startsWith("http") || c.image?.startsWith("data:") || c.image?.startsWith("/") ? (
                  <img src={c.image} alt="" className="w-10 h-10 object-contain" />
                ) : (
                  c.image
                )}
              </div>
              <div className="font-semibold mt-2">{c.name}</div>
              <div className="text-xs text-muted-foreground">
                Ordem: {c.order}
              </div>
              <div className="flex gap-1 justify-center mt-3">
                <button
                  onClick={() => setEditing(c)}
                  className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={async () => {
                    const { confirmDialog } = await import("@/components/ConfirmDialog");
                    if (await confirmDialog({ title: "Excluir categoria?", description: `“${c.name}” será removida.`, confirmLabel: "Excluir" })) {
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
            <div className="block">
              <span className="text-xs font-medium text-muted-foreground mb-1 block">Emoji ou Imagem do ícone</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editing.image}
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                  placeholder="Emoji ou URL"
                  className="flex-1 h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40"
                />
                <label className="cursor-pointer h-11 px-4 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center text-sm font-semibold border border-border transition-colors">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // Limite simples de resize para ícone
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement("canvas");
                        const size = 128; // tamanho de ícone
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                           // manter aspecto
                           const scale = Math.min(size / img.width, size / img.height);
                           const w = img.width * scale;
                           const h = img.height * scale;
                           ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
                           setEditing({ ...editing, image: canvas.toDataURL("image/webp") });
                        } else {
                           setEditing({ ...editing, image: ev.target?.result as string });
                        }
                      };
                      img.src = ev.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }} />
                </label>
              </div>
            </div>
            <Field
              label="Ordem"
              type="number"
              value={String(editing.order)}
              onChange={(v) =>
                setEditing({ ...editing, order: parseInt(v) || 0 })
              }
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
