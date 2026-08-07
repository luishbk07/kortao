import { finDelDia, inicioDelDia } from './fechas'

export type TabCitas = 'hoy' | 'proximas' | 'pasadas'

export const obtenerRangoTabCitas = (
  tab: TabCitas,
  ahora: Date
): { desde: Date, hasta: Date } => {
  if (tab === 'hoy') {
    return {
      desde: inicioDelDia(ahora),
      hasta: finDelDia(ahora)
    }
  }

  if (tab === 'proximas') {
    const manana = new Date(ahora)
    manana.setDate(manana.getDate() + 1)

    const limite = new Date(ahora)
    limite.setFullYear(limite.getFullYear() + 2)

    return {
      desde: inicioDelDia(manana),
      hasta: finDelDia(limite)
    }
  }

  const ayer = new Date(ahora)
  ayer.setDate(ayer.getDate() - 1)

  const inicio = new Date(ahora)
  inicio.setFullYear(inicio.getFullYear() - 2)

  return {
    desde: inicioDelDia(inicio),
    hasta: finDelDia(ayer)
  }
}
