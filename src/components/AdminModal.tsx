import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-overlay-in"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl w-full max-w-md shadow-soft animate-modal-in flex flex-col"
        style={{ maxHeight: "calc(100dvh - 2rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="font-bold text-sm">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-3 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
