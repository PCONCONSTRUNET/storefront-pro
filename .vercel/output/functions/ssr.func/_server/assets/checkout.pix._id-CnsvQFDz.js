import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { ac as Route, c as useNavigate, S as StoreLayout, L as LoaderCircle, d as Link, k as ChevronLeft, C as CircleCheck, D as pixIcon, v as brl, e as Copy, ad as fetchOrder, u as useStore, A as playBeep, t as toast } from "./router-CbsSSRKz.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./adminHelpers.server-BhLg7GIA.js";
import "./client.server-C7GAOqxY.js";
function PixPage() {
  const {
    id
  } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    let timer;
    const tick = async () => {
      try {
        const o = await fetchOrder(id);
        if (cancelled) return;
        if (!o) {
          setError("Pedido não encontrado.");
          setLoading(false);
          return;
        }
        setOrder(o);
        setLoading(false);
        if (o.payment_status === "approved") {
          useStore.getState().clearCart();
          playBeep();
          toast.success("Pagamento aprovado! 🎉");
          setTimeout(() => navigate({
            to: "/pedido/$id",
            params: {
              id: o.id
            }
          }), 1500);
          return;
        }
        if (["rejected", "cancelled", "expired"].includes(o.payment_status)) {
          return;
        }
        timer = setTimeout(tick, 4e3);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    };
    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id, navigate]);
  const copyCode = () => {
    if (!order?.pix_qr_code) return;
    navigator.clipboard.writeText(order.pix_qr_code);
    toast.success("Código Pix copiado!");
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin mx-auto text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "Gerando seu Pix..." })
    ] }) });
  }
  if (error || !order) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: error ?? "Pedido não encontrado." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-primary font-semibold", children: "Voltar" })
    ] }) });
  }
  const status = order.payment_status;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto px-4 py-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
      " Início"
    ] }),
    status === "approved" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-success to-success/70 text-white rounded-2xl p-6 text-center shadow-soft", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-12 w-12 mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Pagamento aprovado!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm opacity-90 mt-1", children: "Redirecionando para seu pedido..." })
    ] }) : ["rejected", "cancelled", "expired"].includes(status) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-destructive/10 border border-destructive/30 rounded-2xl p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-lg font-bold text-destructive", children: [
        "Pagamento ",
        status === "expired" ? "expirado" : "não aprovado"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Você pode tentar novamente." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/carrinho", className: "inline-block mt-4 px-6 h-11 leading-[2.75rem] rounded-full gradient-primary text-primary-foreground font-semibold", children: "Voltar ao carrinho" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-primary to-rose text-primary-foreground rounded-2xl p-5 shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: pixIcon, alt: "Pix", className: "h-5 w-5 object-contain" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Pague com Pix" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm opacity-90 mt-1", children: "Escaneie o QR Code ou copie o código abaixo. A confirmação é automática." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold mt-3", children: brl(Number(order.total)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 bg-card rounded-2xl p-5 shadow-card", children: [
        order.pix_qr_code_base64 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: `data:image/png;base64,${order.pix_qr_code_base64}`, alt: "QR Code Pix", className: "w-64 h-64 rounded-xl border border-border" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground py-8", children: "QR Code indisponível" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Pix Copia e Cola" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { readOnly: true, value: order.pix_qr_code ?? "", className: "mt-1 w-full h-20 px-3 py-2 rounded-xl bg-muted border border-border text-xs font-mono outline-none resize-none", onFocus: (e) => e.target.select() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: copyCode, className: "mt-2 w-full h-11 rounded-full gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }),
            " Copiar código Pix"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2 justify-center text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
          " Aguardando confirmação do pagamento..."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground mt-4", children: [
        "Pedido ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
          "#",
          order.id.slice(0, 8)
        ] }),
        " ",
        "· Pagamento processado por Mercado Pago"
      ] })
    ] })
  ] }) });
}
export {
  PixPage as component
};
