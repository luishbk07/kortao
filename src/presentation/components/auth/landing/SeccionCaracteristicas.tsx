'use client'

import type { SvgIconComponent } from '@mui/icons-material'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined'
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

type Caracteristica = {
  icono: SvgIconComponent
  titulo: string
  descripcion: string
}

const CARACTERISTICAS: Caracteristica[] = [
  {
    icono: ScheduleOutlinedIcon,
    titulo: 'Reservas online 24/7',
    descripcion:
      'Tus clientes agendan cuando les conviene, aunque el local esté cerrado.'
  },
  {
    icono: NotificationsActiveOutlinedIcon,
    titulo: 'Recordatorios por WhatsApp y correo',
    descripcion:
      'Confirmaciones y avisos automáticos para reducir ausencias sin escribir uno a uno.'
  },
  {
    icono: CalendarMonthOutlinedIcon,
    titulo: 'Panel de citas simple',
    descripcion:
      'Hoy, próximas y pasadas en una vista clara, pensada para usarla en el día a día.'
  },
  {
    icono: QrCode2OutlinedIcon,
    titulo: 'Código QR para el local',
    descripcion:
      'Un QR en la recepción o el escaparate lleva directo a tu página de reservas.'
  },
  {
    icono: LocalOfferOutlinedIcon,
    titulo: 'Promociones en tus servicios',
    descripcion:
      'Descuentos por monto o porcentaje visibles al reservar, sin inventar precios a mano.'
  },
  {
    icono: PeopleOutlineOutlinedIcon,
    titulo: 'Clientes recurrentes',
    descripcion:
      'Identifica quién vuelve seguido y contacta fácil a quienes más te visitan.'
  }
]

export const SeccionCaracteristicas = () => {
  return (
    <Container
      component='section'
      maxWidth='md'
      sx={{ py: { xs: 6, sm: 8 } }}
    >
      <Stack spacing={4} width='100%'>
        <Stack spacing={1.5} maxWidth={560} width='100%' sx={{ mx: 'auto' }}>
          <Typography
            variant='overline'
            color='secondary'
            fontWeight={700}
            letterSpacing={1}
          >
            Qué incluye
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
            Herramientas pensadas para el ritmo de un salón, barbería o cualquier tipo de negocio que necesite una agenda.
          </Typography>
          <Typography color='text.secondary' sx={{ lineHeight: 1.65 }}>
            Nada de paneles eternos ni funciones que no vas a usar. Kortao se
            centra en lo que importa: que la agenda fluya y el cliente llegue a
            tiempo.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr'
            },
            gap: 2,
            width: '100%',
            maxWidth: 720,
            mx: 'auto'
          }}
        >
          {CARACTERISTICAS.map((item) => {
            const Icono = item.icono

            return (
              <Box
                key={item.titulo}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  p: 2.5,
                  transition: 'border-color 160ms ease, transform 160ms ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: (tema) =>
                        alpha(tema.palette.primary.main, 0.1),
                      color: 'primary.main'
                    }}
                  >
                    <Icono fontSize='small' />
                  </Box>
                  <Typography fontWeight={700}>{item.titulo}</Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ lineHeight: 1.6 }}
                  >
                    {item.descripcion}
                  </Typography>
                </Stack>
              </Box>
            )
          })}
        </Box>
      </Stack>
    </Container>
  )
}
