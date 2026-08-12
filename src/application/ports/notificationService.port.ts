export type EnviarConfirmacionInput = {
  id: string
  clienteTelefono: string
  clienteNombre: string
  negocioNombre: string
  fechaHora: Date
}

export type EnviarCancelacionInput = {
  clienteTelefono: string
  clienteNombre: string
  negocioNombre: string
  negocioSlug: string
  fechaHora: Date
}

export type NotificationService = {
  enviarConfirmacion: (input: EnviarConfirmacionInput) => Promise<void>
  enviarRecordatorio: (input: EnviarConfirmacionInput) => Promise<void>
  enviarCancelacion: (input: EnviarCancelacionInput) => Promise<void>
}
