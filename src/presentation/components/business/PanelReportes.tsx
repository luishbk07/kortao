'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReportesNegocio } from '@/domain/business/reportes.types'

type PanelReportesProps = {
  reportes: ReportesNegocio
}

const formatearMonto = (monto: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    maximumFractionDigits: 0
  }).format(monto)
}

const TarjetaEstadistica = ({
  etiqueta,
  valor
}: {
  etiqueta: string
  valor: string
}) => {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        px: 2.5,
        py: 2.5,
        flex: '1 1 200px',
        minWidth: 0
      }}
    >
      <Typography variant='body2' color='text.secondary' gutterBottom>
        {etiqueta}
      </Typography>
      <Typography variant='h5' component='p' fontWeight={700} color='primary'>
        {valor}
      </Typography>
    </Box>
  )
}

export const PanelReportes = ({ reportes }: PanelReportesProps) => {
  return (
    <Stack
      direction='row'
      flexWrap='wrap'
      useFlexGap
      spacing={2}
    >
      <TarjetaEstadistica
        etiqueta='Ingresos (últimos 30 días)'
        valor={formatearMonto(reportes.ingresosUltimos30Dias)}
      />
      <TarjetaEstadistica
        etiqueta='Ingresos totales'
        valor={formatearMonto(reportes.ingresosTotales)}
      />
      <TarjetaEstadistica
        etiqueta='Servicio más solicitado'
        valor={reportes.servicioMasSolicitado ?? 'Sin datos'}
      />
      <TarjetaEstadistica
        etiqueta='Ticket promedio'
        valor={
          reportes.ticketPromedio === null
            ? 'Sin datos'
            : formatearMonto(reportes.ticketPromedio)
        }
      />
    </Stack>
  )
}
