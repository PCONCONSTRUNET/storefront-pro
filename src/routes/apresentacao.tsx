import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles, ShoppingBag, Heart, Search, Tag, User, MapPin, Package, Bell,
  LayoutDashboard, Users, Gift, DollarSign, Settings, BarChart3, Star,
  ChevronRight, Smartphone, Monitor, Award, TrendingUp, ListOrdered, Plus,
  CheckCircle2, ArrowRight, Crown, Palette, Zap, Shield, MessageCircle,
} from "lucide-react";

export const Route = createFileRoute("/apresentacao")({
  head: () => ({
    meta: [
      { title: "Apresentação do Sistema — Encantada" },
      { name: "description", content: "Tour completo pelo sistema Encantada: loja, área da afiliada e painel administrativo." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

type SectionId = "intro" | "cliente" | "afiliada" | "admin" | "diferenciais";

function Page() {
  const [section, setSection] = useState<SectionId>("intro");

  const nav: { id: SectionId; label: string; icon: React.ElementType }[] = [
    { id: "intro", label: "Visão geral", icon: Sparkles },
    { id: "cliente", label: "Área do cliente", icon: ShoppingBag },
    { id: "afiliada", label: "Área da afiliada", icon: Crown },
    { id: "admin", label: "Painel admin", icon: LayoutDashboard },
    { id: "diferenciais", label: "Diferenciais", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-rose/20 to-accent/40">
      {/* Top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl gradient-primary grid place-items-center text-primary-foreground shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-primary text-sm leading-none truncate">Encantada</div>
              <div className="text-[10px] text-muted-foreground truncate">Apresentação do sistema</div>
            </div>
          </div>
          <Link to="/" className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted/50 transition-colors">
            Abrir loja
          </Link>
        </div>
        <nav className="max-w-6xl mx-auto px-2 pb-2 flex gap-1 overflow-x-auto no-scrollbar">
          {nav.map(n => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                section === n.id
                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <n.icon className="h-3.5 w-3.5" /> {n.label}
            </button>
          ))}
        </nav>
      </header>

      <main key={section} className="max-w-6xl mx-auto px-4 py-8 animate-page-in">
        {section === "intro" && <Intro onGo={setSection} />}
        {section === "cliente" && <Cliente />}
        {section === "afiliada" && <Afiliada />}
        {section === "admin" && <Admin />}
        {section === "diferenciais" && <Diferenciais />}

        <Footer current={section} onGo={setSection} navItems={nav} />
      </main>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none}`}</style>
    </div>
  );
}

/* ---------- INTRO ---------- */

function Intro({ onGo }: { onGo: (s: SectionId) => void }) {
  const cards = [
    { id: "cliente" as SectionId, title: "Área do cliente", desc: "Loja completa com Vicri (assistente IA), favoritos, pedidos e perfil.", icon: ShoppingBag, color: "from-pink-500/20 to-rose-500/20" },
    { id: "afiliada" as SectionId, title: "Área da afiliada", desc: "Painel exclusivo para registrar vendas e acompanhar comissões.", icon: Crown, color: "from-amber-500/20 to-yellow-500/20" },
    { id: "admin" as SectionId, title: "Painel administrativo", desc: "Gestão completa: produtos, pedidos, clientes, afiliadas, financeiro.", icon: LayoutDashboard, color: "from-violet-500/20 to-purple-500/20" },
  ];
  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl gradient-primary text-primary-foreground p-8 md:p-12 shadow-soft">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-gold/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider bg-white/20 backdrop-blur px-3 py-1 rounded-full">
            <Sparkles className="h-3 w-3" /> Apresentação
          </span>
          <h1 className="font-display text-4xl md:text-6xl mt-4 leading-tight">Sistema Encantada ✨</h1>
          <p className="text-base md:text-lg opacity-90 mt-3">
            Uma plataforma completa de e-commerce feita sob medida — com loja, programa de afiliadas e painel administrativo integrado.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            <button onClick={() => onGo("cliente")} className="inline-flex items-center gap-1.5 bg-white text-primary font-semibold text-sm px-4 py-2 rounded-full hover:scale-[1.03] transition-transform">
              Começar tour <ArrowRight className="h-4 w-4" />
            </button>
            <Link to="/" className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-primary-foreground font-semibold text-sm px-4 py-2 rounded-full border border-white/30 hover:bg-white/25 transition-colors">
              Ver loja ao vivo
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {cards.map(c => (
          <button key={c.id} onClick={() => onGo(c.id)} className={`group text-left bg-card rounded-3xl p-5 shadow-card hover:shadow-soft transition-all hover:-translate-y-1 relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl gradient-primary grid place-items-center text-primary-foreground shadow-soft">
                <c.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl text-primary mt-3">{c.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
              <div className="text-xs font-semibold text-primary mt-3 inline-flex items-center gap-1">
                Explorar <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={Smartphone} label="100% responsivo" value="Mobile-first" />
        <Stat icon={Zap} label="Performance" value="SSR + Edge" />
        <Stat icon={Shield} label="Seguro" value="Auth + RLS" />
        <Stat icon={Palette} label="Identidade" value="Design system" />
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="font-display text-lg text-primary mt-1">{value}</div>
    </div>
  );
}

/* ---------- CLIENTE ---------- */

function Cliente() {
  const features = [
    { icon: ShoppingBag, title: "Catálogo completo", desc: "Produtos com fotos, variações, preços, promoções e estoque em tempo real." },
    { icon: Search, title: "Busca inteligente", desc: "Busca por nome, categoria ou tag, com sugestões e filtros avançados." },
    { icon: Sparkles, title: "Vicri — assistente IA", desc: "Atendente virtual que tira dúvidas, recomenda produtos e ajuda na compra." },
    { icon: Heart, title: "Favoritos", desc: "A cliente salva produtos para comprar depois, acessível de qualquer dispositivo." },
    { icon: Tag, title: "Cupons de desconto", desc: "Aplicação automática de cupons no carrinho com validação em tempo real." },
    { icon: Package, title: "Meus pedidos", desc: "Histórico completo, status de entrega e botão para repetir pedido." },
    { icon: MapPin, title: "Endereços salvos", desc: "Múltiplos endereços de entrega cadastrados e selecionáveis no checkout." },
    { icon: Star, title: "Avaliações com foto", desc: "Reviews de clientes com selo de “compra verificada” e fotos do produto." },
    { icon: Bell, title: "Notificações", desc: "Avisos de pedidos, promoções e novidades direto na sacola." },
    { icon: User, title: "Perfil completo", desc: "Login, cadastro, recuperação de senha e configurações pessoais." },
  ];
  return (
    <Section
      eyebrow="Para a cliente final"
      title="Área do cliente"
      desc="Onde a magia acontece. Uma loja moderna, rápida e fofa — pensada para encantar e vender."
      icon={ShoppingBag}
    >
      <Grid items={features} />
      <Highlight
        title="Vicri — a assistente que vende por você"
        text="A Vicri é uma IA treinada com o catálogo da loja. Ela conversa com a cliente no estilo Encantada, recomenda produtos, esclarece dúvidas sobre material, tamanho e prazos, e leva direto para o carrinho — 24h por dia."
        icon={Sparkles}
      />
      <RoutesList
        label="Telas principais"
        items={[
          { path: "/", desc: "Home com banner, destaques e categorias" },
          { path: "/categorias", desc: "Lista de todas as categorias" },
          { path: "/categoria/:slug", desc: "Produtos da categoria" },
          { path: "/produto/:id", desc: "Página do produto com avaliações" },
          { path: "/buscar", desc: "Resultado de busca com filtros" },
          { path: "/carrinho", desc: "Sacola com cupom e resumo" },
          { path: "/checkout", desc: "Finalização do pedido" },
          { path: "/perfil", desc: "Conta, endereços, favoritos, pedidos" },
        ]}
      />
    </Section>
  );
}

/* ---------- AFILIADA ---------- */

function Afiliada() {
  const features = [
    { icon: Plus, title: "Registrar venda", desc: "Formulário ágil para a afiliada lançar uma venda em segundos, com canal e forma de pagamento." },
    { icon: ListOrdered, title: "Minhas vendas", desc: "Histórico de todas as vendas registradas, com status (pendente, confirmada, cancelada)." },
    { icon: BarChart3, title: "Resumo e métricas", desc: "Faturamento, comissão acumulada, vendas do mês e meta de performance." },
    { icon: TrendingUp, title: "Meta do mês", desc: "Barra de progresso visual incentivando a afiliada a bater a meta." },
    { icon: DollarSign, title: "Comissão automática", desc: "Cálculo automático por porcentagem ou valor fixo, definido pela admin." },
    { icon: Crown, title: "Cadastro próprio", desc: "A afiliada pode se cadastrar sozinha; a admin define a comissão depois." },
  ];
  return (
    <Section
      eyebrow="Programa de revendedoras"
      title="Área da afiliada"
      desc="Painel exclusivo para revendedoras registrarem vendas e acompanharem ganhos em tempo real."
      icon={Crown}
    >
      <Grid items={features} />
      <Highlight
        title="Gamificação que motiva"
        text="A afiliada vê na home dela uma saudação personalizada, comissão do dia, faturamento do mês, comissão acumulada na vida e a meta mensal — tudo num cartão lindo, com efeito de gradiente, para criar engajamento e estimular vendas."
        icon={Award}
      />
      <RoutesList
        label="Telas da afiliada"
        items={[
          { path: "/afiliada/cadastro", desc: "Formulário de cadastro" },
          { path: "/afiliada/login", desc: "Acesso da afiliada" },
          { path: "/afiliada", desc: "Painel: registrar, vendas e resumo" },
        ]}
      />
    </Section>
  );
}

/* ---------- ADMIN ---------- */

function Admin() {
  const features = [
    { icon: LayoutDashboard, title: "Dashboard", desc: "Visão geral: vendas do dia, faturamento, pedidos pendentes e gráficos." },
    { icon: Package, title: "Produtos", desc: "Cadastro completo: fotos, descrição, preço, estoque, variações, categoria e destaque." },
    { icon: Tag, title: "Categorias", desc: "Organização do catálogo em categorias com slug e capa." },
    { icon: ShoppingBag, title: "Pedidos", desc: "Gestão de pedidos: status, fluxo de produção, separação e entrega." },
    { icon: Users, title: "Clientes", desc: "Base de clientes com histórico de compras e dados de contato." },
    { icon: Crown, title: "Afiliadas", desc: "Gestão das revendedoras: comissões, status e vendas vinculadas." },
    { icon: Gift, title: "Cupons", desc: "Criação de cupons de desconto por valor, percentual, validade e uso." },
    { icon: DollarSign, title: "Financeiro", desc: "Controle de receitas, comissões a pagar e exportação de relatórios." },
    { icon: Bell, title: "Notificações", desc: "Disparo de avisos para clientes (push e dentro do app)." },
    { icon: Settings, title: "Configurações", desc: "Identidade da loja, banner, redes sociais e preferências gerais." },
  ];
  return (
    <Section
      eyebrow="Centro de comando"
      title="Painel administrativo"
      desc="Tudo que você precisa para operar a loja, sem depender de planilha ou time técnico."
      icon={LayoutDashboard}
    >
      <Grid items={features} />
      <Highlight
        title="Pensado para quem opera no dia a dia"
        text="Sidebar fixa com acesso rápido a todas as áreas, modais com animação suave, listas com skeleton loading, exportação de dados e atalhos para as ações mais usadas. Funciona perfeitamente no celular para gerenciar a loja de qualquer lugar."
        icon={CheckCircle2}
      />
      <RoutesList
        label="Telas do admin"
        items={[
          { path: "/admin/login", desc: "Acesso restrito" },
          { path: "/admin/dashboard", desc: "Visão geral" },
          { path: "/admin/produtos", desc: "Catálogo de produtos" },
          { path: "/admin/categorias", desc: "Categorias" },
          { path: "/admin/pedidos", desc: "Pedidos e fluxo" },
          { path: "/admin/clientes", desc: "Base de clientes" },
          { path: "/admin/afiliadas", desc: "Revendedoras" },
          { path: "/admin/cupons", desc: "Cupons" },
          { path: "/admin/financeiro", desc: "Financeiro" },
          { path: "/admin/notificacoes", desc: "Notificações" },
          { path: "/admin/configuracoes", desc: "Configurações" },
        ]}
      />
    </Section>
  );
}

/* ---------- DIFERENCIAIS ---------- */

function Diferenciais() {
  const items = [
    { icon: Sparkles, title: "IA integrada (Vicri)", desc: "Atendimento e recomendação 24/7 sem custo de operador." },
    { icon: Crown, title: "Programa de afiliadas nativo", desc: "Sem plugin externo, sem mensalidade extra." },
    { icon: Star, title: "Avaliações com compra verificada", desc: "Mais confiança e mais conversão." },
    { icon: Zap, title: "Animações e transições suaves", desc: "Sensação de app premium em toda a navegação." },
    { icon: Smartphone, title: "Mobile-first de verdade", desc: "Bottom nav, gestos e layout pensado pro celular." },
    { icon: Monitor, title: "Painel responsivo", desc: "Admin e área da afiliada funcionam no celular igualzinho ao desktop." },
    { icon: Palette, title: "Identidade Encantada", desc: "Tipografia, cores e sensação visual coerentes em toda a marca." },
    { icon: MessageCircle, title: "Suporte e iteração contínua", desc: "Sistema vivo, evoluindo conforme o negócio cresce." },
  ];
  return (
    <Section
      eyebrow="Por que esse sistema é diferente"
      title="Diferenciais competitivos"
      desc="O que torna a Encantada uma plataforma única, não só mais uma loja online."
      icon={Award}
    >
      <Grid items={items} />
      <div className="rounded-3xl gradient-primary text-primary-foreground p-8 text-center shadow-soft relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-gold/30 blur-3xl" />
        <div className="relative">
          <Sparkles className="h-8 w-8 mx-auto" />
          <h3 className="font-display text-3xl md:text-4xl mt-2">Pronta para encantar 💖</h3>
          <p className="opacity-90 mt-2 max-w-xl mx-auto">
            Uma plataforma feita com carinho, atenção a cada detalhe e foco em quem importa: a sua cliente.
          </p>
          <Link to="/" className="inline-flex items-center gap-1.5 bg-white text-primary font-semibold text-sm px-5 py-2.5 rounded-full mt-5 hover:scale-[1.03] transition-transform">
            Ver loja agora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

/* ---------- shared ---------- */

function Section({ eyebrow, title, desc, icon: Icon, children }: { eyebrow: string; title: string; desc: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-primary grid place-items-center text-primary-foreground shadow-soft shrink-0">
          <Icon className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">{eyebrow}</div>
          <h2 className="font-display text-3xl md:text-4xl text-primary leading-tight">{title}</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1 max-w-2xl">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Grid({ items }: { items: { icon: React.ElementType; title: string; desc: string }[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((it, i) => (
        <div key={i} className="bg-card rounded-2xl p-4 shadow-card hover:shadow-soft transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center text-primary">
            <it.icon className="h-5 w-5" />
          </div>
          <h4 className="font-semibold mt-3">{it.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{it.desc}</p>
        </div>
      ))}
    </div>
  );
}

function Highlight({ title, text, icon: Icon }: { title: string; text: string; icon: React.ElementType }) {
  return (
    <div className="rounded-3xl bg-card p-6 shadow-card border border-primary/20 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex gap-4 items-start">
        <div className="w-10 h-10 rounded-xl gradient-primary grid place-items-center text-primary-foreground shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-display text-xl text-primary">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

function RoutesList({ label, items }: { label: string; items: { path: string; desc: string }[] }) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">{label}</div>
      <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-baseline gap-2 text-sm">
            <code className="text-[11px] bg-muted/60 text-primary px-1.5 py-0.5 rounded font-mono shrink-0">{it.path}</code>
            <span className="text-muted-foreground text-xs">{it.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer({ current, onGo, navItems }: { current: SectionId; onGo: (s: SectionId) => void; navItems: { id: SectionId; label: string; icon: React.ElementType }[] }) {
  const idx = navItems.findIndex(n => n.id === current);
  const prev = idx > 0 ? navItems[idx - 1] : null;
  const next = idx < navItems.length - 1 ? navItems[idx + 1] : null;
  return (
    <div className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-3">
      {prev ? (
        <button onClick={() => onGo(prev.id)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ChevronRight className="h-4 w-4 rotate-180" /> {prev.label}
        </button>
      ) : <span />}
      {next ? (
        <button onClick={() => onGo(next.id)} className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary-foreground bg-primary px-4 py-2 rounded-full shadow-soft hover:scale-[1.03] transition-transform">
          {next.label} <ChevronRight className="h-4 w-4" />
        </button>
      ) : (
        <Link to="/" className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary-foreground bg-primary px-4 py-2 rounded-full shadow-soft hover:scale-[1.03] transition-transform">
          Abrir loja <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
