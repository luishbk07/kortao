import type { BusinessRepository } from '@/application/ports/businessRepository.port'
import type {
  BloqueHorario,
  HorarioDiaInput,
  HorarioNegocio
} from '@/domain/business/business.types'

const parseHoraAMinutos = (hora: string): number => {
  const [horasTexto, minutosTexto] = hora.split(':')
  return Number(horasTexto) * 60 + Number(minutosTexto)
}

const validarBloques = (bloques: BloqueHorario[]): void => {
  if (bloques.length === 0) {
    throw new Error('Cada día abierto debe tener al menos un bloque horario')
  }

  const rangoInvalido = bloques.some(
    (bloque) =>
      parseHoraAMinutos(bloque.horaFin) <= parseHoraAMinutos(bloque.horaInicio)
  )

  if (rangoInvalido) {
    throw new Error('La hora de fin debe ser posterior a la hora de inicio')
  }

  const ordenados = [...bloques].sort(
    (a, b) => parseHoraAMinutos(a.horaInicio) - parseHoraAMinutos(b.horaInicio)
  )

  const haySolape = ordenados.some((bloque, indice) => {
    if (indice === 0) {
      return false
    }

    const anterior = ordenados[indice - 1]
    return (
      parseHoraAMinutos(bloque.horaInicio) < parseHoraAMinutos(anterior.horaFin)
    )
  })

  if (haySolape) {
    throw new Error('Los bloques del mismo día no pueden solaparse')
  }
}

export const crearGuardarHorarios = (
  businessRepository: BusinessRepository
) => {
  return async (
    negocioId: string,
    horarios: HorarioDiaInput[]
  ): Promise<HorarioNegocio[]> => {
    horarios
      .filter((horario) => !horario.cerrado)
      .forEach((horario) => {
        validarBloques(horario.bloques)
      })

    return businessRepository.reemplazarHorarios(negocioId, horarios)
  }
}
