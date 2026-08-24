'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { NegocioDetalle } from '@/application/ports/businessRepository.port'
import { crearActualizarNegocio } from '@/application/useCases/business/actualizarNegocio'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'
import { palette } from '@/presentation/theme/palette'
import { esPlanPremium } from '@/shared/utils/planes'
import {
  esTelefonoCompleto,
  formatearTelefonoVisual,
  normalizarTelefonoValor
} from '@/shared/utils/telefono'
import { EditorLogoNegocio } from './EditorLogoNegocio'
import { FormularioCambiarContrasena } from './FormularioCambiarContrasena'
import {
  SelectorUbicacion,
  type CoordenadasUbicacion
} from './SelectorUbicacion'

const COLORES_ACENTO_PRESET = [
  palette.secondary.main,
  palette.primary.main,
  '#8B4557',
  '#3D5A80',
  '#6B4E71',
  '#B8860B',
  '#2E7D6F',
  '#A0522D'
] as const

type PanelNegocioProps = {
  negocio: NegocioDetalle
}

export const PanelNegocio = ({ negocio }: PanelNegocioProps) => {
  const router = useRouter()
  const esPremium = esPlanPremium(negocio.plan)
  const [nombre, setNombre] = useState(negocio.nombre)
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState(
    normalizarTelefonoValor(negocio.telefonoWhatsapp)
  )
  const [direccion, setDireccion] = useState(negocio.direccion ?? '')
  const [ubicacion, setUbicacion] = useState<CoordenadasUbicacion | null>(
    negocio.latitud !== null && negocio.longitud !== null
      ? { latitud: negocio.latitud, longitud: negocio.longitud }
      : null
  )
  const [colorAcento, setColorAcento] = useState(
    negocio.colorAcento ?? palette.secondary.main
  )
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const formularioValido =
    nombre.trim().length > 1 && esTelefonoCompleto(telefonoWhatsapp)

  const obtenerDatosNegocio = () => ({
    nombre,
    telefonoWhatsapp,
    direccion: direccion.trim() || null,
    latitud: ubicacion?.latitud ?? null,
    longitud: ubicacion?.longitud ?? null,
    ...(esPremium ? { colorAcento } : {})
  })

  const handleGuardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()

    if (!formularioValido) {
      setError('Completa el nombre y el teléfono del negocio.')
      return
    }

    setGuardando(true)
    setError(null)
    setMensaje(null)

    try {
      const { businessRepository } = crearDependenciasPanelNavegador()
      const actualizarNegocio = crearActualizarNegocio(businessRepository)
      await actualizarNegocio(negocio.id, obtenerDatosNegocio())
      setMensaje('Datos del negocio guardados.')
      router.refresh()
    } catch {
      setError('No se pudieron guardar los datos. Inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant='h5' component='h1' color='primary'>
          Negocio
        </Typography>
        <Typography color='text.secondary'>
          Actualiza la información que ven tus clientes al reservar.
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

      <EditorLogoNegocio
        negocio={negocio}
        obtenerDatosNegocio={obtenerDatosNegocio}
        onLogoActualizado={() => {
          router.refresh()
        }}
      />

      <Stack
        component='form'
        spacing={2}
        onSubmit={(evento) => {
          void handleGuardar(evento)
        }}
      >
        <TextField
          label='Nombre del negocio'
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          fullWidth
          required
        />
        <TextField
          label='Teléfono WhatsApp'
          value={formatearTelefonoVisual(telefonoWhatsapp)}
          onChange={(evento) =>
            setTelefonoWhatsapp(normalizarTelefonoValor(evento.target.value))
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
        <SelectorUbicacion
          valorInicial={
            negocio.latitud !== null && negocio.longitud !== null
              ? { latitud: negocio.latitud, longitud: negocio.longitud }
              : null
          }
          onChange={setUbicacion}
        />

        {esPremium ? (
          <Stack spacing={1.5}>
            <Typography variant='subtitle1' fontWeight={600}>
              Color de acento
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Se usa en botones y acciones de tu página pública de reservas.
            </Typography>
            <Stack direction='row' flexWrap='wrap' useFlexGap spacing={1}>
              {COLORES_ACENTO_PRESET.map((color) => {
                const seleccionado =
                  color.toLowerCase() === colorAcento.toLowerCase()

                return (
                  <Box
                    key={color}
                    component='button'
                    type='button'
                    aria-label={`Elegir color ${color}`}
                    onClick={() => setColorAcento(color)}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: seleccionado ? 'primary.main' : 'divider',
                      bgcolor: color,
                      cursor: 'pointer',
                      p: 0,
                      outline: seleccionado ? '2px solid' : 'none',
                      outlineColor: 'primary.light',
                      outlineOffset: 2
                    }}
                  />
                )
              })}
            </Stack>
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box
                component='input'
                type='color'
                value={colorAcento}
                onChange={(evento) => setColorAcento(evento.target.value)}
                aria-label='Selector de color personalizado'
                sx={{
                  width: 48,
                  height: 40,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  p: 0.5
                }}
              />
              <Typography variant='body2' color='text.secondary'>
                {colorAcento}
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              bgcolor: 'background.paper',
              px: 2.5,
              py: 2
            }}
          >
            <Typography variant='subtitle1' fontWeight={600} gutterBottom>
              Color de acento
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Disponible en Plan Premium. El pago aún no está disponible.
            </Typography>
          </Box>
        )}

        <Button
          type='submit'
          variant='contained'
          color='secondary'
          startIcon={<SaveOutlinedIcon />}
          disabled={!formularioValido || guardando}
          sx={{ alignSelf: { sm: 'flex-start' } }}
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </Stack>

      <Divider />

      <FormularioCambiarContrasena />
    </Stack>
  )
}
