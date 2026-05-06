import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl } from "@/lib/format";
import { Plus, Edit, Trash2, X, Upload, Star, GripVertical } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/data";

export const Route = createFileRoute("/admin/produtos")({
  component: Page,
});

const empty = (): Product => ({
  id: `p_${Date.now()}`, name: "", description: "", price: 0, image: "", gallery: [], category: "lacos", stock: 0, sku: "", active: true,
});

function Page() {
  const { products, categories, upsertProduct, deleteProduct } = useStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const list = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Produtos">
      <div className="flex gap-2 mb-4">
        <input placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 h-10 px-3 rounded-xl bg-card border border-border outline-none focus:ring-2 ring-primary/40" />
        <button onClick={() => setEditing(empty())} className="px-4 h-10 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Novo
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[60px_1fr_120px_100px_80px_100px] gap-3 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground">
          <span>Foto</span><span>Nome</span><span>Preço</span><span>Estoque</span><span>Status</span><span></span>
        </div>
        <ul className="divide-y divide-border">
          {list.map(p => (
            <li key={p.id} className="md:grid md:grid-cols-[60px_1fr_120px_100px_80px_100px] gap-3 px-4 py-3 items-center flex">
              <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-muted" />
              <div className="flex-1 min-w-0 ml-3 md:ml-0">
                <div className="font-medium text-sm truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground">SKU {p.sku}</div>
              </div>
              <div className="hidden md:block text-sm font-semibold text-primary">{brl(p.price)}</div>
              <div className="hidden md:block text-sm">{p.stock}</div>
              <div className="hidden md:block">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                  {p.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(p)} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted"><Edit className="h-4 w-4" /></button>
                <button onClick={() => { if (confirm("Excluir produto?")) { deleteProduct(p.id); toast.success("Excluído"); }}}
                  className="w-8 h-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={products.find(p => p.id === editing.id) ? "Editar produto" : "Novo produto"}>
          <ProductForm product={editing} categories={categories.map(c => ({ id: c.id, name: c.name }))}
            onSave={(p) => { upsertProduct(p); toast.success("Salvo!"); setEditing(null); }} />
        </Modal>
      )}
    </AdminLayout>
  );
}

function ProductForm({ product, categories, onSave }: { product: Product; categories: { id: string; name: string }[]; onSave: (p: Product) => void }) {
  const [p, setP] = useState(product);
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(p); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nome" value={p.name} onChange={v => setP({ ...p, name: v })} className="col-span-2" required />
        <Field label="SKU" value={p.sku} onChange={v => setP({ ...p, sku: v })} required />
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Categoria</span>
          <select value={p.category} onChange={e => setP({ ...p, category: e.target.value })} className="mt-1 w-full h-11 px-3 rounded-xl bg-muted outline-none">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <Field label="Preço" type="number" value={String(p.price)} onChange={v => setP({ ...p, price: parseFloat(v) || 0 })} required />
        <Field label="Preço promocional" type="number" value={String(p.oldPrice ?? "")} onChange={v => setP({ ...p, oldPrice: v ? parseFloat(v) : undefined })} />
        <Field label="Estoque" type="number" value={String(p.stock)} onChange={v => setP({ ...p, stock: parseInt(v) || 0 })} required />
        <label className="flex items-center gap-2 mt-6">
          <input type="checkbox" checked={p.active} onChange={e => setP({ ...p, active: e.target.checked })} />
          <span className="text-sm">Ativo</span>
        </label>
      </div>
      <GalleryEditor
        gallery={p.gallery && p.gallery.length > 0 ? p.gallery : (p.image ? [p.image] : [])}
        onChange={(imgs) => setP({ ...p, gallery: imgs, image: imgs[0] || "" })}
      />
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground">Descrição</span>
        <textarea value={p.description} onChange={e => setP({ ...p, description: e.target.value })} rows={3}
          className="mt-1 w-full px-3 py-2 rounded-xl bg-muted outline-none" />
      </label>
      <button className="w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold">Salvar</button>
    </form>
  );
}

function Field({ label, value, onChange, type = "text", className = "", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string; required?: boolean }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="mt-1 w-full h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40" />
    </label>
  );
}

export function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-3" onClick={onClose}>
      <div className="bg-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-soft" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-card flex items-center justify-between p-4 border-b border-border z-10">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
