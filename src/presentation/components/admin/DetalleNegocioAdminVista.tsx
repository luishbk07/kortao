'use client'

import { useState, type ReactNode } from 'react'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import {
  actualizarAfiliadoNegocioAction,
  actualizarCicloFacturacionAction,
  actualizarPlanAction
} from '@/app/admin/actions'
import type {
  DetalleNegocioAdmin,
  PagoNegocioAdmin
} from '@/domain/admin/admin.types'
import type { AfiliadoOpcion } from '@/domain/admin/afiliado.types'
import type { EstadoCita } from '@/domain/booking/booking.types'
import { HistorialPagosAdmin } from '@/presentation/components/admin/HistorialPagosAdmin'
import {
  formatearFechaLegible,
  formatearHoraLegible
} from '@/shared/utils/fechas'
import {
  calcularMontoCiclo,
  esPlanPagado,
  formatearPrecioMensual,
  OPCIONES_PLAN_ADMIN,
  PLANES_ASIGNABLES_ADMIN,
  type CicloFacturacion
} from '@/shared/utils/planes'
import {
  calcularProximaFechaPago,
  cicloActualEstaAlDia,
  formatearMontoRd
} from '@/shared/utils/suscripcion'
import Link from 'next/link'

type DetalleNegocioAdminVistaProps = {
  detalle: DetalleNegocioAdmin
  historialPagos: PagoNegocioAdmin[]
  afiliadosActivos: AfiliadoOpcion[]
}

const normalizarPlanSelect = (plan: string): string => {
  if (
    PLANES_ASIGNABLES_ADMIN.includes(
      plan as (typeof PLANES_ASIGNABLES_ADMIN)[number]
    )
  ) {
    return plan
  }

  if (plan === 'max') {
    return 'premium'
  }

  return 'estandar'
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
      {complemento ? <Box sx={{ mt: 1 }}>{complemento}</Box> : null}
    </Box>
  )
}

const OPCIONES_CICLO = [
  { valor: 'mensual' as const, etiqueta: 'Mensual' },
  { valor: 'anual' as const, etiqueta: 'Anual' }
]

export const DetalleNegocioAdminVista = ({
  detalle,
  historialPagos,
  afiliadosActivos
}: DetalleNegocioAdminVistaProps) => {
  const { negocio: negocioInicial, metricas, citasRecientes } = detalle
  const [negocio, setNegocio] = useState(negocioInicial)
  const [pagos, setPagos] = useState(historialPagos)
  const [errorCiclo, setErrorCiclo] = useState<string | null>(null)
  const [guardandoCiclo, setGuardandoCiclo] = useState(false)
  const [errorPlan, setErrorPlan] = useState<string | null>(null)
  const [guardandoPlan, setGuardandoPlan] = useState(false)
  const [errorAfiliado, setErrorAfiliado] = useState<string | null>(null)
  const [guardandoAfiliado, setGuardandoAfiliado] = useState(false)

  const proximaPago = calcularProximaFechaPago(
    negocio.fechaInicioSuscripcion,
    negocio.cicloFacturacion,
    new Date(),
    pagos[0]?.fechaPago ?? null
  )
  const estadoCiclo = cicloActualEstaAlDia(
    negocio.fechaInicioSuscripcion,
    pagos[0]?.fechaPago ?? null,
    negocio.cicloFacturacion
  )
  const puedeRegistrarPago =
    esPlanPagado(negocio.plan) &&
    negocio.suscripcionActiva &&
    negocio.precioMensual !== null

  const montoProximoPago =
    negocio.precioMensual === null
      ? null
      : calcularMontoCiclo(negocio.precioMensual, negocio.cicloFacturacion)

  const handleCambiarCiclo = async (ciclo: CicloFacturacion) => {
    if (ciclo === negocio.cicloFacturacion) {
      return
    }

    setErrorCiclo(null)
    setGuardandoCiclo(true)
    const anterior = negocio.cicloFacturacion
    setNegocio((actual) => ({ ...actual, cicloFacturacion: ciclo }))

    try {
      await actualizarCicloFacturacionAction(negocio.id, ciclo)
    } catch {
      setNegocio((actual) => ({ ...actual, cicloFacturacion: anterior }))
      setErrorCiclo('No se pudo actualizar el ciclo de facturación.')
    } finally {
      setGuardandoCiclo(false)
    }
  }

  const handleCambiarPlan = async (plan: string) => {
    const planAnterior = normalizarPlanSelect(negocio.plan)

    if (planAnterior === plan) {
      return
    }

    setErrorPlan(null)
    setGuardandoPlan(true)
    const anterior = negocio.plan
    const iniciaFacturacion =
      planAnterior === 'estandar' &&
      (plan === 'personal' || plan === 'premium')
    const fechaInicioSuscripcion = iniciaFacturacion
      ? new Date()
      : negocio.fechaInicioSuscripcion

    setNegocio((actual) => ({
      ...actual,
      plan,
      fechaInicioSuscripcion
    }))

    try {
      await actualizarPlanAction(negocio.id, plan, planAnterior)
    } catch {
      setNegocio((actual) => ({
        ...actual,
        plan: anterior,
        fechaInicioSuscripcion: negocio.fechaInicioSuscripcion
      }))
      setErrorPlan('No se pudo actualizar el plan.')
    } finally {
      setGuardandoPlan(false)
    }
  }

  const handleCambiarAfiliado = async (afiliadoId: string) => {
    const nuevoId = afiliadoId === '' ? null : afiliadoId

    if (nuevoId === negocio.afiliadoId) {
      return
    }

    setErrorAfiliado(null)
    setGuardandoAfiliado(true)
    const anterior = negocio.afiliadoId
    setNegocio((actual) => ({ ...actual, afiliadoId: nuevoId }))

    try {
      await actualizarAfiliadoNegocioAction(negocio.id, nuevoId)
    } catch {
      setNegocio((actual) => ({ ...actual, afiliadoId: anterior }))
      setErrorAfiliado('No se pudo actualizar el afiliado.')
    } finally {
      setGuardandoAfiliado(false)
    }
  }

  const opcionesAfiliado = (() => {
    const activos = [...afiliadosActivos]
    const asignado = negocio.afiliadoId
      ? activos.find((afiliado) => afiliado.id === negocio.afiliadoId)
      : null

    if (negocio.afiliadoId && !asignado) {
      return [
        {
          id: negocio.afiliadoId,
          nombre: 'Afiliado inactivo',
          codigo: negocio.afiliadoId.slice(0, 8)
        },
        ...activos
      ]
    }

    return activos
  })()

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

      {errorCiclo ? (
        <Alert severity='error' onClose={() => setErrorCiclo(null)}>
          {errorCiclo}
        </Alert>
      ) : null}

      {errorAfiliado ? (
        <Alert severity='error' onClose={() => setErrorAfiliado(null)}>
          {errorAfiliado}
        </Alert>
      ) : null}

      <Stack spacing={1.5}>
        <Typography variant='h6' component='h2' fontWeight={700}>
          Datos básicos
        </Typography>
        <Stack direction='row' flexWrap='wrap' useFlexGap spacing={1.5}>
          <TarjetaDato etiqueta='Nombre' valor={negocio.nombre} />
          <TarjetaDato etiqueta='Slug' valor={negocio.slug} />
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
              Plan
            </Typography>
            <FormControl size='small' fullWidth>
              <Select
                value={normalizarPlanSelect(negocio.plan)}
                disabled={guardandoPlan}
                onChange={(evento) => {
                  void handleCambiarPlan(evento.target.value)
                }}
                inputProps={{
                  'aria-label': 'Plan del negocio'
                }}
              >
                {OPCIONES_PLAN_ADMIN.map((opcion) => (
                  <MenuItem
                    key={opcion.valor}
                    value={opcion.valor}
                    disabled={opcion.deshabilitado}
                  >
                    {opcion.etiqueta}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {errorPlan ? (
              <Typography variant='caption' color='error' sx={{ mt: 0.5, display: 'block' }}>
                {errorPlan}
              </Typography>
            ) : null}
          </Box>
          <TarjetaDato
            etiqueta='Precio mensual'
            valor={
              negocio.precioMensual === null
                ? 'Sin definir'
                : formatearPrecioMensual(negocio.precioMensual)
            }
          />
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
              Ciclo de facturación
            </Typography>
            <FormControl size='small' fullWidth>
              <Select
                value={negocio.cicloFacturacion}
                disabled={guardandoCiclo}
                onChange={(evento) => {
                  void handleCambiarCiclo(
                    evento.target.value as CicloFacturacion
                  )
                }}
                inputProps={{
                  'aria-label': 'Ciclo de facturación'
                }}
              >
                {OPCIONES_CICLO.map((opcion) => (
                  <MenuItem key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <TarjetaDato
            etiqueta='Inicio de suscripción'
            valor={formatearFechaLegible(negocio.fechaInicioSuscripcion, true)}
          />
          <TarjetaDato
            etiqueta={
              negocio.cicloFacturacion === 'anual'
                ? 'Próximo pago anual'
                : 'Próximo pago mensual'
            }
            valor={
              montoProximoPago === null
                ? formatearFechaLegible(proximaPago, true)
                : `${formatearFechaLegible(proximaPago, true)} · ${formatearMontoRd(montoProximoPago)}`
            }
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
              Afiliado
            </Typography>
            <FormControl size='small' fullWidth>
              <Select
                value={negocio.afiliadoId ?? ''}
                disabled={guardandoAfiliado}
                displayEmpty
                onChange={(evento) => {
                  void handleCambiarAfiliado(evento.target.value)
                }}
                inputProps={{
                  'aria-label': 'Afiliado del negocio'
                }}
              >
                <MenuItem value=''>
                  <em>Ninguno</em>
                </MenuItem>
                {opcionesAfiliado.map((afiliado) => (
                  <MenuItem key={afiliado.id} value={afiliado.id}>
                    {afiliado.nombre} ({afiliado.codigo})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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
          montoCiclo={
            negocio.precioMensual === null
              ? 0
              : calcularMontoCiclo(
                  negocio.precioMensual,
                  negocio.cicloFacturacion
                )
          }
          cicloFacturacion={negocio.cicloFacturacion}
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
