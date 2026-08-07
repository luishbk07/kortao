export type Servicio = {
  id: string
  negocioId: string
  nombre: string
  duracionMinutos: number
  precio: number
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
}

export type HorarioDiaInput = {
  diaSemana: number
  cerrado: boolean
  horaInicio: string
  horaFin: string
}
