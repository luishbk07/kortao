-- Support incident reports from negocios.
-- Requires public.es_administrador_kortao() for admin policies.

create table public.reportes_soporte (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  mensaje text not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'resuelto')),
  creado_en timestamptz not null default now(),
  constraint reportes_soporte_mensaje_no_vacio check (char_length(trim(mensaje)) > 0)
);

create index reportes_soporte_negocio_id_creado_en_idx
  on public.reportes_soporte (negocio_id, creado_en desc);

create index reportes_soporte_estado_creado_en_idx
  on public.reportes_soporte (estado, creado_en desc);

alter table public.reportes_soporte enable row level security;

create policy "reportes_soporte_select_miembro"
  on public.reportes_soporte
  for select
  to authenticated
  using (public.es_miembro_del_negocio(negocio_id));

create policy "reportes_soporte_insert_miembro"
  on public.reportes_soporte
  for insert
  to authenticated
  with check (public.es_miembro_del_negocio(negocio_id));

create policy "reportes_soporte_select_admin"
  on public.reportes_soporte
  for select
  to authenticated
  using (public.es_administrador_kortao());

create policy "reportes_soporte_update_admin"
  on public.reportes_soporte
  for update
  to authenticated
  using (public.es_administrador_kortao())
  with check (public.es_administrador_kortao());
