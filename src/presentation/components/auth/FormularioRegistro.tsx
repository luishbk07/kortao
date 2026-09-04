'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { crearAfiliadosRepository } from '@/infrastructure/supabase/afiliadosRepository.supabase'
import { crearClienteNavegador } from '@/infrastructure/supabase/clienteNavegador'
import { CamposIdentidadUsuario } from '@/presentation/components/auth/CamposIdentidadUsuario'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'
import { normalizarCodigoAfiliado } from '@/shared/utils/afiliado'
import {
  esIdentidadUsuarioValida,
  type DatosIdentidadUsuario
} from '@/domain/business/identidadUsuario.types'
import {
  esTelefonoCompleto,
  formatearTelefonoVisual,
  normalizarTelefonoValor
} from '@/shared/utils/telefono'

const identidadVacia: DatosIdentidadUsuario = {
  nombre: '',
  tipoDocumento: 'cedula',
  numeroDocumento: '',
  telefono: ''
}

export const FormularioRegistro = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState('')
  const [direccion, setDireccion] = useState('')
  const [identidad, setIdentidad] = useState(identidadVacia)
  const [codigoAfiliado, setCodigoAfiliado] = useState('')
  const [errorCodigoAfiliado, setErrorCodigoAfiliado] = useState<string | null>(
    null
  )
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [correoEnviado, setCorreoEnviado] = useState(false)

  const formularioValido =
    email.trim().length > 3 &&
    password.length >= 6 &&
    nombreNegocio.trim().length > 1 &&
    esTelefonoCompleto(telefonoWhatsapp) &&
    esIdentidadUsuarioValida(identidad)

  const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()

    if (!formularioValido) {
      return
    }

    setEnviando(true)
    setError(null)
    setErrorCodigoAfiliado(null)

    try {
      const supabase = crearClienteNavegador()
      let afiliadoId: string | undefined

      const codigoIngresado = normalizarCodigoAfiliado(codigoAfiliado)

      if (codigoIngresado.length > 0) {
        const afiliadosRepository = crearAfiliadosRepository(supabase)

        try {
          const afiliado =
            await afiliadosRepository.buscarActivoPorCodigo(codigoIngresado)

          if (afiliado) {
            afiliadoId = afiliado.id
          } else {
            setErrorCodigoAfiliado('Código no válido')
          }
        } catch {
          setErrorCodigoAfiliado('Código no válido')
        }
      }

      const { data, error: errorSignup } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nombreNegocio: nombreNegocio.trim(),
            telefonoWhatsapp,
            direccion: direccion.trim(),
            nombre: identidad.nombre.trim(),
            tipoDocumento: identidad.tipoDocumento,
            numeroDocumento: identidad.numeroDocumento,
            telefono: identidad.telefono,
            ...(afiliadoId ? { afiliadoId } : {})
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

      router.replace('/panel/onboarding')
      router.refresh()
    } catch (err) {
      console.error(err)

      const mensaje =
        err instanceof Error
          ? err.message
          : 'No se pudo crear la cuenta. Inténtalo de nuevo.'

      if (mensaje.toLowerCase().includes('already registered')) {
        setError('Ese correo ya está registrado. Inicia sesión.')
      } else {
        setError('No se pudo crear la cuenta. Inténtalo de nuevo.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Box component='main' bgcolor='background.default' minHeight='100vh'>
      <EncabezadoMarca />
      <Container maxWidth='xs' sx={{ py: { xs: 4, sm: 6 } }}>
        <Stack spacing={3} data-nosnippet=''>
          <Stack spacing={1} alignItems='center'>
            <PersonAddAltOutlinedIcon color='primary' fontSize='large' />
            <Typography variant='h4' component='h1' color='primary'>
              Crear cuenta
            </Typography>
            <Typography color='text.secondary' textAlign='center'>
              Registra tu negocio en Kortao y empieza a recibir reservas online.
            </Typography>
          </Stack>

          {correoEnviado ? (
            <Stack spacing={2} alignItems='center'>
              <MarkEmailReadOutlinedIcon
                color='primary'
                sx={{ fontSize: 48 }}
              />
              <Alert severity='success' icon={false} sx={{ width: '100%' }}>
                Revisa tu correo y confirma tu cuenta para continuar. Cuando
                confirmes, inicia sesión y termina de configurar tu negocio.
              </Alert>
              {errorCodigoAfiliado ? (
                <Alert severity='warning' sx={{ width: '100%' }}>
                  {errorCodigoAfiliado}. Tu cuenta se creó sin código de
                  afiliado.
                </Alert>
              ) : null}
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
                  helperText='Mínimo 6 caracteres'
                  fullWidth
                  required
                />
                <Typography variant='subtitle2' color='text.secondary'>
                  Datos del dueño
                </Typography>
                <CamposIdentidadUsuario
                  valor={identidad}
                  onChange={setIdentidad}
                  etiquetaNombre='Nombre completo del dueño'
                  etiquetaTelefono='Teléfono del dueño'
                />
                <Typography variant='subtitle2' color='text.secondary'>
                  Datos del negocio
                </Typography>
                <TextField
                  label='Nombre del negocio'
                  value={nombreNegocio}
                  onChange={(evento) => setNombreNegocio(evento.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label='Teléfono WhatsApp'
                  value={formatearTelefonoVisual(telefonoWhatsapp)}
                  onChange={(evento) =>
                    setTelefonoWhatsapp(
                      normalizarTelefonoValor(evento.target.value)
                    )
                  }
                  placeholder='+1(809) 000-0000'
                  inputProps={{ inputMode: 'tel', maxLength: 16 }}
                  fullWidth
                  required
                />
                <TextField
                  label='Dirección'
                  value={direccion}
                  onChange={(evento) => setDireccion(evento.target.value)}
                  fullWidth
                />
                <TextField
                  label='Código de afiliado (opcional)'
                  value={codigoAfiliado}
                  onChange={(evento) => {
                    setErrorCodigoAfiliado(null)
                    setCodigoAfiliado(
                      normalizarCodigoAfiliado(evento.target.value)
                    )
                  }}
                  error={Boolean(errorCodigoAfiliado)}
                  helperText={errorCodigoAfiliado ?? undefined}
                  fullWidth
                />
                <Button
                  type='submit'
                  variant='contained'
                  color='secondary'
                  size='large'
                  disabled={!formularioValido || enviando}
                  fullWidth
                >
                  {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              </Stack>

              <Typography textAlign='center' color='text.secondary'>
                <Button
                  component={Link}
                  href='/login'
                  color='primary'
                  sx={{ textTransform: 'none' }}
                >
                  Ya tengo cuenta, iniciar sesión
                </Button>
              </Typography>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  )
}
