'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { registrarEmpleadoConCodigoAction } from '@/app/(negocio)/panel/empleados/actions'
import { CamposIdentidadUsuario } from '@/presentation/components/auth/CamposIdentidadUsuario'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'
import { crearClienteNavegador } from '@/infrastructure/supabase/clienteNavegador'
import {
  esIdentidadUsuarioValida,
  type DatosIdentidadUsuario
} from '@/domain/business/identidadUsuario.types'
import {
  guardarCodigoInvitacionPendiente,
  limpiarCodigoInvitacionPendiente
} from '@/shared/utils/codigoInvitacionPendiente'

type FormularioUnirseProps = {
  codigoInicial: string
  yaAutenticado: boolean
}

const identidadVacia: DatosIdentidadUsuario = {
  nombre: '',
  tipoDocumento: 'cedula',
  numeroDocumento: '',
  telefono: ''
}

export const FormularioUnirse = ({
  codigoInicial,
  yaAutenticado
}: FormularioUnirseProps) => {
  const router = useRouter()
  const [codigo, setCodigo] = useState(codigoInicial)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [identidad, setIdentidad] = useState(identidadVacia)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [correoEnviado, setCorreoEnviado] = useState(false)

  const formularioValido =
    codigo.trim().length >= 6 &&
    esIdentidadUsuarioValida(identidad) &&
    (yaAutenticado ||
      (email.trim().length > 3 && password.length >= 6))

  const unirseConSesion = async () => {
    const codigoNormalizado = codigo.trim().toUpperCase()
    await registrarEmpleadoConCodigoAction(codigoNormalizado, identidad)
    limpiarCodigoInvitacionPendiente()
    router.replace('/panel/citas')
    router.refresh()
  }

  const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()

    if (!formularioValido) {
      setError('Completa todos los datos obligatorios.')
      return
    }

    setEnviando(true)
    setError(null)

    const codigoNormalizado = codigo.trim().toUpperCase()
    guardarCodigoInvitacionPendiente(codigoNormalizado)

    try {
      if (yaAutenticado) {
        await unirseConSesion()
        return
      }

      const supabase = crearClienteNavegador()
      const { data, error: errorSignup } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nombre: identidad.nombre.trim(),
            tipoDocumento: identidad.tipoDocumento,
            numeroDocumento: identidad.numeroDocumento,
            telefono: identidad.telefono
          }
        }
      })

      if (errorSignup) {
        throw errorSignup
      }

      if (!data.session) {
        setCorreoEnviado(true)
        return
      }

      await unirseConSesion()
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message.toLowerCase() : ''

      if (mensaje.includes('already registered')) {
        setError('Ese correo ya está registrado. Inicia sesión e inténtalo de nuevo.')
      } else if (
        mensaje.includes('código') ||
        mensaje.includes('codigo') ||
        mensaje.includes('inválido') ||
        mensaje.includes('invalido') ||
        mensaje.includes('utilizado')
      ) {
        setError(
          'El código de invitación no es válido o ya fue utilizado.'
        )
      } else if (
        mensaje.includes('ya está vinculado') ||
        mensaje.includes('ya pertenece')
      ) {
        setError('Tu cuenta ya está vinculada a un negocio.')
      } else if (
        mensaje.includes('cédula') ||
        mensaje.includes('cedula') ||
        mensaje.includes('rnc') ||
        mensaje.includes('pasaporte') ||
        mensaje.includes('nombre') ||
        mensaje.includes('teléfono') ||
        mensaje.includes('telefono') ||
        mensaje.includes('documento')
      ) {
        setError(err instanceof Error ? err.message : 'Revisa tus datos personales.')
      } else {
        setError('No se pudo completar el registro. Inténtalo de nuevo.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Box component='main' bgcolor='background.default' minHeight='100vh'>
      <EncabezadoMarca />
      <Container maxWidth='xs' sx={{ py: { xs: 5, sm: 8 } }}>
        <Stack spacing={3}>
          <Stack spacing={1} alignItems='center'>
            <GroupAddOutlinedIcon color='primary' fontSize='large' />
            <Typography variant='h4' component='h1' color='primary'>
              Unirse al equipo
            </Typography>
            <Typography color='text.secondary' textAlign='center'>
              Crea tu cuenta con el código de invitación y tus datos personales.
            </Typography>
          </Stack>

          {correoEnviado ? (
            <Stack spacing={2} alignItems='center'>
              <MarkEmailReadOutlinedIcon
                color='primary'
                sx={{ fontSize: 48 }}
              />
              <Alert severity='success' icon={false} sx={{ width: '100%' }}>
                Revisa tu correo y confirma tu cuenta. Luego inicia sesión e
                introduce de nuevo el código de invitación en esta página.
              </Alert>
              <Button
                component={Link}
                href='/login'
                color='secondary'
                variant='contained'
              >
                Ir a iniciar sesión
              </Button>
            </Stack>
          ) : (
            <>
              {error ? <Alert severity='error'>{error}</Alert> : null}

              <Stack
                component='form'
                spacing={2}
                onSubmit={(evento) => {
                  void handleSubmit(evento)
                }}
              >
                <TextField
                  label='Código de invitación'
                  value={codigo}
                  onChange={(evento) =>
                    setCodigo(evento.target.value.toUpperCase())
                  }
                  inputProps={{ maxLength: 8 }}
                  fullWidth
                  required
                />
                <CamposIdentidadUsuario
                  valor={identidad}
                  onChange={setIdentidad}
                />
                {!yaAutenticado ? (
                  <>
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
                      autoComplete='new-password'
                      fullWidth
                      required
                      helperText='Mínimo 6 caracteres'
                    />
                  </>
                ) : (
                  <Alert severity='info'>
                    Ya tienes sesión iniciada. Completa tus datos y el código
                    para unirte.
                  </Alert>
                )}
                <Button
                  type='submit'
                  variant='contained'
                  color='secondary'
                  disabled={enviando || !formularioValido}
                  fullWidth
                >
                  {enviando ? 'Procesando...' : 'Unirme al negocio'}
                </Button>
              </Stack>

              <Typography variant='body2' color='text.secondary' textAlign='center'>
                ¿Ya tienes cuenta?{' '}
                <Typography
                  component={Link}
                  href='/login'
                  color='secondary'
                  sx={{ textDecoration: 'none', fontWeight: 600 }}
                >
                  Inicia sesión
                </Typography>
              </Typography>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  )
}
