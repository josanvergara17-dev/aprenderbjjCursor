-- Mux streaming, portadas del mapa y políticas admin

alter table public.technique_videos
  add column if not exists stream_kind text not null default 'storage'
    check (stream_kind in ('storage', 'mux')),
  add column if not exists mux_asset_id text,
  add column if not exists mux_playback_id text,
  add column if not exists mux_upload_id text,
  add column if not exists processing_status text not null default 'ready'
    check (processing_status in ('pending_upload', 'processing', 'ready', 'error'));

alter table public.techniques
  add column if not exists cover_image_url text;

insert into storage.buckets (id, name, public)
values ('technique-covers', 'technique-covers', true)
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'admin';
$$;

create policy "techniques_insert_admin"
  on public.techniques for insert
  to authenticated
  with check (public.is_admin());

create policy "techniques_update_admin"
  on public.techniques for update
  to authenticated
  using (public.is_admin());

create policy "techniques_delete_admin"
  on public.techniques for delete
  to authenticated
  using (public.is_admin());

create policy "technique_connections_insert_admin"
  on public.technique_connections for insert
  to authenticated
  with check (public.is_admin());

create policy "technique_connections_delete_admin"
  on public.technique_connections for delete
  to authenticated
  using (public.is_admin());

create policy "technique_covers_storage_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'technique-covers');

create policy "technique_covers_storage_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'technique-covers' and public.is_admin());

create policy "technique_covers_storage_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'technique-covers' and public.is_admin());

create policy "technique_covers_storage_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'technique-covers' and public.is_admin());
