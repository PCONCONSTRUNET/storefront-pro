export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  gallery?: string[];
  category: string;
  stock: number;
  minStock?: number;
  sku: string;
  active: boolean;
  hidden?: boolean;
  variations?: { name: string; options: (string | { label: string; priceDelta?: number })[] }[];
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

export const initialCategories: Category[] = [
  { id: "lacos", name: "Laços", image: "🎀", order: 1 },
  { id: "tiaras", name: "Tiaras", image: "👑", order: 2 },
  { id: "bicos", name: "Bicos de Pato", image: "💝", order: 3 },
  { id: "kits", name: "Kits", image: "🎁", order: 4 },
  { id: "elasticos", name: "Elásticos", image: "🌸", order: 5 },
  { id: "presilhas", name: "Presilhas", image: "✨", order: 6 },
];

export const initialProducts: Product[] = [
  {
    id: "p1",
    name: "Laço Princesa Rosa Glitter",
    description:
      "Laço artesanal em fita de cetim com detalhes em glitter dourado. Perfeito para princesas de todas as idades. Acompanha bico de pato resistente.",
    price: 24.9,
    oldPrice: 34.9,
    image: "/products/ilustra-laco-rosa.png",
    gallery: ["/products/ilustra-laco-rosa.png", "/products/demo-laco-rosa-1.png"],
    category: "lacos",
    stock: 25,
    sku: "LC-001",
    active: true,
    variations: [{ name: "Tamanho", options: ["P", "M", "G"] }],
  },
  {
    id: "p2",
    name: "Tiara Coroa Dourada",
    description:
      "Tiara estilo coroa banhada a ouro com strass. Ideal para festas, ensaios e momentos especiais.",
    price: 49.9,
    oldPrice: 69.9,
    image: "/products/ilustra-tiara-coroa.png",
    gallery: ["/products/ilustra-tiara-coroa.png", "/products/demo-tiara-coroa-1.png"],
    category: "tiaras",
    stock: 12,
    sku: "TR-002",
    active: true,
  },
  {
    id: "p3",
    name: "Kit 5 Laços Coloridos",
    description: "Kit promocional com 5 laços de cores variadas. Embalagem presenteável.",
    price: 79.9,
    oldPrice: 119.9,
    image: "/products/ilustra-kit-lacos.png",
    gallery: ["/products/ilustra-kit-lacos.png", "/products/demo-kit-lacos-1.png"],
    category: "kits",
    stock: 8,
    sku: "KT-003",
    active: true,
  },
  {
    id: "p4",
    name: "Bico de Pato Floral",
    description: "Bico de pato com flor de cetim feita à mão. Antialérgico.",
    price: 18.9,
    image: "/products/ilustra-bico-pato.png",
    gallery: ["/products/ilustra-bico-pato.png", "/products/demo-bico-pato-1.png"],
    category: "bicos",
    stock: 40,
    sku: "BP-004",
    active: true,
  },
  {
    id: "p5",
    name: "Presilha Borboleta Pérola",
    description: "Presilha em formato de borboleta com pérolas delicadas.",
    price: 22.5,
    oldPrice: 29.9,
    image: "/products/ilustra-presilha-borboleta.png",
    gallery: ["/products/ilustra-presilha-borboleta.png", "/products/demo-presilha-borboleta-1.png"],
    category: "presilhas",
    stock: 18,
    sku: "PR-005",
    active: true,
  },
  {
    id: "p6",
    name: "Elástico Veludo Rosa",
    description: "Conjunto de 3 elásticos de veludo macio que não marcam o cabelo.",
    price: 14.9,
    image: "/products/ilustra-elastico-veludo.png",
    gallery: ["/products/ilustra-elastico-veludo.png"],
    category: "elasticos",
    stock: 60,
    sku: "EL-006",
    active: true,
  },
  {
    id: "p7",
    name: "Laço Maxi Cetim Dourado",
    description:
      "Laço grande estilo maxi em cetim com brilho dourado, ideal para ocasiões especiais.",
    price: 34.9,
    image: "/products/ilustra-laco-maxi.png",
    gallery: ["/products/ilustra-laco-maxi.png"],
    category: "lacos",
    stock: 15,
    sku: "LC-007",
    active: true,
  },
  {
    id: "p8",
    name: "Tiara Flor de Cerejeira",
    description: "Tiara delicada com aplique de flor rosa em tecido.",
    price: 29.9,
    image: "/products/ilustra-tiara-cerejeira.png",
    gallery: ["/products/ilustra-tiara-cerejeira.png"],
    category: "tiaras",
    stock: 22,
    sku: "TR-008",
    active: true,
  },
];

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
    answer: "Você pode acompanhar o status do seu pedido acessando o menu 'Meus Pedidos' no seu perfil. Além disso, enviamos notificações via e-mail e push a cada atualização de status.",
    sortOrder: 1
  },
  {
    id: "f2",
    category: "Pedidos",
    question: "Qual o prazo de entrega?",
    answer: "O prazo médio de entrega é de 5 a 10 dias úteis, dependendo da sua localização. Após a confirmação do pagamento, seu pedido é preparado em até 24 horas.",
    sortOrder: 2
  },
  {
    id: "f3",
    category: "Pagamento",
    question: "Quais as formas de pagamento aceitas?",
    answer: "Aceitamos Pix (com 5% de desconto automático), Cartão de Crédito e Dinheiro (apenas para retiradas no local).",
    sortOrder: 3
  },
  {
    id: "f4",
    category: "Produtos",
    question: "Os laços são feitos à mão?",
    answer: "Sim! Todos os nossos produtos são 100% artesanais, feitos com fita de alta qualidade e muito carinho por nossas artesãs.",
    sortOrder: 4
  }
];
