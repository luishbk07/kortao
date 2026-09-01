'use client'

import Link from 'next/link'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

export const SeccionCtaFinal = () => {
  return (
    <Box
      component='section'
      sx={{
        py: { xs: 6, sm: 8 },
        bgcolor: 'primary.dark',
        color: 'common.white'
      }}
    >
      <Container maxWidth='md'>
        <Stack
          spacing={3}
          maxWidth={560}
          width='100%'
          sx={{ mx: 'auto' }}
        >
          <Typography
            variant='h4'
            component='h2'
            fontWeight={700}
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.85rem' },
              lineHeight: 1.25
            }}
          >
            Pon tu agenda en orden esta semana
          </Typography>
          <Typography
            sx={{
              lineHeight: 1.65,
              opacity: 0.9
            }}
          >
            Crea tu cuenta, configura servicios y horarios, y empieza a
            recibir reservas por tu enlace. Si ya tienes negocio en Kortao,
            inicia sesión y sigue donde lo dejaste.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ pt: 0.5 }}
          >
            <Button
              component={Link}
              href='/registro'
              variant='contained'
              color='secondary'
              size='large'
              sx={{ py: 1.35, px: 3 }}
            >
              Crear cuenta gratis
            </Button>
            <Button
              component={Link}
              href='/login'
              variant='outlined'
              size='large'
              sx={{
                py: 1.35,
                px: 3,
                color: 'common.white',
                borderColor: (tema) => alpha(tema.palette.common.white, 0.45),
                '&:hover': {
                  borderColor: 'common.white',
                  bgcolor: (tema) => alpha(tema.palette.common.white, 0.08)
                }
              }}
            >
              Iniciar sesión
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
