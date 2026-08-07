export class HorarioNoDisponibleError extends Error {
  constructor(message = 'El horario ya no está disponible') {
    super(message)
    this.name = 'HorarioNoDisponibleError'
  }
}
