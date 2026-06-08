import { U as jsxRuntimeExports } from "../server.js";
import { X } from "./router-CnaK_EO9.js";
function Modal({
  children,
  onClose,
  title
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center sm:p-3 animate-overlay-in",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-card rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] sm:max-h-[85vh] overflow-y-auto shadow-soft animate-modal-in",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 bg-card flex items-center justify-between px-4 py-3 border-b border-border z-10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-sm", children: title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "w-8 h-8 grid place-items-center rounded-lg hover:bg-muted",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3", children })
          ]
        }
      )
    }
  );
}
export {
  Modal as M
};
