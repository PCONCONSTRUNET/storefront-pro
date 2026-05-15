create or replace function public.get_customer_auth_record(_email text)
returns table(
  id uuid,
  name text,
  email text,
  phone text,
  address text,
  addresses jsonb,
  favorites jsonb,
  created_at timestamptz,
  password_hash text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.name,
    c.email,
    c.phone,
    c.address,
    c.addresses,
    c.favorites,
    c.created_at,
    cc.password_hash
  from public.customers c
  left join public.customer_credentials cc on cc.customer_id = c.id
  where lower(c.email) = lower(trim(_email))
  limit 1
$$;

create or replace function public.create_customer_with_password_hash(
  _name text,
  _email text,
  _phone text,
  _address text,
  _password_hash text
)
returns table(
  ok boolean,
  message text,
  id uuid,
  name text,
  email text,
  phone text,
  address text,
  addresses jsonb,
  favorites jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  _customer_id uuid;
  _created_at timestamptz;
begin
  if exists (select 1 from public.customers c where lower(c.email) = lower(trim(_email))) then
    ok := false;
    message := 'E-mail já cadastrado';
    return next;
    return;
  end if;

  _customer_id := gen_random_uuid();

  insert into public.customers (id, name, email, phone, address, addresses, favorites)
  values (_customer_id, trim(_name), lower(trim(_email)), coalesce(_phone, ''), nullif(trim(coalesce(_address, '')), ''), '[]'::jsonb, '[]'::jsonb)
  returning customers.created_at into _created_at;

  insert into public.customer_credentials (customer_id, password_hash)
  values (_customer_id, _password_hash);

  ok := true;
  message := 'Cadastro realizado!';
  id := _customer_id;
  name := trim(_name);
  email := lower(trim(_email));
  phone := coalesce(_phone, '');
  address := nullif(trim(coalesce(_address, '')), '');
  addresses := '[]'::jsonb;
  favorites := '[]'::jsonb;
  created_at := _created_at;
  return next;
end;
$$;

create or replace function public.upsert_customer_google(
  _email text,
  _name text,
  _phone text default ''
)
returns table(
  ok boolean,
  message text,
  id uuid,
  name text,
  email text,
  phone text,
  address text,
  addresses jsonb,
  favorites jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  _existing public.customers%rowtype;
  _customer_id uuid;
  _created_at timestamptz;
begin
  select * into _existing
  from public.customers c
  where lower(c.email) = lower(trim(_email))
  limit 1;

  if found then
    ok := true;
    message := 'Bem-vinda!';
    id := _existing.id;
    name := _existing.name;
    email := _existing.email;
    phone := coalesce(_existing.phone, '');
    address := _existing.address;
    addresses := _existing.addresses;
    favorites := _existing.favorites;
    created_at := _existing.created_at;
    return next;
    return;
  end if;

  _customer_id := gen_random_uuid();

  insert into public.customers (id, name, email, phone, address, addresses, favorites)
  values (_customer_id, trim(_name), lower(trim(_email)), coalesce(_phone, ''), null, '[]'::jsonb, '[]'::jsonb)
  returning customers.created_at into _created_at;

  ok := true;
  message := 'Bem-vinda!';
  id := _customer_id;
  name := trim(_name);
  email := lower(trim(_email));
  phone := coalesce(_phone, '');
  address := null;
  addresses := '[]'::jsonb;
  favorites := '[]'::jsonb;
  created_at := _created_at;
  return next;
end;
$$;

create or replace function public.update_customer_password_hash(
  _customer_id uuid,
  _password_hash text
)
returns table(ok boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.customers c where c.id = _customer_id) then
    ok := false;
    message := 'Cliente não encontrado';
    return next;
    return;
  end if;

  insert into public.customer_credentials (customer_id, password_hash)
  values (_customer_id, _password_hash)
  on conflict (customer_id) do update
  set password_hash = excluded.password_hash,
      updated_at = now();

  ok := true;
  message := 'Senha atualizada';
  return next;
end;
$$;

grant execute on function public.get_customer_auth_record(text) to anon, authenticated;
grant execute on function public.create_customer_with_password_hash(text, text, text, text, text) to anon, authenticated;
grant execute on function public.upsert_customer_google(text, text, text) to anon, authenticated;
grant execute on function public.update_customer_password_hash(uuid, text) to anon, authenticated;