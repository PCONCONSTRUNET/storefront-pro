## Sistema de Afiliadas — Plano

Sistema simplificado onde cada afiliada tem login próprio, registra suas próprias vendas, e a dona acompanha tudo no admin. Tudo persistido localmente (zustand/localStorage), seguindo o padrão atual da loja.

### Modelo de dados (em `src/lib/store.ts`)

**Affiliate**
- `id`, `name`, `email`, `password`, `phone`
- `commissionType`: "percent" | "fixed"
- `commissionValue`: number (ex: 10 = 10% ou R$ 10 por venda)
- `active`: boolean
- `createdAt`

**AffiliateSale**
- `id`, `affiliateId`
- `customerName`, `customerPhone` (opcional)
- `productDescription` (texto livre — o que vendeu)
- `saleValue` (valor total da venda)
- `commissionEarned` (calculado automaticamente)
- `status`: "pendente" | "confirmada" | "cancelada"
- `notes` (opcional)
- `createdAt`

### Novas rotas

1. **`/afiliada/login`** — login da afiliada (email + senha)
2. **`/afiliada`** — painel da afiliada (protegido):
   - Card com totais: vendas do mês, comissão acumulada, total geral
   - Botão "Registrar nova venda" → formulário (cliente, produto, valor)
   - Lista das suas vendas com status
3. **`/admin/afiliadas`** — gestão no admin:
   - Lista de afiliadas com toggle ativo/inativo
   - Botão criar/editar afiliada (nome, email, senha, comissão)
   - Aba "Vendas" mostrando todas vendas de todas afiliadas
   - Admin pode confirmar/cancelar venda registrada
   - Filtro por afiliada e por período

### Fluxo

1. Dona cadastra afiliada no admin definindo % ou valor fixo de comissão
2. Afiliada faz login em `/afiliada/login`
3. Quando vende, registra a venda no painel (status inicial: pendente)
4. Comissão é calculada automaticamente
5. Dona vê no admin, confirma ou cancela
6. Totais ficam visíveis para ambas

### Mudanças técnicas

- `src/lib/store.ts`: adicionar tipos `Affiliate`, `AffiliateSale`, estado `affiliates`, `affiliateSales`, `currentAffiliateId`, e ações: `loginAffiliate`, `logoutAffiliate`, `upsertAffiliate`, `deleteAffiliate`, `registerAffiliateSale`, `updateAffiliateSaleStatus`
- `src/routes/afiliada.login.tsx` — tela de login
- `src/routes/afiliada.index.tsx` — painel com dashboard + form de registro + lista
- `src/routes/admin.afiliadas.tsx` — CRUD de afiliadas + lista global de vendas
- Link no admin menu para "Afiliadas"
- Link discreto no rodapé/header para "Acesso Afiliada"

### Fora do escopo (pode ser adicionado depois)

- Link rastreável de afiliada com cookie/UTM
- Cupom vinculado à afiliada
- Pagamento de comissões (apenas registro, conforme pedido)
- Integração da venda da loja com afiliada automaticamente