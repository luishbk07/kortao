'use client'

import { useState, type FormEvent } from 'react'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { crearActualizarContrasena } from '@/application/useCases/auth/actualizarContrasena'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'

const LONGITUD_MINIMA = 6

export const FormularioCambiarContrasena = () => {
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

    setEnviando(true)
    setError(null)
    setMensaje(null)

    try {
      const { authService } = crearDependenciasPanelNavegador()
      const actualizarContrasena = crearActualizarContrasena(authService)
      await actualizarContrasena(password)
      setPassword('')
      setConfirmacion('')
      setMensaje('Contraseña actualizada.')
    } catch {
      setError('No se pudo actualizar la contraseña. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant='h6' component='h2' color='primary'>
          Cambiar contraseña
        </Typography>
        <Typography color='text.secondary'>
          Actualiza la contraseña de tu cuenta. No hace falta escribir la actual.
        </Typography>
      </Stack>

      {mensaje ? (
        <Alert severity='success' onClose={() => setMensaje(null)}>
          {mensaje}
        </Alert>
      ) : null}

      {error ? (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
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
          startIcon={<LockOutlinedIcon />}
          disabled={enviando}
          sx={{ alignSelf: { sm: 'flex-start' } }}
        >
          {enviando ? 'Guardando...' : 'Cambiar contraseña'}
        </Button>
      </Stack>
    </Stack>
  )
}
