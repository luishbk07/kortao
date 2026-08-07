import type { BusinessHours, OccupiedSlot, TimeSlot } from './booking.types'

const INTERVALO_SLOT_MINUTOS = 15

const parseHoraAMinutos = (hora: string): number => {
  const [horasTexto, minutosTexto] = hora.split(':')
  const horas = Number(horasTexto)
  const minutos = Number(minutosTexto)

  return horas * 60 + minutos
}

const combinarFechaYMinutos = (fecha: Date, minutosDelDia: number): Date => {
  const resultado = new Date(fecha)
  resultado.setHours(0, 0, 0, 0)
  resultado.setMinutes(minutosDelDia)
  return resultado
}

const obtenerFinCita = (cita: OccupiedSlot): Date => {
  return new Date(cita.fechaHora.getTime() + cita.duracionMinutos * 60_000)
}

const citasActivas = (citasExistentes: OccupiedSlot[]): OccupiedSlot[] => {
  return citasExistentes.filter((cita) => cita.estado !== 'cancelada')
}

const haySolapamiento = (
  inicioA: Date,
  finA: Date,
  inicioB: Date,
  finB: Date
): boolean => {
  return inicioA < finB && finA > inicioB
}

const seSolapaConCitas = (
  inicio: Date,
  fin: Date,
  citasExistentes: OccupiedSlot[]
): boolean => {
  return citasActivas(citasExistentes).some((cita) => {
    return haySolapamiento(inicio, fin, cita.fechaHora, obtenerFinCita(cita))
  })
}

const horariosDelDia = (
  horariosNegocio: BusinessHours[],
  diaSemana: number
): BusinessHours[] => {
  return horariosNegocio.filter((horario) => horario.diaSemana === diaSemana)
}

const cabeEnHorario = (
  inicio: Date,
  fin: Date,
  horario: BusinessHours
): boolean => {
  const inicioMinutos = inicio.getHours() * 60 + inicio.getMinutes()
  const finMinutos = fin.getHours() * 60 + fin.getMinutes()
  const horarioInicio = parseHoraAMinutos(horario.horaInicio)
  const horarioFin = parseHoraAMinutos(horario.horaFin)

  return inicioMinutos >= horarioInicio && finMinutos <= horarioFin
}

const estaDentroDeHorarios = (
  inicio: Date,
  fin: Date,
  horariosNegocio: BusinessHours[]
): boolean => {
  const diaSemana = inicio.getDay()

  return horariosDelDia(horariosNegocio, diaSemana).some((horario) => {
    return cabeEnHorario(inicio, fin, horario)
  })
}

export const esHorarioDisponible = (
  horariosNegocio: BusinessHours[],
  citasExistentes: OccupiedSlot[],
  fechaHoraPropuesta: Date,
  duracionServicio: number
): boolean => {
  if (duracionServicio <= 0) {
    return false
  }

  const finPropuesto = new Date(
    fechaHoraPropuesta.getTime() + duracionServicio * 60_000
  )

  if (!estaDentroDeHorarios(fechaHoraPropuesta, finPropuesto, horariosNegocio)) {
    return false
  }

  return !seSolapaConCitas(fechaHoraPropuesta, finPropuesto, citasExistentes)
}

const generarSlotsEnHorario = (
  fecha: Date,
  horario: BusinessHours,
  citasExistentes: OccupiedSlot[],
  duracionServicio: number
): TimeSlot[] => {
  const inicioMinutos = parseHoraAMinutos(horario.horaInicio)
  const finMinutos = parseHoraAMinutos(horario.horaFin)

  const candidatos = Array.from(
    {
      length: Math.floor((finMinutos - inicioMinutos) / INTERVALO_SLOT_MINUTOS) + 1
    },
    (_, indice) => inicioMinutos + indice * INTERVALO_SLOT_MINUTOS
  )

  return candidatos.reduce<TimeSlot[]>((slots, minutosInicio) => {
    const inicio = combinarFechaYMinutos(fecha, minutosInicio)
    const fin = new Date(inicio.getTime() + duracionServicio * 60_000)
    const finMinutosSlot = minutosInicio + duracionServicio

    if (finMinutosSlot > finMinutos) {
      return slots
    }

    if (seSolapaConCitas(inicio, fin, citasExistentes)) {
      return slots
    }

    return [...slots, { inicio, fin }]
  }, [])
}

export const generarSlotsDisponibles = (
  horariosNegocio: BusinessHours[],
  citasExistentes: OccupiedSlot[],
  fecha: Date,
  duracionServicio: number
): TimeSlot[] => {
  if (duracionServicio <= 0) {
    return []
  }

  const diaSemana = fecha.getDay()

  return horariosDelDia(horariosNegocio, diaSemana).flatMap((horario) => {
    return generarSlotsEnHorario(
      fecha,
      horario,
      citasExistentes,
      duracionServicio
    )
  })
}
