import logo from "@/assets/logo-princesa.png";
import { useStore } from "@/lib/store";
import { Instagram, Facebook, Phone, ShieldCheck, FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function StoreFooter() {
  const settings = useStore((s) => s.settings);

  // Formata o número para link do WhatsApp
  const wppNum = settings.whatsapp.replace(/\D/g, "");
  const wppLink = `https://wa.me/55${wppNum}`;
  const instaLink = settings.instagram.startsWith("@") ? `https://instagram.com/${settings.instagram.slice(1)}` : `https://instagram.com/${settings.instagram}`;
  const faceLink = settings.facebook.startsWith("/") ? `https://facebook.com${settings.facebook}` : `https://facebook.com/${settings.facebook}`;

  return (
    <footer className="bg-white/50 backdrop-blur border-t border-border mt-12 py-10 pb-32 md:pb-10 flex-shrink-0">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Coluna 1: Logo e Infos */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <img src={logo} alt={settings.storeName} className="h-16 w-auto object-contain mix-blend-multiply opacity-90" />
          <p className="text-xs text-muted-foreground font-medium max-w-[250px]">
            Laços e tiaras feitos com amor para princesas de todas as idades.
          </p>
        </div>

        {/* Coluna 2: Políticas */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <h3 className="font-bold text-sm uppercase tracking-wider text-primary">Dúvidas e Políticas</h3>
          <Link to="/trocas" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Trocas e Devoluções
          </Link>
          <Link to="/termos" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Privacidade e Termos de Uso
          </Link>
          <a href={wppLink} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Fale Conosco
          </a>
        </div>

        {/* Coluna 3: Redes Sociais */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <h3 className="font-bold text-sm uppercase tracking-wider text-primary">Siga e Fale com a Gente</h3>
          <div className="flex gap-4 mt-1">
            {settings.whatsapp && (
              <a href={wppLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors shadow-sm" aria-label="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="h-4 w-4">
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                </svg>
              </a>
            )}
            {settings.instagram && (
              <a href={instaLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100 transition-colors shadow-sm" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {settings.facebook && settings.facebook !== "/" && settings.facebook !== "/princesadelacos" && (
              <a href={faceLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors shadow-sm" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 pt-8 border-t border-black/5 flex flex-col items-center gap-3">
        <p className="text-xs text-muted-foreground font-medium text-center">
          &copy; {new Date().getFullYear()} {settings.storeName}. CNPJ: 46.975.287/0001-76
        </p>
        
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60 tracking-wide">
          <span>DESENVOLVIDO POR</span>
          <strong className="text-foreground/70 tracking-widest uppercase font-black">P-CON Construnet</strong>
        </div>
      </div>
    </footer>
  );
}
