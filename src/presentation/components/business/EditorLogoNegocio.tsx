'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type {
  ActualizarNegocioInput,
  NegocioDetalle
} from '@/application/ports/businessRepository.port'
import { crearActualizarNegocio } from '@/application/useCases/business/actualizarNegocio'
import { crearClienteNavegador } from '@/infrastructure/supabase/clienteNavegador'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'
import {
  BUCKET_LOGOS,
  construirRutaLogoNegocio,
  esTamanoLogoValido,
  esTipoLogoPermitido,
  obtenerExtensionLogo,
  TAMANO_MAXIMO_BYTES
} from '@/shared/utils/logoNegocio'

type DatosNegocioSinLogo = Omit<ActualizarNegocioInput, 'logoUrl'>

type EditorLogoNegocioProps = {
  negocio: NegocioDetalle
  obtenerDatosNegocio: () => DatosNegocioSinLogo
  onLogoActualizado: (logoUrl: string | null) => void
}

const limpiarArchivosLogo = async (negocioId: string): Promise<void> => {
  const supabase = crearClienteNavegador()
  const { data: archivos, error } = await supabase.storage
    .from(BUCKET_LOGOS)
    .list(negocioId)

  if (error) {
    throw new Error(error.message)
  }

  const rutas = (archivos ?? [])
    .map((archivo) => archivo.name)
    .filter((nombre) => nombre.startsWith('logo.'))
    .map((nombre) => `${negocioId}/${nombre}`)

  if (rutas.length === 0) {
    return
  }

  const { error: errorEliminar } = await supabase.storage
    .from(BUCKET_LOGOS)
    .remove(rutas)

  if (errorEliminar) {
    throw new Error(errorEliminar.message)
  }
}

export const EditorLogoNegocio = ({
  negocio,
  obtenerDatosNegocio,
  onLogoActualizado
}: EditorLogoNegocioProps) => {
  const inputArchivoRef = useRef<HTMLInputElement | null>(null)
  const [logoUrl, setLogoUrl] = useState(negocio.logoUrl)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const guardarLogoUrl = async (nuevaUrl: string | null): Promise<void> => {
    const { businessRepository } = crearDependenciasPanelNavegador()
    const actualizarNegocio = crearActualizarNegocio(businessRepository)
    const datos = obtenerDatosNegocio()

    await actualizarNegocio(negocio.id, {
      ...datos,
      logoUrl: nuevaUrl
    })
  }

  const handleSeleccionarArchivo = () => {
    inputArchivoRef.current?.click()
  }

  const handleArchivoCambiado = async (
    evento: ChangeEvent<HTMLInputElement>
  ) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''

    if (!archivo) {
      return
    }

    if (!esTipoLogoPermitido(archivo.type)) {
      setError('Usa una imagen PNG, JPG o WebP.')
      return
    }

    if (!esTamanoLogoValido(archivo.size)) {
      setError(
        `La imagen no debe superar ${Math.round(TAMANO_MAXIMO_BYTES / (1024 * 1024))} MB.`
      )
      return
    }

    const extension = obtenerExtensionLogo(archivo.type)

    if (!extension) {
      setError('Usa una imagen PNG, JPG o WebP.')
      return
    }

    setSubiendo(true)
    setError(null)
    setMensaje(null)

    try {
      const supabase = crearClienteNavegador()
      await limpiarArchivosLogo(negocio.id)

      const ruta = construirRutaLogoNegocio(negocio.id, extension)
      const { error: errorSubida } = await supabase.storage
        .from(BUCKET_LOGOS)
        .upload(ruta, archivo, {
          cacheControl: '3600',
          upsert: true,
          contentType: archivo.type
        })

      if (errorSubida) {
        throw new Error(errorSubida.message)
      }

      const { data } = supabase.storage.from(BUCKET_LOGOS).getPublicUrl(ruta)
      const urlPublica = `${data.publicUrl}?v=${Date.now()}`

      await guardarLogoUrl(urlPublica)
      setLogoUrl(urlPublica)
      onLogoActualizado(urlPublica)
      setMensaje('Logo actualizado.')
    } catch {
      setError('No se pudo subir el logo. Inténtalo de nuevo.')
    } finally {
      setSubiendo(false)
    }
  }

  const handleQuitarLogo = async () => {
    setSubiendo(true)
    setError(null)
    setMensaje(null)

    try {
      await limpiarArchivosLogo(negocio.id)
      await guardarLogoUrl(null)
      setLogoUrl(null)
      onLogoActualizado(null)
      setMensaje('Logo eliminado.')
    } catch {
      setError('No se pudo quitar el logo. Inténtalo de nuevo.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant='subtitle1' color='primary'>
        Logo del negocio
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        Aparece en tu página de reservas y en los correos a clientes. PNG, JPG
        o WebP, máximo 2 MB.
      </Typography>

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

      {logoUrl ? (
        <Box
          component='img'
          src={logoUrl}
          alt={`Logo de ${negocio.nombre}`}
          sx={{
            maxHeight: 88,
            maxWidth: 220,
            objectFit: 'contain',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            p: 1
          }}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 88,
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'divider',
            color: 'text.secondary',
            bgcolor: 'background.paper'
          }}
        >
          <ImageOutlinedIcon />
        </Box>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button
          variant='outlined'
          color='primary'
          startIcon={<ImageOutlinedIcon />}
          onClick={handleSeleccionarArchivo}
          disabled={subiendo}
          sx={{ alignSelf: { sm: 'flex-start' } }}
        >
          {subiendo ? 'Subiendo...' : logoUrl ? 'Cambiar logo' : 'Subir logo'}
        </Button>
        {logoUrl ? (
          <Button
            variant='text'
            color='inherit'
            startIcon={<DeleteOutlineIcon />}
            onClick={() => {
              void handleQuitarLogo()
            }}
            disabled={subiendo}
            sx={{ alignSelf: { sm: 'flex-start' } }}
          >
            Quitar logo
          </Button>
        ) : null}
      </Stack>

      <Box
        component='input'
        ref={inputArchivoRef}
        type='file'
        accept='image/png,image/jpeg,image/webp'
        hidden
        onChange={(evento: ChangeEvent<HTMLInputElement>) => {
          void handleArchivoCambiado(evento)
        }}
      />
    </Stack>
  )
}
