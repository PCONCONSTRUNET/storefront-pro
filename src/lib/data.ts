export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  gallery?: string[];
  category: string;
  categories?: string[];
  stock: number;
  minStock?: number;
  sku: string;
  active: boolean;
  hidden?: boolean;
  sortOrder?: number;
  variations?: {
    name: string;
    options: (string | { label: string; priceDelta?: number })[];
  }[];
};

export type Category = {
  id: string;
  name: string;
  image: string;
  order: number;
};

export type FAQItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
};

export const initialCategories: Category[] = [];

export const initialProducts: Product[] = [];

export type Coupon = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  validUntil: string;
  maxUses: number;
  usedCount: number;
  minOrder: number;
  active: boolean;
};

export const initialCoupons: Coupon[] = [
  {
    code: "PRIMEIRA10",
    type: "percent",
    value: 10,
    validUntil: "2026-12-31",
    maxUses: 100,
    usedCount: 12,
    minOrder: 0,
    active: true,
  },
  {
    code: "PRINCESA20",
    type: "percent",
    value: 20,
    validUntil: "2026-12-31",
    maxUses: 50,
    usedCount: 7,
    minOrder: 100,
    active: true,
  },
  {
    code: "FRETE15",
    type: "fixed",
    value: 15,
    validUntil: "2026-12-31",
    maxUses: 200,
    usedCount: 33,
    minOrder: 80,
    active: true,
  },
];

export const initialFAQ: FAQItem[] = [
  {
    id: "f1",
    category: "Pedidos",
    question: "Como acompanho meu pedido?",
    answer:
      "Você pode acompanhar o status do seu pedido acessando o menu 'Meus Pedidos' no seu perfil. Além disso, enviamos notificações via e-mail e push a cada atualização de status.",
    sortOrder: 1,
  },
  {
    id: "f2",
    category: "Pedidos",
    question: "Qual o prazo de entrega?",
    answer:
      "O prazo médio de entrega é de 5 a 10 dias úteis, dependendo da sua localização. Após a confirmação do pagamento, seu pedido é preparado em até 24 horas.",
    sortOrder: 2,
  },
  {
    id: "f3",
    category: "Pagamento",
    question: "Quais as formas de pagamento aceitas?",
    answer:
      "Aceitamos Pix (com 5% de desconto automático), Cartão de Crédito e Dinheiro (apenas para retiradas no local).",
    sortOrder: 3,
  },
  {
    id: "f4",
    category: "Produtos",
    question: "Os laços são feitos à mão?",
    answer:
      "Sim! Todos os nossos produtos são 100% artesanais, feitos com fita de alta qualidade e muito carinho por nossas artesãs.",
    sortOrder: 4,
  },
];
