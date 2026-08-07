-- Kortao MVP schema: negocios, servicios, horarios_negocio, citas, usuarios_negocio

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.negocios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null,
  telefono_whatsapp text not null,
  direccion text,
  color_acento text,
  creado_en timestamptz not null default now(),
  constraint negocios_slug_unique unique (slug)
);

create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  nombre text not null,
  duracion_minutos integer not null check (duracion_minutos > 0),
  precio numeric(10, 2) not null check (precio >= 0),
  activo boolean not null default true
);

create table public.horarios_negocio (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin time not null,
  constraint horarios_negocio_rango_valido check (hora_inicio < hora_fin)
);

create table public.citas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  servicio_id uuid not null references public.servicios (id) on delete restrict,
  cliente_nombre text not null,
  cliente_telefono text not null,
  fecha_hora timestamptz not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'confirmada', 'cancelada', 'completada')),
  creado_en timestamptz not null default now()
);

create table public.usuarios_negocio (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  rol text not null default 'owner'
    check (rol in ('owner', 'staff')),
  constraint usuarios_negocio_unique unique (negocio_id, auth_user_id)
);

-- ---------------------------------------------------------------------------
-- Indexes (frequent filters: negocio_id, fecha_hora, slug)
-- ---------------------------------------------------------------------------

create index negocios_slug_idx on public.negocios (slug);
create index servicios_negocio_id_idx on public.servicios (negocio_id);
create index horarios_negocio_negocio_id_idx on public.horarios_negocio (negocio_id);
create index citas_negocio_id_idx on public.citas (negocio_id);
create index citas_fecha_hora_idx on public.citas (fecha_hora);
create index citas_negocio_id_fecha_hora_idx on public.citas (negocio_id, fecha_hora);
create index usuarios_negocio_negocio_id_idx on public.usuarios_negocio (negocio_id);
create index usuarios_negocio_auth_user_id_idx on public.usuarios_negocio (auth_user_id);

-- ---------------------------------------------------------------------------
-- Helper: membership check (security definer avoids RLS recursion)
-- ---------------------------------------------------------------------------

create or replace function public.es_miembro_del_negocio(p_negocio_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios_negocio
    where negocio_id = p_negocio_id
      and auth_user_id = auth.uid()
  );
$$;

revoke all on function public.es_miembro_del_negocio(uuid) from public;
grant execute on function public.es_miembro_del_negocio(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.negocios enable row level security;
alter table public.servicios enable row level security;
alter table public.horarios_negocio enable row level security;
alter table public.citas enable row level security;
alter table public.usuarios_negocio enable row level security;

-- negocios: public can read (booking page by slug); members can manage own

create policy "negocios_select_public"
  on public.negocios
  for select
  to anon, authenticated
  using (true);

create policy "negocios_insert_authenticated"
  on public.negocios
  for insert
  to authenticated
  with check (true);

create policy "negocios_update_miembro"
  on public.negocios
  for update
  to authenticated
  using (public.es_miembro_del_negocio(id))
  with check (public.es_miembro_del_negocio(id));

create policy "negocios_delete_miembro"
  on public.negocios
  for delete
  to authenticated
  using (public.es_miembro_del_negocio(id));

-- servicios: public reads active ones (availability); members manage all

create policy "servicios_select_public_activos"
  on public.servicios
  for select
  to anon, authenticated
  using (
    activo = true
    or public.es_miembro_del_negocio(negocio_id)
  );

create policy "servicios_insert_miembro"
  on public.servicios
  for insert
  to authenticated
  with check (public.es_miembro_del_negocio(negocio_id));

create policy "servicios_update_miembro"
  on public.servicios
  for update
  to authenticated
  using (public.es_miembro_del_negocio(negocio_id))
  with check (public.es_miembro_del_negocio(negocio_id));

create policy "servicios_delete_miembro"
  on public.servicios
  for delete
  to authenticated
  using (public.es_miembro_del_negocio(negocio_id));

-- horarios_negocio: public read (open slots); members manage

create policy "horarios_negocio_select_public"
  on public.horarios_negocio
  for select
  to anon, authenticated
  using (true);

create policy "horarios_negocio_insert_miembro"
  on public.horarios_negocio
  for insert
  to authenticated
  with check (public.es_miembro_del_negocio(negocio_id));

create policy "horarios_negocio_update_miembro"
  on public.horarios_negocio
  for update
  to authenticated
  using (public.es_miembro_del_negocio(negocio_id))
  with check (public.es_miembro_del_negocio(negocio_id));

create policy "horarios_negocio_delete_miembro"
  on public.horarios_negocio
  for delete
  to authenticated
  using (public.es_miembro_del_negocio(negocio_id));

-- citas: members manage their rows; anon books via insert.
-- Public slot occupancy (no cliente PII) is exposed through citas_ocupacion.

create policy "citas_select_miembro"
  on public.citas
  for select
  to authenticated
  using (public.es_miembro_del_negocio(negocio_id));

create policy "citas_insert_public"
  on public.citas
  for insert
  to anon, authenticated
  with check (
    estado = 'pendiente'
    and exists (
      select 1
      from public.servicios s
      where s.id = servicio_id
        and s.negocio_id = negocio_id
        and s.activo = true
    )
  );

create policy "citas_update_miembro"
  on public.citas
  for update
  to authenticated
  using (public.es_miembro_del_negocio(negocio_id))
  with check (public.es_miembro_del_negocio(negocio_id));

create policy "citas_delete_miembro"
  on public.citas
  for delete
  to authenticated
  using (public.es_miembro_del_negocio(negocio_id));

create or replace view public.citas_ocupacion
with (security_invoker = false)
as
select
  c.id,
  c.negocio_id,
  c.servicio_id,
  c.fecha_hora,
  c.estado,
  s.duracion_minutos
from public.citas c
join public.servicios s on s.id = c.servicio_id
where c.estado <> 'cancelada';

revoke all on public.citas_ocupacion from public;
grant select on public.citas_ocupacion to anon, authenticated;

-- usuarios_negocio: users see their memberships; can link themselves to a negocio

create policy "usuarios_negocio_select_propia"
  on public.usuarios_negocio
  for select
  to authenticated
  using (
    auth_user_id = auth.uid()
    or public.es_miembro_del_negocio(negocio_id)
  );

create policy "usuarios_negocio_insert_propia"
  on public.usuarios_negocio
  for insert
  to authenticated
  with check (auth_user_id = auth.uid());

create policy "usuarios_negocio_update_miembro"
  on public.usuarios_negocio
  for update
  to authenticated
  using (public.es_miembro_del_negocio(negocio_id))
  with check (public.es_miembro_del_negocio(negocio_id));

create policy "usuarios_negocio_delete_miembro"
  on public.usuarios_negocio
  for delete
  to authenticated
  using (public.es_miembro_del_negocio(negocio_id));
