import type {
  CitaParaClientes,
  ClienteRecurrente
} from '@/domain/business/reportes.types'

type AcumuladoCliente = {
  clienteNombre: string
  clienteCorreo: string | null
  numeroVisitas: number
  ultimaVisita: Date
}

const elegirCorreo = (
  preferido: string | null,
  reserva: string | null
): string | null => {
  return preferido ?? reserva
}

export const agruparClientesRecurrentes = (
  citas: CitaParaClientes[]
): ClienteRecurrente[] => {
  const porTelefono = citas.reduce<Record<string, AcumuladoCliente>>(
    (acumulado, cita) => {
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
            clienteCorreo: cita.clienteCorreo,
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
          clienteCorreo: esMasReciente
            ? elegirCorreo(cita.clienteCorreo, existente.clienteCorreo)
            : elegirCorreo(existente.clienteCorreo, cita.clienteCorreo),
          numeroVisitas: existente.numeroVisitas + 1,
          ultimaVisita: esMasReciente
            ? cita.fechaHora
            : existente.ultimaVisita
        }
      }
    },
    {}
  )

  return Object.entries(porTelefono)
    .filter(([, datos]) => datos.numeroVisitas >= 1)
    .map(([clienteTelefono, datos]) => ({
      clienteTelefono,
      clienteNombre: datos.clienteNombre,
      clienteCorreo: datos.clienteCorreo,
      numeroVisitas: datos.numeroVisitas,
      ultimaVisita: datos.ultimaVisita
    }))
    .sort((a, b) => b.numeroVisitas - a.numeroVisitas)
}
