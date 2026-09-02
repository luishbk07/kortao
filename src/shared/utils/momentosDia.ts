import { obtenerPartesEnZona } from '@/shared/utils/fechas'

export type MomentoDia = 'manana' | 'tarde' | 'noche'

/** Noon in America/Santo_Domingo wall clock. */
export const HORA_INICIO_TARDE = 12

/** 7:00 p. m. — tarde ends here; noche starts. */
export const HORA_INICIO_NOCHE = 19

export const ORDEN_MOMENTOS_DIA: MomentoDia[] = ['manana', 'tarde', 'noche']

export const ETIQUETAS_MOMENTO_DIA: Record<MomentoDia, string> = {
  manana: 'Mañana (9:00 a. m. - 12:00 p. m.)',
  tarde: 'Tarde (12:00 p. m. - 7:00 p. m.)',
  noche: 'Noche (7:00 p. m. - 11:00 p. m.)'
}

export const obtenerMomentoDia = (fecha: Date): MomentoDia => {
  const { hora } = obtenerPartesEnZona(fecha)

  if (hora < HORA_INICIO_TARDE) {
    return 'manana'
  }

  if (hora < HORA_INICIO_NOCHE) {
    return 'tarde'
  }

  return 'noche'
}

export type GrupoMomentoDia<T> = {
  momento: MomentoDia
  etiqueta: string
  items: T[]
}

export const agruparPorMomentoDia = <T>(
  items: T[],
  obtenerFecha: (item: T) => Date
): GrupoMomentoDia<T>[] => {
  const porMomento = items.reduce<Record<MomentoDia, T[]>>(
    (acumulado, item) => {
      const momento = obtenerMomentoDia(obtenerFecha(item))
      return {
        ...acumulado,
        [momento]: [...acumulado[momento], item]
      }
    },
    { manana: [], tarde: [], noche: [] }
  )

  return ORDEN_MOMENTOS_DIA.filter(
    (momento) => porMomento[momento].length > 0
  ).map((momento) => ({
    momento,
    etiqueta: ETIQUETAS_MOMENTO_DIA[momento],
    items: porMomento[momento]
  }))
}
