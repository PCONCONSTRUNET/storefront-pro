-- Onda 1: separar credenciais para tabelas privadas com bcrypt
create extension if not exists pgcrypto with schema public;

-- Tabela de credenciais de clientes
create table if not exists public.customer_credentials (
  customer_id uuid primary key references public.customers(id) on delete cascade,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.customer_credentials enable row level security;
-- Sem policies = somente service_role acessa (anon/authenticated bloqueados)

-- Tabela de credenciais de afiliadas
create table if not exists public.affiliate_credentials (
  affiliate_id uuid primary key references public.affiliates(id) on delete cascade,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.affiliate_credentials enable row level security;

-- Migrar senhas existentes (texto puro -> bcrypt)
insert into public.customer_credentials (customer_id, password_hash)
select id, crypt(coalesce(nullif(password_hash, ''), 'changeme'), gen_salt('bf', 10))
from public.customers
on conflict (customer_id) do nothing;

insert into public.affiliate_credentials (affiliate_id, password_hash)
select id, crypt(coalesce(nullif(password_hash, ''), 'changeme'), gen_salt('bf', 10))
from public.affiliates
on conflict (affiliate_id) do nothing;

-- Remover coluna sensível das tabelas públicas
alter table public.customers drop column if exists password_hash;
alter table public.affiliates drop column if exists password_hash;

-- Trigger updated_at
create trigger trg_customer_credentials_updated
  before update on public.customer_credentials
  for each row execute function public.set_updated_at();

create trigger trg_affiliate_credentials_updated
  before update on public.affiliate_credentials
  for each row execute function public.set_updated_at();