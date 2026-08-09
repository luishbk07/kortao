'use client'

import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { TimeSlot } from '@/domain/booking/booking.types'

type ListaSlotsProps = {
  slots: TimeSlot[]
  slotSeleccionado: TimeSlot | null
  cargando: boolean
  onSeleccionar: (slot: TimeSlot) => void
}

const formatearHora = (fecha: Date): string => {
  return fecha.toLocaleTimeString('es-DO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const esMismoSlot = (a: TimeSlot, b: TimeSlot): boolean => {
  return a.inicio.getTime() === b.inicio.getTime()
}

export const ListaSlots = ({
  slots,
  slotSeleccionado,
  cargando,
  onSeleccionar
}: ListaSlotsProps) => {
  return (
    <Stack spacing={1.5}>
      <Stack direction='row' spacing={1} alignItems='center'>
        <ScheduleOutlinedIcon color='primary' />
        <Typography variant='h6' component='h2'>
          Horarios disponibles
        </Typography>
      </Stack>

      {cargando ? (
        <Stack alignItems='center' py={3}>
          <CircularProgress size={32} />
        </Stack>
      ) : slots.length === 0 ? (
        <Typography color='text.secondary'>
          No hay horarios disponibles para este día. Prueba con otra fecha.
        </Typography>
      ) : (
        <Stack direction='row' flexWrap='wrap' useFlexGap spacing={1}>
          {slots.map((slot) => {
            const seleccionado =
              slot.disponible && slotSeleccionado
                ? esMismoSlot(slot, slotSeleccionado)
                : false

            return (
              <Button
                key={slot.inicio.toISOString()}
                variant={seleccionado ? 'contained' : 'outlined'}
                color={seleccionado ? 'secondary' : 'primary'}
                disabled={!slot.disponible}
                onClick={() => onSeleccionar(slot)}
                sx={{
                  '&.Mui-disabled': {
                    opacity: 0.45,
                    borderColor: 'action.disabled',
                    color: 'text.disabled'
                  }
                }}
              >
                {formatearHora(slot.inicio)}
              </Button>
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}
