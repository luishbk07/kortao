'use client'

import { useState, type ReactNode } from 'react'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type {
  DetalleNegocioAdmin,
  PagoNegocioAdmin
} from '@/domain/admin/admin.types'
import type { EstadoCita } from '@/domain/booking/booking.types'
import { HistorialPagosAdmin } from '@/presentation/components/admin/HistorialPagosAdmin'
import {
  formatearFechaLegible,
  formatearHoraLegible
} from '@/shared/utils/fechas'
import { esPlanPremium, formatearPrecioMensual } from '@/shared/utils/planes'
import {
  calcularProximaFechaPago,
  cicloActualEstaAlDia
} from '@/shared/utils/suscripcion'
import Link from 'next/link'

type DetalleNegocioAdminVistaProps = {
  detalle: DetalleNegocioAdmin
  historialPagos: PagoNegocioAdmin[]
}

const etiquetaPlan = (plan: string): string => {
  if (plan === 'estandar') {
    return 'Estándar'
  }

  if (plan === 'premium') {
    return 'Premium'
  }

  return plan
}

const etiquetaEstado = (estado: EstadoCita): string => {
  if (estado === 'completada') {
    return 'Atendida'
  }

  if (estado === 'cancelada') {
    return 'Cancelada'
  }

  if (estado === 'confirmada') {
    return 'Confirmada'
  }

  return 'Pendiente'
}

const colorEstado = (
  estado: EstadoCita
): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  if (estado === 'completada') {
    return 'primary'
  }

  if (estado === 'confirmada') {
    return 'success'
  }

  if (estado === 'cancelada') {
    return 'error'
  }

  return 'warning'
}

const formatearMonto = (monto: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    maximumFractionDigits: 0
  }).format(monto)
}

const TarjetaDato = ({
  etiqueta,
  valor,
  complemento
}: {
  etiqueta: string
  valor: string
  complemento?: ReactNode
}) => {
  return (
    <Box
      sx={{
        flex: '1 1 180px',
        minWidth: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        px: 2,
        py: 1.75
      }}
    >
      <Typography variant='body2' color='text.secondary' gutterBottom>
        {etiqueta}
      </Typography>
      <Typography fontWeight={600}>{valor}</Typography>
      {complemento ? (
        <Box sx={{ mt: 1 }}>{complemento}</Box>
      ) : null}
    </Box>
  )
}

export const DetalleNegocioAdminVista = ({
  detalle,
  historialPagos
}: DetalleNegocioAdminVistaProps) => {
  const { negocio, metricas, citasRecientes } = detalle
  const [pagos, setPagos] = useState(historialPagos)
  const proximaPago = calcularProximaFechaPago(negocio.fechaInicioSuscripcion)
  const estadoCiclo = cicloActualEstaAlDia(
    negocio.fechaInicioSuscripcion,
    pagos[0]?.fechaPago ?? null
  )
  const puedeRegistrarPago =
    esPlanPremium(negocio.plan) &&
    negocio.suscripcionActiva &&
    negocio.precioMensual !== null

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent='space-between'
      >
        <Stack spacing={0.5}>
          <Typography variant='h5' component='h1' color='primary'>
            {negocio.nombre}
          </Typography>
          <Typography color='text.secondary'>/{negocio.slug}</Typography>
        </Stack>
        <Button
          component={Link}
          href='/admin'
          variant='outlined'
          color='primary'
          startIcon={<ArrowBackOutlinedIcon />}
        >
          Volver
        </Button>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant='h6' component='h2' fontWeight={700}>
          Datos básicos
        </Typography>
        <Stack direction='row' flexWrap='wrap' useFlexGap spacing={1.5}>
          <TarjetaDato etiqueta='Nombre' valor={negocio.nombre} />
          <TarjetaDato etiqueta='Slug' valor={negocio.slug} />
          <TarjetaDato etiqueta='Plan' valor={etiquetaPlan(negocio.plan)} />
          <TarjetaDato
            etiqueta='Precio mensual'
            valor={
              negocio.precioMensual === null
                ? 'Sin definir'
                : formatearPrecioMensual(negocio.precioMensual)
            }
          />
          <TarjetaDato
            etiqueta='Inicio de suscripción'
            valor={formatearFechaLegible(negocio.fechaInicioSuscripcion, true)}
          />
          <TarjetaDato
            etiqueta='Próximo pago'
            valor={formatearFechaLegible(proximaPago, true)}
            complemento={
              estadoCiclo === null ? null : (
                <Chip
                  size='small'
                  label={estadoCiclo ? 'Al día' : 'Pago pendiente'}
                  color={estadoCiclo ? 'success' : 'warning'}
                />
              )
            }
          />
          <TarjetaDato
            etiqueta='Suscripción'
            valor={negocio.suscripcionActiva ? 'Activa' : 'Pausada'}
          />
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant='h6' component='h2' fontWeight={700}>
          Métricas
        </Typography>
        <Stack direction='row' flexWrap='wrap' useFlexGap spacing={1.5}>
          <TarjetaDato
            etiqueta='Total de citas'
            valor={String(metricas.totalCitas)}
          />
          <TarjetaDato
            etiqueta='Citas atendidas'
            valor={String(metricas.citasCompletadas)}
          />
          <TarjetaDato
            etiqueta='Citas canceladas'
            valor={String(metricas.citasCanceladas)}
          />
          <TarjetaDato
            etiqueta='Ingresos totales'
            valor={formatearMonto(metricas.ingresosTotales)}
          />
          <TarjetaDato
            etiqueta='Cita más reciente'
            valor={
              metricas.fechaCitaMasReciente
                ? `${formatearFechaLegible(metricas.fechaCitaMasReciente, false)} · ${formatearHoraLegible(metricas.fechaCitaMasReciente)}`
                : 'Sin citas'
            }
          />
        </Stack>
      </Stack>

      {puedeRegistrarPago || pagos.length > 0 ? (
        <HistorialPagosAdmin
          negocioId={negocio.id}
          precioMensual={negocio.precioMensual ?? 0}
          pagos={pagos}
          onPagosChange={setPagos}
          puedeRegistrar={puedeRegistrarPago}
        />
      ) : null}

      <Stack spacing={1.5}>
        <Typography variant='h6' component='h2' fontWeight={700}>
          Últimas citas
        </Typography>
        {citasRecientes.length === 0 ? (
          <Typography color='text.secondary'>
            Este negocio aún no tiene citas.
          </Typography>
        ) : (
          <TableContainer
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              bgcolor: 'background.paper'
            }}
          >
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Servicio</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {citasRecientes.map((cita) => (
                  <TableRow key={cita.id} hover>
                    <TableCell>
                      {formatearFechaLegible(cita.fechaHora, false)}
                      {' · '}
                      {formatearHoraLegible(cita.fechaHora)}
                    </TableCell>
                    <TableCell>{cita.clienteNombre}</TableCell>
                    <TableCell>{cita.servicioNombre}</TableCell>
                    <TableCell>
                      <Chip
                        size='small'
                        color={colorEstado(cita.estado)}
                        label={etiquetaEstado(cita.estado)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </Stack>
  )
}
