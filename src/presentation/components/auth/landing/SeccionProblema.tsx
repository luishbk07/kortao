'use client'

import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export const SeccionProblema = () => {
  return (
    <Container
      component='section'
      maxWidth='md'
      sx={{ py: { xs: 6, sm: 8 } }}
    >
      <Stack spacing={2} maxWidth={640}>
        <Typography
          variant='overline'
          color='secondary'
          fontWeight={700}
          letterSpacing={1}
        >
          El problema
        </Typography>
        <Typography
          variant='h4'
          component='h2'
          color='primary'
          fontWeight={700}
          sx={{ fontSize: { xs: '1.5rem', sm: '1.85rem' }, lineHeight: 1.25 }}
        >
          Coordinar citas a mano se vuelve un caos
        </Typography>
        <Typography color='text.secondary' sx={{ lineHeight: 1.7 }}>
          Cuando la agenda vive en chats, notas y la memoria del equipo, es
          fácil confirmar dos clientes a la misma hora o perder una reserva
          entre mensajes. Cada recordatorio que tienes que escribir a mano es
          tiempo que no estás atendiendo a nadie.
        </Typography>
        <Typography color='text.secondary' sx={{ lineHeight: 1.7 }}>
          Y cuando alguien no aparece, casi nunca fue por mala fe: muchas
          veces simplemente se le olvidó. Sin un sistema claro, el día se
          llena de huecos y de idas y vueltas por WhatsApp.
        </Typography>
      </Stack>
    </Container>
  )
}
