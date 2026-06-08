import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { u as useStore, S as StoreLayout, a as Search, M as MessageCircle } from "./router-yLgiv1p7.js";
import { C as ChevronDown } from "./chevron-down-CN8J_YcF.js";
import { C as CircleQuestionMark } from "./circle-question-mark-Ce5RQfln.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./adminHelpers.server-BhLg7GIA.js";
import "./client.server-C7GAOqxY.js";
function Page() {
  const {
    faq,
    settings
  } = useStore();
  const [search, setSearch] = reactExports.useState("");
  const [openId, setOpenId] = reactExports.useState(null);
  const filteredFaq = reactExports.useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return faq;
    return faq.filter((f) => f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term) || f.category.toLowerCase().includes(term));
  }, [faq, search]);
  const categories = reactExports.useMemo(() => {
    const cats = new Set(filteredFaq.map((f) => f.category));
    return Array.from(cats);
  }, [filteredFaq]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl text-primary mb-2", children: "Como podemos ajudar?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Encontre respostas rápidas para suas dúvidas." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Busque por 'frete', 'prazo', 'pagamento'...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border shadow-soft outline-none focus:ring-2 focus:ring-primary/30" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8", children: categories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10 text-muted-foreground", children: "Nenhuma pergunta encontrada para sua busca." }) : categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold uppercase tracking-wider text-primary mb-3 px-2", children: cat }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card rounded-2xl border border-border shadow-card divide-y divide-border overflow-hidden", children: filteredFaq.filter((f) => f.category === cat).map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpenId(openId === f.id ? null : f.id), className: "w-full text-left px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: f.question }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `h-4 w-4 text-muted-foreground transition-transform ${openId === f.id ? "rotate-180" : ""}` })
        ] }),
        openId === f.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 pb-4 text-sm text-muted-foreground animate-fade-in whitespace-pre-wrap", children: f.answer })
      ] }, f.id)) })
    ] }, cat)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-rose/10 border border-primary/20 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "h-8 w-8 text-primary mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg mb-1", children: "Ainda com dúvida?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-5", children: "Fale diretamente com nosso time de atendimento." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-2 h-12 px-6 rounded-full gradient-primary text-white font-semibold shadow-soft hover:scale-105 transition-transform", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5" }),
        " Chamar no WhatsApp"
      ] })
    ] })
  ] }) });
}
export {
  Page as component
};
