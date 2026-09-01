export class HorarioNoDisponibleError extends Error {
  constructor(message = 'El horario ya no está disponible') {
    super(message)
    this.name = 'HorarioNoDisponibleError'
  }
}

export class LimiteDePlanError extends Error {
  constructor(
    message = 'Este negocio alcanzó el límite de citas de su plan gratis'
  ) {
    super(message)
    this.name = 'LimiteDePlanError'
  }
}
