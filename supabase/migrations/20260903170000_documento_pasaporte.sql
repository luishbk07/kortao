-- Allow pasaporte as document type (additive if 160000 already applied).

alter table public.usuarios_negocio
  drop constraint if exists usuarios_negocio_tipo_documento_check;

alter table public.usuarios_negocio
  add constraint usuarios_negocio_tipo_documento_check
  check (
    tipo_documento is null
    or tipo_documento in ('cedula', 'rnc', 'pasaporte')
  );

create or replace function public.registrar_empleado(
  codigo_param text,
  nombre_param text,
  tipo_documento_param text,
  numero_documento_param text,
  telefono_param text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invitacion record;
  v_codigo text := upper(trim(codigo_param));
  v_nombre text := nullif(trim(nombre_param), '');
  v_tipo text := lower(trim(tipo_documento_param));
  v_numero text;
  v_telefono text := nullif(trim(telefono_param), '');
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión primero';
  end if;

  if v_nombre is null or length(v_nombre) < 2 then
    raise exception 'El nombre es obligatorio';
  end if;

  if v_tipo is null or v_tipo not in ('cedula', 'rnc', 'pasaporte') then
    raise exception 'El tipo de documento debe ser cédula, RNC o pasaporte';
  end if;

  if v_tipo = 'pasaporte' then
    v_numero := upper(regexp_replace(coalesce(numero_documento_param, ''), '[^A-Za-z0-9]', '', 'g'));
  else
    v_numero := regexp_replace(coalesce(numero_documento_param, ''), '\D', '', 'g');
  end if;

  if v_tipo = 'cedula' and length(v_numero) <> 11 then
    raise exception 'La cédula debe tener 11 dígitos';
  end if;

  if v_tipo = 'rnc' and length(v_numero) not in (9, 11) then
    raise exception 'El RNC debe tener 9 u 11 dígitos';
  end if;

  if v_tipo = 'pasaporte' and (length(v_numero) < 6 or length(v_numero) > 20) then
    raise exception 'El pasaporte debe tener entre 6 y 20 caracteres';
  end if;

  if v_telefono is null then
    raise exception 'El teléfono es obligatorio';
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

  insert into public.usuarios_negocio (
    negocio_id,
    auth_user_id,
    rol,
    nombre,
    tipo_documento,
    numero_documento,
    telefono
  )
  values (
    invitacion.negocio_id,
    auth.uid(),
    'empleado',
    v_nombre,
    v_tipo,
    v_numero,
    v_telefono
  );

  update public.invitaciones_empleado
  set usado = true, usado_por = auth.uid(), usado_en = now()
  where id = invitacion.id;

  return invitacion.negocio_id;
end;
$$;

create or replace function public.registrar_negocio(
  nombre_param text,
  slug_param text,
  telefono_whatsapp_param text,
  direccion_param text default null,
  latitud_param double precision default null,
  longitud_param double precision default null,
  afiliado_id_param uuid default null,
  nombre_persona_param text default null,
  tipo_documento_param text default null,
  numero_documento_param text default null,
  telefono_persona_param text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_negocio_id uuid;
  v_nombre text := nullif(trim(nombre_persona_param), '');
  v_tipo text := lower(trim(coalesce(tipo_documento_param, '')));
  v_numero text;
  v_telefono text := nullif(trim(coalesce(telefono_persona_param, '')), '');
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

  if v_nombre is null or length(v_nombre) < 2 then
    raise exception 'El nombre del dueño es obligatorio';
  end if;

  if v_tipo is null or v_tipo not in ('cedula', 'rnc', 'pasaporte') then
    raise exception 'El tipo de documento debe ser cédula, RNC o pasaporte';
  end if;

  if v_tipo = 'pasaporte' then
    v_numero := upper(regexp_replace(coalesce(numero_documento_param, ''), '[^A-Za-z0-9]', '', 'g'));
  else
    v_numero := regexp_replace(coalesce(numero_documento_param, ''), '\D', '', 'g');
  end if;

  if v_tipo = 'cedula' and length(v_numero) <> 11 then
    raise exception 'La cédula debe tener 11 dígitos';
  end if;

  if v_tipo = 'rnc' and length(v_numero) not in (9, 11) then
    raise exception 'El RNC debe tener 9 u 11 dígitos';
  end if;

  if v_tipo = 'pasaporte' and (length(v_numero) < 6 or length(v_numero) > 20) then
    raise exception 'El pasaporte debe tener entre 6 y 20 caracteres';
  end if;

  if v_telefono is null then
    raise exception 'El teléfono del dueño es obligatorio';
  end if;

  insert into public.negocios (
    nombre,
    slug,
    telefono_whatsapp,
    direccion,
    latitud,
    longitud,
    afiliado_id
  )
  values (
    nombre_param,
    slug_param,
    telefono_whatsapp_param,
    nullif(trim(direccion_param), ''),
    latitud_param,
    longitud_param,
    afiliado_id_param
  )
  returning id into v_negocio_id;

  insert into public.usuarios_negocio (
    negocio_id,
    auth_user_id,
    rol,
    nombre,
    tipo_documento,
    numero_documento,
    telefono
  )
  values (
    v_negocio_id,
    v_user_id,
    'dueño',
    v_nombre,
    v_tipo,
    v_numero,
    v_telefono
  );

  return v_negocio_id;
end;
$$;
