'use client'

import Link from 'next/link'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'

const pasos = [
  {
    titulo: 'Crea tu cuenta',
    descripcion:
      'Registra tu negocio en minutos y configura tu perfil público de reservas.'
  },
  {
    titulo: 'Define servicios y horarios',
    descripcion:
      'Agrega precios, duración y la disponibilidad de cada día de la semana.'
  },
  {
    titulo: 'Recibe citas',
    descripcion:
      'Tus clientes reservan online y tú gestionas todo desde el panel.'
  }
] as const

const beneficios = [
  {
    icono: CalendarMonthOutlinedIcon,
    titulo: 'Agenda clara',
    descripcion:
      'Consulta, confirma o cancela citas desde un panel pensado para el día a día del negocio.'
  },
  {
    icono: ScheduleOutlinedIcon,
    titulo: 'Horarios a tu medida',
    descripcion:
      'Controla bloques de atención y evita solapamientos al recibir reservas.'
  },
  {
    icono: NotificationsActiveOutlinedIcon,
    titulo: 'Avisos a clientes',
    descripcion:
      'Envía confirmaciones y recordatorios por WhatsApp y correo para reducir inasistencias.'
  },
  {
    icono: StorefrontOutlinedIcon,
    titulo: 'Página de reservas',
    descripcion:
      'Comparte un enlace público para que tus clientes elijan servicio, fecha y hora.'
  }
] as const

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
          minHeight: { xs: 'auto', sm: 'calc(100vh - 64px)' }
        }}
      >
        <Stack spacing={4} alignItems='center' textAlign='center' width='100%'>
          <Stack spacing={1.5} alignItems='center'>
            <Typography variant='h2' component='h1' color='primary'>
              Kortao
            </Typography>
            <Typography variant='h6' component='p' color='text.secondary'>
              Reservas online para barberías, salones y negocios de belleza.
            </Typography>
            <Typography color='text.secondary'>
              Configura tus servicios, comparte tu enlace y empieza a recibir
              citas en minutos.
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

      <Box
        component='section'
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          py: { xs: 6, sm: 8 }
        }}
      >
        <Container maxWidth='md'>
          <Stack spacing={4}>
            <Stack spacing={1} textAlign='center'>
              <Typography variant='h4' component='h2' color='primary'>
                Cómo funciona
              </Typography>
              <Typography color='text.secondary'>
                Tres pasos para digitalizar la agenda de tu negocio.
              </Typography>
            </Stack>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              useFlexGap
            >
              {pasos.map((paso, indice) => (
                <Stack key={paso.titulo} spacing={1} flex={1}>
                  <Typography
                    variant='overline'
                    color='secondary'
                    fontWeight={700}
                  >
                    Paso {indice + 1}
                  </Typography>
                  <Typography variant='h6' component='h3' fontWeight={700}>
                    {paso.titulo}
                  </Typography>
                  <Typography color='text.secondary'>
                    {paso.descripcion}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box
        component='section'
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          py: { xs: 6, sm: 8 }
        }}
      >
        <Container maxWidth='md'>
          <Stack spacing={4}>
            <Stack spacing={1} textAlign='center'>
              <Typography variant='h4' component='h2' color='primary'>
                Todo lo que necesitas para recibir citas
              </Typography>
              <Typography color='text.secondary'>
                Pensado para barberías, salones, spas y negocios basados en
                agenda.
              </Typography>
            </Stack>

            <Stack
              direction='row'
              flexWrap='wrap'
              useFlexGap
              spacing={3}
              justifyContent='center'
            >
              {beneficios.map((beneficio) => {
                const Icono = beneficio.icono

                return (
                  <Stack
                    key={beneficio.titulo}
                    spacing={1}
                    sx={{ flex: '1 1 240px', maxWidth: 320 }}
                  >
                    <Icono color='primary' />
                    <Typography variant='h6' component='h3' fontWeight={700}>
                      {beneficio.titulo}
                    </Typography>
                    <Typography color='text.secondary'>
                      {beneficio.descripcion}
                    </Typography>
                  </Stack>
                )
              })}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box
        component='section'
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'primary.dark',
          color: 'common.white',
          py: { xs: 6, sm: 8 }
        }}
      >
        <Container maxWidth='sm'>
          <Stack spacing={3} alignItems='center' textAlign='center'>
            <Typography variant='h4' component='h2' color='inherit'>
              Empieza a recibir reservas hoy
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>
              Crea tu cuenta gratis, configura tu negocio y comparte tu enlace
              de reservas con tus clientes.
            </Typography>
            <Button
              component={Link}
              href='/registro'
              variant='contained'
              color='secondary'
              size='large'
            >
              Crear cuenta
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
