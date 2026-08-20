export const esCitaYaOcurrida = (
  fechaHora: Date,
  ahora: Date = new Date()
): boolean => {
  return fechaHora.getTime() <= ahora.getTime()
}
