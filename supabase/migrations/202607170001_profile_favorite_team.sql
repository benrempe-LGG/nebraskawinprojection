-- Store each user's preferred team for personalized schedule defaults.
alter table public.profiles
add column if not exists favorite_team text;

comment on column public.profiles.favorite_team is
  'Display name of the team whose schedule opens by default for this user.';
