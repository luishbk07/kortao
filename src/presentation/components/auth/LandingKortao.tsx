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
import { keyframes } from '@mui/system'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'
import { LogoKortao } from '@/presentation/components/ui/LogoKortao'

const aparecer = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

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

const animacion = (retrasoMs: number) => ({
  opacity: 0,
  animation: `${aparecer} 0.55s ease forwards`,
  animationDelay: `${retrasoMs}ms`
})

export const LandingKortao = () => {
  return (
    <Box
      component='main'
      minHeight='100vh'
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.default',
        backgroundImage: (tema) =>
          tema.palette.mode === 'dark'
            ? `radial-gradient(ellipse 90% 60% at 50% -10%, ${tema.palette.primary.dark}66 0%, transparent 55%),
               radial-gradient(ellipse 50% 40% at 100% 80%, ${tema.palette.secondary.main}18 0%, transparent 50%),
               radial-gradient(ellipse 40% 35% at 0% 70%, ${tema.palette.primary.main}14 0%, transparent 45%)`
            : `radial-gradient(ellipse 90% 55% at 50% -5%, ${tema.palette.primary.light}22 0%, transparent 55%),
               radial-gradient(ellipse 45% 40% at 100% 85%, ${tema.palette.secondary.main}14 0%, transparent 50%),
               radial-gradient(ellipse 40% 35% at 0% 75%, ${tema.palette.primary.main}10 0%, transparent 45%)`
      }}
    >
      <EncabezadoMarca />

      <Container
        maxWidth='sm'
        sx={{
          position: 'relative',
          py: { xs: 6, sm: 10 },
          display: 'flex',
          alignItems: 'center',
          minHeight: { sm: 'calc(100vh - 64px)' }
        }}
      >
        <Stack
          spacing={{ xs: 4, sm: 5 }}
          width='100%'
          alignItems='center'
          textAlign='center'
        >
          <Stack spacing={2.5} alignItems='center' sx={animacion(60)}>
            <Box
              sx={{
                display: { xs: 'none', sm: 'block' },
                mb: 0.5
              }}
            >
              <LogoKortao variant='icon' size={56} />
            </Box>
            <Typography
              variant='h2'
              component='h1'
              color='primary'
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.02em',
                fontSize: { xs: '2.75rem', sm: '3.5rem' },
                lineHeight: 1.1
              }}
            >
              Kortao
            </Typography>
            <Typography
              variant='h5'
              component='h2'
              sx={{
                fontWeight: 600,
                maxWidth: 440,
                lineHeight: 1.35,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              Deja de coordinar citas por WhatsApp a mano
            </Typography>
            <Typography
              color='text.secondary'
              sx={{
                maxWidth: 480,
                lineHeight: 1.65,
                fontSize: { xs: '0.95rem', sm: '1rem' }
              }}
            >
              Entre mensajes, capturas y agendas en papel es fácil perder una
              reserva o chocar dos clientes a la misma hora. Kortao organiza
              todo en un solo lugar: tú defines servicios y horarios, tus
              clientes reservan por un enlace y ambos reciben avisos
              automáticos.
            </Typography>
          </Stack>

          <Stack
            spacing={2}
            component='ul'
            alignItems='stretch'
            sx={{
              listStyle: 'none',
              m: 0,
              p: 0,
              width: '100%',
              maxWidth: 440,
              ...animacion(180)
            }}
          >
            {caracteristicas.map((item) => {
              const Icono = item.icono

              return (
                <Stack
                  key={item.texto}
                  component='li'
                  direction='row'
                  spacing={1.75}
                  alignItems='center'
                  textAlign='left'
                  sx={{
                    px: { xs: 1.5, sm: 2 },
                    py: 1.25,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (tema) =>
                      tema.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(255,255,255,0.55)',
                    backdropFilter: 'blur(8px)',
                    transition: 'border-color 160ms ease, transform 160ms ease',
                    '&:hover': {
                      borderColor: 'primary.light',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText'
                    }}
                  >
                    <Icono fontSize='small' />
                  </Box>
                  <Typography
                    color='text.primary'
                    sx={{ fontWeight: 500, lineHeight: 1.4 }}
                  >
                    {item.texto}
                  </Typography>
                </Stack>
              )
            })}
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            width='100%'
            maxWidth={440}
            justifyContent='center'
            sx={animacion(300)}
          >
            <Button
              component={Link}
              href='/login'
              variant='outlined'
              color='primary'
              size='large'
              fullWidth
              sx={{
                py: 1.35,
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                '&:hover': {
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Iniciar sesión
            </Button>
            <Button
              component={Link}
              href='/registro'
              variant='contained'
              color='secondary'
              size='large'
              fullWidth
              sx={{
                py: 1.35,
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 20px rgba(193, 105, 58, 0.28)'
                }
              }}
            >
              Crear cuenta
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
