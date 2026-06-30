create extension if not exists pgcrypto;

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birth_input jsonb not null,
  bazi_chart jsonb not null,
  profile jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bonds (
  id uuid primary key default gen_random_uuid(),
  character_a_id uuid not null references public.characters(id) on delete cascade,
  character_b_id uuid not null references public.characters(id) on delete cascade,
  bond jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists characters_updated_at_idx on public.characters(updated_at desc);
create index if not exists bonds_character_pair_idx on public.bonds(character_a_id, character_b_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_characters_updated_at on public.characters;
create trigger set_characters_updated_at
before update on public.characters
for each row execute function public.set_updated_at();

drop trigger if exists set_bonds_updated_at on public.bonds;
create trigger set_bonds_updated_at
before update on public.bonds
for each row execute function public.set_updated_at();
