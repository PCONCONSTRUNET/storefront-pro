import logo from "@/assets/logo-princesa.png";

export function StoreFooter() {
  return (
    <footer className="bg-white/50 backdrop-blur border-t border-border mt-12 py-10 pb-32 md:pb-10 text-center text-sm flex-shrink-0">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-4">
        <img src={logo} alt="Princesa de Laços" className="h-20 w-auto object-contain mix-blend-multiply opacity-90" />
        
        <p className="text-muted-foreground font-medium">
          &copy; {new Date().getFullYear()} Princesa de Laços. Todos os direitos reservados.
        </p>
        
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 mt-2 tracking-wide">
          <span>DESENVOLVIDO POR</span>
          <strong className="text-foreground/70 tracking-widest uppercase">P-CON Construnet</strong>
        </div>
      </div>
    </footer>
  );
}
