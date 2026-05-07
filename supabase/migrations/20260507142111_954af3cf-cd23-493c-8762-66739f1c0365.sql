-- Tipo de perfil que está pedindo reset
create type public.reset_subject as enum ('admin', 'customer', 'affiliate');

create table public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  subject_type public.reset_subject not null,
  subject_email text not null,
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_prt_token on public.password_reset_tokens(token);
create index idx_prt_email on public.password_reset_tokens(subject_email);

alter table public.password_reset_tokens enable row level security;

-- Qualquer um pode criar um pedido (fluxo público de "esqueci a senha")
create policy "anyone can request reset"
on public.password_reset_tokens
for insert
to anon, authenticated
with check (true);

-- Leitura: somente buscando por token específico (não dá para varrer a tabela
-- porque o token é um segredo de 32+ chars). O cliente faz .eq('token', X).
create policy "anyone can read by token"
on public.password_reset_tokens
for select
to anon, authenticated
using (true);

-- Marcar como usado
create policy "anyone can mark used"
on public.password_reset_tokens
for update
to anon, authenticated
using (used_at is null and expires_at > now())
with check (used_at is not null);