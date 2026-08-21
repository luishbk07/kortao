'use server'

import type { SolicitudCrearReserva } from '@/application/ports/bookingRepository.port'
import { crearCrearReserva } from '@/application/useCases/booking/crearReserva'
import type { Booking, BusinessHours } from '@/domain/booking/booking.types'
import { crearNotificationServiceCompuesto } from '@/infrastructure/notifications/notificationService.compuesto'
import { resendEmailNotificationService } from '@/infrastructure/notifications/resendEmailNotificationService'
import { crearBookingRepository } from '@/infrastructure/supabase/bookingRepository.supabase'
import { crearBusinessRepository } from '@/infrastructure/supabase/businessRepository.supabase'
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

const normalizarInput = (
  input: SolicitudCrearReserva
): SolicitudCrearReserva => ({
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
  logoUrl: string | null
  plan: string
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
      .select('nombre, direccion, logo_url, plan')
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
    direccion: resultadoNegocio.data.direccion ?? null,
    logoUrl: resultadoNegocio.data.logo_url ?? null,
    plan: resultadoNegocio.data.plan ?? 'estandar'
  }
}

export const confirmarReserva = async (
  input: SolicitudCrearReserva
): Promise<Booking> => {
  const inputNormalizado = normalizarInput(input)
  const supabase = crearClienteServidor()
  const bookingRepository = crearBookingRepository(supabase)
  const businessRepository = crearBusinessRepository(supabase)
  const notificationService = crearNotificationServiceCompuesto(
    whatsappNotificationService,
    resendEmailNotificationService
  )
  const crearReserva = crearCrearReserva(
    bookingRepository,
    notificationService,
    businessRepository
  )
  const { horarios, nombre, direccion, logoUrl, plan } =
    await obtenerDatosNegocio(inputNormalizado.negocioId)

  return crearReserva(
    inputNormalizado,
    horarios,
    nombre,
    direccion,
    logoUrl,
    plan
  )
}
