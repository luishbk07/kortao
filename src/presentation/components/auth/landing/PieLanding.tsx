'use client'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { EnlaceAyudaCrearCuenta } from '@/presentation/components/auth/EnlaceAyudaCrearCuenta'

type PieLandingProps = {
  telefonoSoporte?: string | null
}

export const PieLanding = ({ telefonoSoporte = null }: PieLandingProps) => {
  const anio = new Date().getFullYear()

  return (
    <Box
      component='footer'
      sx={{
        py: 4,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth='md'>
        <Stack spacing={2} alignItems='center' textAlign='center'>
          <Typography variant='body2' color='text.secondary'>
            Kortao — agenda y reservas para tu negocio en República Dominicana
          </Typography>
          <EnlaceAyudaCrearCuenta telefonoSoporte={telefonoSoporte} />
          <Typography variant='caption' color='text.secondary'>
            © {anio} Kortao
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
