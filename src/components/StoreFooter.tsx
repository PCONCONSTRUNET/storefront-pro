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
          <Link to="/suporte" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Trocas e Devoluções
          </Link>
          <Link to="/suporte" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Privacidade e Termos de Uso
          </Link>
          <Link to="/suporte" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Fale Conosco
          </Link>
        </div>

        {/* Coluna 3: Redes Sociais */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <h3 className="font-bold text-sm uppercase tracking-wider text-primary">Siga e Fale com a Gente</h3>
          <div className="flex gap-4 mt-1">
            {settings.whatsapp && (
              <a href={wppLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors shadow-sm" aria-label="WhatsApp">
                <Phone className="h-4 w-4" />
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
          &copy; {new Date().getFullYear()} {settings.storeName}. {settings.cpfCnpj ? `CNPJ: ${settings.cpfCnpj}` : "Todos os direitos reservados"}.
        </p>
        
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60 tracking-wide">
          <span>DESENVOLVIDO POR</span>
          <strong className="text-foreground/70 tracking-widest uppercase font-black">P-CON Construnet</strong>
        </div>
      </div>
    </footer>
  );
}
