'use client'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const PASOS = [
  {
    numero: '1',
    titulo: 'Comparte tu enlace',
    descripcion:
      'Configuras servicios y horarios una vez. Luego envías tu link de reservas a clientes, lo publicas en Instagram o lo pegas en tu WhatsApp.'
  },
  {
    numero: '2',
    titulo: 'El cliente reserva solo',
    descripcion:
      'Elige servicio, día y hora disponibles. Tú no tienes que responder mensajes para acomodar cada cita.'
  },
  {
    numero: '3',
    titulo: 'Recordatorios automáticos',
    descripcion:
      'Confirmación y recordatorios salen por WhatsApp y correo, para que haya menos ausencias y menos llamadas de seguimiento.'
  },
  {
    numero: '4',
    titulo: 'Tú ves todo en el panel',
    descripcion:
      'El día queda claro: citas de hoy, próximas y pasadas, en un panel pensado para usarlo desde el celular en el local.'
  }
] as const

export const SeccionComoFunciona = () => {
  return (
    <Box
      component='section'
      sx={{
        py: { xs: 6, sm: 8 },
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth='md'>
        <Stack spacing={4}>
          <Stack spacing={1.5} maxWidth={560}>
            <Typography
              variant='overline'
              color='secondary'
              fontWeight={700}
              letterSpacing={1}
            >
              Cómo funciona
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
              De tu enlace a la cita confirmada, en cuatro pasos
            </Typography>
          </Stack>

          <Stack spacing={2.5}>
            {PASOS.map((paso) => (
              <Stack
                key={paso.numero}
                direction='row'
                spacing={2}
                alignItems='flex-start'
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
                    color: 'primary.contrastText',
                    typography: 'subtitle1',
                    fontWeight: 700
                  }}
                >
                  {paso.numero}
                </Box>
                <Stack spacing={0.5} pt={0.25}>
                  <Typography fontWeight={700} color='text.primary'>
                    {paso.titulo}
                  </Typography>
                  <Typography
                    color='text.secondary'
                    sx={{ lineHeight: 1.65 }}
                  >
                    {paso.descripcion}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
