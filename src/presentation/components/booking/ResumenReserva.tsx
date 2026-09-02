'use client'

import type { SvgIconComponent } from '@mui/icons-material'
import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type ResumenReservaProps = {
  servicioNombre: string
  precioFormateado: string
  fechaFormateada: string
  horaFormateada: string
  mostrarBoton?: boolean
  botonDeshabilitado?: boolean
  textoBoton?: string
  onConfirmar?: () => void
}

const FilaSimple = ({
  icono: Icono,
  etiqueta,
  valor
}: {
  icono: SvgIconComponent
  etiqueta: string
  valor: string
}) => {
  return (
    <Stack
      direction='row'
      alignItems='center'
      justifyContent='space-between'
      spacing={2}
    >
      <Stack direction='row' spacing={1} alignItems='center' minWidth={0}>
        <Icono fontSize='small' color='primary' />
        <Typography color='text.secondary'>{etiqueta}</Typography>
      </Stack>
      <Typography
        color='primary'
        fontWeight={700}
        textAlign='right'
        sx={{ opacity: 1 }}
      >
        {valor}
      </Typography>
    </Stack>
  )
}

export const ResumenReserva = ({
  servicioNombre,
  precioFormateado,
  fechaFormateada,
  horaFormateada,
  mostrarBoton = false,
  botonDeshabilitado = false,
  textoBoton = 'Confirmar reserva',
  onConfirmar
}: ResumenReservaProps) => {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        px: { xs: 2, sm: 2.5 },
        py: { xs: 2, sm: 2.5 }
      }}
    >
      <Stack spacing={2}>
        <Typography variant='subtitle1' fontWeight={700} color='primary'>
          Resumen de reserva
        </Typography>
        <Stack spacing={1.5}>
          <Stack
            direction='row'
            alignItems='flex-start'
            justifyContent='space-between'
            spacing={2}
          >
            <Stack direction='row' spacing={1} alignItems='flex-start' minWidth={0}>
              <ContentCutOutlinedIcon fontSize='small' color='primary' />
              <Stack spacing={0.25} minWidth={0}>
                <Typography color='text.secondary'>Servicio</Typography>
                <Typography
                  variant='body2'
                  color='text.primary'
                  fontWeight={600}
                  sx={{ opacity: 1 }}
                >
                  {servicioNombre}
                </Typography>
              </Stack>
            </Stack>
            <Typography
              color='primary'
              fontWeight={700}
              textAlign='right'
              sx={{ opacity: 1 }}
            >
              {precioFormateado}
            </Typography>
          </Stack>
          <FilaSimple
            icono={EventOutlinedIcon}
            etiqueta='Fecha'
            valor={fechaFormateada}
          />
          <FilaSimple
            icono={ScheduleOutlinedIcon}
            etiqueta='Hora'
            valor={horaFormateada}
          />
        </Stack>
        {mostrarBoton && onConfirmar ? (
          <Button
            variant='contained'
            color='secondary'
            size='large'
            disabled={botonDeshabilitado}
            onClick={onConfirmar}
            fullWidth
          >
            {textoBoton}
          </Button>
        ) : null}
      </Stack>
    </Box>
  )
}
