import type {
  DatosIdentidadUsuario,
  TipoDocumentoUsuario
} from '@/domain/business/identidadUsuario.types'

export type EmpleadoNegocio = {
  id: string
  authUserId: string
  correo: string | null
  nombre: string | null
  tipoDocumento: TipoDocumentoUsuario | null
  numeroDocumento: string | null
  telefono: string | null
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
  registrarConCodigo: (
    codigo: string,
    identidad: DatosIdentidadUsuario
  ) => Promise<string>
}
