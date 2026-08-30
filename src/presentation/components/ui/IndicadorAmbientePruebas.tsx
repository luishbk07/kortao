import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { esProduccion } from '@/shared/utils/entorno'

export const IndicadorAmbientePruebas = () => {
  if (esProduccion()) {
    return null
  }

  return (
    <Box
      component='aside'
      role='status'
      aria-live='polite'
      sx={{
        width: '100%',
        bgcolor: 'warning.main',
        color: 'warning.contrastText',
        py: 0.5,
        px: 2,
        textAlign: 'center'
      }}
    >
      <Typography
        variant='caption'
        component='p'
        sx={{
          m: 0,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          lineHeight: 1.4
        }}
      >
        Ambiente de pruebas
      </Typography>
    </Box>
  )
}
