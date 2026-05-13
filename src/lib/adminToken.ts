// Pequeno holder do token admin para a camada cloud sem importar a store.
let _adminToken: string | null = null;
export const setAdminToken = (t: string | null) => {
  _adminToken = t;
};
export const getAdminToken = () => _adminToken;
