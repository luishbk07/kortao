-- Dueño-only employee list with email from auth.users.

create or replace function public.listar_empleados_negocio(p_negocio_id uuid)
returns table (
  id uuid,
  auth_user_id uuid,
  correo text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_dueño_del_negocio(p_negocio_id) then
    raise exception 'No autorizado';
  end if;

  return query
  select
    un.id,
    un.auth_user_id,
    u.email::text as correo
  from public.usuarios_negocio un
  join auth.users u on u.id = un.auth_user_id
  where un.negocio_id = p_negocio_id
    and un.rol = 'empleado'
  order by u.email nulls last, un.id;
end;
$$;

revoke all on function public.listar_empleados_negocio(uuid) from public;
grant execute on function public.listar_empleados_negocio(uuid) to authenticated;
