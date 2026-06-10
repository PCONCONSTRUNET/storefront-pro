import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    // Exemplo de integração do Google Tag Manager / Facebook Pixel
    // if (typeof window === "undefined") return;
    // const pixelId = import.meta.env.VITE_FB_PIXEL_ID;
    // if (!pixelId) return;
    // 
    // console.log("[Analytics] Pageview tracking:", location.pathname);
    // (window as any).fbq?.("track", "PageView");
  }, [location.pathname]);

  return null;
}
