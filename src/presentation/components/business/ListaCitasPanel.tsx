'use client'

import { useState } from 'react'
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { crearCancelarReserva } from '@/application/useCases/booking/cancelarReserva'
import type { Booking, EstadoCita } from '@/domain/booking/booking.types'
import { bookingRepositorySupabase } from '@/infrastructure/supabase/bookingRepository.supabase'

type ListaCitasPanelProps = {
  citas: Booking[]
  permitirCancelar: boolean
  mostrarFecha: boolean
  mensajeVacio: string
  onCitaCancelada: () => void
}

const etiquetasEstado: Record<EstadoCita, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada'
}

const colorEstado = (
  estado: EstadoCita
): 'default' | 'success' | 'warning' | 'error' => {
  if (estado === 'confirmada' || estado === 'completada') {
    return 'success'
  }

  if (estado === 'cancelada') {
    return 'error'
  }

  return 'warning'
}

const formatearHora = (fecha: Date): string => {
  return fecha.toLocaleTimeString('es-DO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const formatearFecha = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-DO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

export const ListaCitasPanel = ({
  citas,
  permitirCancelar,
  mostrarFecha,
  mensajeVacio,
  onCitaCancelada
}: ListaCitasPanelProps) => {
  const [cancelandoId, setCancelandoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCancelar = async (citaId: string) => {
    setCancelandoId(citaId)
    setError(null)

    try {
      const cancelarReserva = crearCancelarReserva(bookingRepositorySupabase)
      await cancelarReserva(citaId)
      onCitaCancelada()
    } catch {
      setError('No se pudo cancelar la cita. Inténtalo de nuevo.')
    } finally {
      setCancelandoId(null)
    }
  }

  if (citas.length === 0) {
    return (
      <Typography color='text.secondary'>
        {mensajeVacio}
      </Typography>
    )
  }

  return (
    <Stack spacing={2}>
      {error ? (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {citas.map((cita) => {
        const puedeCancelar =
          permitirCancelar && cita.estado !== 'cancelada'

        return (
          <Card key={cita.id} variant='outlined'>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack
                  direction='row'
                  justifyContent='space-between'
                  alignItems='flex-start'
                  spacing={1}
                >
                  <Stack spacing={0.5}>
                    <Typography variant='h6' component='h3'>
                      {mostrarFecha
                        ? `${formatearFecha(cita.fechaHora)} · ${formatearHora(cita.fechaHora)}`
                        : formatearHora(cita.fechaHora)}
                    </Typography>
                    <Typography color='text.secondary'>
                      {cita.servicioNombre} · {cita.duracionMinutos} min
                    </Typography>
                  </Stack>
                  <Chip
                    size='small'
                    label={etiquetasEstado[cita.estado]}
                    color={colorEstado(cita.estado)}
                  />
                </Stack>
                <Stack direction='row' spacing={0.75} alignItems='center'>
                  <PersonOutlineOutlinedIcon fontSize='small' color='action' />
                  <Typography>
                    {cita.clienteNombre} · {cita.clienteTelefono}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
            {puedeCancelar ? (
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  color='error'
                  startIcon={<EventBusyOutlinedIcon />}
                  disabled={cancelandoId === cita.id}
                  onClick={() => {
                    void handleCancelar(cita.id)
                  }}
                >
                  {cancelandoId === cita.id ? 'Cancelando...' : 'Cancelar cita'}
                </Button>
              </CardActions>
            ) : null}
          </Card>
        )
      })}
    </Stack>
  )
}
