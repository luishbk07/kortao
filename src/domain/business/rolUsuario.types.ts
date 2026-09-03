export type RolUsuarioNegocio = 'dueño' | 'empleado'

export const normalizarRolUsuarioNegocio = (
  rol: string | null | undefined
): RolUsuarioNegocio => {
  if (rol === 'empleado' || rol === 'staff') {
    return 'empleado'
  }

  return 'dueño'
}

export const esRolDueño = (rol: RolUsuarioNegocio): boolean => {
  return rol === 'dueño'
}
