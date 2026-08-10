-- Adds optional map coordinates to negocios and extends registrar_negocio.

alter table public.negocios
  add column if not exists latitud double precision,
  add column if not exists longitud double precision;

drop function if exists public.registrar_negocio(text, text, text, text);

create or replace function public.registrar_negocio(
  nombre_param text,
  slug_param text,
  telefono_whatsapp_param text,
  direccion_param text default null,
  latitud_param double precision default null,
  longitud_param double precision default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_negocio_id uuid;
begin
  if v_user_id is null then
    raise exception 'No autenticado';
  end if;

  if exists (
    select 1
    from public.usuarios_negocio
    where auth_user_id = v_user_id
  ) then
    raise exception 'El usuario ya tiene un negocio';
  end if;

  insert into public.negocios (
    nombre,
    slug,
    telefono_whatsapp,
    direccion,
    latitud,
    longitud
  )
  values (
    nombre_param,
    slug_param,
    telefono_whatsapp_param,
    nullif(trim(direccion_param), ''),
    latitud_param,
    longitud_param
  )
  returning id into v_negocio_id;

  insert into public.usuarios_negocio (
    negocio_id,
    auth_user_id,
    rol
  )
  values (
    v_negocio_id,
    v_user_id,
    'owner'
  );

  return v_negocio_id;
end;
$$;

revoke all on function public.registrar_negocio(
  text,
  text,
  text,
  text,
  double precision,
  double precision
) from public;

grant execute on function public.registrar_negocio(
  text,
  text,
  text,
  text,
  double precision,
  double precision
) to authenticated;
