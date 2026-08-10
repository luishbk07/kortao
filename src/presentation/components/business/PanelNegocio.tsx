'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { NegocioDetalle } from '@/application/ports/businessRepository.port'
import { crearActualizarNegocio } from '@/application/useCases/business/actualizarNegocio'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'
import {
  esTelefonoCompleto,
  formatearTelefonoVisual,
  normalizarTelefonoValor
} from '@/shared/utils/telefono'
import {
  SelectorUbicacion,
  type CoordenadasUbicacion
} from './SelectorUbicacion'

type PanelNegocioProps = {
  negocio: NegocioDetalle
}

export const PanelNegocio = ({ negocio }: PanelNegocioProps) => {
  const router = useRouter()
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
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const formularioValido =
    nombre.trim().length > 1 && esTelefonoCompleto(telefonoWhatsapp)

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
      await actualizarNegocio(negocio.id, {
        nombre,
        telefonoWhatsapp,
        direccion: direccion.trim() || null,
        latitud: ubicacion?.latitud ?? null,
        longitud: ubicacion?.longitud ?? null
      })
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
    </Stack>
  )
}
