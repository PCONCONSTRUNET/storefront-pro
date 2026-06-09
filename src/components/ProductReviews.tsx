import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Star, Camera, X, Trash2, ImageIcon, Video, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { cloud } from "@/lib/cloud";

export function productRating(
  reviews: { productId: string; rating: number }[],
  productId: string,
) {
  const list = reviews.filter((r) => r.productId === productId);
  if (list.length === 0) return { avg: 0, count: 0 };
  const avg = list.reduce((a, r) => a + r.rating, 0) / list.length;
  return { avg, count: list.length };
}

export function Stars({
  value,
  size = 14,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(value);
        const Cls = onChange
          ? "cursor-pointer hover:scale-110 transition-transform"
          : "";
        return (
          <Star
            key={i}
            className={`${Cls} ${filled ? "fill-gold text-gold" : "text-muted-foreground/40"}`}
            style={{ width: size, height: size }}
            onClick={() => onChange?.(i)}
          />
        );
      })}
    </div>
  );
}

type SortKey = "recent" | "oldest" | "highest" | "lowest";

export function ProductReviews({ productId }: { productId: string }) {
  const allReviews = useStore((s) => s.reviews);
  const reviews = allReviews.filter((r) => r.productId === productId);
  const currentCustomerId = useStore((s) => s.currentCustomerId);
  const isAdmin = useStore((s) => s.isAdmin);
  const addReview = useStore((s) => s.addReview);
  const deleteReview = useStore((s) => s.deleteReview);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStars, setFilterStars] = useState<number | null>(null);
  const [filterMedia, setFilterMedia] = useState<"all" | "photos" | "comments">("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [photoView, setPhotoView] = useState<string | null>(null);
  const [videoView, setVideoView] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const [eligible, setEligible] = useState<{
    eligible: boolean;
    variation: string | null;
    alreadyReviewed: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!currentCustomerId) {
      setEligible(null);
      return;
    }
    cloud.checkReviewEligibility(currentCustomerId, productId).then((r) => {
      if (!cancelled) setEligible({ eligible: r.eligible, variation: r.variation, alreadyReviewed: r.alreadyReviewed });
    });
    return () => {
      cancelled = true;
    };
  }, [currentCustomerId, productId, reviews.length]);

  const summary = useMemo(() => {
    const total = reviews.length;
    if (!total) return { avg: 0, total: 0, dist: [0, 0, 0, 0, 0], withPhoto: 0, withComment: 0 };
    const dist = [0, 0, 0, 0, 0];
    let withPhoto = 0;
    let withComment = 0;
    reviews.forEach((r) => {
      dist[5 - r.rating]++;
      if ((r.photos?.length || 0) + (r.videos?.length || 0) > 0) withPhoto++;
      if (r.comment?.trim()) withComment++;
    });
    const avg = reviews.reduce((a, r) => a + r.rating, 0) / total;
    return { avg, total, dist, withPhoto, withComment };
  }, [reviews]);

  const filtered = useMemo(() => {
    let list = reviews.slice();
    if (filterStars) list = list.filter((r) => r.rating === filterStars);
    if (filterMedia === "photos")
      list = list.filter((r) => (r.photos?.length || 0) + (r.videos?.length || 0) > 0);
    if (filterMedia === "comments") list = list.filter((r) => r.comment?.trim());
    list.sort((a, b) => {
      if (sort === "recent") return +new Date(b.createdAt) - +new Date(a.createdAt);
      if (sort === "oldest") return +new Date(a.createdAt) - +new Date(b.createdAt);
      if (sort === "highest") return b.rating - a.rating;
      return a.rating - b.rating;
    });
    return list;
  }, [reviews, filterStars, filterMedia, sort]);

  const onPickFiles = async (files: FileList | null, kind: "photo" | "video") => {
    if (!files || !files.length || !currentCustomerId) return;
    
    // Total media limit is 1
    if (photos.length + videos.length >= 1) {
      toast.error("Você já enviou a quantidade máxima (1 mídia)");
      return;
    }

    const limitBytes = kind === "photo" ? 15 * 1024 * 1024 : 50 * 1024 * 1024; // Let photo sizes be larger before compression
    const file = files[0]; // take only the first one

    if (file.size > limitBytes) {
      toast.error(kind === "photo" ? "A foto deve ter até 15MB" : "O vídeo deve ter até 50MB");
      return;
    }

    setUploading(true);
    try {
      let fileToUpload = file;
      if (kind === "photo") {
        const { compressImage } = await import("@/lib/imageCompression");
        fileToUpload = await compressImage(file, 1080, 1080, 0.75);
      }

      const url = await cloud.uploadReviewMedia(fileToUpload, currentCustomerId);
      if (kind === "photo") setPhotos([url]); // replace just in case
      else setVideos([url]);
    } catch (e: any) {
      toast.error(e?.message || "Falha ao enviar mídia");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await addReview({ productId, rating, comment, photos, videos });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setRating(0);
      setComment("");
      setPhotos([]);
      setVideos([]);
    } finally {
      setSubmitting(false);
    }
  };

  const reviewPhotos = reviews.flatMap((r) =>
    (r.photos || []).map((src) => ({ src, name: r.customerName })),
  );

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold mb-3">Avaliações</h2>

      {/* Resumo */}
      <div className="bg-card rounded-2xl p-4 shadow-card grid md:grid-cols-[180px_1fr] gap-4">
        <div className="text-center md:border-r md:border-border md:pr-4">
          <div className="text-4xl font-bold text-gold">{summary.avg.toFixed(1)}</div>
          <Stars value={summary.avg} size={16} />
          <div className="text-xs text-muted-foreground mt-1">
            {summary.total} avaliação{summary.total === 1 ? "" : "ões"}
          </div>
        </div>
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((s, i) => {
            const count = summary.dist[i];
            const pct = summary.total ? (count / summary.total) * 100 : 0;
            const active = filterStars === s;
            return (
              <button
                key={s}
                onClick={() => setFilterStars(active ? null : s)}
                className={`w-full flex items-center gap-2 text-xs rounded-lg px-1.5 py-0.5 ${active ? "bg-primary/10" : "hover:bg-muted"}`}
              >
                <span className="w-3 text-right">{s}</span>
                <Star className="h-3 w-3 fill-gold text-gold" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      {summary.total > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <FilterChip active={filterMedia === "all" && !filterStars} onClick={() => { setFilterMedia("all"); setFilterStars(null); }}>
            Tudo ({summary.total})
          </FilterChip>
          <FilterChip active={filterMedia === "photos"} onClick={() => setFilterMedia(filterMedia === "photos" ? "all" : "photos")}>
            Com foto/vídeo ({summary.withPhoto})
          </FilterChip>
          <FilterChip active={filterMedia === "comments"} onClick={() => setFilterMedia(filterMedia === "comments" ? "all" : "comments")}>
            Com comentário ({summary.withComment})
          </FilterChip>
          {filterStars && (
            <FilterChip active onClick={() => setFilterStars(null)}>
              {filterStars}★ <X className="inline h-3 w-3 ml-1" />
            </FilterChip>
          )}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="ml-auto text-xs h-8 rounded-full bg-muted px-3 border border-border outline-none"
          >
            <option value="recent">Mais recentes</option>
            <option value="oldest">Mais antigas</option>
            <option value="highest">Maior nota</option>
            <option value="lowest">Menor nota</option>
          </select>
        </div>
      )}

      {/* Galeria de fotos dos clientes */}
      {reviewPhotos.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-primary" /> Fotos dos clientes ({reviewPhotos.length})
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {reviewPhotos.slice(0, 12).map((p, i) => (
              <button
                key={i}
                onClick={() => setPhotoView(p.src)}
                className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border hover:opacity-80"
              >
                <img src={p.src} alt={`Foto de ${p.name}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formulário */}
      <div className="mt-4 bg-card rounded-2xl p-4 shadow-card">
        <h3 className="font-semibold mb-2 text-sm">Compartilhe sua opinião</h3>
        {!currentCustomerId ? (
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="text-primary font-semibold underline">
              Entre na sua conta
            </Link>{" "}
            para deixar uma avaliação.
          </p>
        ) : eligible === null ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Verificando...
          </p>
        ) : eligible.alreadyReviewed ? (
          <p className="text-sm text-muted-foreground">Você já avaliou este produto. Obrigada! 💕</p>
        ) : !eligible.eligible ? (
          <p className="text-sm text-muted-foreground">
            🔒 Apenas clientes que <b>compraram e pagaram</b> este produto podem avaliar.
          </p>
        ) : (
          <div className="space-y-3">
            {eligible.variation && (
              <div className="text-xs inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                Variação comprada: <b>{eligible.variation}</b>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm">Sua nota:</span>
              <Stars value={rating} size={22} onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Conte como foi sua experiência com o produto..."
              className="w-full px-3 py-2 rounded-xl bg-muted/70 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <div className="flex flex-wrap items-center gap-2">
              {photos.map((src, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 grid place-items-center rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {videos.map((src, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-black grid place-items-center">
                  <video src={src} className="w-full h-full object-cover" />
                  <Play className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
                  <button
                    onClick={() => setVideos((v) => v.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 grid place-items-center rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length + videos.length < 1 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </button>
              )}
              {photos.length + videos.length < 1 && (
                <button
                  type="button"
                  onClick={() => videoRef.current?.click()}
                  disabled={uploading}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  <Video className="h-5 w-5" />
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  onPickFiles(e.target.files, "photo");
                  e.target.value = "";
                }}
              />
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  onPickFiles(e.target.files, "video");
                  e.target.value = "";
                }}
              />
              <span className="text-[11px] text-muted-foreground ml-auto">
                {photos.length + videos.length}/1 mídia
              </span>
            </div>
            <button
              onClick={submit}
              disabled={rating === 0 || submitting || uploading}
              className="w-full h-10 rounded-full gradient-primary text-primary-foreground font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Publicar avaliação
            </button>
          </div>
        )}
      </div>

      {/* Lista de avaliações */}
      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 bg-card rounded-2xl">
            {filterStars || filterMedia !== "all"
              ? "Nenhuma avaliação com esse filtro."
              : "Seja a primeira a avaliar!"}
          </p>
        ) : (
          filtered.map((r) => {
            const canDelete = isAdmin || r.customerId === currentCustomerId;
            return (
              <div key={r.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{r.customerName}</span>
                      {r.verified && (
                        <span className="text-[9px] uppercase tracking-wide bg-success/15 text-success px-1.5 py-0.5 rounded-full font-bold">
                          ✓ Compra verificada
                        </span>
                      )}
                      {r.variation && (
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                          {r.variation}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Stars value={r.rating} size={12} />
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => {
                        if (confirm("Excluir avaliação?")) {
                          deleteReview(r.id);
                          toast.success("Removida");
                        }
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {r.comment && (
                  <p className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap">{r.comment}</p>
                )}
                {(r.photos?.length > 0 || r.videos?.length > 0) && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {r.photos?.map((src, i) => (
                      <button
                        key={`p${i}`}
                        onClick={() => setPhotoView(src)}
                        className="w-20 h-20 rounded-lg overflow-hidden bg-muted hover:opacity-80"
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {r.videos?.map((src, i) => (
                      <button
                        key={`v${i}`}
                        onClick={() => setVideoView(src)}
                        className="relative w-20 h-20 rounded-lg overflow-hidden bg-black grid place-items-center"
                      >
                        <video src={src} className="w-full h-full object-cover" />
                        <Play className="absolute inset-0 m-auto h-6 w-6 text-white drop-shadow" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox foto */}
      {photoView && (
        <div
          onClick={() => setPhotoView(null)}
          className="fixed inset-0 z-50 bg-black/80 grid place-items-center p-4 cursor-zoom-out"
        >
          <img src={photoView} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
          <button className="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-full bg-white/10 text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      {/* Lightbox vídeo */}
      {videoView && (
        <div
          onClick={() => setVideoView(null)}
          className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-4"
        >
          <video src={videoView} controls autoPlay className="max-w-full max-h-full rounded-xl" />
          <button className="absolute top-4 right-4 w-10 h-10 grid place-items-center rounded-full bg-white/10 text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs h-8 px-3 rounded-full border transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-muted border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
