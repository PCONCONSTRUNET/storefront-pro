drop policy if exists "anyone can mark used" on public.password_reset_tokens;

create or replace function public.consume_password_reset_token(_token text)
returns table(subject_type public.reset_subject, subject_email text)
language plpgsql
security definer
set search_path = public
as $$
declare
  _row public.password_reset_tokens%rowtype;
begin
  select * into _row
  from public.password_reset_tokens
  where token = _token
    and used_at is null
    and expires_at > now()
  limit 1;

  if not found then
    return;
  end if;

  update public.password_reset_tokens
  set used_at = now()
  where id = _row.id;

  subject_type := _row.subject_type;
  subject_email := _row.subject_email;
  return next;
end;
$$;

grant execute on function public.consume_password_reset_token(text) to anon, authenticated;