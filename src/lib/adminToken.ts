// Pequeno holder do token admin para a camada cloud sem importar a store.
// Em domínios publicados, a página pode montar antes do holder em memória ser
// reidratado; por isso usamos o localStorage persistido como fallback.
let _adminToken: string | null = null;

const STORAGE_KEY = "princesa-store-v1";

function getPersistedAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { adminToken?: unknown } };
    const token = parsed?.state?.adminToken;
    return typeof token === "string" && token.length > 0 ? token : null;
  } catch {
    return null;
  }
}

export const setAdminToken = (t: string | null) => {
  _adminToken = t;
};

export const getAdminToken = () => _adminToken || getPersistedAdminToken();
