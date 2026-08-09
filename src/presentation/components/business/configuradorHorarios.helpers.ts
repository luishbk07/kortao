import type {
  BloqueHorario,
  HorarioDiaInput,
  HorarioNegocio
} from '@/domain/business/business.types'
import { diasSemana } from '@/shared/constants/diasSemana'

export type DiaConfigurado = {
  diaSemana: number
  abierto: boolean
  bloques: BloqueHorario[]
}

export const bloquePorDefecto = (): BloqueHorario => ({
  horaInicio: '09:00',
  horaFin: '18:00'
})

const parseHoraAMinutos = (hora: string): number => {
  const [horasTexto, minutosTexto] = hora.split(':')
  return Number(horasTexto) * 60 + Number(minutosTexto)
}

export const validarBloquesDia = (bloques: BloqueHorario[]): string | null => {
  if (bloques.length === 0) {
    return 'Cada día abierto debe tener al menos un bloque horario'
  }

  if (
    bloques.some(
      (bloque) =>
        parseHoraAMinutos(bloque.horaFin) <=
        parseHoraAMinutos(bloque.horaInicio)
    )
  ) {
    return 'La hora de fin debe ser posterior a la hora de inicio'
  }

  const ordenados = [...bloques].sort(
    (a, b) => parseHoraAMinutos(a.horaInicio) - parseHoraAMinutos(b.horaInicio)
  )

  const haySolape = ordenados.some((bloque, indice) => {
    if (indice === 0) {
      return false
    }

    return (
      parseHoraAMinutos(bloque.horaInicio) <
      parseHoraAMinutos(ordenados[indice - 1].horaFin)
    )
  })

  if (haySolape) {
    return 'Los bloques del mismo día no pueden solaparse'
  }

  return null
}

export const construirDiasDesdeInicial = (
  valorInicial: HorarioDiaInput[]
): DiaConfigurado[] => {
  return diasSemana.map((dia) => {
    const entrada = valorInicial.find(
      (horario) => horario.diaSemana === dia.valor
    )

    if (!entrada || entrada.cerrado) {
      return {
        diaSemana: dia.valor,
        abierto: false,
        bloques: [bloquePorDefecto()]
      }
    }

    return {
      diaSemana: dia.valor,
      abierto: true,
      bloques:
        entrada.bloques.length > 0
          ? entrada.bloques.map((bloque) => ({ ...bloque }))
          : [bloquePorDefecto()]
    }
  })
}

export const mapearHorariosNegocioAInputs = (
  horarios: HorarioNegocio[]
): HorarioDiaInput[] => {
  return diasSemana.map((dia) => {
    const bloques = horarios
      .filter((horario) => horario.diaSemana === dia.valor)
      .map((horario) => ({
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin
      }))
      .sort(
        (a, b) =>
          parseHoraAMinutos(a.horaInicio) - parseHoraAMinutos(b.horaInicio)
      )

    if (bloques.length === 0) {
      return {
        diaSemana: dia.valor,
        cerrado: true,
        bloques: [bloquePorDefecto()]
      }
    }

    return {
      diaSemana: dia.valor,
      cerrado: false,
      bloques
    }
  })
}

export const construirPayloadHorarios = (
  aplicarATodos: boolean,
  dias: DiaConfigurado[],
  diasAbiertosCompartidos: number[],
  bloquesCompartidos: BloqueHorario[]
): HorarioDiaInput[] => {
  if (!aplicarATodos) {
    return dias.map((dia) => ({
      diaSemana: dia.diaSemana,
      cerrado: !dia.abierto,
      bloques: dia.abierto ? dia.bloques : [bloquePorDefecto()]
    }))
  }

  return diasSemana.map((dia) => {
    const abierto = diasAbiertosCompartidos.includes(dia.valor)

    return {
      diaSemana: dia.valor,
      cerrado: !abierto,
      bloques: abierto
        ? bloquesCompartidos.map((bloque) => ({ ...bloque }))
        : [bloquePorDefecto()]
    }
  })
}
