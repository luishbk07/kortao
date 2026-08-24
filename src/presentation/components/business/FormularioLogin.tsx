'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { crearIniciarSesion } from '@/application/useCases/auth/iniciarSesion'
import { crearSolicitarRestablecimientoContrasena } from '@/application/useCases/auth/solicitarRestablecimientoContrasena'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'

type VistaLogin = 'entrar' | 'olvidar'

const MENSAJE_ENLACE_ENVIADO =
  'Si el correo existe, te enviamos un enlace para restablecer tu contraseña.'

export const FormularioLogin = () => {
  const router = useRouter()
  const [vista, setVista] = useState<VistaLogin>('entrar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enlaceEnviado, setEnlaceEnviado] = useState(false)

  const handleSubmitLogin = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)

    try {
      const { authService } = crearDependenciasPanelNavegador()
      const iniciarSesion = crearIniciarSesion(authService)
      await iniciarSesion(email, password)
      router.replace('/')
      router.refresh()
    } catch {
      setError('Correo o contraseña incorrectos. Inténtalo de nuevo.')
      setEnviando(false)
    }
  }

  const handleSubmitOlvidar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)

    try {
      const { authService } = crearDependenciasPanelNavegador()
      const solicitarRestablecimiento =
        crearSolicitarRestablecimientoContrasena(authService)
      await solicitarRestablecimiento(email)
    } catch {
      // Mostramos el mismo mensaje genérico para no filtrar correos registrados.
    } finally {
      setEnlaceEnviado(true)
      setEnviando(false)
    }
  }

  const volverALogin = () => {
    setVista('entrar')
    setError(null)
    setEnlaceEnviado(false)
    setEnviando(false)
  }

  return (
    <Box component='main' bgcolor='background.default' minHeight='100vh'>
      <EncabezadoMarca />
      <Container maxWidth='xs' sx={{ py: { xs: 5, sm: 8 } }}>
        <Stack spacing={3}>
          {vista === 'entrar' ? (
            <>
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
                  void handleSubmitLogin(evento)
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
                <Box textAlign='right'>
                  <Button
                    type='button'
                    color='primary'
                    onClick={() => {
                      setVista('olvidar')
                      setError(null)
                      setEnlaceEnviado(false)
                    }}
                    sx={{ textTransform: 'none', px: 0 }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Button>
                </Box>
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

              <Typography textAlign='center' color='text.secondary'>
                <Button
                  component={Link}
                  href='/registro'
                  color='primary'
                  sx={{ textTransform: 'none' }}
                >
                  Crear cuenta
                </Button>
              </Typography>
            </>
          ) : (
            <>
              <Stack spacing={1} alignItems='center'>
                <LockOutlinedIcon color='primary' fontSize='large' />
                <Typography variant='h4' component='h1' color='primary'>
                  Restablecer contraseña
                </Typography>
                <Typography color='text.secondary' textAlign='center'>
                  Escribe el correo de tu cuenta y te enviaremos un enlace.
                </Typography>
              </Stack>

              {enlaceEnviado ? (
                <Stack spacing={2} alignItems='center'>
                  <MarkEmailReadOutlinedIcon
                    color='primary'
                    sx={{ fontSize: 48 }}
                  />
                  <Alert severity='success' icon={false} sx={{ width: '100%' }}>
                    {MENSAJE_ENLACE_ENVIADO}
                  </Alert>
                  <Button
                    type='button'
                    color='secondary'
                    variant='contained'
                    onClick={volverALogin}
                  >
                    Volver a iniciar sesión
                  </Button>
                </Stack>
              ) : (
                <>
                  {error ? <Alert severity='error'>{error}</Alert> : null}

                  <Stack
                    component='form'
                    spacing={2}
                    onSubmit={(evento) => {
                      void handleSubmitOlvidar(evento)
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
                    <Button
                      type='submit'
                      variant='contained'
                      color='secondary'
                      size='large'
                      disabled={enviando}
                      fullWidth
                    >
                      {enviando ? 'Enviando...' : 'Enviar enlace'}
                    </Button>
                    <Button
                      type='button'
                      color='primary'
                      onClick={volverALogin}
                      sx={{ textTransform: 'none' }}
                    >
                      Volver a iniciar sesión
                    </Button>
                  </Stack>
                </>
              )}
            </>
          )}
        </Stack>
      </Container>
    </Box>
  )
}
