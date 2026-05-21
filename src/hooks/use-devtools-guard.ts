import { useEffect } from "react";

const BLOCKED_CTRL_SHIFT_KEYS = new Set([
  "i",
  "j",
  "c",
  "k",
  "u",
  "e",
  "p",
  "d",
]);

const BLOCKED_META_ALT_KEYS = new Set(["i", "j", "c", "u", "e"]);

function isBlockedShortcut(event: KeyboardEvent): boolean {
  const key = event.key?.toLowerCase();

  if (key === "f12" || event.keyCode === 123) return true;

  const ctrl = event.ctrlKey || event.metaKey;
  const shift = event.shiftKey;

  if (ctrl && shift && key && BLOCKED_CTRL_SHIFT_KEYS.has(key)) return true;

  if (ctrl && !shift && !event.altKey && key === "u") return true;

  if (event.metaKey && event.altKey && key && BLOCKED_META_ALT_KEYS.has(key))
    return true;

  return false;
}

export function attachDevtoolsGuard(): () => void {
  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!isBlockedShortcut(event)) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const onDragStart = (event: DragEvent) => {
    if (event.target instanceof HTMLImageElement) {
      event.preventDefault();
    }
  };

  const onSelectStart = (event: Event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement) {
      event.preventDefault();
    }
  };

  document.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("dragstart", onDragStart);
  document.addEventListener("selectstart", onSelectStart);

  return () => {
    document.removeEventListener("contextmenu", onContextMenu);
    document.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("dragstart", onDragStart);
    document.removeEventListener("selectstart", onSelectStart);
  };
}

/** Proteção global em todas as rotas (loja, admin, afiliada). Sempre ativa. */
export function useDevtoolsGuard(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    return attachDevtoolsGuard();
  }, [enabled]);
}

/** Script inline para rodar antes do React hidratar (primeiro paint). */
export const DEVTOOLS_GUARD_INLINE_SCRIPT = `(function(){
  var blocked=new Set("ijckuepd".split(""));
  var blockedMac=new Set("ijcue".split(""));
  function blockedKey(e){
    var k=(e.key||"").toLowerCase();
    if(k==="f12"||e.keyCode===123)return true;
    var ctrl=e.ctrlKey||e.metaKey;
    if(ctrl&&e.shiftKey&&blocked.has(k))return true;
    if(ctrl&&!e.shiftKey&&!e.altKey&&k==="u")return true;
    if(e.metaKey&&e.altKey&&blockedMac.has(k))return true;
    return false;
  }
  document.addEventListener("contextmenu",function(e){e.preventDefault();});
  document.addEventListener("keydown",function(e){
    if(blockedKey(e)){e.preventDefault();e.stopPropagation();}
  },true);
  document.addEventListener("dragstart",function(e){
    if(e.target&&e.target.tagName==="IMG")e.preventDefault();
  });
  document.addEventListener("selectstart",function(e){
    if(e.target&&e.target.tagName==="IMG")e.preventDefault();
  });
})();`;
