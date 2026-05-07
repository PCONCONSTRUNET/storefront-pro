import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBag, Crown, LayoutDashboard, Package, ShoppingCart, Tag, Maximize2 } from "lucide-react";

import imgHome from "@/assets/slides/home.png";
import imgCategorias from "@/assets/slides/categorias.png";
import imgCategoriaLacos from "@/assets/slides/categoria-lacos.png";
import imgProduto from "@/assets/slides/produto.png";
import imgCarrinho from "@/assets/slides/carrinho-vazio.png";
import imgAfiliadaLogin from "@/assets/slides/afiliada-login.png";
import imgAdminDash from "@/assets/slides/admin-dashboard.png";
import imgAdminProdutos from "@/assets/slides/admin-produtos.png";
import imgAdminPedidos from "@/assets/slides/admin-pedidos.png";
import imgAdminCupons from "@/assets/slides/admin-cupons.png";

export const Route = createFileRoute("/apresentacao")({
  head: () => ({
    meta: [
      { title: "Apresentação — Sistema Encantada" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

type Slide =
  | { kind: "cover"; title: string; subtitle: string; eyebrow: string }
  | { kind: "section"; title: string; subtitle: string; icon: React.ElementType; color: string }
  | { kind: "image"; title: string; description: string; bullets: string[]; image: string; tag?: string }
  | { kind: "outro"; title: string; subtitle: string };

const slides: Slide[] = [
  { kind: "cover", eyebrow: "Apresentação do sistema", title: "Princesa de Laços", subtitle: "Plataforma completa de e-commerce, programa de afiliadas e painel administrativo." },

  { kind: "section", icon: ShoppingBag, color: "from-pink-500 to-rose-400", title: "Área do cliente", subtitle: "A experiência da consumidora final na loja." },
  { kind: "image", tag: "Página inicial", title: "Home da loja", description: "Banner principal com a coleção em destaque, atalhos para Tiaras e Kits Presente, selos de confiança e categorias.", bullets: ["Banner com coleção atual", "Atalhos para coleções em destaque", "Selos: frete fixo, compra segura, envio rápido, cupons", "Carrossel de categorias"], image: imgHome },
  { kind: "image", tag: "Catálogo", title: "Categorias", description: "Grade clara com todas as categorias disponíveis e contagem de produtos.", bullets: ["6 categorias visíveis", "Ícones personalizados por categoria", "Contagem de produtos em tempo real"], image: imgCategorias },
  { kind: "image", tag: "Catálogo", title: "Produtos da categoria", description: "Listagem da categoria com cards ricos: foto, preço, badges e botão de compra direto.", bullets: ["Badge \"Mais vendido\" e \"-29%\"", "Avaliações com estrelas", "Botão Comprar direto no card"], image: imgCategoriaLacos },
  { kind: "image", tag: "Produto", title: "Página do produto", description: "Detalhe completo do produto com foto grande, variações, preço Pix e CTAs.", bullets: ["Preço de venda + preço Pix com 5% off", "Seleção de tamanho e quantidade", "Adicionar ao carrinho ou comprar agora", "Selos de frete e compra protegida"], image: imgProduto },
  { kind: "image", tag: "Compra", title: "Carrinho", description: "Sacola limpa, com mensagem amigável quando vazio e CTA para explorar produtos.", bullets: ["Aplicação de cupons", "Resumo do pedido", "Animação suave ao abrir"], image: imgCarrinho },

  { kind: "section", icon: Crown, color: "from-amber-500 to-yellow-400", title: "Área da afiliada", subtitle: "Painel exclusivo das revendedoras." },
  { kind: "image", tag: "Login", title: "Acesso da afiliada", description: "Tela limpa de login para a revendedora entrar no painel próprio.", bullets: ["Login com e-mail e senha", "Recuperação de senha", "Cadastro próprio (com aprovação da admin)"], image: imgAfiliadaLogin },

  { kind: "section", icon: LayoutDashboard, color: "from-violet-500 to-purple-400", title: "Painel administrativo", subtitle: "Centro de comando completo do negócio." },
  { kind: "image", tag: "Dashboard", title: "Visão geral do negócio", description: "Métricas-chave do dia, gráfico semanal de faturamento, mais vendidos e estoque crítico — tudo em uma tela.", bullets: ["Faturamento, pedidos, ticket médio e clientes", "Gráfico dos últimos 7 dias", "Ranking de mais vendidos", "Alerta de estoque crítico"], image: imgAdminDash },
  { kind: "image", tag: "Catálogo", title: "Gestão de produtos", description: "Lista completa do catálogo com foto, SKU, preço, estoque e status. Edição e exclusão em um clique.", bullets: ["Tabela com foto, SKU, preço e estoque", "Status Ativo/Inativo", "Editar ou excluir direto da lista", "Botão + Novo para cadastro rápido"], image: imgAdminProdutos },
  { kind: "image", tag: "Operação", title: "Pedidos", description: "Fluxo de pedidos com filtros por status: do pagamento até a entrega.", bullets: ["Filtros: aguardando, pago, em separação, saiu para entrega…", "Busca por ID, nome ou telefone", "Reembolso e cancelamento controlados"], image: imgAdminPedidos },
  { kind: "image", tag: "Marketing", title: "Cupons de desconto", description: "Crie cupons percentuais ou em valor, com mínimo de compra, limite de usos e validade.", bullets: ["3 cupons já configurados", "Controle de uso (12/100, 7/50…)", "Validade e valor mínimo", "Ativação/desativação rápida"], image: imgAdminCupons },

  { kind: "outro", title: "Pronta para encantar 💖", subtitle: "Loja, afiliadas e admin em uma única plataforma — feita sob medida para o Princesa de Laços." },
];

function Page() {
  const [i, setI] = useState(0);
  const total = slides.length;

  const go = useCallback((d: number) => setI(v => Math.min(total - 1, Math.max(0, v + d))), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
      else if (e.key === "f" || e.key === "F") { document.documentElement.requestFullscreen?.(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const s = slides[i];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Top bar */}
      <header className="h-12 px-4 flex items-center justify-between border-b border-white/10 bg-slate-900/60 backdrop-blur">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-400 grid place-items-center"><Sparkles className="h-4 w-4" /></div>
          <span className="font-semibold tracking-tight">Princesa de Laços · Apresentação</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{i + 1} / {total}</span>
          <button onClick={() => document.documentElement.requestFullscreen?.()} className="hover:text-white p-1.5 rounded-md hover:bg-white/10" title="Tela cheia (F)">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Stage */}
      <div className="flex-1 grid place-items-center p-6 md:p-10 relative overflow-hidden">
        <div key={i} className="w-full max-w-6xl aspect-[16/9] bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-page-in">
          {renderSlide(s)}
        </div>

        {/* Nav buttons */}
        <button onClick={() => go(-1)} disabled={i === 0} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 grid place-items-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button onClick={() => go(1)} disabled={i === total - 1} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 grid place-items-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Progress */}
      <footer className="px-6 py-3 border-t border-white/10 bg-slate-900/60">
        <div className="flex gap-1">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-1.5 flex-1 rounded-full transition-all ${idx === i ? "bg-gradient-to-r from-pink-500 to-rose-400" : idx < i ? "bg-white/40" : "bg-white/10 hover:bg-white/20"}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-2 text-center">Use ← → ou espaço para navegar · F para tela cheia</p>
      </footer>
    </div>
  );
}

function renderSlide(s: Slide) {
  if (s.kind === "cover") {
    return (
      <div className="w-full h-full bg-gradient-to-br from-pink-500 via-rose-400 to-amber-300 text-white p-12 md:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/15 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> {s.eyebrow}
          </div>
          <h1 className="font-semibold text-5xl md:text-7xl mt-6 leading-[1.05] tracking-tight">{s.title}</h1>
          <p className="text-lg md:text-xl mt-4 opacity-95 max-w-2xl leading-relaxed">{s.subtitle}</p>
        </div>
      </div>
    );
  }
  if (s.kind === "section") {
    const Icon = s.icon;
    return (
      <div className={`w-full h-full bg-gradient-to-br ${s.color} text-white p-16 flex flex-col justify-center relative overflow-hidden`}>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/15 blur-3xl" />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur grid place-items-center"><Icon className="h-8 w-8" /></div>
          <h2 className="font-semibold text-5xl md:text-6xl mt-6 tracking-tight">{s.title}</h2>
          <p className="text-lg md:text-xl mt-3 opacity-95 max-w-2xl">{s.subtitle}</p>
        </div>
      </div>
    );
  }
  if (s.kind === "outro") {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-pink-900 to-rose-700 text-white p-16 flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-pink-500/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl" />
        <Sparkles className="h-12 w-12 relative" />
        <h2 className="font-semibold text-5xl md:text-6xl mt-6 tracking-tight relative">{s.title}</h2>
        <p className="text-lg md:text-xl mt-4 opacity-90 max-w-2xl relative leading-relaxed">{s.subtitle}</p>
      </div>
    );
  }
  // image slide
  return (
    <div className="w-full h-full grid grid-cols-[1fr_1.4fr]">
      <div className="bg-slate-50 p-8 md:p-10 flex flex-col justify-center border-r border-slate-200">
        {s.tag && (
          <div className="inline-flex w-fit items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-pink-600 bg-pink-100 px-2.5 py-1 rounded-full">
            <TagIcon kind={s.tag} /> {s.tag}
          </div>
        )}
        <h3 className="font-semibold text-3xl md:text-4xl mt-3 tracking-tight text-slate-900 leading-tight">{s.title}</h3>
        <p className="text-sm md:text-base text-slate-600 mt-3 leading-relaxed">{s.description}</p>
        <ul className="mt-5 space-y-2">
          {s.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-pink-500 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50 p-6 md:p-8 grid place-items-center">
        <div className="w-full rounded-xl shadow-2xl ring-1 ring-slate-900/10 overflow-hidden bg-white">
          <img src={s.image} alt={s.title} className="w-full h-auto block" />
        </div>
      </div>
    </div>
  );
}

function TagIcon({ kind }: { kind: string }) {
  const map: Record<string, React.ElementType> = {
    "Página inicial": Sparkles, "Catálogo": Package, "Produto": ShoppingBag,
    "Compra": ShoppingCart, "Login": Crown, "Dashboard": LayoutDashboard,
    "Operação": Package, "Marketing": Tag,
  };
  const Icon = map[kind] || Sparkles;
  return <Icon className="h-3 w-3" />;
}
