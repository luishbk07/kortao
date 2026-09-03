const CLAVE_CODIGO_INVITACION_PENDIENTE = 'kortao_codigo_invitacion'

export const guardarCodigoInvitacionPendiente = (codigo: string): void => {
  const normalizado = codigo.trim().toUpperCase()
  if (!normalizado) {
    return
  }

  try {
    window.localStorage.setItem(CLAVE_CODIGO_INVITACION_PENDIENTE, normalizado)
  } catch {
    // Ignore storage errors (private mode, etc.).
  }
}

export const leerCodigoInvitacionPendiente = (): string | null => {
  try {
    const valor = window.localStorage.getItem(CLAVE_CODIGO_INVITACION_PENDIENTE)
    return valor && valor.trim().length > 0 ? valor.trim().toUpperCase() : null
  } catch {
    return null
  }
}

export const limpiarCodigoInvitacionPendiente = (): void => {
  try {
    window.localStorage.removeItem(CLAVE_CODIGO_INVITACION_PENDIENTE)
  } catch {
    // Ignore storage errors.
  }
}
