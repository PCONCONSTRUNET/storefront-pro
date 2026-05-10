import { useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Star, Camera, X, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export function productRating(reviews: { productId: string; rating: number }[], productId: string) {
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
        const Cls = onChange ? "cursor-pointer hover:scale-110 transition-transform" : "";
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

export function ProductReviews({ productId }: { productId: string }) {
  const allReviews = useStore((s) => s.reviews);
  const reviews = allReviews.filter((r) => r.productId === productId);
  const orders = useStore((s) => s.orders);
  const currentCustomerId = useStore((s) => s.currentCustomerId);
  const isAdmin = useStore((s) => s.isAdmin);
  const addReview = useStore((s) => s.addReview);
  const deleteReview = useStore((s) => s.deleteReview);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [filterStars, setFilterStars] = useState<number | null>(null);
  const [photoView, setPhotoView] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const summary = useMemo(() => {
    const total = reviews.length;
    if (!total) return { avg: 0, total: 0, dist: [0, 0, 0, 0, 0] };
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      dist[5 - r.rating]++;
    });
    const avg = reviews.reduce((a, r) => a + r.rating, 0) / total;
    return { avg, total, dist };
  }, [reviews]);

  const filtered = filterStars ? reviews.filter((r) => r.rating === filterStars) : reviews;

  const customerHasBought = useMemo(() => {
    if (!currentCustomerId) return false;
    return orders.some(
      (o) => o.customerId === currentCustomerId && o.items.some((i) => i.productId === productId),
    );
  }, [orders, currentCustomerId, productId]);

  const alreadyReviewed = useMemo(
    () => !!currentCustomerId && reviews.some((r) => r.customerId === currentCustomerId),
    [reviews, currentCustomerId],
  );

  const onPickFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const remaining = 5 - photos.length;
    if (remaining <= 0) {
      toast.error("Máx. 5 fotos por avaliação");
      return;
    }
    const arr = Array.from(files).slice(0, remaining);
    const tooBig = arr.find((f) => f.size > 5 * 1024 * 1024);
    if (tooBig) {
      toast.error("Cada foto deve ter no máximo 5MB");
      return;
    }
    const dataUrls = await Promise.all(
      arr.map(
        (f) =>
          new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.onerror = rej;
            r.readAsDataURL(f);
          }),
      ),
    );
    setPhotos((p) => [...p, ...dataUrls]);
  };

  const submit = () => {
    const res = addReview({ productId, rating, comment, photos });
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
    setRating(0);
    setComment("");
    setPhotos([]);
  };

  const reviewPhotos = reviews.flatMap((r) =>
    r.photos.map((src) => ({ src, name: r.customerName })),
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
          {filterStars && (
            <button
              onClick={() => setFilterStars(null)}
              className="text-[11px] text-primary font-semibold mt-1"
            >
              Limpar filtro
            </button>
          )}
        </div>
      </div>

      {/* Galeria de fotos dos clientes */}
      {reviewPhotos.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-primary" /> Fotos dos clientes ({reviewPhotos.length}
            )
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
        ) : alreadyReviewed ? (
          <p className="text-sm text-muted-foreground">
            Você já avaliou este produto. Obrigada! 💕
          </p>
        ) : (
          <div className="space-y-3">
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
              {photos.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Camera className="h-5 w-5" />
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  onPickFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <span className="text-[11px] text-muted-foreground ml-auto">
                {photos.length}/5 fotos
              </span>
            </div>
            {!customerHasBought && (
              <p className="text-[11px] text-muted-foreground">
                💡 Avaliações de quem já comprou ganham o selo "Compra verificada".
              </p>
            )}
            <button
              onClick={submit}
              disabled={rating === 0}
              className="w-full h-10 rounded-full gradient-primary text-primary-foreground font-semibold disabled:opacity-50"
            >
              Publicar avaliação
            </button>
          </div>
        )}
      </div>

      {/* Lista de avaliações */}
      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 bg-card rounded-2xl">
            {filterStars ? "Nenhuma avaliação com esse filtro." : "Seja a primeira a avaliar!"}
          </p>
        ) : (
          filtered.map((r) => {
            const verified = orders.some(
              (o) =>
                o.customerId === r.customerId && o.items.some((i) => i.productId === productId),
            );
            const canDelete = isAdmin || r.customerId === currentCustomerId;
            return (
              <div key={r.id} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{r.customerName}</span>
                      {verified && (
                        <span className="text-[9px] uppercase tracking-wide bg-success/15 text-success px-1.5 py-0.5 rounded-full font-bold">
                          ✓ Compra verificada
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
                {r.photos.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {r.photos.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoView(src)}
                        className="w-20 h-20 rounded-lg overflow-hidden bg-muted hover:opacity-80"
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox */}
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
    </section>
  );
}
