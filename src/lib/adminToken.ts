// DEPRECATED: token admin agora vive em cookie httpOnly "princesa_admin_session".
// Este arquivo é mantido apenas para evitar quebrar imports legados.
// Sempre retorna null — código novo deve usar isAdmin do store + serverFns.
export const setAdminToken = (_t: string | null) => {};
export const getAdminToken = (): string | null => null;
