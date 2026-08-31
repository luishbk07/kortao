'use client'

import { useState } from 'react'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type {
  PeriodoReportes,
  ReportesNegocio
} from '@/domain/business/reportes.types'
import { GraficoIngresosMensuales } from '@/presentation/components/business/reportes/GraficoIngresosMensuales'
import { GraficoIngresosServicio } from '@/presentation/components/business/reportes/GraficoIngresosServicio'
import { TarjetaKpiReporte } from '@/presentation/components/business/reportes/TarjetaKpiReporte'

type PanelReportesProps = {
  reportes: ReportesNegocio
}

const OPCIONES_PERIODO: Array<{ valor: PeriodoReportes; etiqueta: string }> = [
  { valor: 'mes_actual', etiqueta: 'Este mes' },
  { valor: 'ultimos_30', etiqueta: 'Últimos 30 días' },
  { valor: 'todo', etiqueta: 'Todo el tiempo' }
]

const formatearMonto = (monto: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    maximumFractionDigits: 0
  }).format(monto)
}

const etiquetaIngresosPeriodo = (periodo: PeriodoReportes): string => {
  if (periodo === 'mes_actual') {
    return 'Ingresos (este mes)'
  }

  if (periodo === 'ultimos_30') {
    return 'Ingresos (últimos 30 días)'
  }

  return 'Ingresos (todo el tiempo)'
}

export const PanelReportes = ({ reportes }: PanelReportesProps) => {
  const [periodo, setPeriodo] = useState<PeriodoReportes>('mes_actual')
  const snapshot = reportes.porPeriodo[periodo]

  const sparklineIngresos = snapshot.ingresosPorDia.map((punto) => ({
    clave: punto.fecha,
    monto: punto.monto
  }))

  const sparklineServicios = snapshot.conteoPorServicio.map((item) => ({
    clave: item.nombre,
    monto: item.monto
  }))

  const sparklineTicket = snapshot.ingresosPorDia.map((punto) => ({
    clave: punto.fecha,
    monto: punto.monto
  }))

  const sinCitas =
    reportes.porPeriodo.todo.citasCompletadas === 0 &&
    reportes.porPeriodo.todo.ingresosTotales === 0

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        justifyContent='space-between'
      >
        <Stack spacing={0.5} flex={1} minWidth={0}>
          <Typography variant='h5' component='h1' color='primary'>
            Reportes
          </Typography>
          <Typography color='text.secondary'>
            Resumen de ingresos y servicios a partir de citas atendidas.
          </Typography>
        </Stack>

        <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <Select
            value={periodo}
            onChange={(evento) => {
              setPeriodo(evento.target.value as PeriodoReportes)
            }}
            startAdornment={
              <InputAdornment position='start'>
                <CalendarMonthOutlinedIcon
                  fontSize='small'
                  color='primary'
                />
              </InputAdornment>
            }
            inputProps={{ 'aria-label': 'Período del reporte' }}
          >
            {OPCIONES_PERIODO.map((opcion) => (
              <MenuItem key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {sinCitas ? (
        <Typography color='text.secondary'>
          Todavía no hay citas atendidas para mostrar reportes.
        </Typography>
      ) : null}

      <Stack direction='row' flexWrap='wrap' useFlexGap spacing={2}>
        <TarjetaKpiReporte
          etiqueta={etiquetaIngresosPeriodo(periodo)}
          valor={formatearMonto(snapshot.ingresosPeriodo)}
          variacionPorcentual={snapshot.variacionPorcentual}
          sparkline={sparklineIngresos}
          tipoSparkline='area'
        />
        <TarjetaKpiReporte
          etiqueta='Ingresos totales'
          valor={formatearMonto(snapshot.ingresosTotales)}
          sparkline={snapshot.ingresosPorMes.map((punto) => ({
            clave: punto.mes,
            monto: punto.monto
          }))}
          tipoSparkline='area'
        />
        <TarjetaKpiReporte
          etiqueta='Servicio más solicitado'
          valor={snapshot.servicioMasSolicitado ?? 'Sin datos'}
          sparkline={sparklineServicios}
          tipoSparkline='barras'
          mostrarEtiquetasBarras
        />
        <TarjetaKpiReporte
          etiqueta='Ticket promedio'
          valor={
            snapshot.ticketPromedio === null
              ? 'Sin datos'
              : formatearMonto(snapshot.ticketPromedio)
          }
          sparkline={sparklineTicket}
          tipoSparkline='barras'
        />
      </Stack>

      <Stack direction='row' flexWrap='wrap' useFlexGap spacing={2}>
        <GraficoIngresosMensuales datos={snapshot.ingresosPorMes} />
        <GraficoIngresosServicio datos={snapshot.ingresosPorServicio} />
      </Stack>
    </Stack>
  )
}
