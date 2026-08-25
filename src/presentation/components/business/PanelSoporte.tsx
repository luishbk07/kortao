'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { enviarReporteSoporteAction } from '@/app/(negocio)/panel/soporte/actions'
import type {
  EstadoReporteSoporte,
  ReporteSoporte
} from '@/domain/support/support.types'
import {
  formatearFechaLegible,
  formatearHoraLegible
} from '@/shared/utils/fechas'
import { esPlanPremium } from '@/shared/utils/planes'
import { useContadorReportesPendientes } from '@/presentation/lib/contadorReportesPendientes'

type PanelSoporteProps = {
  nombreNegocio: string
  plan: string
  telefonoWhatsappSoporte: string | null
  reportesIniciales: ReporteSoporte[]
}

const etiquetaEstado = (estado: EstadoReporteSoporte): string => {
  return estado === 'resuelto' ? 'Resuelto' : 'Pendiente'
}

const colorEstado = (
  estado: EstadoReporteSoporte
): 'success' | 'warning' => {
  return estado === 'resuelto' ? 'success' : 'warning'
}

const construirEnlaceWhatsappSoporte = (
  telefono: string,
  nombreNegocio: string
): string => {
  const limpio = telefono.replace(/\D/g, '')
  const mensaje = encodeURIComponent(
    `Hola, soy ${nombreNegocio}, necesito soporte personalizado.`
  )
  return `https://wa.me/${limpio}?text=${mensaje}`
}

export const PanelSoporte = ({
  nombreNegocio,
  plan,
  telefonoWhatsappSoporte,
  reportesIniciales
}: PanelSoporteProps) => {
  const [mensaje, setMensaje] = useState('')
  const [reportes, setReportes] = useState(reportesIniciales)
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const contador = useContadorReportesPendientes()
  const esPremium = esPlanPremium(plan)
  const enlaceWhatsapp =
    esPremium && telefonoWhatsappSoporte
      ? construirEnlaceWhatsappSoporte(telefonoWhatsappSoporte, nombreNegocio)
      : null

  const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()

    if (mensaje.trim().length === 0) {
      setError('Escribe un mensaje para enviar el reporte.')
      return
    }

    setEnviando(true)
    setError(null)
    setExito(null)

    try {
      const creado = await enviarReporteSoporteAction(mensaje)
      const reporte: ReporteSoporte = {
        id: creado.id,
        negocioId: '',
        mensaje: creado.mensaje,
        estado: creado.estado as EstadoReporteSoporte,
        creadoEn: new Date(creado.creadoEn)
      }
      setReportes((actuales) => [reporte, ...actuales])
      setMensaje('')
      setExito('Reporte enviado. Te responderemos lo antes posible.')
      if (creado.estado === 'pendiente') {
        contador?.ajustarReportesPendientes(1)
      }
    } catch {
      setError('No se pudo enviar el reporte. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant='h5' component='h1' color='primary'>
          Soporte
        </Typography>
        <Typography color='text.secondary'>
          Cuéntanos un problema o consulta y revisa el estado de tus reportes.
        </Typography>
      </Stack>

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
        {esPremium ? (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent='space-between'
          >
            <Stack direction='row' spacing={1.5} alignItems='flex-start'>
              <HelpOutlineOutlinedIcon color='primary' sx={{ mt: 0.25 }} />
              <Typography variant='body2' color='text.secondary'>
                Como negocio Premium, también puedes contactarnos directo por
                WhatsApp para soporte personalizado.
              </Typography>
            </Stack>
            {enlaceWhatsapp ? (
              <Button
                component='a'
                href={enlaceWhatsapp}
                target='_blank'
                rel='noopener noreferrer'
                variant='contained'
                color='secondary'
                startIcon={<WhatsAppIcon />}
                sx={{ flexShrink: 0 }}
              >
                Contactar por WhatsApp
              </Button>
            ) : null}
          </Stack>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            El soporte directo por WhatsApp está disponible en el{' '}
            <Typography
              component={Link}
              href='/panel/plan'
              color='secondary'
              fontWeight={600}
              sx={{ textDecoration: 'underline' }}
            >
              plan Premium
            </Typography>
            .
          </Typography>
        )}
      </Box>

      <Stack
        component='form'
        spacing={2}
        onSubmit={(evento) => {
          void handleSubmit(evento)
        }}
      >
        <Typography variant='h6' component='h2' fontWeight={700}>
          Enviar reporte
        </Typography>

        {exito ? (
          <Alert severity='success' onClose={() => setExito(null)}>
            {exito}
          </Alert>
        ) : null}

        {error ? (
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        <TextField
          label='Describe tu incidente o consulta'
          value={mensaje}
          onChange={(evento) => setMensaje(evento.target.value)}
          multiline
          minRows={4}
          fullWidth
          required
        />
        <Button
          type='submit'
          variant='contained'
          color='secondary'
          startIcon={<SendOutlinedIcon />}
          disabled={enviando}
          sx={{ alignSelf: { sm: 'flex-start' } }}
        >
          {enviando ? 'Enviando...' : 'Enviar reporte'}
        </Button>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant='h6' component='h2' fontWeight={700}>
          Tus reportes
        </Typography>

        {reportes.length === 0 ? (
          <Typography color='text.secondary'>
            Aún no has enviado ningún reporte.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {reportes.map((reporte) => (
              <Box
                key={reporte.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  px: 2,
                  py: 1.75
                }}
              >
                <Stack
                  direction='row'
                  spacing={1}
                  alignItems='center'
                  justifyContent='space-between'
                  mb={1}
                >
                  <Typography variant='body2' color='text.secondary'>
                    {formatearFechaLegible(reporte.creadoEn, true)}
                    {' · '}
                    {formatearHoraLegible(reporte.creadoEn)}
                  </Typography>
                  <Chip
                    size='small'
                    label={etiquetaEstado(reporte.estado)}
                    color={colorEstado(reporte.estado)}
                  />
                </Stack>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {reporte.mensaje}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
