import Link from 'next/link'
import SentimentDissatisfiedOutlinedIcon from '@mui/icons-material/SentimentDissatisfiedOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'

const NotFoundPage = () => {
  return (
    <Box component='main' bgcolor='background.default' minHeight='100vh'>
      <EncabezadoMarca />
      <Container maxWidth='sm' sx={{ py: { xs: 8, sm: 12 } }}>
        <Stack spacing={3} alignItems='center' textAlign='center'>
          <SentimentDissatisfiedOutlinedIcon
            color='primary'
            sx={{ fontSize: 56 }}
          />
          <Stack spacing={1}>
            <Typography variant='h3' component='h1' color='primary'>
              Página no encontrada
            </Typography>
            <Typography color='text.secondary'>
              El enlace no existe o ya no está disponible. Vuelve al inicio para
              continuar.
            </Typography>
          </Stack>
          <Button
            component={Link}
            href='/'
            variant='contained'
            color='secondary'
            size='large'
          >
            Volver al inicio
          </Button>
        </Stack>
      </Container>
    </Box>
  )
}

export default NotFoundPage
