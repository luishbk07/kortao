'use client'

import { useEffect, useState } from 'react'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

type EnlaceReservaPublicaProps = {
  negocioSlug: string
}

const construirRutaReserva = (slug: string): string => `/reservar/${slug}`

export const EnlaceReservaPublica = ({
  negocioSlug
}: EnlaceReservaPublicaProps) => {
  const [urlPublica, setUrlPublica] = useState(construirRutaReserva(negocioSlug))
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setUrlPublica(
      `${window.location.origin}${construirRutaReserva(negocioSlug)}`
    )
  }, [negocioSlug])

  const copiarEnlace = async () => {
    setError(null)

    try {
      await navigator.clipboard.writeText(urlPublica)
      setMensaje('Enlace copiado')
    } catch {
      setMensaje(null)
      setError('No se pudo copiar el enlace. Cópialo manualmente.')
    }
  }

  return (
    <Stack spacing={1.5}>
      <Stack spacing={0.5}>
        <Typography variant='subtitle1' color='primary' fontWeight={600}>
          Enlace para tus clientes
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Comparte este enlace para que puedan reservar contigo.
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ sm: 'stretch' }}
      >
        <TextField
          size='small'
          fullWidth
          label='Enlace de reserva'
          value={urlPublica}
          InputProps={{ readOnly: true }}
        />
        <Button
          variant='contained'
          color='secondary'
          startIcon={<ContentCopyOutlinedIcon />}
          onClick={() => {
            void copiarEnlace()
          }}
          sx={{ flexShrink: 0 }}
        >
          Copiar
        </Button>
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
    </Stack>
  )
}
