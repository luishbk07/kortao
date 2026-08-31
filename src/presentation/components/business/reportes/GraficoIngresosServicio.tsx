'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme, type Theme } from '@mui/material/styles'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { IngresoPorServicio } from '@/domain/business/reportes.types'

type GraficoIngresosServicioProps = {
  datos: IngresoPorServicio[]
}

const TAMANO_DONUT = 200

const formatearMonto = (monto: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    maximumFractionDigits: 0
  }).format(monto)
}

const coloresDonut = (tema: Theme): string[] => [
  tema.palette.primary.dark,
  tema.palette.primary.main,
  tema.palette.primary.light,
  tema.palette.secondary.main,
  tema.palette.divider
]

export const GraficoIngresosServicio = ({
  datos
}: GraficoIngresosServicioProps) => {
  const tema = useTheme()
  const colores = coloresDonut(tema)
  const hayDatos = datos.some((item) => item.monto > 0)

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        px: { xs: 2, sm: 2.5 },
        py: 2.5,
        flex: '1 1 280px',
        minWidth: 0,
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'hidden'
      }}
    >
      <Typography variant='subtitle1' fontWeight={700} color='primary'>
        Ingresos por servicio
      </Typography>

      {!hayDatos ? (
        <Box
          flex={1}
          display='flex'
          alignItems='center'
          justifyContent='center'
        >
          <Typography color='text.secondary'>
            Sin datos de servicios todavía.
          </Typography>
        </Box>
      ) : (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2.5}
          alignItems='center'
          flex={1}
          minWidth={0}
        >
          <Box
            sx={{
              width: TAMANO_DONUT,
              height: TAMANO_DONUT,
              flexShrink: 0,
              mx: 'auto'
            }}
          >
            <ResponsiveContainer width='100%' height='100%' debounce={50}>
              <PieChart>
                <Pie
                  data={datos}
                  dataKey='monto'
                  nameKey='nombre'
                  cx='50%'
                  cy='50%'
                  innerRadius='58%'
                  outerRadius='82%'
                  paddingAngle={3}
                  stroke={tema.palette.background.paper}
                  strokeWidth={3}
                  isAnimationActive={false}
                >
                  {datos.map((entrada, indice) => (
                    <Cell
                      key={entrada.nombre}
                      fill={colores[indice % colores.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(valor) =>
                    typeof valor === 'number'
                      ? formatearMonto(valor)
                      : String(valor ?? '')
                  }
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: tema.palette.divider,
                    backgroundColor: tema.palette.background.paper
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Stack spacing={1} width='100%' flex={1} minWidth={0}>
            {datos.map((item, indice) => (
              <Stack
                key={item.nombre}
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                spacing={1}
              >
                <Stack
                  direction='row'
                  alignItems='center'
                  spacing={1}
                  minWidth={0}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      flexShrink: 0,
                      bgcolor: colores[indice % colores.length]
                    }}
                  />
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    noWrap
                    title={item.nombre}
                  >
                    {item.nombre}
                  </Typography>
                </Stack>
                <Typography
                  variant='body2'
                  fontWeight={600}
                  color='text.primary'
                  flexShrink={0}
                >
                  {formatearMonto(item.monto)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
    </Box>
  )
}
