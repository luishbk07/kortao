'use client'

import { useEffect, useState } from 'react'
import { confirmarReserva as confirmarReservaAction } from '@/app/(cliente)/reservar/[negocioSlug]/actions'
import { crearObtenerDisponibilidad } from '@/application/useCases/booking/obtenerDisponibilidad'
import { HorarioNoDisponibleError } from '@/domain/booking/booking.errors'
import type { BusinessHours, TimeSlot } from '@/domain/booking/booking.types'
import { bookingRepositorySupabase } from '@/infrastructure/supabase/bookingRepository.supabase'
import type { ServicioPublico } from '@/presentation/components/booking/tiposReservar'
import { esCorreoGmail } from '@/shared/utils/correo'
import { crearEnlaceGoogleCalendar } from '@/shared/utils/googleCalendar'

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

const formatearFechaLocal = (fecha: Date): string => {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

const parsearFechaLocal = (fechaTexto: string): Date => {
  const [anio, mes, dia] = fechaTexto.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

export const useFlujoReservar = ({
  negocioId,
  negocioNombre,
  negocioDireccion,
  servicios,
  horariosNegocio
}: UseFlujoReservarParams) => {
  const fechaMinima = formatearFechaLocal(new Date())

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
          parsearFechaLocal(fecha),
          servicioSeleccionado.duracionMinutos,
          horariosNegocio
        )

        if (!cancelado) {
          setSlots(disponibles)
        }
      } catch {
        if (!cancelado) {
          setSlots([])
          setMensajeError(
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
      window.scrollTo({ top: 0, behavior: 'smooth' })

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
        parsearFechaLocal(fecha),
        servicioReservado.duracionMinutos,
        horariosNegocio
      )
      setSlots(disponibles)
    } catch (error) {
      if (esErrorHorarioNoDisponible(error)) {
        setMensajeError(
          'Ese horario ya no está disponible. Elige otro e inténtalo de nuevo.'
        )
        setSlotSeleccionado(null)

        const disponibles = await obtenerDisponibilidad(
          negocioId,
          parsearFechaLocal(fecha),
          servicioReservado.duracionMinutos,
          horariosNegocio
        )
        setSlots(disponibles)
      } else {
        setMensajeError(
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
