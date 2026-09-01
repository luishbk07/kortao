import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { FilaComparacionPlan } from './filasComparacionPlanes'
import { ListaComparacionPlan } from './ListaComparacionPlan'

type TarjetaComparacionPlanProps = {
  titulo: string
  precio: string
  filas: FilaComparacionPlan[]
  destacado?: boolean
  chipActual?: boolean
  accion?: ReactNode
}

export const TarjetaComparacionPlan = ({
  titulo,
  precio,
  filas,
  destacado = false,
  chipActual = false,
  accion
}: TarjetaComparacionPlanProps) => {
  return (
    <Box
      sx={{
        flex: '1 1 260px',
        minWidth: 0,
        border: '1px solid',
        borderColor: destacado ? 'primary.main' : 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        px: { xs: 2.5, sm: 3 },
        py: { xs: 2.5, sm: 3 },
        boxShadow: (tema) =>
          destacado
            ? `0 0 0 1px ${alpha(tema.palette.primary.main, 0.12)}`
            : 'none',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack spacing={2} flex={1}>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          spacing={1}
        >
          <Typography variant='h6' component='h3' fontWeight={700}>
            {titulo}
          </Typography>
          {chipActual ? (
            <Chip size='small' color='primary' label='Actual' />
          ) : null}
        </Stack>
        <Typography
          variant={destacado ? 'h5' : 'subtitle1'}
          color={destacado ? 'primary' : 'text.secondary'}
          fontWeight={700}
        >
          {precio}
        </Typography>
        <ListaComparacionPlan filas={filas} />
        {accion ? <Box sx={{ pt: 1, mt: 'auto' }}>{accion}</Box> : null}
      </Stack>
    </Box>
  )
}
