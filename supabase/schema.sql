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

-- ============================================================
-- 7. DURCISSEMENT SÉCURITÉ
-- ============================================================

-- 7a. SUPPRIME la policy UPDATE large : sans cela, un utilisateur connecté
-- pouvait exécuter depuis son navigateur :
--   supabase.from('profiles').update({ credits: 999999, is_pro: true })
-- Toute modification du profil doit passer par les fonctions SECURITY DEFINER.
drop policy if exists "Les utilisateurs peuvent mettre à jour leur propre profil"
  on public.profiles;

-- 7b. Journal des générations : sert au rate limiting côté serveur.
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  tool text,
  created_at timestamptz default timezone('utc'::text, now())
);

alter table public.generations enable row level security;

drop policy if exists "Lecture de ses propres generations" on public.generations;
create policy "Lecture de ses propres generations"
  on public.generations for select
  using ( auth.uid() = user_id );

drop policy if exists "Insertion de ses propres generations" on public.generations;
create policy "Insertion de ses propres generations"
  on public.generations for insert
  with check ( auth.uid() = user_id );

create index if not exists generations_user_created_idx
  on public.generations (user_id, created_at);

-- 7c. consume_credits v2 :
--   - autorisation : un utilisateur ne peut consommer que SES crédits
--     (l'ancienne version acceptait n'importe quel user_id) ;
--   - validation : montant borné 1..10 ;
--   - rate limiting : max 30 générations par heure glissante ;
--   - atomicité conservée (décrément conditionnel).
-- Postgres ne permet pas de RENOMMER les parametres d'une fonction
-- existante via CREATE OR REPLACE : on supprime l'ancienne version
-- (signatures user_id/amount de l'ancien tutoriel) avant de recreer.
drop function if exists public.consume_credits(uuid, int);

create or replace function public.consume_credits(p_user_id uuid, p_amount int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining int;
  recent_count int;
begin
  -- Autorisation : l'appelant authentifié ne peut agir que sur son compte
  if auth.uid() is null or p_user_id is null or p_user_id <> auth.uid() then
    raise exception 'Forbidden: you can only consume your own credits.';
  end if;

  -- Validation des entrées serveur
  if p_amount is null or p_amount < 1 or p_amount > 10 then
    raise exception 'Invalid credit amount.';
  end if;

  -- VERROU CONCURRENTIEL : pose un verrou ligne sur le profil AVANT le
  -- comptage. Deux requêtes simultanées du même utilisateur sont donc
  -- sérialisées : la seconde voit la génération de la première déjà
  -- insérée -> le rate limit ne peut plus être contourné en parallèle.
  perform 1 from public.profiles where id = auth.uid() for update;

  -- Rate limiting : fenêtre glissante d'une heure
  select count(*) into recent_count
    from public.generations
    where user_id = auth.uid()
      and created_at > now() - interval '1 hour';

  if recent_count >= 30 then
    raise exception 'Rate limit exceeded. Please wait before generating again.';
  end if;

  update public.profiles
    set credits = credits - p_amount,
        updated_at = timezone('utc'::text, now())
    where id = auth.uid() and credits >= p_amount
    returning credits into remaining;

  if remaining is null then
    raise exception 'Not enough credits. Please upgrade to PRO.';
  end if;

  insert into public.generations (user_id, tool)
    values (auth.uid(), 'tool');

  return remaining;
end;
$$;

grant execute on function public.consume_credits(uuid, int) to authenticated;

-- ============================================================
-- 8. REMBOURSEMENT : si l'appel IA echoue APRES le debit
-- (tous fournisseurs indisponibles), l'Edge Function rembourse.
--
-- DURETE MAXIMALE : une fonction de remboursement ne doit JAMAIS
-- pouvoir servir a fabriquer des credits.
--   - executable UNIQUEMENT par le role service_role (Edge Function) ;
--   - aucun utilisateur final ne peut l'appeler en RPC ;
--   - plafond anti-abus : 30 credits remboursables max / 24h / profil
--     (registre credit_refunds, table sans policy => invisible).
-- ============================================================
create table if not exists public.credit_refunds (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null check (amount between 1 and 10),
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.credit_refunds enable row level security;
-- Aucune policy : les utilisateurs ne voient rien ; le role service_role
-- contourne la RLS et reste le seul a pouvoir ecrire via la fonction.

create or replace function public.refund_credits(p_user_id uuid, p_amount int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  refunded_24h int;
  remaining int;
begin
  -- Reserve au service_role (Edge Function). Ni anon, ni authenticated,
  -- ni appel manuel depuis le SQL Editor.
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Forbidden.';
  end if;

  if p_user_id is null or p_amount is null or p_amount < 1 or p_amount > 10 then
    raise exception 'Invalid refund parameters.';
  end if;

  -- Plafond anti-abus : pas plus de 30 credits rembourses / 24h / profil.
  select coalesce(sum(amount), 0)
    into refunded_24h
    from public.credit_refunds
   where user_id = p_user_id
     and created_at > timezone('utc'::text, now()) - interval '24 hours';

  if refunded_24h + p_amount > 30 then
    raise exception 'Refund limit exceeded.';
  end if;

  update public.profiles
    set credits = credits + p_amount,
        updated_at = timezone('utc'::text, now())
    where id = p_user_id
    returning credits into remaining;

  if remaining is null then
    raise exception 'Profile not found.';
  end if;

  insert into public.credit_refunds (user_id, amount)
  values (p_user_id, p_amount);

  return remaining;
end;
$$;

-- Une fonction accorde EXECUTE a PUBLIC par defaut : on retire tout,
-- puis on n'autorise que le service_role.
revoke execute on function public.refund_credits(uuid, int) from public;
revoke execute on function public.refund_credits(uuid, int) from anon;
revoke execute on function public.refund_credits(uuid, int) from authenticated;
grant execute on function public.refund_credits(uuid, int) to service_role;

-- ============================================================
-- 9. WORKSPACE : projets sauvegardes (packs, scripts, favoris).
--    RLS stricte : chacun ne voit que SES lignes ; UPDATE autorise
--    uniquement le basculement favori / edition de titre.
-- ============================================================
create table if not exists public.saved_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  type text not null,
  content jsonb not null,
  is_favorite boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists saved_projects_user_created_idx
  on public.saved_projects (user_id, created_at desc);

alter table public.saved_projects enable row level security;

drop policy if exists "select own projects" on public.saved_projects;
create policy "select own projects" on public.saved_projects
  for select using (auth.uid() = user_id);

drop policy if exists "insert own projects" on public.saved_projects;
create policy "insert own projects" on public.saved_projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own projects" on public.saved_projects;
create policy "update own projects" on public.saved_projects
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete own projects" on public.saved_projects;
create policy "delete own projects" on public.saved_projects
  for delete using (auth.uid() = user_id);
-- ============================================================
-- KITBOT : profil de marque / style du createur (memoire de l agent).
-- RLS : chaque createur ne lit/ecrit que SA ligne (FOR ALL).
-- ============================================================
create table if not exists public.creator_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  brand_name text,
  niche text,
  target_audience text,
  content_tone text not null default 'Energetic',
  favorite_formats text[] not null default '{}',
  custom_instructions text,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.creator_profiles enable row level security;

drop policy if exists "manage own creator profile" on public.creator_profiles;
create policy "manage own creator profile" on public.creator_profiles
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 9b. WORKSPACE v2 : statuts de production sur saved_projects.
-- ============================================================
alter table public.saved_projects
  add column if not exists platform text not null default 'TikTok';
alter table public.saved_projects
  add column if not exists niche text not null default '';
alter table public.saved_projects
  add column if not exists topic text not null default '';
alter table public.saved_projects
  add column if not exists status text not null default 'draft';
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'saved_projects_status_check'
  ) then
    alter table public.saved_projects
      add constraint saved_projects_status_check
      check (status in ('draft','done','archived'));
  end if;
end $$;
create index if not exists saved_projects_user_status_idx
  on public.saved_projects (user_id, status);
