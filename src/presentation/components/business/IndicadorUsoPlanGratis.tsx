'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { LIMITE_CITAS_FUTURAS_PLAN_GRATIS } from '@/shared/utils/planes'

type IndicadorUsoPlanGratisProps = {
  citasActivas: number
}

const obtenerColorBarra = (citasActivas: number): string => {
  if (citasActivas >= LIMITE_CITAS_FUTURAS_PLAN_GRATIS) {
    return 'error.main'
  }

  if (citasActivas >= 10) {
    return 'secondary.main'
  }

  return 'success.main'
}

export const IndicadorUsoPlanGratis = ({
  citasActivas
}: IndicadorUsoPlanGratisProps) => {
  const anclaRef = useRef<HTMLButtonElement | null>(null)
  const [popoverAbierto, setPopoverAbierto] = useState(false)
  const limiteAlcanzado = citasActivas >= LIMITE_CITAS_FUTURAS_PLAN_GRATIS
  const porcentaje = Math.min(
    100,
    (citasActivas / LIMITE_CITAS_FUTURAS_PLAN_GRATIS) * 100
  )
  const colorBarra = obtenerColorBarra(citasActivas)
  const etiqueta = `${citasActivas}/${LIMITE_CITAS_FUTURAS_PLAN_GRATIS} citas activas`

  return (
    <Stack spacing={0.75} sx={{ width: '100%', maxWidth: 360 }}>
      <Stack direction='row' alignItems='center' spacing={0.5}>
        <Typography variant='body2' color='text.secondary'>
          {limiteAlcanzado
            ? etiqueta
            : `${etiqueta} en tu plan gratis`}
        </Typography>
        <IconButton
          ref={anclaRef}
          size='small'
          color='primary'
          aria-label='Más información sobre el límite del plan gratis'
          aria-haspopup='true'
          aria-expanded={popoverAbierto}
          onClick={() => setPopoverAbierto(true)}
          sx={{ p: 0.25 }}
        >
          <InfoOutlinedIcon fontSize='small' />
        </IconButton>
      </Stack>

      <Box sx={{ width: '100%' }}>
        <LinearProgress
          variant='determinate'
          value={porcentaje}
          aria-label={etiqueta}
          sx={{
            height: 8,
            borderRadius: 999,
            bgcolor: 'divider',
            '& .MuiLinearProgress-bar': {
              borderRadius: 999,
              bgcolor: colorBarra
            }
          }}
        />
      </Box>

      {limiteAlcanzado ? (
        <Typography variant='body2' color='error.main'>
          Alcanzaste el límite del plan gratis —{' '}
          <Typography
            component={Link}
            href='/panel/plan'
            variant='body2'
            color='secondary.main'
            sx={{ fontWeight: 600, textDecoration: 'underline' }}
          >
            actualiza a Premium
          </Typography>{' '}
          para citas ilimitadas
        </Typography>
      ) : null}

      <Popover
        open={popoverAbierto}
        anchorEl={anclaRef.current}
        onClose={() => setPopoverAbierto(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              maxWidth: 300,
              borderRadius: 3
            }
          }
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant='body2' color='text.secondary'>
            En el plan gratis puedes tener hasta{' '}
            {LIMITE_CITAS_FUTURAS_PLAN_GRATIS} citas activas a la vez. Si
            necesitas superar ese límite, actualiza a Premium para citas
            ilimitadas.
          </Typography>
          <Button
            component={Link}
            href='/panel/plan'
            variant='contained'
            color='secondary'
            size='small'
            onClick={() => setPopoverAbierto(false)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Ver plan
          </Button>
        </Stack>
      </Popover>
    </Stack>
  )
}
