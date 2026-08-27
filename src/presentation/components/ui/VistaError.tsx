'use client'

import Link from 'next/link'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'

type VistaErrorProps = {
  error: Error & { digest?: string }
  onReintentar: () => void
  mostrarVolverInicio?: boolean
}

export const VistaError = ({
  error,
  onReintentar,
  mostrarVolverInicio = false
}: VistaErrorProps) => {
  const esDesarrollo = process.env.NODE_ENV === 'development'

  return (
    <Box component='main' bgcolor='background.default' minHeight='100vh'>
      <EncabezadoMarca />
      <Container maxWidth='sm' sx={{ py: { xs: 8, sm: 12 } }}>
        <Paper
          variant='outlined'
          sx={{
            borderRadius: 3,
            px: { xs: 3, sm: 4 },
            py: { xs: 4, sm: 5 },
            bgcolor: 'background.paper'
          }}
        >
          <Stack spacing={3} alignItems='center' textAlign='center'>
            <ErrorOutlineOutlinedIcon color='error' sx={{ fontSize: 56 }} />
            <Stack spacing={1}>
              <Typography variant='h4' component='h1' color='primary'>
                Algo salió mal
              </Typography>
              <Typography color='text.secondary'>
                Algo salió mal. Intenta de nuevo.
              </Typography>
              {esDesarrollo && error.message ? (
                <Typography
                  variant='body2'
                  color='error'
                  sx={{
                    mt: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    textAlign: 'left'
                  }}
                >
                  {error.message}
                </Typography>
              ) : null}
            </Stack>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              width='100%'
              justifyContent='center'
            >
              <Button
                variant='contained'
                color='secondary'
                size='large'
                onClick={onReintentar}
              >
                Reintentar
              </Button>
              {mostrarVolverInicio ? (
                <Button
                  component={Link}
                  href='/'
                  variant='outlined'
                  color='primary'
                  size='large'
                >
                  Volver al inicio
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
