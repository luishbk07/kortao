'use client'

import { useEffect, useState } from 'react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { crearCitaManualAction } from '@/app/(negocio)/panel/citas/actions'
import { crearObtenerDisponibilidad } from '@/application/useCases/booking/obtenerDisponibilidad'
import {
  HorarioNoDisponibleError,
  LimiteDePlanError
} from '@/domain/booking/booking.errors'
import type { BusinessHours, TimeSlot } from '@/domain/booking/booking.types'
import { bookingRepositorySupabase } from '@/infrastructure/supabase/bookingRepository.supabase'
import { FormularioCliente } from '@/presentation/components/booking/FormularioCliente'
import { ListaServicios } from '@/presentation/components/booking/ListaServicios'
import { ListaSlots } from '@/presentation/components/booking/ListaSlots'
import { SelectorFecha } from '@/presentation/components/booking/SelectorFecha'
import type { ServicioPublico } from '@/presentation/components/booking/tiposReservar'
import {
  formatearFechaCalendario,
  parsearFechaCalendario
} from '@/shared/utils/fechas'

type DialogNuevaCitaProps = {
  abierto: boolean
  negocioId: string
  servicios: ServicioPublico[]
  horariosNegocio: BusinessHours[]
  onCerrar: () => void
  onExito: () => void
}

const obtenerDisponibilidad = crearObtenerDisponibilidad(
  bookingRepositorySupabase
)

const mensajeErrorReserva = (error: unknown): string => {
  if (
    error instanceof HorarioNoDisponibleError ||
    (error instanceof Error &&
      error.message === 'El horario ya no está disponible')
  ) {
    return 'Ese horario ya no está disponible. Elige otro e inténtalo de nuevo.'
  }

  if (
    error instanceof LimiteDePlanError ||
    (error instanceof Error &&
      error.message ===
        'Este negocio alcanzó el límite de citas de su plan gratis')
  ) {
    return 'No hay cupo disponible por ahora. Revisa el límite de citas del plan.'
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return 'No se pudo crear la cita. Inténtalo de nuevo.'
}

export const DialogNuevaCita = ({
  abierto,
  negocioId,
  servicios,
  horariosNegocio,
  onCerrar,
  onExito
}: DialogNuevaCitaProps) => {
  const fechaMinima = formatearFechaCalendario(new Date())
  const [servicioId, setServicioId] = useState<string | null>(null)
  const [fecha, setFecha] = useState(fechaMinima)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [cargandoSlots, setCargandoSlots] = useState(false)
  const [slotSeleccionado, setSlotSeleccionado] = useState<TimeSlot | null>(
    null
  )
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteTelefono, setClienteTelefono] = useState('')
  const [clienteCorreo, setClienteCorreo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  const servicioSeleccionado =
    servicios.find((servicio) => servicio.id === servicioId) ?? null

  useEffect(() => {
    if (!abierto) {
      return
    }

    setServicioId(null)
    setFecha(formatearFechaCalendario(new Date()))
    setSlots([])
    setSlotSeleccionado(null)
    setClienteNombre('')
    setClienteTelefono('')
    setClienteCorreo('')
    setEnviando(false)
    setMensajeError(null)
  }, [abierto])

  useEffect(() => {
    if (!abierto || !servicioSeleccionado || !fecha) {
      setSlots([])
      return
    }

    let cancelado = false

    const cargarSlots = async () => {
      setCargandoSlots(true)
      setSlotSeleccionado(null)
      setMensajeError(null)

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
  }, [abierto, servicioSeleccionado, fecha, negocioId, horariosNegocio])

  const handleConfirmar = async () => {
    if (!servicioSeleccionado || !slotSeleccionado) {
      return
    }

    setEnviando(true)
    setMensajeError(null)

    try {
      await crearCitaManualAction({
        negocioId,
        servicioId: servicioSeleccionado.id,
        clienteNombre: clienteNombre.trim(),
        clienteTelefono: clienteTelefono.trim(),
        clienteCorreo: clienteCorreo.trim() ? clienteCorreo.trim() : null,
        fechaHora: slotSeleccionado.inicio,
        duracionMinutos: servicioSeleccionado.duracionMinutos
      })
      onExito()
      onCerrar()
    } catch (error) {
      setMensajeError(mensajeErrorReserva(error))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog
      open={abierto}
      onClose={enviando ? undefined : onCerrar}
      fullWidth
      maxWidth='sm'
      scroll='paper'
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pr: 1
        }}
      >
        <Stack direction='row' spacing={1} alignItems='center'>
          <AddOutlinedIcon color='secondary' />
          <Typography variant='h6' component='span'>
            Nueva cita
          </Typography>
        </Stack>
        <IconButton
          aria-label='Cerrar'
          onClick={onCerrar}
          disabled={enviando}
          size='small'
        >
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Typography color='text.secondary'>
            Crea una cita para un cliente que llegó al local o llamó por
            teléfono.
          </Typography>

          {mensajeError ? (
            <Alert severity='error' onClose={() => setMensajeError(null)}>
              {mensajeError}
            </Alert>
          ) : null}

          <Stack spacing={1.5}>
            <Typography variant='h6' component='h2'>
              Elige un servicio
            </Typography>
            <ListaServicios
              servicios={servicios}
              servicioSeleccionadoId={servicioId}
              onSeleccionar={(id) => {
                setServicioId(id)
                setSlotSeleccionado(null)
                setMensajeError(null)
              }}
            />
          </Stack>

          {servicioSeleccionado ? (
            <SelectorFecha
              fecha={fecha}
              fechaMinima={fechaMinima}
              onCambiarFecha={(nuevaFecha) => {
                setFecha(nuevaFecha)
                setSlotSeleccionado(null)
                setMensajeError(null)
              }}
            />
          ) : null}

          {servicioSeleccionado && fecha ? (
            <ListaSlots
              slots={slots}
              slotSeleccionado={slotSeleccionado}
              cargando={cargandoSlots}
              onSeleccionar={(slot) => {
                setSlotSeleccionado(slot)
                setMensajeError(null)
              }}
            />
          ) : null}

          {slotSeleccionado ? (
            <FormularioCliente
              clienteNombre={clienteNombre}
              clienteTelefono={clienteTelefono}
              clienteCorreo={clienteCorreo}
              enviando={enviando}
              onCambiarNombre={setClienteNombre}
              onCambiarTelefono={setClienteTelefono}
              onCambiarCorreo={setClienteCorreo}
              onConfirmar={() => {
                void handleConfirmar()
              }}
              titulo='Datos del cliente'
              textoBoton='Crear cita'
              textoBotonCargando='Creando...'
              helperCorreo='Opcional. Se envía la confirmación por correo si lo indicas.'
            />
          ) : null}
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
