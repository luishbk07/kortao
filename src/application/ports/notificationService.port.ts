export type EnviarConfirmacionInput = {
  id: string
  clienteTelefono: string
  clienteNombre: string
  clienteCorreo: string | null
  negocioNombre: string
  negocioDireccion: string | null
  negocioLogoUrl: string | null
  servicioNombre: string
  fechaHora: Date
  duracionMinutos: number
}

export type EnviarCancelacionInput = {
  clienteTelefono: string
  clienteNombre: string
  clienteCorreo: string | null
  negocioNombre: string
  negocioSlug: string
  negocioLogoUrl: string | null
  fechaHora: Date
}

export type NotificationService = {
  enviarConfirmacion: (input: EnviarConfirmacionInput) => Promise<void>
  enviarRecordatorio: (input: EnviarConfirmacionInput) => Promise<void>
  enviarCancelacion: (input: EnviarCancelacionInput) => Promise<void>
}
