create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  plan_tier text not null default 'free',
  founders_badge boolean not null default false,
  trial_end_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ads_enabled boolean not null default true,
  max_presets int not null default 3,
  max_programs int not null default 1,
  max_waypoints int not null default 3,
  can_import boolean not null default false,
  can_publish boolean not null default false,
  can_access_packs boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  tags text[] not null default '{}',
  mode text not null,
  waveform text not null,
  carrier_hz numeric(10,3) not null,
  entrainment_hz numeric(10,3) not null,
  volume numeric(4,3) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal_tag text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.program_waypoints (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  position int not null,
  duration_minutes int not null,
  mode text not null,
  waveform text not null,
  carrier_hz numeric(10,3) not null,
  entrainment_hz numeric(10,3) not null,
  volume numeric(4,3) not null,
  transition_type text not null default 'step',
  created_at timestamptz not null default now(),
  unique(program_id, position)
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  listing_type text not null check (listing_type in ('preset', 'program')),
  source_id uuid not null,
  title text not null,
  description text,
  goal_tags text[] not null default '{}',
  is_active boolean not null default true,
  imports_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'presets_mode_check') then
    alter table public.presets
      add constraint presets_mode_check check (mode in ('binaural', 'isochronic'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'presets_waveform_check') then
    alter table public.presets
      add constraint presets_waveform_check check (waveform in ('sine', 'triangle', 'square', 'sawtooth'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'waypoints_mode_check') then
    alter table public.program_waypoints
      add constraint waypoints_mode_check check (mode in ('binaural', 'isochronic'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'waypoints_waveform_check') then
    alter table public.program_waypoints
      add constraint waypoints_waveform_check check (waveform in ('sine', 'triangle', 'square', 'sawtooth'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'waypoints_transition_check') then
    alter table public.program_waypoints
      add constraint waypoints_transition_check check (transition_type in ('step', 'ramp'));
  end if;
end $$;

create index if not exists idx_presets_user_created
  on public.presets(user_id, created_at desc);
create index if not exists idx_programs_user_created
  on public.programs(user_id, created_at desc);
create index if not exists idx_program_waypoints_program_position
  on public.program_waypoints(program_id, position);
create index if not exists idx_marketplace_active_trending
  on public.marketplace_listings(is_active, imports_count desc, created_at desc);
create index if not exists idx_marketplace_goal_tags
  on public.marketplace_listings using gin(goal_tags);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, display_name, plan_tier, founders_badge)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 'free', false)
  on conflict (user_id) do nothing;

  insert into public.entitlements (
    user_id, ads_enabled, max_presets, max_programs, max_waypoints, can_import, can_publish, can_access_packs
  )
  values (new.id, true, 3, 1, 3, false, false, false)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists user_profiles_updated_at on public.user_profiles;
create trigger user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists presets_updated_at on public.presets;
create trigger presets_updated_at
before update on public.presets
for each row execute function public.set_updated_at();

drop trigger if exists programs_updated_at on public.programs;
create trigger programs_updated_at
before update on public.programs
for each row execute function public.set_updated_at();

drop trigger if exists marketplace_updated_at on public.marketplace_listings;
create trigger marketplace_updated_at
before update on public.marketplace_listings
for each row execute function public.set_updated_at();

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  purchase_type text not null,
  product_code text,
  amount_cents int,
  currency text default 'usd',
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid references auth.users(id) on delete set null,
  referral_code text not null,
  conversion_purchase_id uuid references public.purchases(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_purchases_user_created
  on public.purchases(user_id, created_at desc);
create index if not exists idx_purchases_customer_id
  on public.purchases(stripe_customer_id);
create index if not exists idx_referrals_referrer
  on public.referrals(referrer_user_id);

alter table public.user_profiles enable row level security;
alter table public.entitlements enable row level security;
alter table public.presets enable row level security;
alter table public.programs enable row level security;
alter table public.program_waypoints enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.purchases enable row level security;
alter table public.referrals enable row level security;

drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own" on public.user_profiles
for select using (auth.uid() = user_id);

drop policy if exists "profiles_upsert_own" on public.user_profiles;
create policy "profiles_upsert_own" on public.user_profiles
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own" on public.entitlements
for select using (auth.uid() = user_id);

drop policy if exists "presets_own" on public.presets;
create policy "presets_own" on public.presets
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "programs_own_or_public" on public.programs;
create policy "programs_own_or_public" on public.programs
for select using (auth.uid() = user_id or is_public = true);

drop policy if exists "programs_own_mutation" on public.programs;
create policy "programs_own_mutation" on public.programs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "waypoints_own_or_public" on public.program_waypoints;
create policy "waypoints_own_or_public" on public.program_waypoints
for select using (
  exists (
    select 1 from public.programs p
    where p.id = program_waypoints.program_id
      and (p.user_id = auth.uid() or p.is_public = true)
  )
);

drop policy if exists "waypoints_mutation_own" on public.program_waypoints;
create policy "waypoints_mutation_own" on public.program_waypoints
for all using (
  exists (
    select 1 from public.programs p
    where p.id = program_waypoints.program_id
      and p.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.programs p
    where p.id = program_waypoints.program_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "marketplace_public_read" on public.marketplace_listings;
create policy "marketplace_public_read" on public.marketplace_listings
for select using (is_active = true);

drop policy if exists "marketplace_creator_mutation" on public.marketplace_listings;
create policy "marketplace_creator_mutation" on public.marketplace_listings
for all using (auth.uid() = creator_user_id) with check (auth.uid() = creator_user_id);

drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own" on public.purchases
for select using (auth.uid() = user_id);

drop policy if exists "referrals_select_own" on public.referrals;
create policy "referrals_select_own" on public.referrals
for select using (auth.uid() = referrer_user_id or auth.uid() = referred_user_id);
