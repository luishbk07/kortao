'use server'

import type { CrearCitaInput } from '@/application/ports/bookingRepository.port'
import { crearCrearReserva } from '@/application/useCases/booking/crearReserva'
import type { Booking, BusinessHours } from '@/domain/booking/booking.types'
import { crearNotificationServiceCompuesto } from '@/infrastructure/notifications/notificationService.compuesto'
import { resendEmailNotificationService } from '@/infrastructure/notifications/resendEmailNotificationService'
import { crearBookingRepository } from '@/infrastructure/supabase/bookingRepository.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { whatsappNotificationService } from '@/infrastructure/whatsapp/whatsappNotificationService'
import { normalizarCorreo } from '@/shared/utils/correo'

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
  fechaHora: new Date(input.fechaHora),
  clienteCorreo: input.clienteCorreo
    ? normalizarCorreo(input.clienteCorreo)
    : null
})

const obtenerDatosNegocio = async (
  negocioId: string
): Promise<{
  horarios: BusinessHours[]
  nombre: string
  direccion: string | null
}> => {
  const supabase = crearClienteServidor()

  const [resultadoHorarios, resultadoNegocio] = await Promise.all([
    supabase
      .from('horarios_negocio')
      .select('dia_semana, hora_inicio, hora_fin')
      .eq('negocio_id', negocioId)
      .order('dia_semana', { ascending: true }),
    supabase
      .from('negocios')
      .select('nombre, direccion')
      .eq('id', negocioId)
      .maybeSingle()
  ])

  if (resultadoHorarios.error) {
    throw new Error('No se pudieron cargar los horarios del negocio')
  }

  if (resultadoNegocio.error || !resultadoNegocio.data?.nombre) {
    throw new Error('No se pudo cargar el negocio')
  }

  return {
    horarios: ((resultadoHorarios.data as HorarioFila[] | null) ?? []).map(
      mapearHorario
    ),
    nombre: resultadoNegocio.data.nombre,
    direccion: resultadoNegocio.data.direccion ?? null
  }
}

export const confirmarReserva = async (
  input: CrearCitaInput
): Promise<Booking> => {
  const inputNormalizado = normalizarInput(input)
  const supabase = crearClienteServidor()
  const bookingRepository = crearBookingRepository(supabase)
  const notificationService = crearNotificationServiceCompuesto(
    whatsappNotificationService,
    resendEmailNotificationService
  )
  const crearReserva = crearCrearReserva(
    bookingRepository,
    notificationService
  )
  const { horarios, nombre, direccion } = await obtenerDatosNegocio(
    inputNormalizado.negocioId
  )

  return crearReserva(inputNormalizado, horarios, nombre, direccion)
}
