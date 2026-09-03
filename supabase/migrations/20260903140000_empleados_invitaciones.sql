-- Aligns with the SQL applied on Supabase for plan restructure + employee invites.
-- (App code targets this schema: usado boolean, no listar_empleados_negocio RPC.)

-- 1. Plans: old 'premium' (single-user paid) → 'personal'
update public.negocios set plan = 'personal' where plan = 'premium';

alter table public.negocios drop constraint if exists negocios_plan_check;
alter table public.negocios add constraint negocios_plan_check
  check (plan in ('estandar', 'personal', 'premium', 'max'));

-- 2. Employee invitations
create table if not exists public.invitaciones_empleado (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  codigo text not null unique,
  usado boolean not null default false,
  usado_por uuid references auth.users (id),
  creado_en timestamptz not null default now(),
  usado_en timestamptz
);

create index if not exists idx_invitaciones_empleado_negocio_id
  on public.invitaciones_empleado (negocio_id);

alter table public.invitaciones_empleado enable row level security;

-- Requires es_dueño_del_negocio(uuid) already present in the database.
drop policy if exists "invitaciones_dueno_todo" on public.invitaciones_empleado;
create policy "invitaciones_dueno_todo"
  on public.invitaciones_empleado for all
  to authenticated
  using (public.es_dueño_del_negocio(negocio_id))
  with check (public.es_dueño_del_negocio(negocio_id));

-- 3. Dueño can remove employees
drop policy if exists "usuarios_negocio_dueno_delete" on public.usuarios_negocio;
create policy "usuarios_negocio_dueno_delete"
  on public.usuarios_negocio for delete
  to authenticated
  using (
    rol = 'empleado'
    and public.es_dueño_del_negocio(negocio_id)
  );

-- 4. Redeem invitation code
create or replace function public.registrar_empleado(codigo_param text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invitacion record;
  v_codigo text := upper(trim(codigo_param));
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión primero';
  end if;

  if exists (
    select 1 from public.usuarios_negocio where auth_user_id = auth.uid()
  ) then
    raise exception 'Este usuario ya está vinculado a un negocio';
  end if;

  select * into invitacion
  from public.invitaciones_empleado
  where upper(codigo) = v_codigo and usado = false
  limit 1;

  if invitacion is null then
    raise exception 'Código de invitación inválido o ya utilizado';
  end if;

  insert into public.usuarios_negocio (negocio_id, auth_user_id, rol)
  values (invitacion.negocio_id, auth.uid(), 'empleado');

  update public.invitaciones_empleado
  set usado = true, usado_por = auth.uid(), usado_en = now()
  where id = invitacion.id;

  return invitacion.negocio_id;
end;
$$;

grant execute on function public.registrar_empleado(text) to authenticated;
