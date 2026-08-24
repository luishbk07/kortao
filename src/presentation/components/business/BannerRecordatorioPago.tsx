'use client'

import { useState } from 'react'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatearMontoRd } from '@/shared/utils/suscripcion'

export type RecordatorioPagoPanel = {
  precioMensual: number
  /** YYYY-MM-DD (calendar day, no timezone shift). */
  fechaProximoPago: string
}

type BannerRecordatorioPagoProps = {
  recordatorio: RecordatorioPagoPanel
}

const formatearFechaPago = (fechaCalendario: string): string => {
  const [anio, mes, dia] = fechaCalendario.split('-').map(Number)
  const fecha = new Date(anio, mes - 1, dia)

  return fecha.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export const BannerRecordatorioPago = ({
  recordatorio
}: BannerRecordatorioPagoProps) => {
  const [descartado, setDescartado] = useState(false)

  if (descartado) {
    return null
  }

  const monto = formatearMontoRd(recordatorio.precioMensual)
  const fechaTexto = formatearFechaPago(recordatorio.fechaProximoPago)

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'secondary.main',
        color: 'common.white'
      }}
    >
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        spacing={1.5}
        sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}
      >
        <Stack
          direction='row'
          alignItems='flex-start'
          spacing={1.5}
          sx={{ flex: 1, minWidth: 0 }}
        >
          <PaymentsOutlinedIcon sx={{ mt: 0.25, opacity: 0.95 }} />
          <Typography variant='body2'>
            Tu próximo pago ({monto}) es el {fechaTexto} — no olvides
            coordinarlo.
          </Typography>
        </Stack>

        <IconButton
          aria-label='Cerrar recordatorio de pago'
          onClick={() => setDescartado(true)}
          size='small'
          sx={{
            color: 'common.white',
            flexShrink: 0
          }}
        >
          <CloseOutlinedIcon fontSize='small' />
        </IconButton>
      </Stack>
    </Box>
  )
}
