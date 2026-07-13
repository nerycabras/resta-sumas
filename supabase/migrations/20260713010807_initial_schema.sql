-- Esquema inicial de "Zorro Aventurero" (F1).
-- Modelo de datos del ANALISIS.md §8 con RLS por adulto (§7 RNF-07).
--
-- El "adulto" es el usuario de Supabase Auth (auth.users): no duplicamos una
-- tabla adult; cada fila se ata a su dueño mediante adult_id = auth.uid().

-- ---------------------------------------------------------------------------
-- Catálogo de bloques (referencia pública, solo lectura)
-- ---------------------------------------------------------------------------
create table public.block (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  order_index int not null unique
);

insert into public.block (code, title, order_index) values
  ('valor-posicional', 'Valor posicional', 1),
  ('suma-acarreo',     'Suma con acarreo', 2),
  ('resta-acarreo',    'Resta con acarreo', 3),
  ('consolidacion',    'Mezcla y retos', 4),
  ('evaluacion',       'Prueba final', 5);

-- ---------------------------------------------------------------------------
-- Perfiles de niño (pertenecen a un adulto)
-- ---------------------------------------------------------------------------
create table public.child (
  id uuid primary key default gen_random_uuid(),
  adult_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  avatar text not null default 'fox',
  birth_year int,
  created_at timestamptz not null default now()
);
create index child_adult_id_idx on public.child (adult_id);

-- Config pedagógica (ExerciseConfig) por niño
create table public.settings (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child (id) on delete cascade,
  config_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (child_id)
);

-- Avance por bloque
create table public.child_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child (id) on delete cascade,
  block_id uuid not null references public.block (id) on delete cascade,
  status text not null default 'locked'
    check (status in ('locked', 'unlocked', 'in_progress', 'mastered')),
  accuracy numeric(5, 2) not null default 0,
  sessions_done int not null default 0,
  mastered_at timestamptz,
  unique (child_id, block_id)
);

-- Sesiones de juego
create table public.session (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child (id) on delete cascade,
  block_id uuid references public.block (id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  mode text not null default 'independent'
    check (mode in ('guided', 'independent')),
  gems_earned int not null default 0
);
create index session_child_id_idx on public.session (child_id);

-- Intentos (append-only, para sync offline sin conflictos — §13)
create table public.attempt (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.session (id) on delete cascade,
  exercise_json jsonb not null,
  given_answer jsonb,
  is_correct boolean not null,
  error_type text,
  ms_taken int,
  created_at timestamptz not null default now()
);
create index attempt_session_id_idx on public.attempt (session_id);

-- Recompensas (una fila por niño; "última escritura gana" — §13)
create table public.reward (
  child_id uuid primary key references public.child (id) on delete cascade,
  gems_total int not null default 0,
  streak_days int not null default 0,
  last_played_on date,
  updated_at timestamptz not null default now()
);

-- Logros
create table public.achievement (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child (id) on delete cascade,
  code text not null,
  earned_at timestamptz not null default now(),
  unique (child_id, code)
);

-- ---------------------------------------------------------------------------
-- Helpers de propiedad (SECURITY DEFINER para evaluar sin recursión de RLS)
-- ---------------------------------------------------------------------------
create or replace function public.owns_child(cid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.child c
    where c.id = cid and c.adult_id = auth.uid()
  );
$$;

create or replace function public.owns_session(sid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.session s
    join public.child c on c.id = s.child_id
    where s.id = sid and c.adult_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.block          enable row level security;
alter table public.child          enable row level security;
alter table public.settings       enable row level security;
alter table public.child_progress enable row level security;
alter table public.session        enable row level security;
alter table public.attempt        enable row level security;
alter table public.reward         enable row level security;
alter table public.achievement    enable row level security;

-- block: lectura pública
create policy "block: lectura publica" on public.block
  for select using (true);

-- child: el adulto solo ve/gestiona sus niños
create policy "child: propios select" on public.child
  for select using (adult_id = auth.uid());
create policy "child: propios insert" on public.child
  for insert with check (adult_id = auth.uid());
create policy "child: propios update" on public.child
  for update using (adult_id = auth.uid()) with check (adult_id = auth.uid());
create policy "child: propios delete" on public.child
  for delete using (adult_id = auth.uid());

-- settings / child_progress / session / reward / achievement: vía owns_child
create policy "settings: propios" on public.settings
  for all using (public.owns_child(child_id)) with check (public.owns_child(child_id));
create policy "child_progress: propios" on public.child_progress
  for all using (public.owns_child(child_id)) with check (public.owns_child(child_id));
create policy "session: propios" on public.session
  for all using (public.owns_child(child_id)) with check (public.owns_child(child_id));
create policy "reward: propios" on public.reward
  for all using (public.owns_child(child_id)) with check (public.owns_child(child_id));
create policy "achievement: propios" on public.achievement
  for all using (public.owns_child(child_id)) with check (public.owns_child(child_id));

-- attempt: vía owns_session
create policy "attempt: propios" on public.attempt
  for all using (public.owns_session(session_id)) with check (public.owns_session(session_id));

-- ---------------------------------------------------------------------------
-- Permisos para la Data API (RLS sigue restringiendo las filas)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.block to anon, authenticated;
grant select, insert, update, delete on
  public.child, public.settings, public.child_progress,
  public.session, public.attempt, public.reward, public.achievement
  to authenticated;
