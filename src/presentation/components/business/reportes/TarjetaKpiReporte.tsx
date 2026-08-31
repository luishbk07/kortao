'use client'

import { useId } from 'react'
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined'
import TrendingFlatOutlinedIcon from '@mui/icons-material/TrendingFlatOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis
} from 'recharts'

type TarjetaKpiReporteProps = {
  etiqueta: string
  valor: string
  variacionPorcentual?: number | null
  sparkline?: Array<{ clave: string; monto: number }>
  tipoSparkline?: 'area' | 'barras'
  mostrarEtiquetasBarras?: boolean
}

const formatearVariacion = (valor: number): string => {
  const absoluto = Math.abs(valor)
  const texto = absoluto >= 10 ? absoluto.toFixed(0) : absoluto.toFixed(1)
  return `${valor > 0 ? '+' : valor < 0 ? '-' : ''}${texto}%`
}

const acortarEtiqueta = (texto: string, maximo = 14): string => {
  const limpio = texto.trim()
  if (limpio.length <= maximo) {
    return limpio
  }
  return `${limpio.slice(0, maximo - 1)}…`
}

export const TarjetaKpiReporte = ({
  etiqueta,
  valor,
  variacionPorcentual = null,
  sparkline = [],
  tipoSparkline = 'area',
  mostrarEtiquetasBarras = false
}: TarjetaKpiReporteProps) => {
  const tema = useTheme()
  const idGradiente = useId().replace(/:/g, '')
  const haySparkline = sparkline.some((punto) => punto.monto > 0)
  const alturaGrafico = mostrarEtiquetasBarras ? 72 : 48

  const chipVariacion =
    variacionPorcentual === null || Number.isNaN(variacionPorcentual) ? null : (
      <Chip
        size='small'
        icon={
          variacionPorcentual > 0.5 ? (
            <TrendingUpOutlinedIcon />
          ) : variacionPorcentual < -0.5 ? (
            <TrendingDownOutlinedIcon />
          ) : (
            <TrendingFlatOutlinedIcon />
          )
        }
        label={formatearVariacion(variacionPorcentual)}
        sx={{
          height: 24,
          bgcolor:
            variacionPorcentual > 0.5
              ? 'success.main'
              : variacionPorcentual < -0.5
                ? 'error.main'
                : 'action.hover',
          color:
            variacionPorcentual > 0.5 || variacionPorcentual < -0.5
              ? 'common.white'
              : 'text.secondary',
          '& .MuiChip-icon': {
            color: 'inherit',
            ml: 0.5
          }
        }}
      />
    )

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        px: 2.5,
        py: 2.5,
        flex: '1 1 220px',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5
      }}
    >
      <Stack
        direction='row'
        alignItems='flex-start'
        justifyContent='space-between'
        spacing={1}
      >
        <Typography variant='body2' color='text.secondary'>
          {etiqueta}
        </Typography>
        {chipVariacion}
      </Stack>

      <Typography
        variant='h5'
        component='p'
        fontWeight={700}
        color='primary'
        sx={{ wordBreak: 'break-word' }}
      >
        {valor}
      </Typography>

      <Box sx={{ height: alturaGrafico, width: '100%', mt: 'auto' }}>
        {haySparkline ? (
          <ResponsiveContainer width='100%' height='100%'>
            {tipoSparkline === 'barras' ? (
              <BarChart
                data={sparkline}
                margin={{
                  top: 4,
                  right: 0,
                  left: 0,
                  bottom: mostrarEtiquetasBarras ? 4 : 0
                }}
              >
                {mostrarEtiquetasBarras ? (
                  <XAxis
                    dataKey='clave'
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    height={28}
                    tick={{
                      fontSize: 10,
                      fill: tema.palette.text.secondary
                    }}
                    tickFormatter={(valor: string) => acortarEtiqueta(valor)}
                  />
                ) : null}
                <Bar
                  dataKey='monto'
                  fill={tema.palette.primary.light}
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            ) : (
              <AreaChart
                data={sparkline}
                margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={idGradiente} x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='0%'
                      stopColor={tema.palette.primary.main}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset='100%'
                      stopColor={tema.palette.primary.main}
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type='monotone'
                  dataKey='monto'
                  stroke={tema.palette.primary.main}
                  fill={`url(#${idGradiente})`}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        ) : (
          <Box
            sx={{
              height: '100%',
              borderRadius: 1,
              bgcolor: 'action.hover',
              opacity: 0.5
            }}
          />
        )}
      </Box>
    </Box>
  )
}
