import { useEffect, useState } from "react";
import {
  X,
  Download,
  Share,
  Plus,
  MoreVertical,
  ChevronRight,
} from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa_install_dismissed_at";
const DISMISS_DAYS = 7;

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

function detectPlatform(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

export function PwaInstallPrompt() {
  const [open, setOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">(
    "desktop",
  );

  useEffect(() => {
    if (isStandalone()) return;
    setPlatform(detectPlatform());

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const fresh = Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    if (fresh) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    const t = window.setTimeout(() => setOpen(true), 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.clearTimeout(t);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
    setShowTutorial(false);
  };

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") dismiss();
      else setShowTutorial(true);
      setDeferred(null);
    } else {
      setShowTutorial(true);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 pointer-events-none">
      <div className="pointer-events-auto max-w-sm mx-auto bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {!showTutorial ? (
          <div className="relative p-4">
            <button
              onClick={dismiss}
              aria-label="Fechar"
              className="absolute right-2 top-2 w-7 h-7 grid place-items-center rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary grid place-items-center text-primary-foreground shrink-0">
                <Download className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <div className="font-bold text-sm text-foreground">
                  Instale nosso app
                </div>
                <div className="text-xs text-muted-foreground">
                  Acesso rápido na sua tela inicial 💖
                </div>
              </div>
            </div>
            <button
              onClick={handleInstall}
              className="mt-3 w-full h-10 rounded-full gradient-primary text-primary-foreground font-semibold text-sm shadow-soft active:scale-[0.98] transition-transform"
            >
              Instalar
            </button>
          </div>
        ) : (
          <div className="relative p-4">
            <button
              onClick={dismiss}
              aria-label="Fechar"
              className="absolute right-2 top-2 w-7 h-7 grid place-items-center rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="font-bold text-sm text-foreground mb-2 pr-6">
              Como instalar
            </div>

            {platform !== "android" && (
              <div className="mb-3">
                <div className="text-[11px] uppercase font-semibold text-primary mb-1.5">
                  iPhone (Safari)
                </div>
                <ol className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted grid place-items-center text-[10px] font-bold text-foreground shrink-0">
                      1
                    </span>
                    Toque em{" "}
                    <Share className="inline h-3.5 w-3.5 text-primary" />{" "}
                    Compartilhar
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted grid place-items-center text-[10px] font-bold text-foreground shrink-0">
                      2
                    </span>
                    "Adicionar à Tela de Início"{" "}
                    <Plus className="inline h-3.5 w-3.5 text-primary" />
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted grid place-items-center text-[10px] font-bold text-foreground shrink-0">
                      3
                    </span>
                    Toque em "Adicionar"{" "}
                    <ChevronRight className="inline h-3.5 w-3.5 text-primary" />
                  </li>
                </ol>
              </div>
            )}

            {platform !== "ios" && (
              <div>
                <div className="text-[11px] uppercase font-semibold text-primary mb-1.5">
                  Android (Chrome)
                </div>
                <ol className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted grid place-items-center text-[10px] font-bold text-foreground shrink-0">
                      1
                    </span>
                    Toque em{" "}
                    <MoreVertical className="inline h-3.5 w-3.5 text-primary" />{" "}
                    menu
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted grid place-items-center text-[10px] font-bold text-foreground shrink-0">
                      2
                    </span>
                    "Instalar app" ou "Adicionar à tela inicial"
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted grid place-items-center text-[10px] font-bold text-foreground shrink-0">
                      3
                    </span>
                    Confirme tocando em "Instalar"
                  </li>
                </ol>
              </div>
            )}

            <button
              onClick={dismiss}
              className="mt-3 w-full h-9 rounded-full bg-muted text-foreground font-semibold text-xs"
            >
              Entendi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
