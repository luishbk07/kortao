'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  actualizarPlanAction,
  actualizarPrecioMensualAction,
  actualizarSuscripcionActivaAction
} from '@/app/admin/actions'
import { formatearFechaLegible } from '@/shared/utils/fechas'
import {
  calcularMontoCiclo,
  type CicloFacturacion
} from '@/shared/utils/planes'
import {
  calcularProximaFechaPago,
  diasHastaFecha,
  formatearMontoRd
} from '@/shared/utils/suscripcion'

export type NegocioAdminFila = {
  id: string
  nombre: string
  plan: string
  fechaInicioSuscripcion: string
  suscripcionActiva: boolean
  precioMensual: number | null
  cicloFacturacion: CicloFacturacion
}

type TablaNegociosAdminProps = {
  negociosIniciales: NegocioAdminFila[]
}

const OPCIONES_PLAN = [
  { valor: 'estandar', etiqueta: 'Estándar' },
  { valor: 'premium', etiqueta: 'Premium' }
] as const

const normalizarPlanSelect = (plan: string): string => {
  if (plan === 'estandar') {
    return 'estandar'
  }

  return 'premium'
}

const parsearPrecioMensual = (valor: string): number | null => {
  const texto = valor.trim()
  if (!texto) {
    return null
  }

  const numero = Number(texto)
  if (!Number.isFinite(numero) || numero < 0) {
    throw new Error('Precio inválido')
  }

  return numero
}

export const TablaNegociosAdmin = ({
  negociosIniciales
}: TablaNegociosAdminProps) => {
  const router = useRouter()
  const [negocios, setNegocios] = useState(negociosIniciales)
  const [preciosBorrador, setPreciosBorrador] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        negociosIniciales.map((negocio) => [
          negocio.id,
          negocio.precioMensual === null ? '' : String(negocio.precioMensual)
        ])
      )
  )
  const [error, setError] = useState<string | null>(null)
  const [actualizandoId, setActualizandoId] = useState<string | null>(null)

  const filas = useMemo(() => {
    return [...negocios]
      .map((negocio) => {
        const fechaInicio = new Date(negocio.fechaInicioSuscripcion)
        const proximaPago = calcularProximaFechaPago(
          fechaInicio,
          negocio.cicloFacturacion
        )
        const dias = diasHastaFecha(proximaPago)
        const montoProximoPago =
          negocio.precioMensual === null
            ? null
            : calcularMontoCiclo(
                negocio.precioMensual,
                negocio.cicloFacturacion
              )

        return {
          ...negocio,
          fechaInicio,
          proximaPago,
          dias,
          montoProximoPago
        }
      })
      .sort(
        (a, b) => a.proximaPago.getTime() - b.proximaPago.getTime()
      )
  }, [negocios])

  const handleCambiarActiva = async (
    negocioId: string,
    activa: boolean
  ) => {
    setError(null)
    setActualizandoId(negocioId)

    const anteriores = negocios
    setNegocios((actuales) =>
      actuales.map((negocio) =>
        negocio.id === negocioId
          ? { ...negocio, suscripcionActiva: activa }
          : negocio
      )
    )

    try {
      await actualizarSuscripcionActivaAction(negocioId, activa)
    } catch {
      setNegocios(anteriores)
      setError('No se pudo actualizar la suscripción. Inténtalo de nuevo.')
    } finally {
      setActualizandoId(null)
    }
  }

  const handleCambiarPlan = async (negocioId: string, plan: string) => {
    setError(null)

    const negocioActual = negocios.find((negocio) => negocio.id === negocioId)
    const planAnterior = negocioActual?.plan ?? 'estandar'
    const planAnteriorNormalizado = normalizarPlanSelect(planAnterior)

    if (planAnteriorNormalizado === plan) {
      return
    }

    const iniciaFacturacionPremium =
      planAnteriorNormalizado === 'estandar' && plan === 'premium'
    const fechaInicioSuscripcion = iniciaFacturacionPremium
      ? new Date().toISOString()
      : negocioActual?.fechaInicioSuscripcion

    setActualizandoId(negocioId)
    setNegocios((actuales) =>
      actuales.map((negocio) =>
        negocio.id === negocioId
          ? {
              ...negocio,
              plan,
              ...(fechaInicioSuscripcion
                ? { fechaInicioSuscripcion }
                : {})
            }
          : negocio
      )
    )

    try {
      await actualizarPlanAction(negocioId, plan, planAnteriorNormalizado)
    } catch {
      setNegocios((actuales) =>
        actuales.map((negocio) =>
          negocio.id === negocioId
            ? {
                ...negocio,
                plan: planAnterior,
                fechaInicioSuscripcion:
                  negocioActual?.fechaInicioSuscripcion ??
                  negocio.fechaInicioSuscripcion
              }
            : negocio
        )
      )
      setError('No se pudo actualizar el plan. Inténtalo de nuevo.')
    } finally {
      setActualizandoId(null)
    }
  }

  const handleGuardarPrecio = async (negocioId: string) => {
    setError(null)

    const negocioActual = negocios.find((negocio) => negocio.id === negocioId)
    const valorAnterior = negocioActual?.precioMensual ?? null
    const borrador = preciosBorrador[negocioId] ?? ''

    let precioNuevo: number | null

    try {
      precioNuevo = parsearPrecioMensual(borrador)
    } catch {
      setError('El precio mensual no es válido.')
      setPreciosBorrador((actuales) => ({
        ...actuales,
        [negocioId]: valorAnterior === null ? '' : String(valorAnterior)
      }))
      return
    }

    if (precioNuevo === valorAnterior) {
      return
    }

    setActualizandoId(negocioId)

    try {
      setNegocios((actuales) =>
        actuales.map((negocio) =>
          negocio.id === negocioId
            ? { ...negocio, precioMensual: precioNuevo }
            : negocio
        )
      )

      await actualizarPrecioMensualAction(negocioId, precioNuevo)
      setPreciosBorrador((actuales) => ({
        ...actuales,
        [negocioId]: precioNuevo === null ? '' : String(precioNuevo)
      }))
    } catch {
      setNegocios((actuales) =>
        actuales.map((negocio) =>
          negocio.id === negocioId
            ? { ...negocio, precioMensual: valorAnterior }
            : negocio
        )
      )
      setPreciosBorrador((actuales) => ({
        ...actuales,
        [negocioId]: valorAnterior === null ? '' : String(valorAnterior)
      }))
      setError('No se pudo guardar el precio mensual. Inténtalo de nuevo.')
    } finally {
      setActualizandoId(null)
    }
  }

  return (
    <Stack spacing={2}>
      {error ? (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {filas.length === 0 ? (
        <Typography color='text.secondary'>
          Aún no hay negocios registrados.
        </Typography>
      ) : (
        <TableContainer>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Negocio</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Precio mensual</TableCell>
                <TableCell>Inicio de suscripción</TableCell>
                <TableCell>Próximo pago</TableCell>
                <TableCell align='center'>Activa</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((fila) => (
                <TableRow
                  key={fila.id}
                  hover
                  onClick={() => {
                    router.push(`/admin/negocios/${fila.id}`)
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{fila.nombre}</TableCell>
                  <TableCell
                    onClick={(evento) => {
                      evento.stopPropagation()
                    }}
                  >
                    <FormControl size='small' sx={{ minWidth: 120 }}>
                      <Select
                        value={normalizarPlanSelect(fila.plan)}
                        disabled={actualizandoId === fila.id}
                        onChange={(evento) => {
                          void handleCambiarPlan(fila.id, evento.target.value)
                        }}
                        inputProps={{
                          'aria-label': `Plan de ${fila.nombre}`
                        }}
                      >
                        {OPCIONES_PLAN.map((opcion) => (
                          <MenuItem key={opcion.valor} value={opcion.valor}>
                            {opcion.etiqueta}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell
                    onClick={(evento) => {
                      evento.stopPropagation()
                    }}
                  >
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <TextField
                        size='small'
                        type='number'
                        placeholder='1000'
                        value={preciosBorrador[fila.id] ?? ''}
                        disabled={actualizandoId === fila.id}
                        onChange={(evento) => {
                          const valor = evento.target.value
                          setPreciosBorrador((actuales) => ({
                            ...actuales,
                            [fila.id]: valor
                          }))
                        }}
                        onBlur={() => {
                          void handleGuardarPrecio(fila.id)
                        }}
                        inputProps={{
                          min: 0,
                          step: 1,
                          'aria-label': `Precio mensual de ${fila.nombre}`
                        }}
                        sx={{ width: 110 }}
                      />
                      <IconButton
                        size='small'
                        color='primary'
                        aria-label={`Guardar precio de ${fila.nombre}`}
                        disabled={actualizandoId === fila.id}
                        onClick={() => {
                          void handleGuardarPrecio(fila.id)
                        }}
                      >
                        <SaveOutlinedIcon fontSize='small' />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {formatearFechaLegible(fila.fechaInicio, true)}
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Typography variant='body2'>
                          {formatearFechaLegible(fila.proximaPago, true)}
                        </Typography>
                        {fila.dias < 0 ? (
                          <Chip size='small' color='error' label='Vencido' />
                        ) : fila.dias <= 3 ? (
                          <Chip size='small' color='warning' label='Pronto' />
                        ) : null}
                      </Stack>
                      <Typography variant='caption' color='text.secondary'>
                        {fila.cicloFacturacion === 'anual'
                          ? 'Pago anual'
                          : 'Pago mensual'}
                        {fila.montoProximoPago === null
                          ? ''
                          : ` · ${formatearMontoRd(fila.montoProximoPago)}`}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell
                    align='center'
                    onClick={(evento) => {
                      evento.stopPropagation()
                    }}
                  >
                    <Switch
                      checked={fila.suscripcionActiva}
                      color='secondary'
                      disabled={actualizandoId === fila.id}
                      onChange={(evento) => {
                        void handleCambiarActiva(fila.id, evento.target.checked)
                      }}
                      inputProps={{
                        'aria-label': `Suscripción de ${fila.nombre}`
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  )
}
