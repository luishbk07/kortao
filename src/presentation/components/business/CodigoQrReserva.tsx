'use client'

import { useEffect, useState } from 'react'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { toDataURL } from 'qrcode'
import { construirUrlReserva } from '@/shared/utils/sitio'

type CodigoQrReservaProps = {
  negocioSlug: string
}

const TAMANO_QR = 200
const TAMANO_QR_MOVIL = 168

const descargarPng = (dataUrl: string, nombreArchivo: string): void => {
  const enlace = document.createElement('a')
  enlace.href = dataUrl
  enlace.download = nombreArchivo
  enlace.rel = 'noopener'
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
}

export const CodigoQrReserva = ({ negocioSlug }: CodigoQrReservaProps) => {
  const urlPublica = construirUrlReserva(negocioSlug)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    const generar = async () => {
      setError(null)
      setDataUrl(null)

      try {
        const imagen = await toDataURL(urlPublica, {
          width: TAMANO_QR,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#1F4B3F',
            light: '#FFFFFF'
          }
        })

        if (!cancelado) {
          setDataUrl(imagen)
        }
      } catch {
        if (!cancelado) {
          setError('No se pudo generar el código QR. Inténtalo de nuevo.')
        }
      }
    }

    void generar()

    return () => {
      cancelado = true
    }
  }, [urlPublica])

  const handleDescargar = () => {
    if (!dataUrl) {
      return
    }

    descargarPng(dataUrl, `kortao-qr-${negocioSlug}.png`)
  }

  return (
    <Stack
      spacing={1.5}
      height='100%'
      alignItems='stretch'
      sx={{ width: '100%', minWidth: 0 }}
    >
      <Stack spacing={0.5}>
        <Stack direction='row' spacing={1} alignItems='center'>
          <QrCode2OutlinedIcon color='primary' fontSize='small' />
          <Typography variant='subtitle1' color='primary' fontWeight={600}>
            Código QR de reservas
          </Typography>
        </Stack>
        <Typography variant='body2' color='text.secondary'>
          Imprímelo o compártelo para que tus clientes reserven escaneando.
        </Typography>
      </Stack>

      {error ? (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Stack spacing={2} alignItems='center' sx={{ flex: 1, justifyContent: 'center' }}>
        <Box
          sx={{
            width: { xs: TAMANO_QR_MOVIL, sm: TAMANO_QR },
            height: { xs: TAMANO_QR_MOVIL, sm: TAMANO_QR },
            maxWidth: '100%',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'common.white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {dataUrl ? (
            <Box
              component='img'
              src={dataUrl}
              alt={`Código QR para reservar en ${negocioSlug}`}
              sx={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          ) : (
            <Skeleton
              variant='rounded'
              sx={{
                width: { xs: TAMANO_QR_MOVIL, sm: TAMANO_QR },
                height: { xs: TAMANO_QR_MOVIL, sm: TAMANO_QR },
                maxWidth: '100%'
              }}
            />
          )}
        </Box>

        <Button
          variant='contained'
          color='secondary'
          startIcon={<DownloadOutlinedIcon />}
          onClick={handleDescargar}
          disabled={!dataUrl}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Descargar QR
        </Button>
      </Stack>
    </Stack>
  )
}
