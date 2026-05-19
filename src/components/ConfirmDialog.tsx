import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type Pending = ConfirmOptions & { resolve: (v: boolean) => void };

let listener: ((p: Pending | null) => void) | null = null;

export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (!listener) {
      // fallback if host not mounted
      resolve(window.confirm(opts.description || opts.title || "Confirmar?"));
      return;
    }
    listener({ ...opts, resolve });
  });
}

export function ConfirmHost() {
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    listener = setPending;
    return () => {
      listener = null;
    };
  }, []);

  if (!pending) return null;

  const {
    title = "Confirmar ação",
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    destructive = true,
    resolve,
  } = pending;

  const close = (v: boolean) => {
    resolve(v);
    setPending(null);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center sm:p-3 animate-overlay-in"
      onClick={() => close(false)}
    >
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm overflow-hidden shadow-soft animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5">
          <div
            className={`w-10 h-10 grid place-items-center rounded-full shrink-0 ${
              destructive
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => close(false)}
            className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted -mr-2 -mt-2"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 pt-0">
          <button
            onClick={() => close(false)}
            className="h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => close(true)}
            className={`h-10 rounded-xl text-sm font-semibold text-white ${
              destructive
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
