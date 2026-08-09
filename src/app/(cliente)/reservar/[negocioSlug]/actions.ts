'use server'

import type { CrearCitaInput } from '@/application/ports/bookingRepository.port'
import { crearCrearReserva } from '@/application/useCases/booking/crearReserva'
import type { Booking, BusinessHours } from '@/domain/booking/booking.types'
import { crearBookingRepository } from '@/infrastructure/supabase/bookingRepository.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { whatsappNotificationService } from '@/infrastructure/whatsapp/whatsappNotificationService'

type HorarioFila = {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}

const mapearHorario = (fila: HorarioFila): BusinessHours => ({
  diaSemana: fila.dia_semana,
  horaInicio: fila.hora_inicio.slice(0, 5),
  horaFin: fila.hora_fin.slice(0, 5)
})

const normalizarInput = (input: CrearCitaInput): CrearCitaInput => ({
  ...input,
  fechaHora: new Date(input.fechaHora)
})

const obtenerHorariosNegocio = async (
  negocioId: string
): Promise<BusinessHours[]> => {
  const supabase = crearClienteServidor()

  const { data, error } = await supabase
    .from('horarios_negocio')
    .select('dia_semana, hora_inicio, hora_fin')
    .eq('negocio_id', negocioId)
    .order('dia_semana', { ascending: true })

  if (error) {
    throw new Error('No se pudieron cargar los horarios del negocio')
  }

  return ((data as HorarioFila[] | null) ?? []).map(mapearHorario)
}

export const confirmarReserva = async (
  input: CrearCitaInput
): Promise<Booking> => {
  const inputNormalizado = normalizarInput(input)
  const supabase = crearClienteServidor()
  const bookingRepository = crearBookingRepository(supabase)
  const crearReserva = crearCrearReserva(
    bookingRepository,
    whatsappNotificationService
  )
  const horariosNegocio = await obtenerHorariosNegocio(
    inputNormalizado.negocioId
  )

  return crearReserva(inputNormalizado, horariosNegocio)
}
