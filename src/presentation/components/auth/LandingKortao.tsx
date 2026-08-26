'use client'

import Link from 'next/link'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'

const caracteristicas = [
  {
    icono: LinkOutlinedIcon,
    texto: 'Reservas online con un enlace que compartes con tus clientes'
  },
  {
    icono: NotificationsActiveOutlinedIcon,
    texto: 'Recordatorios automáticos por WhatsApp y correo'
  },
  {
    icono: CalendarMonthOutlinedIcon,
    texto: 'Panel simple para ver y gestionar las citas del día'
  },
  {
    icono: CheckCircleOutlineIcon,
    texto: 'Horarios y servicios configurados a tu medida'
  }
] as const

export const LandingKortao = () => {
  return (
    <Box component='main' bgcolor='background.default' minHeight='100vh'>
      <EncabezadoMarca />

      <Container
        maxWidth='sm'
        sx={{
          py: { xs: 6, sm: 10 }
        }}
      >
        <Stack spacing={4} width='100%'>
          <Stack spacing={2} textAlign='center' alignItems='center'>
            <Typography variant='h2' component='h1' color='primary'>
              Kortao
            </Typography>
            <Typography variant='h5' component='h2' fontWeight={600}>
              Deja de coordinar citas por WhatsApp a mano
            </Typography>
            <Typography color='text.secondary'>
              Entre mensajes, capturas de pantalla y agendas en papel, es fácil
              perder una reserva o chocar dos clientes a la misma hora. Kortao
              organiza las citas de tu negocio en un solo lugar: tú defines
              servicios y horarios, tus clientes reservan por un enlace, y
              ambos reciben avisos automáticos.
            </Typography>
          </Stack>

          <Stack spacing={1.5} component='ul' sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {caracteristicas.map((item) => {
              const Icono = item.icono

              return (
                <Stack
                  key={item.texto}
                  component='li'
                  direction='row'
                  spacing={1.5}
                  alignItems='flex-start'
                >
                  <Icono color='primary' sx={{ mt: 0.25, flexShrink: 0 }} />
                  <Typography color='text.primary'>{item.texto}</Typography>
                </Stack>
              )
            })}
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
