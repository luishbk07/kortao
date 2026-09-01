'use client'

import Link from 'next/link'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TarjetaComparacionPlan } from '@/presentation/components/planes/TarjetaComparacionPlan'
import {
  FILAS_PLAN_ESTANDAR,
  FILAS_PLAN_PREMIUM
} from '@/presentation/components/planes/filasComparacionPlanes'
import {
  formatearPrecioMensual,
  PRECIO_LISTA_PLAN_PREMIUM
} from '@/shared/utils/planes'

export const SeccionPlanesLanding = () => {
  const precioPremium = formatearPrecioMensual(PRECIO_LISTA_PLAN_PREMIUM)

  return (
    <Container
      component='section'
      maxWidth='md'
      sx={{
        py: { xs: 6, sm: 8 },
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={4}>
        <Stack spacing={1.5} maxWidth={560}>
          <Typography
            variant='overline'
            color='secondary'
            fontWeight={700}
            letterSpacing={1}
          >
            Planes
          </Typography>
          <Typography
            variant='h4'
            component='h2'
            color='primary'
            fontWeight={700}
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.85rem' },
              lineHeight: 1.25
            }}
          >
            Empieza gratis y crece cuando lo necesites
          </Typography>
          <Typography color='text.secondary' sx={{ lineHeight: 1.65 }}>
            El plan Estándar te deja probar Kortao sin compromiso. Cuando tu
            agenda crezca, Premium quita límites y desbloquea herramientas
            avanzadas.
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems='stretch'
        >
          <TarjetaComparacionPlan
            titulo='Estándar'
            precio='Gratis'
            filas={FILAS_PLAN_ESTANDAR}
            accion={
              <Button
                component={Link}
                href='/registro'
                variant='outlined'
                color='primary'
                fullWidth
              >
                Crear cuenta
              </Button>
            }
          />
          <TarjetaComparacionPlan
            titulo='Premium'
            precio={precioPremium}
            filas={FILAS_PLAN_PREMIUM}
            destacado
            accion={
              <Button
                component={Link}
                href='/registro'
                variant='contained'
                color='secondary'
                fullWidth
              >
                Crear cuenta
              </Button>
            }
          />
        </Stack>
      </Stack>
    </Container>
  )
}
