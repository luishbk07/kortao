'use client'

import { useEffect, useState } from 'react'
import { confirmarReserva as confirmarReservaAction } from '@/app/(cliente)/reservar/[negocioSlug]/actions'
import { crearObtenerDisponibilidad } from '@/application/useCases/booking/obtenerDisponibilidad'
import {
  HorarioNoDisponibleError,
  LimiteDePlanError
} from '@/domain/booking/booking.errors'
import type { BusinessHours, TimeSlot } from '@/domain/booking/booking.types'
import { bookingRepositorySupabase } from '@/infrastructure/supabase/bookingRepository.supabase'
import type { ServicioPublico } from '@/presentation/components/booking/tiposReservar'
import { esCorreoGmail } from '@/shared/utils/correo'
import {
  formatearFechaCalendario,
  parsearFechaCalendario
} from '@/shared/utils/fechas'
import { crearEnlaceGoogleCalendar } from '@/shared/utils/googleCalendar'
import { desplazarAlInicio } from '@/shared/utils/desplazamiento'

type UseFlujoReservarParams = {
  negocioId: string
  negocioNombre: string
  negocioDireccion: string | null
  servicios: ServicioPublico[]
  horariosNegocio: BusinessHours[]
}

const obtenerDisponibilidad = crearObtenerDisponibilidad(
  bookingRepositorySupabase
)

const esErrorHorarioNoDisponible = (error: unknown): boolean => {
  if (error instanceof HorarioNoDisponibleError) {
    return true
  }

  return (
    error instanceof Error &&
    error.message === 'El horario ya no está disponible'
  )
}

const esErrorLimiteDePlan = (error: unknown): boolean => {
  if (error instanceof LimiteDePlanError) {
    return true
  }

  return (
    error instanceof Error &&
    error.message ===
      'Este negocio alcanzó su límite de citas activas por el momento'
  )
}

export const useFlujoReservar = ({
  negocioId,
  negocioNombre,
  negocioDireccion,
  servicios,
  horariosNegocio
}: UseFlujoReservarParams) => {
  const fechaMinima = formatearFechaCalendario(new Date())

  const [servicioId, setServicioId] = useState<string | null>(null)
  const [fecha, setFecha] = useState(fechaMinima)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [cargandoSlots, setCargandoSlots] = useState(false)
  const [slotSeleccionado, setSlotSeleccionado] = useState<TimeSlot | null>(null)
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteTelefono, setClienteTelefono] = useState('')
  const [clienteCorreo, setClienteCorreo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [mensajeError, setMensajeError] = useState<string | null>(null)
  const [enlaceGoogleCalendar, setEnlaceGoogleCalendar] = useState<
    string | null
  >(null)

  const servicioSeleccionado = servicios.find(
    (servicio) => servicio.id === servicioId
  ) ?? null

  const mostrarError = (mensaje: string) => {
    setMensajeError(mensaje)
    desplazarAlInicio()
  }

  useEffect(() => {
    setSlotSeleccionado(null)
    setMensajeError(null)
    setMensajeExito(null)
    setEnlaceGoogleCalendar(null)

    if (!servicioSeleccionado || !fecha) {
      setSlots([])
      return
    }

    let cancelado = false

    const cargarSlots = async () => {
      setCargandoSlots(true)

      try {
        const disponibles = await obtenerDisponibilidad(
          negocioId,
          parsearFechaCalendario(fecha),
          servicioSeleccionado.duracionMinutos,
          horariosNegocio
        )

        if (!cancelado) {
          setSlots(disponibles)
        }
      } catch {
        if (!cancelado) {
          setSlots([])
          mostrarError(
            'No se pudieron cargar los horarios. Inténtalo de nuevo.'
          )
        }
      } finally {
        if (!cancelado) {
          setCargandoSlots(false)
        }
      }
    }

    void cargarSlots()

    return () => {
      cancelado = true
    }
  }, [servicioSeleccionado, fecha, negocioId, horariosNegocio])

  const seleccionarServicio = (id: string) => {
    setServicioId(id)
    setSlotSeleccionado(null)
    setMensajeExito(null)
    setMensajeError(null)
    setEnlaceGoogleCalendar(null)
  }

  const cambiarFecha = (nuevaFecha: string) => {
    setFecha(nuevaFecha)
    setSlotSeleccionado(null)
    setMensajeExito(null)
    setMensajeError(null)
    setEnlaceGoogleCalendar(null)
  }

  const seleccionarSlot = (slot: TimeSlot) => {
    if (!slot.disponible) {
      return
    }

    setSlotSeleccionado(slot)
    setMensajeExito(null)
    setMensajeError(null)
    setEnlaceGoogleCalendar(null)
  }

  const confirmarReserva = async () => {
    if (!servicioSeleccionado || !slotSeleccionado) {
      return
    }

    setEnviando(true)
    setMensajeError(null)
    setMensajeExito(null)
    setEnlaceGoogleCalendar(null)

    const correoUsado = clienteCorreo.trim()
    const slotReservado = slotSeleccionado
    const servicioReservado = servicioSeleccionado

    try {
      await confirmarReservaAction({
        negocioId,
        servicioId: servicioReservado.id,
        clienteNombre: clienteNombre.trim(),
        clienteTelefono: clienteTelefono.trim(),
        clienteCorreo: correoUsado ? correoUsado : null,
        fechaHora: slotReservado.inicio,
        duracionMinutos: servicioReservado.duracionMinutos
      })

      setMensajeExito(
        'Tu reserva está confirmada. Te esperamos en el horario elegido.'
      )
      desplazarAlInicio()

      if (esCorreoGmail(correoUsado)) {
        setEnlaceGoogleCalendar(
          crearEnlaceGoogleCalendar({
            titulo: `${servicioReservado.nombre} — ${negocioNombre}`,
            inicio: slotReservado.inicio,
            duracionMinutos: servicioReservado.duracionMinutos,
            detalles: `Cita en ${negocioNombre}`,
            ubicacion: negocioDireccion
          })
        )
      }

      setSlotSeleccionado(null)
      setClienteNombre('')
      setClienteTelefono('')
      setClienteCorreo('')

      const disponibles = await obtenerDisponibilidad(
        negocioId,
        parsearFechaCalendario(fecha),
        servicioReservado.duracionMinutos,
        horariosNegocio
      )
      setSlots(disponibles)
    } catch (error) {
      if (esErrorHorarioNoDisponible(error)) {
        mostrarError(
          'Ese horario ya no está disponible. Elige otro e inténtalo de nuevo.'
        )
        setSlotSeleccionado(null)

        const disponibles = await obtenerDisponibilidad(
          negocioId,
          parsearFechaCalendario(fecha),
          servicioReservado.duracionMinutos,
          horariosNegocio
        )
        setSlots(disponibles)
      } else if (esErrorLimiteDePlan(error)) {
        mostrarError(
          'Este negocio no tiene cupo disponible por ahora, contáctalo directamente para coordinar tu cita.'
        )
      } else {
        mostrarError(
          'No se pudo completar la reserva. Inténtalo de nuevo.'
        )
      }
    } finally {
      setEnviando(false)
    }
  }

  return {
    fechaMinima,
    servicioId,
    servicioSeleccionado,
    fecha,
    slots,
    cargandoSlots,
    slotSeleccionado,
    clienteNombre,
    clienteTelefono,
    clienteCorreo,
    enviando,
    mensajeExito,
    mensajeError,
    enlaceGoogleCalendar,
    seleccionarServicio,
    cambiarFecha,
    seleccionarSlot,
    setClienteNombre,
    setClienteTelefono,
    setClienteCorreo,
    setMensajeError,
    confirmarReserva
  }
}
