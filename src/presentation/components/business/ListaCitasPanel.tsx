'use client'

import { useState } from 'react'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  cancelarCitaAction,
  marcarAtendidaAction
} from '@/app/(negocio)/panel/citas/actions'
import type { Booking, EstadoCita } from '@/domain/booking/booking.types'
import { esCitaYaOcurrida } from '@/domain/booking/cita.rules'
import {
  formatearFechaLegible,
  formatearHoraLegible
} from '@/shared/utils/fechas'
import {
  construirEnlaceWhatsapp,
  formatearTelefonoVisual
} from '@/shared/utils/telefono'

type ListaCitasPanelProps = {
  citas: Booking[]
  permitirCancelar: boolean
  permitirMarcarAtendida: boolean
  mostrarFecha: boolean
  mensajeVacio: string
  onCitaActualizada: () => void
}

type AccionEnCurso = {
  citaId: string
  tipo: 'atendida' | 'cancelar'
}

const etiquetasEstado: Record<EstadoCita, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Atendida'
}

const colorEstado = (
  estado: EstadoCita
): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
  if (estado === 'completada') {
    return 'primary'
  }

  if (estado === 'confirmada') {
    return 'success'
  }

  if (estado === 'cancelada') {
    return 'error'
  }

  return 'warning'
}

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(precio)
}

export const ListaCitasPanel = ({
  citas,
  permitirCancelar,
  permitirMarcarAtendida,
  mostrarFecha,
  mensajeVacio,
  onCitaActualizada
}: ListaCitasPanelProps) => {
  const [accionEnCurso, setAccionEnCurso] = useState<AccionEnCurso | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCancelar = async (citaId: string) => {
    setAccionEnCurso({ citaId, tipo: 'cancelar' })
    setError(null)

    try {
      await cancelarCitaAction(citaId)
      onCitaActualizada()
    } catch {
      setError('No se pudo cancelar la cita. Inténtalo de nuevo.')
    } finally {
      setAccionEnCurso(null)
    }
  }

  const handleMarcarAtendida = async (citaId: string) => {
    setAccionEnCurso({ citaId, tipo: 'atendida' })
    setError(null)

    try {
      await marcarAtendidaAction(citaId)
      onCitaActualizada()
    } catch {
      setError('No se pudo marcar la cita como atendida. Inténtalo de nuevo.')
    } finally {
      setAccionEnCurso(null)
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
          permitirCancelar &&
          cita.estado !== 'cancelada' &&
          cita.estado !== 'completada'
        const puedeMarcarAtendida =
          permitirMarcarAtendida &&
          (cita.estado === 'pendiente' || cita.estado === 'confirmada') &&
          esCitaYaOcurrida(cita.fechaHora)
        const ocupada = accionEnCurso?.citaId === cita.id
        const marcandoAtendida =
          ocupada && accionEnCurso?.tipo === 'atendida'
        const cancelando = ocupada && accionEnCurso?.tipo === 'cancelar'

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
                        ? `${formatearFechaLegible(cita.fechaHora, false)} · ${formatearHoraLegible(cita.fechaHora)}`
                        : formatearHoraLegible(cita.fechaHora)}
                    </Typography>
                    <Typography color='text.secondary'>
                      {cita.servicioNombre} · {cita.duracionMinutos} min
                      {cita.precio !== null
                        ? ` · ${formatearPrecio(cita.precio)}`
                        : ''}
                    </Typography>
                  </Stack>
                  <Chip
                    size='small'
                    label={etiquetasEstado[cita.estado]}
                    color={colorEstado(cita.estado)}
                  />
                </Stack>
                <Stack
                  direction='row'
                  spacing={0.75}
                  alignItems='flex-start'
                  flexWrap='wrap'
                >
                  <PersonOutlineOutlinedIcon
                    fontSize='small'
                    color='action'
                    sx={{ mt: 0.25 }}
                  />
                  <Typography component='span'>
                    {cita.clienteNombre}
                    {' · '}
                    <Link
                      href={construirEnlaceWhatsapp(cita.clienteTelefono)}
                      target='_blank'
                      rel='noopener noreferrer'
                      underline='hover'
                    >
                      {formatearTelefonoVisual(cita.clienteTelefono) ||
                        cita.clienteTelefono}
                    </Link>
                    {cita.clienteCorreo ? (
                      <>
                        {' · '}
                        <Link
                          href={`mailto:${cita.clienteCorreo}`}
                          underline='hover'
                        >
                          {cita.clienteCorreo}
                        </Link>
                      </>
                    ) : null}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
            {puedeCancelar || puedeMarcarAtendida ? (
              <CardActions sx={{ px: 2, pb: 2, flexWrap: 'wrap', gap: 1 }}>
                {puedeMarcarAtendida ? (
                  <Button
                    color='secondary'
                    startIcon={<CheckCircleOutlineIcon />}
                    disabled={ocupada}
                    onClick={() => {
                      void handleMarcarAtendida(cita.id)
                    }}
                  >
                    {marcandoAtendida
                      ? 'Marcando...'
                      : 'Marcar como atendida'}
                  </Button>
                ) : null}
                {puedeCancelar ? (
                  <Button
                    color='error'
                    startIcon={<EventBusyOutlinedIcon />}
                    disabled={ocupada}
                    onClick={() => {
                      void handleCancelar(cita.id)
                    }}
                  >
                    {cancelando ? 'Cancelando...' : 'Cancelar cita'}
                  </Button>
                ) : null}
              </CardActions>
            ) : null}
          </Card>
        )
      })}
    </Stack>
  )
}
