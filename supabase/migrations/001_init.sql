-- No-Gi Lab — schema inicial (Auth + perfiles + vídeos + entregas)
-- Ejecutar en el SQL Editor de Supabase o con la CLI.

create extension if not exists "pgcrypto";

create type public.app_role as enum ('student', 'master');
create type public.submission_status as enum ('pending', 'approved', 'needs_improvement');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role public.app_role not null default 'student',
  created_at timestamptz not null default now()
);

create table public.technique_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  thumbnail_url text not null,
  video_url text not null,
  technique_id text,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index technique_videos_created_at_idx on public.technique_videos (created_at desc);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  technique_id text not null,
  technique_title text not null,
  video_url text not null,
  status public.submission_status not null default 'pending',
  master_comment text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index submissions_student_id_idx on public.submissions (student_id, created_at desc);
create index submissions_status_idx on public.submissions (status, created_at desc);

-- Perfil al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_role public.app_role := 'student';
  email_lower text := lower(new.email);
begin
  if email_lower like '%master%' or email_lower like '%maestro%' then
    chosen_role := 'master';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, chosen_role)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.technique_videos enable row level security;
alter table public.submissions enable row level security;

create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Profiles
create policy "profiles_select_own_or_master"
  on public.profiles for select
  using (auth.uid() = id or public.current_role() = 'master');

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Technique videos (galería oficial)
create policy "technique_videos_select_authenticated"
  on public.technique_videos for select
  to authenticated
  using (true);

create policy "technique_videos_insert_master"
  on public.technique_videos for insert
  to authenticated
  with check (public.current_role() = 'master');

create policy "technique_videos_update_master"
  on public.technique_videos for update
  to authenticated
  using (public.current_role() = 'master');

create policy "technique_videos_delete_master"
  on public.technique_videos for delete
  to authenticated
  using (public.current_role() = 'master');

-- Submissions
create policy "submissions_select_own_or_master"
  on public.submissions for select
  to authenticated
  using (student_id = auth.uid() or public.current_role() = 'master');

create policy "submissions_insert_student"
  on public.submissions for insert
  to authenticated
  with check (student_id = auth.uid() and public.current_role() = 'student');

create policy "submissions_update_master"
  on public.submissions for update
  to authenticated
  using (public.current_role() = 'master');

-- Storage buckets (crear también desde Dashboard si hace falta)
insert into storage.buckets (id, name, public)
values
  ('technique-videos', 'technique-videos', true),
  ('practice-videos', 'practice-videos', true)
on conflict (id) do nothing;

create policy "technique_videos_storage_read"
  on storage.objects for select
  to authenticated
  using (bucket_id in ('technique-videos', 'practice-videos'));

create policy "technique_videos_storage_insert_master"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'technique-videos'
    and public.current_role() = 'master'
  );

create policy "practice_videos_storage_insert_student"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'practice-videos'
    and public.current_role() = 'student'
  );
