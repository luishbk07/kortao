import type {
  CitaPanel,
  HorarioDiaInput,
  HorarioNegocio,
  Servicio
} from '@/domain/business/business.types'
import type { RolUsuarioNegocio } from '@/domain/business/rolUsuario.types'
import type { DescuentoTipo } from '@/domain/business/servicio.rules'
import type { CicloFacturacion } from '@/shared/utils/planes'

export type MembresiaUsuarioNegocio = {
  negocioId: string
  rol: RolUsuarioNegocio
}

export type CrearServicioInput = {
  negocioId: string
  nombre: string
  duracionMinutos: number
  precio: number | null
  descuentoTipo: DescuentoTipo | null
  descuentoValor: number | null
}

export type ActualizarServicioInput = {
  nombre: string
  duracionMinutos: number
  precio: number | null
  descuentoTipo: DescuentoTipo | null
  descuentoValor: number | null
  activo: boolean
}

export type ActualizarNegocioInput = {
  nombre: string
  telefonoWhatsapp: string
  direccion: string | null
  latitud: number | null
  longitud: number | null
  logoUrl?: string | null
  colorAcento?: string | null
}

export type NegocioPublico = {
  nombre: string
  slug: string
  logoUrl: string | null
}

export type NegocioDetalle = {
  id: string
  nombre: string
  slug: string
  telefonoWhatsapp: string
  direccion: string | null
  latitud: number | null
  longitud: number | null
  logoUrl: string | null
  colorAcento: string | null
  plan: string
  precioMensual: number | null
  cicloFacturacion: CicloFacturacion
  fechaInicioSuscripcion: Date | null
}

export type BusinessRepository = {
  obtenerNegocioIdPorUsuario: (authUserId: string) => Promise<string | null>
  obtenerMembresiaPorUsuario: (
    authUserId: string
  ) => Promise<MembresiaUsuarioNegocio | null>
  obtenerSlugPorNegocioId: (negocioId: string) => Promise<string | null>
  obtenerNegocioPublicoPorId: (
    negocioId: string
  ) => Promise<NegocioPublico | null>
  obtenerNegocioPorId: (negocioId: string) => Promise<NegocioDetalle | null>
  actualizarNegocio: (
    negocioId: string,
    input: ActualizarNegocioInput
  ) => Promise<NegocioDetalle>
  listarServicios: (negocioId: string) => Promise<Servicio[]>
  obtenerServicioPorId: (servicioId: string) => Promise<Servicio | null>
  crearServicio: (input: CrearServicioInput) => Promise<Servicio>
  actualizarServicio: (
    servicioId: string,
    input: ActualizarServicioInput
  ) => Promise<Servicio>
  listarHorarios: (negocioId: string) => Promise<HorarioNegocio[]>
  reemplazarHorarios: (
    negocioId: string,
    horarios: HorarioDiaInput[]
  ) => Promise<HorarioNegocio[]>
  listarCitasDelDia: (negocioId: string, fecha: Date) => Promise<CitaPanel[]>
}
