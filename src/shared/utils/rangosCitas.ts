import { crearFechaEnZona, finDelDia, inicioDelDia, obtenerPartesEnZona } from './fechas'

export type TabCitas = 'hoy' | 'proximas' | 'pasadas'

const MS_POR_DIA = 24 * 60 * 60 * 1000

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
    const manana = new Date(inicioDelDia(ahora).getTime() + MS_POR_DIA)
    const partes = obtenerPartesEnZona(ahora)
    const limite = crearFechaEnZona(partes.anio + 2, partes.mes, partes.dia)

    return {
      desde: inicioDelDia(manana),
      hasta: finDelDia(limite)
    }
  }

  const ayer = new Date(inicioDelDia(ahora).getTime() - MS_POR_DIA)
  const partes = obtenerPartesEnZona(ahora)
  const inicio = crearFechaEnZona(partes.anio - 2, partes.mes, partes.dia)

  return {
    desde: inicioDelDia(inicio),
    hasta: finDelDia(ayer)
  }
}
