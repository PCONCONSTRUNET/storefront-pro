import { useEffect, useRef, useState } from "react";
import { X, Check } from "lucide-react";

type Rect = { x: number; y: number; w: number; h: number };
type Mode = "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | null;

export function ImageCropModal({
  src,
  onCancel,
  onConfirm,
}: {
  src: string;
  onCancel: () => void;
  onConfirm: (dataUrl: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [mode, setMode] = useState<Mode>(null);
  const startRef = useRef<{ mx: number; my: number; r: Rect } | null>(null);

  const onImgLoad = () => {
    const img = imgRef.current!;
    const cont = containerRef.current!;
    const maxW = cont.clientWidth;
    const maxH = Math.min(window.innerHeight * 0.6, 600);
    const ratio = Math.min(
      maxW / img.naturalWidth,
      maxH / img.naturalHeight,
      1,
    );
    const w = img.naturalWidth * ratio;
    const h = img.naturalHeight * ratio;
    setImgSize({ w, h });
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    const m = Math.min(w, h) * 0.1;
    setRect({ x: m, y: m, w: w - m * 2, h: h - m * 2 });
  };

  const getPos = (
    e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
  ) => {
    const t =
      "touches" in e ? e.touches[0] || (e as TouchEvent).changedTouches[0] : e;
    return { x: (t as any).clientX, y: (t as any).clientY };
  };

  const startDrag = (m: Mode) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const p = getPos(e);
    setMode(m);
    startRef.current = { mx: p.x, my: p.y, r: { ...rect } };
  };

  useEffect(() => {
    if (!mode) return;
    const move = (e: MouseEvent | TouchEvent) => {
      if (!startRef.current) return;
      const p = getPos(e);
      const dx = p.x - startRef.current.mx;
      const dy = p.y - startRef.current.my;
      let { x, y, w, h } = startRef.current.r;
      const min = 20;
      if (mode === "move") {
        x = Math.max(0, Math.min(imgSize.w - w, x + dx));
        y = Math.max(0, Math.min(imgSize.h - h, y + dy));
      } else {
        if (mode.includes("e"))
          w = Math.max(min, Math.min(imgSize.w - x, w + dx));
        if (mode.includes("s"))
          h = Math.max(min, Math.min(imgSize.h - y, h + dy));
        if (mode.includes("w")) {
          const nx = Math.max(0, Math.min(x + w - min, x + dx));
          w = w + (x - nx);
          x = nx;
        }
        if (mode.includes("n")) {
          const ny = Math.max(0, Math.min(y + h - min, y + dy));
          h = h + (y - ny);
          y = ny;
        }
      }
      setRect({ x, y, w, h });
    };
    const up = () => {
      setMode(null);
      startRef.current = null;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [mode, imgSize.w, imgSize.h]);

  const confirm = () => {
    const scale = natural.w / imgSize.w;
    const sx = rect.x * scale,
      sy = rect.y * scale;
    const sw = rect.w * scale,
      sh = rect.h * scale;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      try {
        onConfirm(canvas.toDataURL("image/jpeg", 0.9));
      } catch {
        onConfirm(src);
      }
    };
    img.onerror = () => onConfirm(src);
    img.src = src;
  };

  const handles: { m: Mode; cls: string }[] = [
    { m: "nw", cls: "-top-1.5 -left-1.5 cursor-nwse-resize" },
    { m: "ne", cls: "-top-1.5 -right-1.5 cursor-nesw-resize" },
    { m: "sw", cls: "-bottom-1.5 -left-1.5 cursor-nesw-resize" },
    { m: "se", cls: "-bottom-1.5 -right-1.5 cursor-nwse-resize" },
    { m: "n", cls: "-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" },
    { m: "s", cls: "-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" },
    { m: "w", cls: "top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize" },
    { m: "e", cls: "top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize" },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-3"
      onClick={onCancel}
    >
      <div
        className="bg-card rounded-2xl w-full max-w-2xl shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Recortar imagem (livre)</h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 grid place-items-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div
          ref={containerRef}
          className="p-3 flex items-center justify-center bg-muted/30 select-none"
        >
          <div
            className="relative"
            style={{ width: imgSize.w || "auto", height: imgSize.h || "auto" }}
          >
            <img
              ref={imgRef}
              src={src}
              onLoad={onImgLoad}
              alt=""
              className="block max-w-full pointer-events-none"
              style={{
                width: imgSize.w || undefined,
                height: imgSize.h || undefined,
              }}
              crossOrigin="anonymous"
            />
            {imgSize.w > 0 && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: `0 0 0 9999px rgba(0,0,0,0.5) inset`,
                    clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${rect.y}px, ${rect.x}px ${rect.y}px, ${rect.x}px ${rect.y + rect.h}px, ${rect.x + rect.w}px ${rect.y + rect.h}px, ${rect.x + rect.w}px ${rect.y}px, 0 ${rect.y}px)`,
                  }}
                />
                <div
                  className="absolute border-2 border-white cursor-move"
                  style={{
                    left: rect.x,
                    top: rect.y,
                    width: rect.w,
                    height: rect.h,
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                  }}
                  onMouseDown={startDrag("move")}
                  onTouchStart={startDrag("move")}
                >
                  {handles.map((h) => (
                    <div
                      key={h.m}
                      onMouseDown={startDrag(h.m)}
                      onTouchStart={startDrag(h.m)}
                      className={`absolute w-3 h-3 bg-white border border-black/40 rounded-sm ${h.cls}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 p-3 border-t border-border">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl bg-muted font-semibold text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={confirm}
            className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" /> Aplicar recorte
          </button>
        </div>
      </div>
    </div>
  );
}
