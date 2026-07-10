import { useEffect, useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Se true, usa cores destrutivas (vermelho). Padrão: true */
  destructive?: boolean;
  /** Se true, mostra ícone de lixeira no lugar de triângulo */
  trashIcon?: boolean;
};

type Pending = ConfirmOptions & { resolve: (v: boolean) => void };

// Fila de pendências: garante que confirmDialog() funciona mesmo antes
// do ConfirmHost estar montado — ele drena a fila assim que monta.
let _queue: Pending[] = [];
let _listener: ((p: Pending | null) => void) | null = null;

function push(p: Pending) {
  if (_listener) {
    _listener(p);
  } else {
    _queue.push(p);
  }
}

export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    push({ ...opts, resolve });
  });
}

export function ConfirmHost() {
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    _listener = setPending;
    // Drena fila acumulada antes da montagem
    if (_queue.length > 0) {
      const next = _queue.shift()!;
      setPending(next);
    }
    return () => {
      _listener = null;
    };
  }, []);

  // Quando o modal fecha, pega o próximo da fila se houver
  const close = (v: boolean) => {
    pending?.resolve(v);
    const next = _queue.shift() ?? null;
    setPending(next);
  };

  if (!pending) return null;

  const {
    title = "Confirmar ação",
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    destructive = true,
    trashIcon = false,
  } = pending;

  const Icon = trashIcon ? Trash2 : AlertTriangle;

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-3 animate-overlay-in"
      onClick={() => close(false)}
    >
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm overflow-hidden shadow-soft animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5 pb-3">
          <div
            className={`w-10 h-10 grid place-items-center rounded-full shrink-0 ${
              destructive
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            }`}
          >
            <Icon className="h-5 w-5" />
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
            className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted -mr-2 -mt-2 text-muted-foreground transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3 pt-2">
          <button
            onClick={() => close(false)}
            className="h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => close(true)}
            className={`h-10 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-1.5 ${
              destructive
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {trashIcon && <Trash2 className="h-4 w-4" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
