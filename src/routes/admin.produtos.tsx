import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { brl } from "@/lib/format";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Star,
  GripVertical,
  Crop,
} from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/data";
import { ImageCropModal } from "@/components/ImageCropModal";
import { Modal } from "@/components/AdminModal";

export const Route = createFileRoute("/admin/produtos")({
  component: Page,
});

const empty = (): Product => ({
  id: `p_${Date.now()}`,
  name: "",
  description: "",
  price: 0,
  image: "",
  gallery: [],
  category: "",
  categories: [],
  stock: 0,
  minStock: 5,
  sku: "",
  active: true,
  variations: [],
});

function Page() {
  const { products, categories, upsertProduct, deleteProduct } = useStore();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const list = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminLayout title="Produtos">
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-10 px-3 rounded-xl bg-card border border-border outline-none focus:ring-2 ring-primary/40"
        />
        <button
          onClick={() => setEditing(empty())}
          className="px-4 h-10 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Novo
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[60px_1fr_120px_100px_80px_100px] gap-3 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground">
          <span>Foto</span>
          <span>Nome</span>
          <span>Preço</span>
          <span>Estoque</span>
          <span>Status</span>
          <span></span>
        </div>
        <ul className="p-2 space-y-2">
          {list.map((p) => (
            <li
              key={p.id}
              className="relative overflow-hidden rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors shadow-sm md:grid md:grid-cols-[60px_1fr_120px_100px_80px_100px] gap-3 px-4 py-3 items-center flex"
            >
              <div
                className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-xl"
                style={{ backgroundColor: p.active ? (p.stock <= 0 ? "#f59e0b" : "#22c55e") : "#94a3b8" }}
              />
              <img
                src={p.image}
                alt=""
                className="w-12 h-12 rounded-lg object-cover bg-muted ml-1"
              />
              <div className="flex-1 min-w-0 ml-3 md:ml-0">
                <div className="font-medium text-sm truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground">SKU {p.sku}</div>
                {/* Category badges — only show categories that exist in catMap */}
                {(() => {
                  const cats = (p.categories?.length ? p.categories : (p.category ? [p.category] : []))
                    .filter((cid) => !!catMap[cid]); // hide orphan IDs not in admin categories
                  return cats.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cats.map((cid) => (
                        <span key={cid} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary leading-none">
                          {catMap[cid]}
                        </span>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>
              <div className="hidden md:block text-sm font-semibold text-primary">
                {brl(p.price)}
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-sm">
                <span>{p.stock}</span>
                {p.stock <= 0 ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-semibold">
                    Esgotado
                  </span>
                ) : p.stock <= (p.minStock ?? 5) ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold/15 text-gold font-semibold">
                    Baixo
                  </span>
                ) : null}
              </div>
              <div className="hidden md:block">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
                >
                  {p.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditing(p)}
                  className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={async () => {
                    const { confirmDialog } = await import("@/components/ConfirmDialog");
                    if (await confirmDialog({ title: "Excluir produto?", description: `“${p.name}” será removido.`, confirmLabel: "Excluir" })) {
                      deleteProduct(p.id);
                      toast.success("Excluído");
                    }
                  }}
                  className="w-8 h-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editing && (
        <Modal
          onClose={() => setEditing(null)}
          title={
            products.find((p) => p.id === editing.id)
              ? "Editar produto"
              : "Novo produto"
          }
        >
          <ProductForm
            product={editing}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            onSave={async (p) => {
              try {
                await upsertProduct(p);
                toast.success("Salvo!");
                setEditing(null);
              } catch (e: any) {
                toast.error(e?.message || "Falha ao salvar produto");
              }
            }}
          />
        </Modal>
      )}
    </AdminLayout>
  );
}

function ProductForm({
  product,
  categories,
  onSave,
}: {
  product: Product;
  categories: { id: string; name: string }[];
  onSave: (p: Product) => void;
}) {
  const [p, setP] = useState(product);
  const [tab, setTab] = useState<"basico" | "midia" | "var" | "desc">("basico");
  const tabs = [
    { id: "basico", label: "Básico" },
    { id: "midia", label: "Mídia" },
    { id: "var", label: "Variações" },
    { id: "desc", label: "Descrição" },
  ] as const;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(p);
      }}
      className="space-y-3"
    >
      <div className="flex gap-1 p-1 bg-muted rounded-xl">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 h-8 text-xs font-semibold rounded-lg transition ${tab === t.id ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "basico" && (
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Nome"
            value={p.name}
            onChange={(v) => setP({ ...p, name: v })}
            className="col-span-2"
            required
          />
          <Field
            label="SKU"
            value={p.sku}
            onChange={(v) => setP({ ...p, sku: v })}
            required
          />
          <div className="block col-span-2">
            <span className="text-xs font-medium text-muted-foreground mb-1 block">
              Categorias
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const selected = p.categories?.includes(c.id) || p.category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      let nextCats = p.categories || (p.category ? [p.category] : []);
                      if (selected) {
                        nextCats = nextCats.filter(id => id !== c.id);
                      } else {
                        nextCats = [...nextCats, c.id];
                      }
                      setP({ ...p, categories: nextCats, category: nextCats[0] || "" });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors border ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
            {(!p.categories?.length && !p.category) && (
               <p className="text-[10px] text-destructive mt-1">Selecione pelo menos uma categoria.</p>
            )}
          </div>
          <Field
            label="Preço"
            type="number"
            value={String(p.price)}
            onChange={(v) => setP({ ...p, price: parseFloat(v) || 0 })}
            required
          />
          <Field
            label="Promocional"
            type="number"
            value={String(p.oldPrice ?? "")}
            onChange={(v) =>
              setP({ ...p, oldPrice: v ? parseFloat(v) : undefined })
            }
          />
          <div className="col-span-2 flex gap-2">
            <Field
              label="Estoque"
              type="number"
              value={String(p.stock)}
              onChange={(v) => setP({ ...p, stock: parseInt(v) || 0 })}
              className="flex-1"
              required
            />
            <Field
              label="Estoque mínimo"
              type="number"
              value={String(p.minStock ?? 5)}
              onChange={(v) => setP({ ...p, minStock: parseInt(v) || 0 })}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => setP({ ...p, stock: 0 })}
              className="self-end h-11 px-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold whitespace-nowrap"
            >
              Sem estoque
            </button>
          </div>
          <p className="col-span-2 text-[11px] text-muted-foreground -mt-1">
            Você receberá um alerta quando o estoque ficar igual ou abaixo do
            mínimo.
          </p>
          <label className="col-span-2 flex items-center gap-2 p-3 rounded-xl bg-muted/50">
            <input
              type="checkbox"
              checked={p.active}
              onChange={(e) => setP({ ...p, active: e.target.checked })}
            />
            <span className="text-sm">Ativo</span>
          </label>
          <label className="col-span-2 flex items-center gap-2 p-3 rounded-xl bg-muted/50">
            <input
              type="checkbox"
              checked={!!p.hidden}
              onChange={(e) => setP({ ...p, hidden: e.target.checked })}
            />
            <span className="text-sm">Ocultar da vitrine</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              não aparece na home/categorias
            </span>
          </label>
        </div>
      )}

      {tab === "midia" && (
        <GalleryEditor
          gallery={
            p.gallery && p.gallery.length > 0
              ? p.gallery
              : p.image
                ? [p.image]
                : []
          }
          onChange={(imgs) =>
            setP({ ...p, gallery: imgs, image: imgs[0] || "" })
          }
        />
      )}

      {tab === "var" && (
        <FlatVariationsEditor
          variations={p.variations ?? []}
          onChange={(v) => setP({ ...p, variations: v })}
        />
      )}

      {tab === "desc" && (
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">
            Descrição
          </span>
          <textarea
            value={p.description}
            onChange={(e) => setP({ ...p, description: e.target.value })}
            rows={6}
            className="mt-1 w-full px-3 py-2 text-sm rounded-xl bg-muted outline-none"
          />
        </label>
      )}

      <button className="w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold">
        Salvar
      </button>
    </form>
  );
}

type VarOption = { label: string; priceDelta?: number };
type Variation = { name: string; options: VarOption[] };

// Extrai a lista plana de opções de qualquer formato de variações salvo
function flatOptions(variations: { name: string; options: (string | VarOption)[] }[]): VarOption[] {
  return variations.flatMap((v) =>
    v.options.map((o) => (typeof o === "string" ? { label: o } : o))
  );
}

// Salva como um único grupo (sem nome) para manter compatibilidade com o banco
function toVariations(opts: VarOption[]): Variation[] {
  if (opts.length === 0) return [];
  return [{ name: "Opção", options: opts }];
}

function FlatVariationsEditor({
  variations,
  onChange,
}: {
  variations: { name: string; options: (string | VarOption)[] }[];
  onChange: (v: Variation[]) => void;
}) {
  const opts = flatOptions(variations);

  const updateLabel = (i: number, val: string) => {
    const next = opts.map((o, idx) => (idx === i ? { ...o, label: val } : o));
    onChange(toVariations(next));
  };

  const updateDelta = (i: number, val: string) => {
    const d = parseFloat(val);
    const next = opts.map((o, idx) =>
      idx === i ? { ...o, priceDelta: isNaN(d) || val === "" ? undefined : d } : o
    );
    onChange(toVariations(next));
  };

  const addRow = () => {
    onChange(toVariations([...opts, { label: "", priceDelta: undefined }]));
  };

  const removeRow = (i: number) => {
    onChange(toVariations(opts.filter((_, idx) => idx !== i)));
  };

  return (
    <div className="space-y-2">
      {/* Cabeçalho das colunas */}
      {opts.length > 0 && (
        <div className="flex gap-2 px-1">
          <span className="flex-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Nome da opção</span>
          <span className="w-24 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Preço (R$)</span>
          <span className="w-5" />
        </div>
      )}

      {opts.length === 0 && (
        <div className="text-center py-6 text-xs text-muted-foreground bg-muted/40 rounded-xl">
          Nenhuma opção cadastrada.
        </div>
      )}

      {opts.map((o, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-muted/40 px-2 py-1.5 rounded-xl border border-border"
        >
          <input
            type="text"
            value={o.label}
            onChange={(e) => updateLabel(i, e.target.value)}
            placeholder="Ex: Com bico de pato"
            className="flex-1 h-9 px-2 text-sm rounded-lg bg-card outline-none focus:ring-2 ring-primary/40"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            value={o.priceDelta ?? ""}
            onChange={(e) => updateDelta(i, e.target.value)}
            placeholder="0,00"
            className="w-24 h-9 px-2 text-sm rounded-lg bg-card outline-none text-right focus:ring-2 ring-primary/40"
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="w-8 h-8 grid place-items-center rounded-lg bg-destructive/10 text-destructive flex-shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="w-full h-10 rounded-xl bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center gap-1.5"
      >
        <Plus className="h-4 w-4" /> Adicionar opção
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 w-full h-11 px-3 rounded-xl bg-muted outline-none focus:ring-2 ring-primary/40"
      />
    </label>
  );
}

function GalleryEditor({
  gallery,
  onChange,
}: {
  gallery: string[];
  onChange: (imgs: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [cropIdx, setCropIdx] = useState<number | null>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    
    // Mostra um toast de carregamento se forem muitas/grandes
    const toastId = toast.loading("Processando imagens...");

    try {
      const dataUrls = await Promise.all(
        arr.map(
          (f) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement("canvas");
                  const MAX_WIDTH = 1200;
                  const MAX_HEIGHT = 1200;
                  let width = img.width;
                  let height = img.height;

                  if (width > height) {
                    if (width > MAX_WIDTH) {
                      height *= MAX_WIDTH / width;
                      width = MAX_WIDTH;
                    }
                  } else {
                    if (height > MAX_HEIGHT) {
                      width *= MAX_HEIGHT / height;
                      height = MAX_HEIGHT;
                    }
                  }

                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Comprime para WebP e envia para o Supabase
                    canvas.toBlob(async (blob) => {
                      if (!blob) {
                        resolve(event.target?.result as string);
                        return;
                      }
                      try {
                        const { supabase } = await import("@/integrations/supabase/client");
                        const fileName = `p_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.webp`;
                        const { error } = await supabase.storage.from("products-media").upload(fileName, blob, { contentType: "image/webp" });
                        if (error) throw error;
                        const { data } = supabase.storage.from("products-media").getPublicUrl(fileName);
                        resolve(data.publicUrl);
                      } catch (err) {
                        console.error("Storage upload error:", err);
                        // Fallback to base64 if storage fails
                        resolve(canvas.toDataURL("image/webp", 0.8));
                      }
                    }, "image/webp", 0.8);
                  } else {
                    resolve(event.target?.result as string); // fallback
                  }
                };
                img.onerror = () => reject(new Error("Falha ao ler imagem"));
                img.src = event.target?.result as string;
              };
              reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
              reader.readAsDataURL(f);
            }),
        ),
      );
      
      onChange([...gallery, ...dataUrls]);
      toast.success(
        `${dataUrls.length} foto${dataUrls.length > 1 ? "s" : ""} adicionada${dataUrls.length > 1 ? "s" : ""}`,
        { id: toastId }
      );
    } catch (err) {
      console.error(err);
      toast.error("Erro ao processar imagem", { id: toastId });
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Ignora se o usuário estiver colando texto dentro de um input ou textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        e.preventDefault();
        addFiles(e.clipboardData.files);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [addFiles]);

  const addUrl = () => {
    const u = url.trim();
    if (!u) return;
    onChange([...gallery, u]);
    setUrl("");
  };

  const remove = (i: number) => onChange(gallery.filter((_, idx) => idx !== i));
  const setMain = (i: number) => {
    const next = [gallery[i], ...gallery.filter((_, idx) => idx !== i)];
    onChange(next);
  };
  const onDrop = (i: number) => {
    if (dragIdx === null || dragIdx === i) return;
    const next = [...gallery];
    const [m] = next.splice(dragIdx, 1);
    next.splice(i, 0, m);
    onChange(next);
    setDragIdx(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          Fotos do produto ({gallery.length})
        </span>
        <span className="text-[10px] text-muted-foreground">
          A primeira é a capa. Arraste para reordenar.
        </span>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-border rounded-xl p-3 bg-muted/30"
      >
        {gallery.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {gallery.map((src, i) => (
              <div
                key={src + i}
                draggable
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDrop(i);
                }}
                className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${i === 0 ? "border-primary" : "border-transparent"} bg-card cursor-move`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-current" /> Capa
                  </span>
                )}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setCropIdx(i)}
                    title="Recortar"
                    className="w-6 h-6 grid place-items-center rounded-full bg-card/90 hover:bg-card shadow"
                  >
                    <Crop className="h-3 w-3" />
                  </button>
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => setMain(i)}
                      title="Definir como capa"
                      className="w-6 h-6 grid place-items-center rounded-full bg-card/90 hover:bg-card shadow"
                    >
                      <Star className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    title="Remover"
                    className="w-6 h-6 grid place-items-center rounded-full bg-destructive text-destructive-foreground shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="absolute bottom-1 left-1 bg-black/40 text-white rounded p-0.5">
                  <GripVertical className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full py-3 rounded-lg bg-card hover:bg-muted border border-border flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Upload className="h-4 w-4" /> Enviar fotos do dispositivo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          arraste e solte ou dê Ctrl+V para colar · até 5MB cada
        </p>
      </div>

      <div className="flex gap-2 mt-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="ou cole uma URL de imagem"
          className="flex-1 h-10 px-3 rounded-xl bg-muted text-sm outline-none focus:ring-2 ring-primary/40"
        />
        <button
          type="button"
          onClick={addUrl}
          className="px-4 h-10 rounded-xl bg-primary/10 text-primary text-sm font-semibold"
        >
          Adicionar
        </button>
      </div>

      {cropIdx !== null && gallery[cropIdx] && (
        <ImageCropModal
          src={gallery[cropIdx]}
          onCancel={() => setCropIdx(null)}
          onConfirm={(dataUrl) => {
            const next = [...gallery];
            next[cropIdx] = dataUrl;
            onChange(next);
            setCropIdx(null);
            toast.success("Imagem recortada");
          }}
        />
      )}
    </div>
  );
}

