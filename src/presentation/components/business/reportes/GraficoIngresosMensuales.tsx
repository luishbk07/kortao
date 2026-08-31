'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { PuntoIngresoMensual } from '@/domain/business/reportes.types'

type GraficoIngresosMensualesProps = {
  datos: PuntoIngresoMensual[]
}

const formatearMonto = (monto: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    maximumFractionDigits: 0
  }).format(monto)
}

export const GraficoIngresosMensuales = ({
  datos
}: GraficoIngresosMensualesProps) => {
  const tema = useTheme()
  const hayDatos = datos.some((punto) => punto.monto > 0)

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        px: { xs: 2, sm: 2.5 },
        py: 2.5,
        flex: '1 1 320px',
        minWidth: 0,
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <Typography variant='subtitle1' fontWeight={700} color='primary'>
        Ingresos mensuales
      </Typography>

      {!hayDatos ? (
        <Box
          flex={1}
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <Typography color='text.secondary'>
            Sin datos de ingresos todavía.
          </Typography>
        </Box>
      ) : (
        <Box flex={1} minHeight={240}>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart
              data={datos}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id='ingresosMensuales' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='0%'
                    stopColor={tema.palette.primary.main}
                    stopOpacity={0.28}
                  />
                  <stop
                    offset='100%'
                    stopColor={tema.palette.primary.main}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke={tema.palette.divider}
                strokeDasharray='3 3'
                vertical={false}
              />
              <XAxis
                dataKey='etiqueta'
                tick={{ fill: tema.palette.text.secondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: tema.palette.text.secondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={(valor: number) =>
                  valor >= 1000 ? `${Math.round(valor / 1000)}k` : String(valor)
                }
              />
              <Tooltip
                formatter={(valor) => [
                  typeof valor === 'number'
                    ? formatearMonto(valor)
                    : String(valor ?? ''),
                  'Ingresos'
                ]}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: tema.palette.divider,
                  backgroundColor: tema.palette.background.paper
                }}
                labelStyle={{ color: tema.palette.text.primary }}
              />
              <Area
                type='monotone'
                dataKey='monto'
                stroke={tema.palette.primary.main}
                fill='url(#ingresosMensuales)'
                strokeWidth={2.5}
                activeDot={{ r: 5, fill: tema.palette.secondary.main }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  )
}
