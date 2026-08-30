'use client'

import { useState } from 'react'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { construirUrlReserva } from '@/shared/utils/sitio'
import { copiarAlPortapapeles } from '@/shared/utils/portapapeles'

type EnlaceReservaPublicaProps = {
  negocioSlug: string
}

const construirMensajeCompartir = (url: string): string => {
  return `Reserva una cita con nosotros en minutos: ${url}`
}

export const EnlaceReservaPublica = ({
  negocioSlug
}: EnlaceReservaPublicaProps) => {
  const urlPublica = construirUrlReserva(negocioSlug)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const copiarEnlace = async () => {
    setError(null)

    try {
      await copiarAlPortapapeles(urlPublica)
      setMensaje('Enlace copiado')
    } catch {
      setMensaje(null)
      setError('No se pudo copiar el enlace. Cópialo manualmente.')
    }
  }

  const compartirEnlace = async () => {
    setError(null)
    const texto = construirMensajeCompartir(urlPublica)

    try {
      if (navigator.share) {
        // Only `text` — many apps (WhatsApp, etc.) drop the message when
        // a separate `url` is also provided and share only the link.
        await navigator.share({
          text: texto
        })
        return
      }

      await copiarAlPortapapeles(texto)
      setMensaje('Texto de compartir copiado')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }

      setMensaje(null)
      setError('No se pudo compartir el enlace. Inténtalo de nuevo.')
    }
  }

  return (
    <Stack
      spacing={1.5}
      sx={{
        width: '100%',
        minWidth: 0,
        height: '100%'
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant='subtitle1' color='primary' fontWeight={600}>
          Enlace para tus clientes
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Comparte este enlace para que puedan reservar contigo.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          width: '100%',
          minWidth: 0,
          maxWidth: '100%',
          boxSizing: 'border-box',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.default',
          px: { xs: 1, sm: 1.5 },
          py: 1,
          mt: 'auto',
          overflow: 'hidden'
        }}
      >
        <Link
          href={urlPublica}
          target='_blank'
          rel='noopener noreferrer'
          color='primary'
          underline='hover'
          title={urlPublica}
          sx={{
            flex: '1 1 auto',
            minWidth: 0,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          {urlPublica}
        </Link>

        <IconButton
          color='secondary'
          aria-label='Copiar enlace'
          onClick={() => {
            void copiarEnlace()
          }}
          size='small'
          sx={{
            flex: '0 0 auto',
            color: 'secondary.main',
            borderRadius: 2,
            '&:hover': {
              color: 'secondary.dark'
            }
          }}
        >
          <ContentCopyOutlinedIcon fontSize='small' />
        </IconButton>

        <IconButton
          color='primary'
          aria-label='Compartir enlace'
          onClick={() => {
            void compartirEnlace()
          }}
          size='small'
          sx={{
            flex: '0 0 auto',
            color: 'secondary.main',
            borderRadius: 2,
            '&:hover': {
              color: 'secondary.dark'
            }
          }}
        >
          <IosShareOutlinedIcon fontSize='small' />
        </IconButton>
      </Box>

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
