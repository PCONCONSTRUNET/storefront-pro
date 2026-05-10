import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { StoreLayout } from "@/components/StoreLayout";
import { useState, useMemo } from "react";
import { ChevronDown, Search, MessageCircle, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/suporte")({
  head: () => ({ meta: [{ title: "Central de Ajuda — Princesa de Laços" }] }),
  component: Page,
});

function Page() {
  const { faq, settings } = useStore();
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredFaq = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return faq;
    return faq.filter(f => 
      f.question.toLowerCase().includes(term) || 
      f.answer.toLowerCase().includes(term) ||
      f.category.toLowerCase().includes(term)
    );
  }, [faq, search]);

  const categories = useMemo(() => {
    const cats = new Set(filteredFaq.map(f => f.category));
    return Array.from(cats);
  }, [filteredFaq]);

  return (
    <StoreLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-primary mb-2">Como podemos ajudar?</h1>
          <p className="text-muted-foreground">Encontre respostas rápidas para suas dúvidas.</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Busque por 'frete', 'prazo', 'pagamento'..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border shadow-soft outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-8">
          {categories.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Nenhuma pergunta encontrada para sua busca.
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat}>
                <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-3 px-2">
                  {cat}
                </h2>
                <div className="bg-card rounded-2xl border border-border shadow-card divide-y divide-border overflow-hidden">
                  {filteredFaq.filter(f => f.category === cat).map(f => (
                    <div key={f.id}>
                      <button 
                        onClick={() => setOpenId(openId === f.id ? null : f.id)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-medium text-sm">{f.question}</span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openId === f.id ? "rotate-180" : ""}`} />
                      </button>
                      {openId === f.id && (
                        <div className="px-5 pb-4 text-sm text-muted-foreground animate-fade-in whitespace-pre-wrap">
                          {f.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-rose/10 border border-primary/20 text-center">
          <HelpCircle className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-1">Ainda com dúvida?</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Fale diretamente com nosso time de atendimento.
          </p>
          <a 
            href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full gradient-primary text-white font-semibold shadow-soft hover:scale-105 transition-transform"
          >
            <MessageCircle className="h-5 w-5" /> Chamar no WhatsApp
          </a>
        </div>
      </div>
    </StoreLayout>
  );
}
