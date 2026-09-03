'use client'

import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
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
  const [citaCobroPendiente, setCitaCobroPendiente] = useState<Booking | null>(
    null
  )
  const [precioCobrado, setPrecioCobrado] = useState('')
  const [errorCobro, setErrorCobro] = useState<string | null>(null)

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

  const confirmarMarcarAtendida = async (
    citaId: string,
    precioFinal?: number
  ) => {
    setAccionEnCurso({ citaId, tipo: 'atendida' })
    setError(null)

    try {
      await marcarAtendidaAction(citaId, precioFinal)
      setCitaCobroPendiente(null)
      setPrecioCobrado('')
      setErrorCobro(null)
      onCitaActualizada()
    } catch {
      setError('No se pudo marcar la cita como atendida. Inténtalo de nuevo.')
    } finally {
      setAccionEnCurso(null)
    }
  }

  const handleSolicitarMarcarAtendida = (cita: Booking) => {
    if (cita.precio === null) {
      setCitaCobroPendiente(cita)
      setPrecioCobrado('')
      setErrorCobro(null)
      return
    }

    void confirmarMarcarAtendida(cita.id)
  }

  const handleConfirmarCobro = () => {
    if (!citaCobroPendiente) {
      return
    }

    const valor = Number(precioCobrado)

    if (!Number.isFinite(valor) || valor < 0 || precioCobrado.trim() === '') {
      setErrorCobro('Indica el monto cobrado.')
      return
    }

    void confirmarMarcarAtendida(citaCobroPendiente.id, valor)
  }

  const cerrarDialogoCobro = () => {
    if (accionEnCurso?.tipo === 'atendida') {
      return
    }

    setCitaCobroPendiente(null)
    setPrecioCobrado('')
    setErrorCobro(null)
  }

  if (citas.length === 0) {
    return (
      <Typography color='text.secondary'>
        {mensajeVacio}
      </Typography>
    )
  }

  const marcandoCobro =
    citaCobroPendiente !== null &&
    accionEnCurso?.citaId === citaCobroPendiente.id &&
    accionEnCurso.tipo === 'atendida'

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
                  const encontrada = citas.find((item) => item.id === citaId)
                  if (!encontrada) {
                    return
                  }
                  handleSolicitarMarcarAtendida(encontrada)
                }}
              />
            ))}
          </Stack>
        </Stack>
      ))}

      <Dialog
        open={citaCobroPendiente !== null}
        onClose={cerrarDialogoCobro}
        fullWidth
        maxWidth='xs'
      >
        <DialogTitle>¿Cuánto se cobró por este servicio?</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {citaCobroPendiente ? (
              <Typography color='text.secondary'>
                {citaCobroPendiente.servicioNombre} ·{' '}
                {citaCobroPendiente.clienteNombre}
              </Typography>
            ) : null}
            <TextField
              label='Monto cobrado (RD$)'
              type='number'
              value={precioCobrado}
              onChange={(evento) => {
                setPrecioCobrado(evento.target.value)
                setErrorCobro(null)
              }}
              inputProps={{ min: 0, step: 50 }}
              error={Boolean(errorCobro)}
              helperText={errorCobro ?? 'Requerido para marcar la cita como atendida'}
              fullWidth
              autoFocus
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrarDialogoCobro} disabled={marcandoCobro}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            color='secondary'
            onClick={handleConfirmarCobro}
            disabled={marcandoCobro}
          >
            {marcandoCobro ? 'Guardando...' : 'Marcar como atendida'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
