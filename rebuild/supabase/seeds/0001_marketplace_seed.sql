-- BlueStarBeats marketplace bootstrap seed
-- Idempotent: safe to run multiple times.
-- Requires at least one auth user.

do $$
declare
  seed_user uuid;
  focus_preset_id uuid;
  deep_sleep_program_id uuid;
  calm_reset_program_id uuid;
  waypoint_count int;
begin
  select id
  into seed_user
  from auth.users
  order by created_at asc
  limit 1;

  if seed_user is null then
    raise notice 'No auth users found. Create a user first, then rerun seed.';
    return;
  end if;

  -- Ensure profile/entitlements baseline exists for seeded creator.
  insert into public.user_profiles (user_id, display_name, plan_tier, founders_badge)
  values (seed_user, 'BlueLab', 'free', false)
  on conflict (user_id) do update
  set display_name = coalesce(public.user_profiles.display_name, excluded.display_name);

  insert into public.entitlements (
    user_id, ads_enabled, max_presets, max_programs, max_waypoints, can_import, can_publish, can_access_packs
  )
  values (seed_user, true, 3, 1, 3, false, false, false)
  on conflict (user_id) do nothing;

  -- Focus preset seed.
  select id into focus_preset_id
  from public.presets
  where user_id = seed_user and name = 'Focus Lock 40Hz'
  limit 1;

  if focus_preset_id is null then
    insert into public.presets (
      user_id, name, tags, mode, waveform, carrier_hz, entrainment_hz, volume
    )
    values (
      seed_user, 'Focus Lock 40Hz', array['focus','custom'], 'isochronic', 'square', 430, 18, 0.55
    )
    returning id into focus_preset_id;
  end if;

  -- Deep sleep program seed.
  select id into deep_sleep_program_id
  from public.programs
  where user_id = seed_user and name = 'Deep Sleep Ramp 25m'
  limit 1;

  if deep_sleep_program_id is null then
    insert into public.programs (user_id, name, goal_tag, is_public)
    values (seed_user, 'Deep Sleep Ramp 25m', 'sleep', true)
    returning id into deep_sleep_program_id;
  end if;

  select count(*) into waypoint_count
  from public.program_waypoints
  where program_id = deep_sleep_program_id;

  if waypoint_count = 0 then
    insert into public.program_waypoints (
      program_id, position, duration_minutes, mode, waveform, carrier_hz, entrainment_hz, volume, transition_type
    )
    values
      (deep_sleep_program_id, 1, 8, 'binaural', 'sine', 220, 6.0, 0.55, 'step'),
      (deep_sleep_program_id, 2, 10, 'binaural', 'triangle', 180, 3.5, 0.50, 'ramp'),
      (deep_sleep_program_id, 3, 7, 'binaural', 'triangle', 150, 2.2, 0.45, 'ramp');
  end if;

  -- Calm reset program seed.
  select id into calm_reset_program_id
  from public.programs
  where user_id = seed_user and name = 'Calm Reset 12m'
  limit 1;

  if calm_reset_program_id is null then
    insert into public.programs (user_id, name, goal_tag, is_public)
    values (seed_user, 'Calm Reset 12m', 'calm', true)
    returning id into calm_reset_program_id;
  end if;

  select count(*) into waypoint_count
  from public.program_waypoints
  where program_id = calm_reset_program_id;

  if waypoint_count = 0 then
    insert into public.program_waypoints (
      program_id, position, duration_minutes, mode, waveform, carrier_hz, entrainment_hz, volume, transition_type
    )
    values
      (calm_reset_program_id, 1, 4, 'binaural', 'triangle', 260, 10.5, 0.58, 'step'),
      (calm_reset_program_id, 2, 4, 'binaural', 'triangle', 240, 8.0, 0.54, 'ramp'),
      (calm_reset_program_id, 3, 4, 'binaural', 'sine', 220, 7.0, 0.50, 'ramp');
  end if;

  -- Marketplace listing seeds.
  insert into public.marketplace_listings (
    creator_user_id, listing_type, source_id, title, description, goal_tags, is_active, imports_count
  )
  select
    seed_user,
    'program',
    deep_sleep_program_id,
    'Deep Sleep Ramp 25m',
    'Sleep-focused staged downshift with smooth ramps.',
    array['sleep','calm'],
    true,
    98
  where not exists (
    select 1
    from public.marketplace_listings
    where creator_user_id = seed_user
      and listing_type = 'program'
      and title = 'Deep Sleep Ramp 25m'
  );

  insert into public.marketplace_listings (
    creator_user_id, listing_type, source_id, title, description, goal_tags, is_active, imports_count
  )
  select
    seed_user,
    'preset',
    focus_preset_id,
    'Focus Lock 40Hz',
    'High-energy pulse preset for work sprints.',
    array['focus','custom'],
    true,
    93
  where not exists (
    select 1
    from public.marketplace_listings
    where creator_user_id = seed_user
      and listing_type = 'preset'
      and title = 'Focus Lock 40Hz'
  );

  insert into public.marketplace_listings (
    creator_user_id, listing_type, source_id, title, description, goal_tags, is_active, imports_count
  )
  select
    seed_user,
    'program',
    calm_reset_program_id,
    'Calm Reset 12m',
    'Short decompression protocol for post-work transition.',
    array['calm','meditation'],
    true,
    90
  where not exists (
    select 1
    from public.marketplace_listings
    where creator_user_id = seed_user
      and listing_type = 'program'
      and title = 'Calm Reset 12m'
  );

  raise notice 'Marketplace seed complete for user %', seed_user;
end $$;
