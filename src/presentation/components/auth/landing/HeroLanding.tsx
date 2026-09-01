'use client'

import Link from 'next/link'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { keyframes } from '@mui/system'
import { EnlaceAyudaCrearCuenta } from '@/presentation/components/auth/EnlaceAyudaCrearCuenta'

const aparecer = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

type HeroLandingProps = {
  telefonoSoporte?: string | null
}

export const HeroLanding = ({ telefonoSoporte = null }: HeroLandingProps) => {
  return (
    <Box
      component='section'
      sx={{
        py: { xs: 6, sm: 10 },
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth='md'>
        <Stack
          spacing={3}
          maxWidth={640}
          sx={{
            opacity: 0,
            animation: `${aparecer} 0.55s ease forwards`
          }}
        >
          <Typography
            variant='h3'
            component='h1'
            color='primary'
            fontWeight={700}
            sx={{
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.85rem', sm: '2.5rem', md: '2.85rem' },
              lineHeight: 1.15
            }}
          >
            Deja de cuadrar citas por WhatsApp a mano
          </Typography>
          <Typography
            color='text.secondary'
            sx={{
              fontSize: { xs: '1rem', sm: '1.125rem' },
              lineHeight: 1.65,
              maxWidth: 560
            }}
          >
            Kortao es la agenda online para barberías y salones: tus clientes
            reservan solos y tú ves todo ordenado en un solo panel.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ pt: 0.5 }}
          >
            <Button
              component={Link}
              href='/login'
              variant='outlined'
              color='primary'
              size='large'
              sx={{ py: 1.35, px: 3 }}
            >
              Iniciar sesión
            </Button>
            <Button
              component={Link}
              href='/registro'
              variant='contained'
              color='secondary'
              size='large'
              sx={{ py: 1.35, px: 3 }}
            >
              Crear cuenta
            </Button>
          </Stack>
          <Box sx={{ pt: 0.5 }}>
            <EnlaceAyudaCrearCuenta
              telefonoSoporte={telefonoSoporte}
              alinear='left'
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
