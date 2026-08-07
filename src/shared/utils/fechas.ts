export const inicioDelDia = (fecha: Date): Date => {
  const inicio = new Date(fecha)
  inicio.setHours(0, 0, 0, 0)
  return inicio
}

export const finDelDia = (fecha: Date): Date => {
  const fin = new Date(fecha)
  fin.setHours(23, 59, 59, 999)
  return fin
}
