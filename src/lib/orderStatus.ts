export type OrderStatus =
  | "aguardando_pagamento"
  | "pago"
  | "em_separacao"
  | "saiu_para_entrega"
  | "concluido"
  | "cancelado"
  | "reembolsado";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  em_separacao: "Em separação",
  saiu_para_entrega: "Aguardando retirada",
  concluido: "Concluído",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

const ORDER_STATUS_VALUES = new Set<OrderStatus>([
  "aguardando_pagamento",
  "pago",
  "em_separacao",
  "saiu_para_entrega",
  "concluido",
  "cancelado",
  "reembolsado",
]);

const REMOTE_STATUS_ALIASES: Record<string, OrderStatus> = {
  approved: "pago",
  paid: "pago",
  pending: "aguardando_pagamento",
  in_process: "aguardando_pagamento",
  in_mediation: "aguardando_pagamento",
  authorized: "pago",
  rejected: "cancelado",
  cancelled: "cancelado",
  canceled: "cancelado",
  expired: "cancelado",
  refunded: "reembolsado",
  charged_back: "reembolsado",
};

export function normalizeOrderStatus(status: unknown): OrderStatus {
  const value = String(status || "").trim().toLowerCase();
  if (ORDER_STATUS_VALUES.has(value as OrderStatus)) return value as OrderStatus;
  return REMOTE_STATUS_ALIASES[value] || "aguardando_pagamento";
}

export function getOrderStatusLabel(status: unknown) {
  return ORDER_STATUS_LABEL[normalizeOrderStatus(status)];
}

// ---------- Delivery status (separado do pagamento) ----------
export type DeliveryStatus =
  | "pendente"
  | "em_separacao"
  | "saiu_para_entrega"
  | "entregue";

export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  pendente: "Pendente",
  em_separacao: "Em separação",
  saiu_para_entrega: "Aguardando retirada",
  entregue: "Entregue",
};

const DELIVERY_VALUES = new Set<DeliveryStatus>([
  "pendente",
  "em_separacao",
  "saiu_para_entrega",
  "entregue",
]);

const DELIVERY_ALIASES: Record<string, DeliveryStatus> = {
  concluido: "entregue",
  delivered: "entregue",
  shipped: "saiu_para_entrega",
  separacao: "em_separacao",
  preparing: "em_separacao",
};

export function normalizeDeliveryStatus(status: unknown): DeliveryStatus {
  const v = String(status || "").trim().toLowerCase();
  if (DELIVERY_VALUES.has(v as DeliveryStatus)) return v as DeliveryStatus;
  return DELIVERY_ALIASES[v] || "pendente";
}

export function getDeliveryStatusLabel(status: unknown) {
  return DELIVERY_STATUS_LABEL[normalizeDeliveryStatus(status)];
}
