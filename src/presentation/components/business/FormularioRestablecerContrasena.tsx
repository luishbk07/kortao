'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { crearActualizarContrasena } from '@/application/useCases/auth/actualizarContrasena'
import { crearClienteNavegador } from '@/infrastructure/supabase/clienteNavegador'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'

const LONGITUD_MINIMA = 6

export const FormularioRestablecerContrasena = () => {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [sesionLista, setSesionLista] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = crearClienteNavegador()

    const sincronizarSesion = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (session) {
        setSesionLista(true)
      }
    }

    void sincronizarSesion()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((evento, session) => {
      if (evento === 'PASSWORD_RECOVERY' || session) {
        setSesionLista(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const formularioValido =
    password.length >= LONGITUD_MINIMA && password === confirmacion

  const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()

    if (!formularioValido) {
      if (password.length < LONGITUD_MINIMA) {
        setError(`La contraseña debe tener al menos ${LONGITUD_MINIMA} caracteres.`)
        return
      }

      setError('Las contraseñas no coinciden.')
      return
    }

    if (!sesionLista) {
      setError(
        'El enlace no es válido o ya expiró. Solicita uno nuevo desde iniciar sesión.'
      )
      return
    }

    setEnviando(true)
    setError(null)

    try {
      const { authService } = crearDependenciasPanelNavegador()
      const actualizarContrasena = crearActualizarContrasena(authService)
      await actualizarContrasena(password)
      router.replace('/panel/citas')
      router.refresh()
    } catch {
      setError('No se pudo actualizar la contraseña. Inténtalo de nuevo.')
      setEnviando(false)
    }
  }

  return (
    <Box component='main' bgcolor='background.default' minHeight='100vh'>
      <EncabezadoMarca />
      <Container maxWidth='xs' sx={{ py: { xs: 5, sm: 8 } }}>
        <Stack spacing={3}>
          <Stack spacing={1} alignItems='center'>
            <LockResetOutlinedIcon color='primary' fontSize='large' />
            <Typography variant='h4' component='h1' color='primary'>
              Nueva contraseña
            </Typography>
            <Typography color='text.secondary' textAlign='center'>
              Elige una contraseña nueva para tu cuenta.
            </Typography>
          </Stack>

          {error ? <Alert severity='error'>{error}</Alert> : null}

          {!sesionLista ? (
            <Alert severity='info'>
              Validando el enlace de restablecimiento...
            </Alert>
          ) : null}

          <Stack
            component='form'
            spacing={2}
            onSubmit={(evento) => {
              void handleSubmit(evento)
            }}
          >
            <TextField
              label='Nueva contraseña'
              type='password'
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
              autoComplete='new-password'
              fullWidth
              required
              helperText={`Mínimo ${LONGITUD_MINIMA} caracteres`}
            />
            <TextField
              label='Confirmar contraseña'
              type='password'
              value={confirmacion}
              onChange={(evento) => setConfirmacion(evento.target.value)}
              autoComplete='new-password'
              fullWidth
              required
            />
            <Button
              type='submit'
              variant='contained'
              color='secondary'
              size='large'
              disabled={enviando || !sesionLista}
              fullWidth
            >
              {enviando ? 'Guardando...' : 'Guardar contraseña'}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
