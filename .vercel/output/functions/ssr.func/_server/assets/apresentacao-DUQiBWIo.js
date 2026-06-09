import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { g as createLucideIcon, h as ShoppingBag, i as Crown, j as Sparkles, k as ChevronLeft, l as ChevronRight, T as Tag, P as Package } from "./router-CbsSSRKz.js";
import { L as LayoutDashboard } from "./layout-dashboard-Tw_Axpdn.js";
import { S as ShoppingCart } from "./shopping-cart-BRFmSKRc.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./adminHelpers.server-BhLg7GIA.js";
import "./client.server-C7GAOqxY.js";
const __iconNode = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "m21 3-7 7", key: "1l2asr" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M9 21H3v-6", key: "wtvkvv" }]
];
const Maximize2 = createLucideIcon("maximize-2", __iconNode);
const imgHome = "/assets/home-kuUwObwl.png";
const imgCategorias = "/assets/categorias-BVbcZek-.png";
const imgCategoriaLacos = "/assets/categoria-lacos-DBXPOLvg.png";
const imgProduto = "/assets/produto-mEOU9PJ2.png";
const imgCarrinho = "/assets/carrinho-vazio-Db3ZOChv.png";
const imgAfiliadaLogin = "/assets/afiliada-login-BIWIdEZc.png";
const imgAfiliadaCadastro = "/assets/afiliada-cadastro-68_HjeyS.png";
const imgAfiliadaRegistrar = "/assets/afiliada-registrar-CEemkLoV.png";
const imgAfiliadaVendas = "/assets/afiliada-vendas-CHu_OyAL.png";
const imgAfiliadaResumo = "/assets/afiliada-resumo-D9KUij4O.png";
const imgAdminAfiliadas = "/assets/admin-afiliadas-Cw_Tfmfw.png";
const imgAdminAfiliadasVendas = "/assets/admin-afiliadas-vendas-puWkPtHQ.png";
const imgAdminDash = "/assets/admin-dashboard-DChc8L9C.png";
const imgAdminProdutos = "/assets/admin-produtos-BB7n_Is4.png";
const imgAdminPedidos = "/assets/admin-pedidos-CaqEwAhM.png";
const imgAdminCupons = "/assets/admin-cupons-DUP-lOE8.png";
const slides = [{
  kind: "cover",
  eyebrow: "Apresentação do sistema",
  title: "Princesa de Laços",
  subtitle: "Plataforma completa de e-commerce, programa de afiliadas e painel administrativo."
}, {
  kind: "section",
  icon: ShoppingBag,
  color: "from-pink-500 to-rose-400",
  title: "Área do cliente",
  subtitle: "A experiência da consumidora final na loja."
}, {
  kind: "image",
  tag: "Página inicial",
  title: "Home da loja",
  description: "Banner principal com a coleção em destaque, atalhos para Tiaras e Kits Presente, selos de confiança e categorias.",
  bullets: ["Banner com coleção atual", "Atalhos para coleções em destaque", "Selos: frete fixo, compra segura, envio rápido, cupons", "Carrossel de categorias"],
  image: imgHome
}, {
  kind: "image",
  tag: "Catálogo",
  title: "Categorias",
  description: "Grade clara com todas as categorias disponíveis e contagem de produtos.",
  bullets: ["6 categorias visíveis", "Ícones personalizados por categoria", "Contagem de produtos em tempo real"],
  image: imgCategorias
}, {
  kind: "image",
  tag: "Catálogo",
  title: "Produtos da categoria",
  description: "Listagem da categoria com cards ricos: foto, preço, badges e botão de compra direto.",
  bullets: ['Badge "Mais vendido" e "-29%"', "Avaliações com estrelas", "Botão Comprar direto no card"],
  image: imgCategoriaLacos
}, {
  kind: "image",
  tag: "Produto",
  title: "Página do produto",
  description: "Detalhe completo do produto com foto grande, variações, preço Pix e CTAs.",
  bullets: ["Preço de venda + preço Pix com 5% off", "Seleção de tamanho e quantidade", "Adicionar ao carrinho ou comprar agora", "Selos de frete e compra protegida"],
  image: imgProduto
}, {
  kind: "image",
  tag: "Compra",
  title: "Carrinho",
  description: "Sacola limpa, com mensagem amigável quando vazio e CTA para explorar produtos.",
  bullets: ["Aplicação de cupons", "Resumo do pedido", "Animação suave ao abrir"],
  image: imgCarrinho
}, {
  kind: "section",
  icon: Crown,
  color: "from-amber-500 to-yellow-400",
  title: "Área da afiliada",
  subtitle: "Painel exclusivo das revendedoras."
}, {
  kind: "image",
  tag: "Login",
  title: "Acesso da afiliada",
  description: "Tela limpa de login para a revendedora entrar no painel próprio.",
  bullets: ["Login com e-mail e senha", "Recuperação de senha", "Link para autocadastro"],
  image: imgAfiliadaLogin
}, {
  kind: "image",
  tag: "Login",
  title: "Autocadastro de afiliada",
  description: "Formulário simples para a revendedora criar sua conta. A administradora aprova e define a comissão depois.",
  bullets: ["Nome, e-mail, WhatsApp e senha", "Comissão definida pela admin após o cadastro", "Acesso imediato ao painel"],
  image: imgAfiliadaCadastro
}, {
  kind: "image",
  tag: "Painel",
  title: "Registrar nova venda",
  description: "Formulário rápido onde a afiliada registra cada venda. A comissão é calculada automaticamente conforme o percentual definido.",
  bullets: ["Cliente, WhatsApp, produto e valor", "Canal de venda: WhatsApp, Instagram, Presencial", "Forma de pagamento: Pix, Cartão, Dinheiro", "Comissão calculada na hora"],
  image: imgAfiliadaRegistrar
}, {
  kind: "image",
  tag: "Painel",
  title: "Minhas vendas",
  description: "Listagem das vendas registradas pela afiliada com status (pendente, confirmada ou cancelada) e comissão de cada uma.",
  bullets: ["Histórico completo da afiliada", "Status visível por venda", "Comissão acumulada em destaque", "Meta do mês com barra de progresso"],
  image: imgAfiliadaVendas
}, {
  kind: "image",
  tag: "Painel",
  title: "Resumo da afiliada",
  description: "Visão geral de desempenho: vendas, faturamento, comissão e gráfico de evolução do período.",
  bullets: ["Filtros: diário, semanal, mensal, personalizado", "KPIs de faturamento e comissão", "Gráfico de faturamento ao longo do tempo", "Exportação em PDF"],
  image: imgAfiliadaResumo
}, {
  kind: "section",
  icon: LayoutDashboard,
  color: "from-violet-500 to-purple-400",
  title: "Painel administrativo",
  subtitle: "Centro de comando completo do negócio."
}, {
  kind: "image",
  tag: "Dashboard",
  title: "Visão geral do negócio",
  description: "Métricas-chave do dia, gráfico semanal de faturamento, mais vendidos e estoque crítico — tudo em uma tela.",
  bullets: ["Faturamento, pedidos, ticket médio e clientes", "Gráfico dos últimos 7 dias", "Ranking de mais vendidos", "Alerta de estoque crítico"],
  image: imgAdminDash
}, {
  kind: "image",
  tag: "Catálogo",
  title: "Gestão de produtos",
  description: "Lista completa do catálogo com foto, SKU, preço, estoque e status. Edição e exclusão em um clique.",
  bullets: ["Tabela com foto, SKU, preço e estoque", "Status Ativo/Inativo", "Editar ou excluir direto da lista", "Botão + Novo para cadastro rápido"],
  image: imgAdminProdutos
}, {
  kind: "image",
  tag: "Operação",
  title: "Pedidos",
  description: "Fluxo de pedidos com filtros por status: do pagamento até a entrega.",
  bullets: ["Filtros: aguardando, pago, em separação, saiu para entrega…", "Busca por ID, nome ou telefone", "Reembolso e cancelamento controlados"],
  image: imgAdminPedidos
}, {
  kind: "image",
  tag: "Marketing",
  title: "Cupons de desconto",
  description: "Crie cupons percentuais ou em valor, com mínimo de compra, limite de usos e validade.",
  bullets: ["3 cupons já configurados", "Controle de uso (12/100, 7/50…)", "Validade e valor mínimo", "Ativação/desativação rápida"],
  image: imgAdminCupons
}, {
  kind: "image",
  tag: "Afiliadas",
  title: "Gestão de afiliadas",
  description: "Cadastro e controle das revendedoras: status, percentual de comissão e indicadores de cada uma.",
  bullets: ["Cadastro de novas afiliadas", "Comissão e status (Ativa/Inativa)", "Vendas pagas e comissões pagas em destaque", "Acesso direto ao link da afiliada"],
  image: imgAdminAfiliadas
}, {
  kind: "image",
  tag: "Afiliadas",
  title: "Vendas das afiliadas",
  description: "Vendas registradas por todas as afiliadas em um só lugar. A admin confirma, cancela ou exclui.",
  bullets: ["Filtro por status e por afiliada", "Confirmar ou cancelar venda em 1 clique", "Exportação CSV e PDF", "Comissão calculada por venda"],
  image: imgAdminAfiliadasVendas
}, {
  kind: "outro",
  title: "Pronta para encantar 💖",
  subtitle: "Loja, afiliadas e admin em uma única plataforma — feita sob medida para o Princesa de Laços."
}];
function Page() {
  const [i, setI] = reactExports.useState(0);
  const total = slides.length;
  const go = reactExports.useCallback((d) => setI((v) => Math.min(total - 1, Math.max(0, v + d))), [total]);
  reactExports.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "f" || e.key === "F") {
        document.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);
  const s = slides[i];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex flex-col", style: {
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-12 px-4 flex items-center justify-between border-b border-white/10 bg-slate-900/60 backdrop-blur", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-400 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tracking-tight", children: "Princesa de Laços · Apresentação" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-slate-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          i + 1,
          " / ",
          total
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => document.documentElement.requestFullscreen?.(), className: "hover:text-white p-1.5 rounded-md hover:bg-white/10", title: "Tela cheia (F)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 grid place-items-center p-6 md:p-10 relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-6xl aspect-[16/9] bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-page-in", children: renderSlide(s) }, i),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => go(-1), disabled: i === 0, className: "absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 grid place-items-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => go(1), disabled: i === total - 1, className: "absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 grid place-items-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-6 w-6" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "px-6 py-3 border-t border-white/10 bg-slate-900/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: slides.map((_, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setI(idx), className: `h-1.5 flex-1 rounded-full transition-all ${idx === i ? "bg-gradient-to-r from-pink-500 to-rose-400" : idx < i ? "bg-white/40" : "bg-white/10 hover:bg-white/20"}`, "aria-label": `Slide ${idx + 1}` }, idx)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-slate-500 mt-2 text-center", children: "Use ← → ou espaço para navegar · F para tela cheia" })
    ] })
  ] });
}
function renderSlide(s) {
  if (s.kind === "cover") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full bg-gradient-to-br from-pink-500 via-rose-400 to-amber-300 text-white p-12 md:p-16 flex flex-col justify-center relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/20 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/15 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] bg-white/20 backdrop-blur px-3 py-1.5 rounded-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
          " ",
          s.eyebrow
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-semibold text-5xl md:text-7xl mt-6 leading-[1.05] tracking-tight", children: s.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg md:text-xl mt-4 opacity-95 max-w-2xl leading-relaxed", children: s.subtitle })
      ] })
    ] });
  }
  if (s.kind === "section") {
    const Icon = s.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `w-full h-full bg-gradient-to-br ${s.color} text-white p-16 flex flex-col justify-center relative overflow-hidden`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/15 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-2xl bg-white/20 backdrop-blur grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-8 w-8" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-5xl md:text-6xl mt-6 tracking-tight", children: s.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg md:text-xl mt-3 opacity-95 max-w-2xl", children: s.subtitle })
      ] })
    ] });
  }
  if (s.kind === "outro") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full bg-gradient-to-br from-slate-900 via-pink-900 to-rose-700 text-white p-16 flex flex-col justify-center items-center text-center relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-20 -right-20 w-96 h-96 rounded-full bg-pink-500/30 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-12 w-12 relative" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-5xl md:text-6xl mt-6 tracking-tight relative", children: s.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg md:text-xl mt-4 opacity-90 max-w-2xl relative leading-relaxed", children: s.subtitle })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full grid grid-cols-[1fr_1.4fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 p-8 md:p-10 flex flex-col justify-center border-r border-slate-200", children: [
      s.tag && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex w-fit items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-pink-600 bg-pink-100 px-2.5 py-1 rounded-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TagIcon, { kind: s.tag }),
        " ",
        s.tag
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-3xl md:text-4xl mt-3 tracking-tight text-slate-900 leading-tight", children: s.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm md:text-base text-slate-600 mt-3 leading-relaxed", children: s.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-5 space-y-2", children: s.bullets.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 text-sm text-slate-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1.5 h-1.5 w-1.5 rounded-full bg-pink-500 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50 p-6 md:p-8 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full rounded-xl shadow-2xl ring-1 ring-slate-900/10 overflow-hidden bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.image, alt: s.title, className: "w-full h-auto block" }) }) })
  ] });
}
function TagIcon({
  kind
}) {
  const map = {
    "Página inicial": Sparkles,
    Catálogo: Package,
    Produto: ShoppingBag,
    Compra: ShoppingCart,
    Login: Crown,
    Dashboard: LayoutDashboard,
    Operação: Package,
    Marketing: Tag,
    Afiliadas: Crown,
    Painel: LayoutDashboard
  };
  const Icon = map[kind] || Sparkles;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" });
}
export {
  Page as component
};
