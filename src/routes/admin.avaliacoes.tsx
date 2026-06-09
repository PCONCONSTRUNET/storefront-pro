import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { Star, Trash2, X, Play, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cloud } from "@/lib/cloud";

export const Route = createFileRoute("/admin/avaliacoes")({
  component: Page,
});

type FilterType = "all" | "photos" | "comments" | "1star" | "2star" | "3star" | "4star" | "5star";

function Page() {
  const { reviews, products, deleteReview } = useStore();
  const [filter, setFilter] = useState<FilterType>("all");
  const [photoView, setPhotoView] = useState<string | null>(null);
  const [videoView, setVideoView] = useState<string | null>(null);

  const filteredReviews = useMemo(() => {
    let list = reviews.slice();
    if (filter === "photos") {
      list = list.filter((r) => (r.photos?.length || 0) + (r.videos?.length || 0) > 0);
    } else if (filter === "comments") {
      list = list.filter((r) => r.comment && r.comment.trim().length > 0);
    } else if (filter.endsWith("star")) {
      const stars = parseInt(filter[0]);
      list = list.filter((r) => r.rating === stars);
    }
    // Order by date, newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews, filter]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  }, [reviews]);

  const handleFilterClick = (f: FilterType) => {
    setFilter(filter === f ? "all" : f);
  };

  const FilterChip = ({ f, label, count }: { f: FilterType; label: React.ReactNode; count?: number }) => {
    const active = filter === f;
    return (
      <button
        onClick={() => handleFilterClick(f)}
        className={`text-xs h-8 px-3 rounded-full border transition-colors flex items-center gap-1 ${
          active
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-muted border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
        }`}
      >
        {label}
        {count !== undefined && <span className="opacity-70">({count})</span>}
      </button>
    );
  };

  return (
    <AdminLayout title="Avaliações">
      {/* Resumo */}
      <div className="bg-card rounded-2xl p-6 shadow-card flex flex-col md:flex-row gap-6 items-center justify-between mb-6 border border-border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 text-gold flex items-center justify-center">
            <Star className="h-8 w-8 fill-gold" />
          </div>
          <div>
            <div className="text-3xl font-black text-foreground">
              {avgRating.toFixed(1)}
            </div>
            <div className="text-sm font-semibold text-muted-foreground">
              Nota média da loja
            </div>
          </div>
        </div>
        <div className="text-center md:text-right">
          <div className="text-2xl font-bold text-foreground">{reviews.length}</div>
          <div className="text-sm font-semibold text-muted-foreground">
            Total de avaliações recebidas
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterChip f="all" label="Todas" count={reviews.length} />
        <FilterChip f="photos" label={<><ImageIcon className="h-3 w-3" /> Com Mídia</>} count={reviews.filter(r => (r.photos?.length || 0) + (r.videos?.length || 0) > 0).length} />
        <FilterChip f="comments" label="Com Comentário" count={reviews.filter(r => r.comment?.trim()).length} />
        <div className="w-px h-6 bg-border mx-1 self-center hidden sm:block" />
        <FilterChip f="5star" label="5 Estrelas" count={reviews.filter(r => r.rating === 5).length} />
        <FilterChip f="4star" label="4 Estrelas" count={reviews.filter(r => r.rating === 4).length} />
        <FilterChip f="3star" label="3 Estrelas" count={reviews.filter(r => r.rating === 3).length} />
        <FilterChip f="2star" label="2 Estrelas" count={reviews.filter(r => r.rating === 2).length} />
        <FilterChip f="1star" label="1 Estrela" count={reviews.filter(r => r.rating === 1).length} />
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 text-center shadow-card border border-border text-muted-foreground">
            Nenhuma avaliação encontrada para os filtros selecionados.
          </div>
        ) : (
          filteredReviews.map((r) => {
            const product = products.find((p) => p.id === r.productId);
            return (
              <div key={r.id} className="bg-card rounded-2xl p-5 shadow-sm border border-border flex flex-col sm:flex-row gap-4 relative overflow-hidden group">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl bg-gradient-to-b from-primary/80 to-primary/40" />
                
                {/* Produto Info Simplificada */}
                <div className="w-full sm:w-48 shrink-0 flex items-center gap-3 pr-4 sm:border-r border-border">
                  {product?.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-muted" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate text-foreground/80">{product?.name || "Produto excluído"}</div>
                    {r.variation && <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{r.variation}</div>}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{r.customerName}</span>
                        {r.verified && (
                          <span className="text-[9px] uppercase tracking-wide bg-success/15 text-success px-1.5 py-0.5 rounded-full font-bold">
                            ✓ Compra verificada
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i <= r.rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (confirm("Tem certeza que deseja apagar esta avaliação permanentemente?")) {
                          deleteReview(r.id);
                          toast.success("Avaliação excluída");
                        }
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                      title="Excluir Avaliação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {r.comment && (
                    <p className="mt-3 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{r.comment}</p>
                  )}

                  {(r.photos?.length > 0 || r.videos?.length > 0) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {r.photos?.map((src, i) => (
                        <button
                          key={`p${i}`}
                          onClick={() => setPhotoView(src)}
                          className="w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border hover:opacity-80 transition-opacity shadow-sm"
                        >
                          <img src={src} alt="Foto da avaliação" className="w-full h-full object-cover" />
                        </button>
                      ))}
                      {r.videos?.map((src, i) => (
                        <button
                          key={`v${i}`}
                          onClick={() => setVideoView(src)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden bg-black grid place-items-center shadow-sm hover:opacity-80 transition-opacity border border-border"
                        >
                          <video src={src} className="w-full h-full object-cover" />
                          <Play className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Lightboxes */}
      {photoView && (
        <div
          onClick={() => setPhotoView(null)}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm grid place-items-center p-4 cursor-zoom-out animate-overlay-in"
        >
          <img src={photoView} alt="" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain animate-modal-in" />
          <button className="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {videoView && (
        <div
          onClick={() => setVideoView(null)}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm grid place-items-center p-4 cursor-zoom-out animate-overlay-in"
        >
          <div className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl animate-modal-in" onClick={e => e.stopPropagation()}>
            <video src={videoView} controls autoPlay className="w-full h-full max-h-[85vh] object-contain bg-black" />
          </div>
          <button className="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
