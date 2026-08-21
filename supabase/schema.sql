-- ============================================================
-- KitCreator — Script COMPLET (idempotent, peut être relancé)
-- À exécuter EN ENTIER dans le SQL Editor Supabase → Run
-- ============================================================

-- 1. Table profiles (5 crédits offerts à l'inscription)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  credits int default 5,
  is_pro boolean default false,
  updated_at timestamptz default timezone('utc'::text, now())
);

-- Ajoute les colonnes manquantes si la table existait déjà
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists credits int default 5;
alter table public.profiles add column if not exists is_pro boolean default false;
alter table public.profiles add column if not exists updated_at timestamptz default timezone('utc'::text, now());

alter table public.profiles enable row level security;

-- 2. Politiques de sécurité (supprimées puis recréées proprement)
drop policy if exists "Les utilisateurs peuvent lire leur propre profil." on public.profiles;
drop policy if exists "Les utilisateurs peuvent lire leur propre profil" on public.profiles;
create policy "Les utilisateurs peuvent lire leur propre profil"
  on public.profiles for select
  using ( auth.uid() = id );

drop policy if exists "Les utilisateurs peuvent creer leur propre profil." on public.profiles;
drop policy if exists "Création automatique du profil" on public.profiles;
create policy "Les utilisateurs peuvent creer leur propre profil"
  on public.profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Les utilisateurs peuvent mettre à jour leur propre profil" on public.profiles;
create policy "Les utilisateurs peuvent mettre à jour leur propre profil"
  on public.profiles for update
  using ( auth.uid() = id );

-- 3. Fonction RPC : décompte atomique des crédits (utilisée par l'app)
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

-- 4. Trigger : création automatique du profil à l'inscription
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

-- 5. Backfill : crée les profils manquants SANS réinitialiser
-- les crédits déjà consommés des comptes existants
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- 6. Compteur public de créateurs (sûr : ne renvoie que le total,
-- aucune donnée personnelle) — utilisé par le composant SocialProof
create or replace function public.profiles_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.profiles;
$$;

grant execute on function public.profiles_count() to anon, authenticated;
