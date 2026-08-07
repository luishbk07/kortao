import type { BusinessRepository } from '@/application/ports/businessRepository.port'
import type {
  HorarioDiaInput,
  HorarioNegocio
} from '@/domain/business/business.types'

export const crearGuardarHorarios = (
  businessRepository: BusinessRepository
) => {
  return async (
    negocioId: string,
    horarios: HorarioDiaInput[]
  ): Promise<HorarioNegocio[]> => {
    const abiertos = horarios.filter((horario) => !horario.cerrado)

    const rangoInvalido = abiertos.some(
      (horario) => horario.horaInicio >= horario.horaFin
    )

    if (rangoInvalido) {
      throw new Error('La hora de inicio debe ser anterior a la hora de fin')
    }

    return businessRepository.reemplazarHorarios(negocioId, horarios)
  }
}
