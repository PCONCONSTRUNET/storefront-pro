import { r as reactExports, U as jsxRuntimeExports } from "../server.js";
import { c as useNavigate, q as useStoreHydrated, u as useStore, s as selectCurrentCustomer, S as StoreLayout, d as Link, k as ChevronLeft, H as Heart, J as ProductGridSkeleton, K as ProductCard } from "./router-yLgiv1p7.js";
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
  const navigate = useNavigate();
  const hydrated = useStoreHydrated();
  const customer = useStore(selectCurrentCustomer);
  const products = useStore((s) => s.products);
  reactExports.useEffect(() => {
    if (hydrated && !customer) navigate({
      to: "/login"
    });
  }, [hydrated, customer, navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StoreLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-4 py-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/perfil", className: "inline-flex items-center gap-1 text-sm text-muted-foreground mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
      " Voltar"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-bold mb-4 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5 text-primary" }),
      " Favoritos"
    ] }),
    !hydrated || !customer ? /* @__PURE__ */ jsxRuntimeExports.jsx(ProductGridSkeleton, { count: 6, cols: "grid-cols-2 md:grid-cols-4" }) : (() => {
      const favIds = customer.favorites || [];
      const favProducts = products.filter((p) => favIds.includes(p.id));
      if (favProducts.length === 0) {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-12 w-12 mx-auto text-muted-foreground/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-3", children: "Você ainda não tem favoritos." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-4 inline-block text-primary text-sm font-semibold underline", children: "Ver produtos" })
        ] });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: favProducts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product: p }, p.id)) });
    })()
  ] }) });
}
export {
  Page as component
};
