export type EmpleadoNegocio = {
  id: string
  authUserId: string
  correo: string | null
}

export type InvitacionEmpleado = {
  id: string
  codigo: string
  creadoEn: Date
}

export type EmpleadosRepository = {
  listarEmpleados: (negocioId: string) => Promise<EmpleadoNegocio[]>
  quitarEmpleado: (negocioId: string, membresiaId: string) => Promise<void>
  listarInvitacionesPendientes: (
    negocioId: string
  ) => Promise<InvitacionEmpleado[]>
  crearInvitacion: (
    negocioId: string,
    creadoPor: string,
    codigo: string
  ) => Promise<InvitacionEmpleado>
  revocarInvitacion: (negocioId: string, invitacionId: string) => Promise<void>
  registrarConCodigo: (codigo: string) => Promise<string>
}
