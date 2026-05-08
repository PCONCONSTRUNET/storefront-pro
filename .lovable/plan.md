## Objetivo

Hoje o admin lê quase tudo do `localStorage` (Zustand persist). Vou criar as tabelas no Supabase, conectar o cadastro/checkout/admin para persistir e ler do banco, mantendo o store local como cache para a parte pública (catálogo) continuar funcionando rápido.

## 1. Migrações no Supabase (uma única migração)

Criar tabelas (todas com RLS):

- **`customers`** — id, name, email (unique), phone, password_hash, address, addresses (jsonb), favorites (jsonb), created_at, updated_at
- **`products`** — id, name, slug, price, original_price, description, images (jsonb), category_id, stock, featured, active, variations (jsonb), created_at, updated_at
- **`categories`** — id, name, slug, image, sort_order, created_at
- **`coupons`** — code (PK), kind (percent|fixed|shipping), value, min_subtotal, expires_at, active, created_at
- **`affiliates`** — id, name, email, phone, password_hash, commission_type, commission_value, active, created_at
- **`affiliate_sales`** — id, affiliate_id, customer_name, customer_phone, product_description, sale_value, commission_earned, status, notes, created_at
- **`transactions`** — id, kind (entrada|saida), category, description, amount, date, affiliate_id, product_summary, notes, created_at
- **`reviews`** — id, product_id, customer_id, customer_name, rating, comment, photos (jsonb), created_at
- **`store_settings`** — singleton (id=1) com whatsapp, address, instagram, facebook, banner, etc.

RLS:
- `customers`, `affiliates`, `transactions`, `affiliate_sales`, `reviews`, `coupons`, `store_settings`: leitura pública nas que precisam (produtos, categorias, cupons ativos, settings, reviews); restantes ficam abertas para insert anon (loja sem auth Supabase, igual padrão atual de `orders`).
- Campos sensíveis (`password_hash`) ficam fora de qualquer view pública — quem precisar autenticar passa por server function.

> Observação importante: o app não usa `auth.users` do Supabase — autenticação é feita por hash local. Vou seguir o padrão existente (RLS aberta + acesso via service role nas server fns sensíveis), mantendo consistência com `orders`. Posso endurecer depois.

## 2. Camada de acesso (`src/lib/db/*.ts`)

Para cada tabela: `list()`, `upsert()`, `remove()` usando o client browser. Funções puras async que retornam dados tipados.

Server function `src/lib/auth.functions.ts`:
- `registerCustomer({name,email,phone,password})` — hasheia senha, insere em `customers`, dispara email de boas-vindas (já existe).
- `loginCustomer({email,password})` — valida hash, retorna customer sem hash.
- Mesmas funções para affiliate.

## 3. Refactor do `src/lib/store.ts`

Manter o Zustand para: cart, currentCustomerId, sessions, appliedCoupon, isAdmin (estado de UI). Remover persist de: products, categories, coupons, customers, orders, affiliates, affiliateSales, transactions, reviews, settings.

Adicionar `hydrateFromDb()` que carrega tudo no boot da app (chamado no `__root.tsx`). Cada mutação (`upsertProduct`, `addTransaction`, etc.) passa a chamar a função de DB e depois atualizar o estado local.

## 4. Refactor das telas admin

- `admin.dashboard.tsx`, `admin.clientes.tsx`, `admin.pedidos.tsx`, `admin.produtos.tsx`, `admin.categorias.tsx`, `admin.cupons.tsx`, `admin.afiliadas.tsx`, `admin.financeiro.tsx`, `admin.configuracoes.tsx`, `admin.notificacoes.tsx` — passam a ler do estado já hidratado (sem mudar UI).
- `admin.pedidos.tsx`: já temos `orders` na DB, mas hoje a tela lê do Zustand. Refatorar para ler/atualizar status direto na tabela `orders` (precisa adicionar policy de UPDATE).

## 5. Fluxos públicos atualizados

- `cadastro.tsx` → server fn `registerCustomer`
- `login.tsx` → server fn `loginCustomer`
- `checkout.tsx` / `placeOrder` → já insere em `orders`, vou garantir que também grava `transaction(kind='entrada', category='venda')` quando o pagamento é aprovado (no webhook do Mercado Pago já existente).
- `afiliada.cadastro.tsx` / `afiliada.login.tsx` → server fns equivalentes.

## 6. Migração de dados existentes

Adicionar uma rotina `migrateLocalToCloud()` no boot do admin: se detectar dados no localStorage que não estão na DB, faz upsert em massa. Roda 1x e marca `localStorage.migrated=true`.

## Detalhes técnicos

- Senhas: `bcryptjs` server-side (já na lista de packages compatíveis com Worker, se não tiver instalo).
- Tipos: usar `Database` gerado pelo Supabase em `src/integrations/supabase/types.ts` (auto).
- Email de boas-vindas continua no fluxo de `registerCustomer`.
- O store local vira cache em memória — sumir o localStorage não perde mais nada.

## Ordem de execução

1. Migration SQL (espera aprovação do usuário).
2. Helpers `src/lib/db/*` + server fns auth.
3. `hydrateFromDb` + remover persist dos campos migrados.
4. Refactor cadastro/login/checkout para escrever na DB.
5. Refactor admin (cada tela lê dados já hidratados).
6. Rotina de migração one-shot do localStorage.
7. Testar fluxo: cadastro → pedido → admin clientes/financeiro.

## O que NÃO muda

- Visual de todas as telas.
- Fluxo de PIX / Mercado Pago.
- Email de boas-vindas e confirmação.
- Carrinho continua local (UX rápida).