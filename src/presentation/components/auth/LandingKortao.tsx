'use client'

import Link from 'next/link'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'

export const LandingKortao = () => {
  return (
    <Box component='main' bgcolor='background.default' minHeight='100vh'>
      <EncabezadoMarca />
      <Container
        maxWidth='sm'
        sx={{
          py: { xs: 8, sm: 12 },
          display: 'flex',
          alignItems: 'center',
          minHeight: { xs: 'calc(100vh - 64px)', sm: 'calc(100vh - 64px)' }
        }}
      >
        <Stack spacing={4} alignItems='center' textAlign='center' width='100%'>
          <Stack spacing={1.5} alignItems='center'>
            <Typography variant='h2' component='h1' color='primary'>
              Kortao
            </Typography>
            <Typography variant='h6' component='p' color='text.secondary'>
              Reservas simples para barberías, salones, entre otros.
            </Typography>
            <Typography color='text.secondary'>
              Crea tu cuenta, configura tus servicios y empieza a recibir citas
              en minutos.
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            width='100%'
            justifyContent='center'
          >
            <Button
              component={Link}
              href='/login'
              variant='outlined'
              color='primary'
              size='large'
              sx={{ minWidth: { sm: 180 } }}
            >
              Iniciar sesión
            </Button>
            <Button
              component={Link}
              href='/registro'
              variant='contained'
              color='secondary'
              size='large'
              sx={{ minWidth: { sm: 180 } }}
            >
              Crear cuenta
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
