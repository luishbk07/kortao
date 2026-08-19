export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'completada'

export type Booking = {
  id: string
  negocioId: string
  servicioId: string
  servicioNombre: string
  clienteNombre: string
  clienteTelefono: string
  clienteCorreo: string | null
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
  disponible: boolean
}

export type BusinessHours = {
  diaSemana: number
  horaInicio: string
  horaFin: string
}
