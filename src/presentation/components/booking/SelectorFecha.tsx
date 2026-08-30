'use client'

import { useState } from 'react'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs, { type Dayjs } from 'dayjs'
import 'dayjs/locale/es'

type SelectorFechaProps = {
  fecha: string
  fechaMinima: string
  onCambiarFecha: (fecha: string) => void
}

const estilosCalendario = {
  desktopPaper: {
    sx: {
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: '0 8px 24px rgba(28, 28, 26, 0.08)'
    }
  },
  mobilePaper: {
    sx: {
      borderRadius: 3
    }
  },
  day: {
    sx: {
      borderRadius: 2,
      fontWeight: 500,
      '&.Mui-selected': {
        bgcolor: 'primary.main',
        color: 'common.white',
        '&:hover': {
          bgcolor: 'primary.dark'
        },
        '&:focus': {
          bgcolor: 'primary.main'
        }
      },
      '&.MuiPickersDay-today': {
        borderColor: 'primary.light'
      }
    }
  },
  actionBar: {
    actions: [] as []
  }
}

export const SelectorFecha = ({
  fecha,
  fechaMinima,
  onCambiarFecha
}: SelectorFechaProps) => {
  const [abierto, setAbierto] = useState(false)

  const handleChange = (nuevaFecha: Dayjs | null) => {
    if (!nuevaFecha || !nuevaFecha.isValid()) {
      return
    }

    onCambiarFecha(nuevaFecha.format('YYYY-MM-DD'))
    setAbierto(false)
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction='row' spacing={1} alignItems='center'>
        <CalendarMonthOutlinedIcon color='primary' />
        <Typography variant='h6' component='h2'>
          Elige una fecha
        </Typography>
      </Stack>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='es'>
        <DatePicker
          label='Fecha'
          value={dayjs(fecha)}
          minDate={dayjs(fechaMinima)}
          open={abierto}
          onOpen={() => setAbierto(true)}
          onClose={() => setAbierto(false)}
          onChange={handleChange}
          closeOnSelect
          format='DD/MM/YYYY'
          slots={{
            openPickerIcon: CalendarMonthOutlinedIcon
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              onClick: () => setAbierto(true)
            },
            ...estilosCalendario
          }}
          localeText={{
            todayButtonLabel: 'Hoy',
            cancelButtonLabel: 'Cancelar',
            clearButtonLabel: 'Borrar',
            okButtonLabel: 'Aceptar'
          }}
        />
      </LocalizationProvider>
    </Stack>
  )
}
