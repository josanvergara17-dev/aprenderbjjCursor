-- No-Gi Lab — grafo de técnicas, rol admin, metadatos de vídeo

alter type public.app_role add value if not exists 'admin';

create table if not exists public.techniques (
  id text primary key,
  name text not null,
  description text not null default '',
  type text not null check (type in ('base_position', 'progression', 'defense', 'variation')),
  is_verified boolean not null default false,
  position_x numeric not null default 0,
  position_y numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.technique_connections (
  source_technique_id text not null references public.techniques (id) on delete cascade,
  target_technique_id text not null references public.techniques (id) on delete cascade,
  primary key (source_technique_id, target_technique_id)
);

alter table public.technique_videos
  add column if not exists is_published boolean not null default true,
  add column if not exists views_count integer not null default 0 check (views_count >= 0);

alter table public.techniques enable row level security;
alter table public.technique_connections enable row level security;

create policy "techniques_select_authenticated"
  on public.techniques for select
  to authenticated
  using (true);

create policy "technique_connections_select_authenticated"
  on public.technique_connections for select
  to authenticated
  using (true);

create or replace function public.is_reviewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('master', 'admin');
$$;

drop policy if exists "technique_videos_insert_master" on public.technique_videos;
create policy "technique_videos_insert_reviewer"
  on public.technique_videos for insert
  to authenticated
  with check (public.is_reviewer());

drop policy if exists "technique_videos_update_master" on public.technique_videos;
create policy "technique_videos_update_reviewer"
  on public.technique_videos for update
  to authenticated
  using (public.is_reviewer());

drop policy if exists "technique_videos_delete_master" on public.technique_videos;
create policy "technique_videos_delete_reviewer"
  on public.technique_videos for delete
  to authenticated
  using (public.is_reviewer());

drop policy if exists "submissions_update_master" on public.submissions;
create policy "submissions_update_reviewer"
  on public.submissions for update
  to authenticated
  using (public.is_reviewer());

drop policy if exists "technique_videos_storage_insert_master" on storage.objects;
create policy "technique_videos_storage_insert_reviewer"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'technique-videos'
    and public.is_reviewer()
  );

-- Seed del grafo demo (idempotente)
insert into public.techniques (id, name, type, is_verified, position_x, position_y)
values
  ('montada', 'Montada', 'base_position', true, 40, 0),
  ('guardia_cerrada', 'Guardia cerrada', 'base_position', true, 470, 0),
  ('media_guardia', 'Media guardia', 'base_position', true, 900, 0),
  ('americana', 'Americana', 'progression', false, 0, 220),
  ('escape_codo_rodilla', 'Escape codo-rodilla', 'defense', false, 160, 220),
  ('gancho_espalda', 'Gancho a la espalda', 'progression', false, 330, 220),
  ('armbar', 'Llave de brazo', 'progression', false, 390, 220),
  ('triangulo', 'Triángulo', 'progression', false, 550, 220),
  ('omoplata', 'Omoplata', 'progression', false, 710, 220),
  ('raspado_mariposa', 'Raspado de mariposa', 'progression', false, 820, 220),
  ('escudo_rodilla', 'Escudo de rodilla', 'defense', false, 990, 220),
  ('dogfight', 'Dogfight', 'progression', false, 1160, 220),
  ('transicion_espalda', 'Transición a espalda', 'progression', false, 0, 450),
  ('recuperar_media', 'Recuperar media guardia', 'defense', false, 170, 450),
  ('armbar_triangulo', 'Armbar desde triángulo', 'progression', false, 500, 450),
  ('paso_montada', 'Paso a montada', 'progression', false, 760, 450),
  ('control_tobillo', 'Control de tobillo', 'progression', false, 940, 450)
on conflict (id) do update set
  name = excluded.name,
  type = excluded.type,
  is_verified = excluded.is_verified,
  position_x = excluded.position_x,
  position_y = excluded.position_y;

insert into public.technique_connections (source_technique_id, target_technique_id)
values
  ('montada', 'americana'),
  ('montada', 'escape_codo_rodilla'),
  ('montada', 'gancho_espalda'),
  ('guardia_cerrada', 'armbar'),
  ('guardia_cerrada', 'triangulo'),
  ('guardia_cerrada', 'omoplata'),
  ('media_guardia', 'raspado_mariposa'),
  ('media_guardia', 'escudo_rodilla'),
  ('media_guardia', 'dogfight'),
  ('americana', 'transicion_espalda'),
  ('escape_codo_rodilla', 'recuperar_media'),
  ('triangulo', 'armbar_triangulo'),
  ('raspado_mariposa', 'paso_montada'),
  ('raspado_mariposa', 'control_tobillo')
on conflict do nothing;

create or replace view public.evaluations as
select
  id,
  student_id,
  technique_id,
  video_url,
  case
    when status = 'pending' then 'pending'
    when status = 'approved' then 'approved'
    else 'needs_improvement'
  end as status,
  master_comment as feedback_notes,
  reviewed_by as reviewer_id,
  created_at,
  reviewed_at
from public.submissions;
