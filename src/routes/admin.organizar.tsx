import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { ArrowUp, ArrowDown, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Category, Product } from "@/lib/data";

export const Route = createFileRoute("/admin/organizar")({
  component: Page,
});

function Page() {
  const { categories, products, upsertCategory, upsertProduct, sync } =
    useStore();
  useEffect(() => {
    sync();
  }, [sync]);

  const [tab, setTab] = useState<"categorias" | "produtos">("categorias");

  const initialCats = useMemo(
    () =>
      [...categories].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [categories],
  );
  const initialProds = useMemo(
    () =>
      [...products].sort(
        (a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999),
      ),
    [products],
  );

  const [catList, setCatList] = useState<Category[]>(initialCats);
  const [prodList, setProdList] = useState<Product[]>(initialProds);
  const [catFilter, setCatFilter] = useState<string>("");

  // Re-sync local state if the store updates
  useEffect(() => setCatList(initialCats), [initialCats]);
  useEffect(() => setProdList(initialProds), [initialProds]);

  const move = <T,>(arr: T[], from: number, to: number): T[] => {
    if (to < 0 || to >= arr.length) return arr;
    const next = [...arr];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  };

  const saveCategories = async () => {
    try {
      await Promise.all(
        catList.map((c, i) => upsertCategory({ ...c, order: i + 1 })),
      );
      toast.success("Ordem das categorias salva!");
    } catch (e) {
      toast.error("Erro ao salvar");
    }
  };

  const saveProducts = async () => {
    try {
      const visible = catFilter
        ? prodList.filter((p) => p.categories?.includes(catFilter) || p.category === catFilter)
        : prodList;
      await Promise.all(
        visible.map((p, i) => upsertProduct({ ...p, sortOrder: i + 1 })),
      );
      toast.success("Ordem dos produtos salva!");
    } catch (e) {
      toast.error("Erro ao salvar");
    }
  };

  const visibleProds = catFilter
    ? prodList.filter((p) => p.categories?.includes(catFilter) || p.category === catFilter)
    : prodList;

  return (
    <AdminLayout title="Organizar Home">
      <div className="bg-card rounded-2xl p-3 shadow-card mb-3 text-xs text-muted-foreground">
        Reorganize a ordem em que as categorias e os produtos aparecem na
        página inicial. Use as setas para subir ou descer e clique em{" "}
        <strong>Salvar</strong> ao terminar.
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setTab("categorias")}
          className={`flex-1 h-10 rounded-full text-sm font-semibold transition ${
            tab === "categorias"
              ? "bg-primary text-primary-foreground shadow-card"
              : "bg-card border border-border hover:bg-muted"
          }`}
        >
          Categorias ({catList.length})
        </button>
        <button
          onClick={() => setTab("produtos")}
          className={`flex-1 h-10 rounded-full text-sm font-semibold transition ${
            tab === "produtos"
              ? "bg-primary text-primary-foreground shadow-card"
              : "bg-card border border-border hover:bg-muted"
          }`}
        >
          Produtos ({prodList.length})
        </button>
      </div>

      {tab === "categorias" && (
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="px-3 py-2 flex items-center justify-between border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground">
              Ordem das categorias
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCatList(initialCats)}
                className="px-3 h-8 rounded-full bg-muted text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Resetar
              </button>
              <button
                onClick={saveCategories}
                className="px-3 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" /> Salvar
              </button>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {catList.map((c, i) => (
              <li
                key={c.id}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40"
              >
                <span className="text-[10px] w-6 text-center font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="text-2xl w-8 h-8 grid place-items-center">
                  {c.image?.startsWith("http") || c.image?.startsWith("data:") || c.image?.startsWith("/") ? (
                    <img src={c.image} alt="" className="w-6 h-6 object-contain" />
                  ) : (
                    c.image
                  )}
                </span>
                <span className="flex-1 font-medium text-sm truncate">
                  {c.name}
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={i === 0}
                    onClick={() => setCatList(move(catList, i, i - 1))}
                    className="w-8 h-8 grid place-items-center rounded-lg bg-muted hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    disabled={i === catList.length - 1}
                    onClick={() => setCatList(move(catList, i, i + 1))}
                    className="w-8 h-8 grid place-items-center rounded-lg bg-muted hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "produtos" && (
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="px-3 py-2 flex flex-wrap items-center gap-2 border-b border-border">
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="h-8 px-2 rounded-full bg-muted border border-border text-xs"
            >
              <option value="">Todas as categorias</option>
              {catList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              {visibleProds.length} produto(s)
            </span>
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => setProdList(initialProds)}
                className="px-3 h-8 rounded-full bg-muted text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Resetar
              </button>
              <button
                onClick={saveProducts}
                className="px-3 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" /> Salvar
              </button>
            </div>
          </div>
          {visibleProds.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              Nenhum produto.
            </div>
          ) : (
            <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto">
              {visibleProds.map((p, i) => {
                // index inside full prodList (for move op)
                const fullIdx = prodList.findIndex((x) => x.id === p.id);
                const prevId = visibleProds[i - 1]?.id;
                const nextId = visibleProds[i + 1]?.id;
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted/40"
                  >
                    <span className="text-[10px] w-6 text-center font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    {p.image ? (
                      <img
                        src={p.image}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-muted"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {p.categories?.length ? p.categories.join(", ") : p.category} · {p.active ? "ativo" : "inativo"}
                        {p.hidden ? " · oculto" : ""}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        disabled={!prevId}
                        onClick={() => {
                          const prevIdx = prodList.findIndex(
                            (x) => x.id === prevId,
                          );
                          setProdList(move(prodList, fullIdx, prevIdx));
                        }}
                        className="w-8 h-8 grid place-items-center rounded-lg bg-muted hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        disabled={!nextId}
                        onClick={() => {
                          const nextIdx = prodList.findIndex(
                            (x) => x.id === nextId,
                          );
                          setProdList(move(prodList, fullIdx, nextIdx));
                        }}
                        className="w-8 h-8 grid place-items-center rounded-lg bg-muted hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
