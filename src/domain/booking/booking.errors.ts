export class HorarioNoDisponibleError extends Error {
  constructor(message = 'El horario ya no está disponible') {
    super(message)
    this.name = 'HorarioNoDisponibleError'
  }
}

export class LimiteDePlanError extends Error {
  constructor(
    message = 'Este negocio alcanzó su límite de citas activas por el momento'
  ) {
    super(message)
    this.name = 'LimiteDePlanError'
  }
}
