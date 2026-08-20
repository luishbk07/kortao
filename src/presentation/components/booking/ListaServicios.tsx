'use client'

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  calcularPrecioFinal,
  tieneDescuentoActivo
} from '@/domain/business/servicio.rules'
import type { ServicioPublico } from './tiposReservar'

type ListaServiciosProps = {
  servicios: ServicioPublico[]
  servicioSeleccionadoId: string | null
  onSeleccionar: (servicioId: string) => void
}

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(precio)
}

export const ListaServicios = ({
  servicios,
  servicioSeleccionadoId,
  onSeleccionar
}: ListaServiciosProps) => {
  if (servicios.length === 0) {
    return (
      <Typography color='text.secondary'>
        Este negocio aún no tiene servicios disponibles.
      </Typography>
    )
  }

  return (
    <Stack spacing={1.5}>
      {servicios.map((servicio) => {
        const seleccionado = servicio.id === servicioSeleccionadoId
        const conDescuento = tieneDescuentoActivo(
          servicio.descuentoTipo,
          servicio.descuentoValor
        )
        const precioFinal = calcularPrecioFinal(
          servicio.precio,
          servicio.descuentoTipo,
          servicio.descuentoValor
        )

        return (
          <Card
            key={servicio.id}
            variant='outlined'
            sx={{
              borderColor: seleccionado ? 'secondary.main' : 'divider',
              borderWidth: seleccionado ? 2 : 1,
              bgcolor: seleccionado ? 'background.paper' : 'transparent'
            }}
          >
            <CardActionArea onClick={() => onSeleccionar(servicio.id)}>
              <CardContent>
                <Stack
                  direction='row'
                  justifyContent='space-between'
                  alignItems='flex-start'
                  spacing={2}
                >
                  <Stack spacing={0.5}>
                    <Typography variant='h6' component='h3'>
                      {servicio.nombre}
                    </Typography>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <AccessTimeOutlinedIcon
                        fontSize='small'
                        color='action'
                      />
                      <Typography variant='body2' color='text.secondary'>
                        {servicio.duracionMinutos} min
                      </Typography>
                    </Stack>
                  </Stack>
                  {conDescuento ? (
                    <Stack alignItems='flex-end' spacing={0.25}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ textDecoration: 'line-through' }}
                      >
                        {formatearPrecio(servicio.precio)}
                      </Typography>
                      <Typography
                        variant='subtitle1'
                        fontWeight={600}
                        color='secondary.main'
                      >
                        {formatearPrecio(precioFinal)}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant='subtitle1' fontWeight={600}>
                      {formatearPrecio(servicio.precio)}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        )
      })}
    </Stack>
  )
}
