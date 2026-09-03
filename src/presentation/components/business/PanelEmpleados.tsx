'use client'

import { useState } from 'react'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  generarInvitacionEmpleadoAction,
  quitarEmpleadoAction,
  revocarInvitacionEmpleadoAction
} from '@/app/(negocio)/panel/empleados/actions'
import type {
  EmpleadoNegocio,
  InvitacionEmpleado
} from '@/application/ports/empleadosRepository.port'
import { obtenerOrigenSitio } from '@/shared/utils/sitio'

type PanelEmpleadosProps = {
  negocioNombre: string
  empleadosIniciales: EmpleadoNegocio[]
  invitacionesIniciales: InvitacionEmpleado[]
}

const construirEnlaceUnirse = (codigo: string): string => {
  return `${obtenerOrigenSitio()}/unirse?codigo=${encodeURIComponent(codigo)}`
}

const construirWhatsappInvitacion = (
  negocioNombre: string,
  codigo: string
): string => {
  const enlace = construirEnlaceUnirse(codigo)
  const mensaje = encodeURIComponent(
    `Te invito a unirte a ${negocioNombre} en Kortao. Usa el código ${codigo} o abre este enlace: ${enlace}`
  )
  return `https://wa.me/?text=${mensaje}`
}

export const PanelEmpleados = ({
  negocioNombre,
  empleadosIniciales,
  invitacionesIniciales
}: PanelEmpleadosProps) => {
  const [empleados, setEmpleados] = useState(empleadosIniciales)
  const [invitaciones, setInvitaciones] = useState(invitacionesIniciales)
  const [codigoReciente, setCodigoReciente] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const handleGenerar = async () => {
    setOcupado(true)
    setError(null)
    setMensaje(null)

    try {
      const invitacion = await generarInvitacionEmpleadoAction()
      setInvitaciones((actuales) => [
        {
          id: invitacion.id,
          codigo: invitacion.codigo,
          creadoEn: new Date(invitacion.creadoEn)
        },
        ...actuales
      ])
      setCodigoReciente(invitacion.codigo)
      setMensaje('Código generado. Compártelo con tu empleado.')
    } catch {
      setError('No se pudo generar el código. Inténtalo de nuevo.')
    } finally {
      setOcupado(false)
    }
  }

  const handleCopiar = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo)
      setMensaje('Código copiado.')
      setError(null)
    } catch {
      setError('No se pudo copiar el código.')
    }
  }

  const handleRevocar = async (invitacionId: string) => {
    setOcupado(true)
    setError(null)
    setMensaje(null)

    try {
      await revocarInvitacionEmpleadoAction(invitacionId)
      setInvitaciones((actuales) =>
        actuales.filter((item) => item.id !== invitacionId)
      )
      setMensaje('Invitación revocada.')
    } catch {
      setError('No se pudo revocar la invitación.')
    } finally {
      setOcupado(false)
    }
  }

  const handleQuitar = async (membresiaId: string) => {
    setOcupado(true)
    setError(null)
    setMensaje(null)

    try {
      await quitarEmpleadoAction(membresiaId)
      setEmpleados((actuales) =>
        actuales.filter((item) => item.id !== membresiaId)
      )
      setMensaje('Empleado eliminado del negocio.')
    } catch {
      setError('No se pudo quitar al empleado.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant='h5' component='h1' color='primary'>
          Empleados
        </Typography>
        <Typography color='text.secondary'>
          Invita a tu equipo para que gestionen las citas del negocio.
        </Typography>
      </Stack>

      {error ? (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}
      {mensaje ? (
        <Alert severity='success' onClose={() => setMensaje(null)}>
          {mensaje}
        </Alert>
      ) : null}

      <Card variant='outlined'>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='h6' component='h2'>
              Invitaciones
            </Typography>
            <Button
              variant='contained'
              color='secondary'
              startIcon={<PersonAddAltOutlinedIcon />}
              disabled={ocupado}
              onClick={() => {
                void handleGenerar()
              }}
              sx={{ alignSelf: 'flex-start' }}
            >
              Generar código de invitación
            </Button>

            {codigoReciente ? (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <Typography
                  variant='h6'
                  component='p'
                  sx={{ letterSpacing: 2, fontFamily: 'monospace' }}
                >
                  {codigoReciente}
                </Typography>
                <Button
                  size='small'
                  startIcon={<ContentCopyOutlinedIcon />}
                  onClick={() => {
                    void handleCopiar(codigoReciente)
                  }}
                >
                  Copiar
                </Button>
                <Button
                  size='small'
                  color='success'
                  startIcon={<WhatsAppIcon />}
                  component='a'
                  href={construirWhatsappInvitacion(
                    negocioNombre,
                    codigoReciente
                  )}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  WhatsApp
                </Button>
              </Stack>
            ) : null}

            {invitaciones.length === 0 ? (
              <Typography color='text.secondary'>
                No hay códigos pendientes.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {invitaciones.map((invitacion) => (
                  <Stack
                    key={invitacion.id}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    justifyContent='space-between'
                  >
                    <Typography sx={{ fontFamily: 'monospace', letterSpacing: 1 }}>
                      {invitacion.codigo}
                    </Typography>
                    <Stack direction='row' spacing={1} flexWrap='wrap'>
                      <Button
                        size='small'
                        startIcon={<ContentCopyOutlinedIcon />}
                        onClick={() => {
                          void handleCopiar(invitacion.codigo)
                        }}
                      >
                        Copiar
                      </Button>
                      <Button
                        size='small'
                        color='success'
                        startIcon={<WhatsAppIcon />}
                        component='a'
                        href={construirWhatsappInvitacion(
                          negocioNombre,
                          invitacion.codigo
                        )}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        WhatsApp
                      </Button>
                      <Button
                        size='small'
                        color='error'
                        startIcon={<DeleteOutlineOutlinedIcon />}
                        disabled={ocupado}
                        onClick={() => {
                          void handleRevocar(invitacion.id)
                        }}
                      >
                        Revocar
                      </Button>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card variant='outlined'>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant='h6' component='h2'>
              Empleados actuales
            </Typography>
            {empleados.length === 0 ? (
              <Typography color='text.secondary'>
                Aún no hay empleados vinculados.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {empleados.map((empleado) => (
                  <Stack
                    key={empleado.id}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    justifyContent='space-between'
                  >
                    <Typography>
                      {empleado.correo ??
                        `Empleado ${empleado.authUserId.slice(0, 8)}`}
                    </Typography>
                    <Button
                      size='small'
                      color='error'
                      disabled={ocupado}
                      onClick={() => {
                        void handleQuitar(empleado.id)
                      }}
                    >
                      Quitar
                    </Button>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
