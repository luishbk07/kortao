'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { crearIniciarSesion } from '@/application/useCases/auth/iniciarSesion'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'

export const FormularioLogin = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)

    try {
      const { authService } = crearDependenciasPanelNavegador()
      const iniciarSesion = crearIniciarSesion(authService)
      await iniciarSesion(email, password)
      router.replace('/panel/citas')
      router.refresh()
    } catch {
      setError('Correo o contraseña incorrectos. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Box component='main' bgcolor='background.default' minHeight='100vh'>
      <Container maxWidth='xs' sx={{ py: { xs: 6, sm: 10 } }}>
        <Stack spacing={3}>
          <Stack spacing={1} alignItems='center'>
            <LockOutlinedIcon color='primary' fontSize='large' />
            <Typography variant='h4' component='h1' color='primary'>
              Panel del negocio
            </Typography>
            <Typography color='text.secondary' textAlign='center'>
              Inicia sesión para gestionar tus citas, servicios y horarios.
            </Typography>
          </Stack>

          {error ? <Alert severity='error'>{error}</Alert> : null}

          <Stack
            component='form'
            spacing={2}
            onSubmit={(evento) => {
              void handleSubmit(evento)
            }}
          >
            <TextField
              label='Correo electrónico'
              type='email'
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              autoComplete='email'
              fullWidth
              required
            />
            <TextField
              label='Contraseña'
              type='password'
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
              autoComplete='current-password'
              fullWidth
              required
            />
            <Button
              type='submit'
              variant='contained'
              color='secondary'
              size='large'
              disabled={enviando}
              fullWidth
            >
              {enviando ? 'Entrando...' : 'Entrar'}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
