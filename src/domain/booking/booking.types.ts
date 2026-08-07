export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'completada'

export type Booking = {
  id: string
  negocioId: string
  servicioId: string
  clienteNombre: string
  clienteTelefono: string
  fechaHora: Date
  duracionMinutos: number
  estado: EstadoCita
  creadoEn: Date
}

export type OccupiedSlot = {
  fechaHora: Date
  duracionMinutos: number
  estado: EstadoCita
}

export type TimeSlot = {
  inicio: Date
  fin: Date
}

export type BusinessHours = {
  diaSemana: number
  horaInicio: string
  horaFin: string
}
