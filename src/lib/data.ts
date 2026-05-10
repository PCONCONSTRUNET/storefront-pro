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

import lacoRosaGlitter from "@/assets/products/laco-rosa-glitter.jpg";
import tiaraCoroaDourada from "@/assets/products/tiara-coroa-dourada.jpg";
import kit5Lacos from "@/assets/products/kit-5-lacos.jpg";
import bicoPatoFloral from "@/assets/products/bico-pato-floral.jpg";
import presilhaBorboleta from "@/assets/products/presilha-borboleta-perola.jpg";
import elasticoVeludo from "@/assets/products/elastico-veludo-rosa.jpg";
import lacoMaxiDourado from "@/assets/products/laco-maxi-dourado.jpg";
import tiaraFlorCerejeira from "@/assets/products/tiara-flor-cerejeira.jpg";
import demoLaco1 from "@/assets/products/demo-laco-rosa-1.png";
import demoTiara1 from "@/assets/products/demo-tiara-coroa-1.png";
import demoKit1 from "@/assets/products/demo-kit-lacos-1.png";
import demoPresilha1 from "@/assets/products/demo-presilha-borboleta-1.png";

export const initialProducts: Product[] = [
  {
    id: "p1",
    name: "Laço Princesa Rosa Glitter",
    description:
      "Laço artesanal em fita de cetim com detalhes em glitter dourado. Perfeito para princesas de todas as idades. Acompanha bico de pato resistente.",
    price: 24.9,
    oldPrice: 34.9,
    image: lacoRosaGlitter,
    gallery: [lacoRosaGlitter, demoLaco1, lacoMaxiDourado],
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
    image: tiaraCoroaDourada,
    gallery: [tiaraCoroaDourada, demoTiara1],
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
    image: kit5Lacos,
    gallery: [kit5Lacos, demoKit1],
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
    image: bicoPatoFloral,
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
    image: presilhaBorboleta,
    gallery: [presilhaBorboleta, demoPresilha1],
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
    image: elasticoVeludo,
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
    image: lacoMaxiDourado,
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
    image: tiaraFlorCerejeira,
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
