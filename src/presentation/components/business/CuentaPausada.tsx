import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'

const construirEnlaceSoporte = (): string | null => {
  const telefono = process.env.SOPORTE_WHATSAPP?.replace(/\D/g, '')

  if (!telefono) {
    return null
  }

  return `https://wa.me/${telefono}`
}

export const CuentaPausada = () => {
  const enlaceSoporte = construirEnlaceSoporte()

  return (
    <Box component='main' bgcolor='background.default' minHeight='100vh'>
      <EncabezadoMarca />
      <Container maxWidth='sm' sx={{ py: { xs: 8, sm: 12 } }}>
        <Stack spacing={3} alignItems='center' textAlign='center'>
          <PauseCircleOutlineOutlinedIcon
            color='primary'
            sx={{ fontSize: 56 }}
          />
          <Stack spacing={1}>
            <Typography variant='h3' component='h1' color='primary'>
              Cuenta en pausa
            </Typography>
            <Typography color='text.secondary'>
              Tu cuenta está pausada por falta de pago. Contáctanos por WhatsApp
              para reactivarla y seguir recibiendo reservas.
            </Typography>
          </Stack>
          {enlaceSoporte ? (
            <Button
              component='a'
              href={enlaceSoporte}
              target='_blank'
              rel='noopener noreferrer'
              variant='contained'
              color='secondary'
              size='large'
            >
              Contactar soporte
            </Button>
          ) : null}
        </Stack>
      </Container>
    </Box>
  )
}
