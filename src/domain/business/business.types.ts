import type { DescuentoTipo } from '@/domain/business/servicio.rules'

export type Servicio = {
  id: string
  negocioId: string
  nombre: string
  duracionMinutos: number
  precio: number
  descuentoTipo: DescuentoTipo | null
  descuentoValor: number | null
  activo: boolean
}

export type HorarioNegocio = {
  id: string
  negocioId: string
  diaSemana: number
  horaInicio: string
  horaFin: string
}

export type CitaPanel = {
  id: string
  clienteNombre: string
  clienteTelefono: string
  fechaHora: Date
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
  servicioNombre: string
  duracionMinutos: number
  precio: number | null
}

export type BloqueHorario = {
  horaInicio: string
  horaFin: string
}

export type HorarioDiaInput = {
  diaSemana: number
  cerrado: boolean
  bloques: BloqueHorario[]
}
