import type {
  CitaPanel,
  HorarioDiaInput,
  HorarioNegocio,
  Servicio
} from '@/domain/business/business.types'

export type CrearServicioInput = {
  negocioId: string
  nombre: string
  duracionMinutos: number
  precio: number
}

export type ActualizarServicioInput = {
  nombre: string
  duracionMinutos: number
  precio: number
  activo: boolean
}

export type NegocioPublico = {
  nombre: string
  slug: string
}

export type BusinessRepository = {
  obtenerNegocioIdPorUsuario: (authUserId: string) => Promise<string | null>
  obtenerSlugPorNegocioId: (negocioId: string) => Promise<string | null>
  obtenerNegocioPublicoPorId: (
    negocioId: string
  ) => Promise<NegocioPublico | null>
  listarServicios: (negocioId: string) => Promise<Servicio[]>
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
