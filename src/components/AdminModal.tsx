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
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center sm:p-3 animate-overlay-in"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] sm:max-h-[85vh] overflow-y-auto shadow-soft animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card flex items-center justify-between px-4 py-3 border-b border-border z-10">
          <h2 className="font-bold text-sm">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-lg hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}
