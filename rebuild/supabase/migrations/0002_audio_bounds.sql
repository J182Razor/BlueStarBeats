do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'presets_carrier_hz_range_check') then
    alter table public.presets
      add constraint presets_carrier_hz_range_check check (carrier_hz >= 20 and carrier_hz <= 20000) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'presets_entrainment_hz_range_check') then
    alter table public.presets
      add constraint presets_entrainment_hz_range_check check (entrainment_hz >= 0.1 and entrainment_hz <= 40) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'presets_volume_range_check') then
    alter table public.presets
      add constraint presets_volume_range_check check (volume >= 0.01 and volume <= 1) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'waypoints_carrier_hz_range_check') then
    alter table public.program_waypoints
      add constraint waypoints_carrier_hz_range_check check (carrier_hz >= 20 and carrier_hz <= 20000) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'waypoints_entrainment_hz_range_check') then
    alter table public.program_waypoints
      add constraint waypoints_entrainment_hz_range_check check (entrainment_hz >= 0.1 and entrainment_hz <= 40) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'waypoints_volume_range_check') then
    alter table public.program_waypoints
      add constraint waypoints_volume_range_check check (volume >= 0.01 and volume <= 1) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'waypoints_duration_minutes_check') then
    alter table public.program_waypoints
      add constraint waypoints_duration_minutes_check check (duration_minutes >= 1 and duration_minutes <= 720) not valid;
  end if;
end $$;
