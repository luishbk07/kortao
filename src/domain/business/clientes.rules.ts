import type {
  CitaParaClientes,
  ClienteRecurrente
} from '@/domain/business/reportes.types'

export const agruparClientesRecurrentes = (
  citas: CitaParaClientes[]
): ClienteRecurrente[] => {
  const porTelefono = citas.reduce<
    Record<
      string,
      {
        clienteNombre: string
        numeroVisitas: number
        ultimaVisita: Date
      }
    >
  >((acumulado, cita) => {
    const telefono = cita.clienteTelefono.trim()
    if (!telefono) {
      return acumulado
    }

    const existente = acumulado[telefono]
    if (!existente) {
      return {
        ...acumulado,
        [telefono]: {
          clienteNombre: cita.clienteNombre,
          numeroVisitas: 1,
          ultimaVisita: cita.fechaHora
        }
      }
    }

    const esMasReciente = cita.fechaHora > existente.ultimaVisita

    return {
      ...acumulado,
      [telefono]: {
        clienteNombre: esMasReciente
          ? cita.clienteNombre
          : existente.clienteNombre,
        numeroVisitas: existente.numeroVisitas + 1,
        ultimaVisita: esMasReciente
          ? cita.fechaHora
          : existente.ultimaVisita
      }
    }
  }, {})

  return Object.entries(porTelefono)
    .filter(([, datos]) => datos.numeroVisitas >= 2)
    .map(([clienteTelefono, datos]) => ({
      clienteTelefono,
      clienteNombre: datos.clienteNombre,
      numeroVisitas: datos.numeroVisitas,
      ultimaVisita: datos.ultimaVisita
    }))
    .sort((a, b) => b.numeroVisitas - a.numeroVisitas)
}
