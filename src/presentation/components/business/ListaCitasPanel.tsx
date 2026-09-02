'use client'

import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  cancelarCitaAction,
  marcarAtendidaAction
} from '@/app/(negocio)/panel/citas/actions'
import type { Booking } from '@/domain/booking/booking.types'
import { agruparPorMomentoDia } from '@/shared/utils/momentosDia'
import { TarjetaCitaPanel } from './TarjetaCitaPanel'

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

  const grupos = useMemo(
    () => agruparPorMomentoDia(citas, (cita) => cita.fechaHora),
    [citas]
  )

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
    <Stack spacing={2.5}>
      {error ? (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {grupos.map((grupo) => (
        <Stack key={grupo.momento} spacing={1.5}>
          <Typography
            variant='subtitle2'
            color='text.secondary'
            fontWeight={600}
          >
            {grupo.etiqueta}
          </Typography>
          <Stack spacing={2}>
            {grupo.items.map((cita) => (
              <TarjetaCitaPanel
                key={cita.id}
                cita={cita}
                permitirCancelar={permitirCancelar}
                permitirMarcarAtendida={permitirMarcarAtendida}
                mostrarFecha={mostrarFecha}
                accionEnCurso={accionEnCurso}
                onCancelar={(citaId) => {
                  void handleCancelar(citaId)
                }}
                onMarcarAtendida={(citaId) => {
                  void handleMarcarAtendida(citaId)
                }}
              />
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  )
}
