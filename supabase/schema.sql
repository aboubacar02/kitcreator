-- ============================================================
-- KitCreator — Script complémentaire (à exécuter dans SQL Editor)
-- À exécuter APRÈS le script de création de la table profiles
-- ============================================================

-- 1. Fonction RPC pour décompter les crédits de façon atomique
create or replace function public.consume_credits(user_id uuid, amount int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining int;
begin
  update public.profiles
    set credits = credits - amount,
        updated_at = timezone('utc'::text, now())
    where id = user_id and credits >= amount
    returning credits into remaining;

  if remaining is null then
    raise exception 'Not enough credits. Please upgrade to PRO.';
  end if;

  return remaining;
end;
$$;

grant execute on function public.consume_credits(uuid, int) to authenticated;

-- 2. Création automatique du profil lors de l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Crédits de bienvenue pour les profils déjà existants (optionnel)
update public.profiles set credits = 5 where credits is null;
