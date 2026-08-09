'use client'

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import dayjs, { type Dayjs } from 'dayjs'
import 'dayjs/locale/es'

type SelectorHoraProps = {
  label: string
  valor: string
  onChange: (hora: string) => void
}

const estilosSelector = {
  desktopPaper: {
    sx: {
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: '0 8px 24px rgba(28, 28, 26, 0.08)',
      '& .MuiMultiSectionDigitalClockSection-item.Mui-selected': {
        bgcolor: 'primary.main',
        color: 'common.white',
        '&:hover': {
          bgcolor: 'primary.dark'
        },
        '&:focus': {
          bgcolor: 'primary.main'
        }
      }
    }
  },
  mobilePaper: {
    sx: {
      borderRadius: 3
    }
  },
  actionBar: {
    actions: ['accept', 'cancel'] as ('accept' | 'cancel')[]
  }
}

const parsearHora = (hora: string): Dayjs | null => {
  const valor = dayjs(`2000-01-01T${hora}`)
  return valor.isValid() ? valor : null
}

export const SelectorHora = ({
  label,
  valor,
  onChange
}: SelectorHoraProps) => {
  const handleChange = (nuevaHora: Dayjs | null) => {
    if (!nuevaHora || !nuevaHora.isValid()) {
      return
    }

    onChange(nuevaHora.format('HH:mm'))
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='es'>
      <TimePicker
        label={label}
        value={parsearHora(valor)}
        onAccept={handleChange}
        closeOnSelect={false}
        ampm
        minutesStep={15}
        format='h:mm A'
        slots={{
          openPickerIcon: AccessTimeOutlinedIcon
        }}
        slotProps={{
          textField: {
            fullWidth: true
          },
          ...estilosSelector
        }}
        localeText={{
          cancelButtonLabel: 'Cancelar',
          okButtonLabel: 'Aceptar',
          clearButtonLabel: 'Borrar'
        }}
      />
    </LocalizationProvider>
  )
}
