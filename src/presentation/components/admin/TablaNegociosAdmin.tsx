'use client'

import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { actualizarSuscripcionActivaAction } from '@/app/admin/actions'
import {
  calcularProximaFechaPago,
  diasHastaFecha
} from '@/shared/utils/suscripcion'

export type NegocioAdminFila = {
  id: string
  nombre: string
  plan: string
  fechaInicioSuscripcion: string
  suscripcionActiva: boolean
}

type TablaNegociosAdminProps = {
  negociosIniciales: NegocioAdminFila[]
}

const formatearFecha = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const etiquetaPlan = (plan: string): string => {
  if (plan === 'basico') {
    return 'Básico'
  }

  return plan
}

export const TablaNegociosAdmin = ({
  negociosIniciales
}: TablaNegociosAdminProps) => {
  const [negocios, setNegocios] = useState(negociosIniciales)
  const [error, setError] = useState<string | null>(null)
  const [actualizandoId, setActualizandoId] = useState<string | null>(null)

  const filas = useMemo(() => {
    return [...negocios]
      .map((negocio) => {
        const fechaInicio = new Date(negocio.fechaInicioSuscripcion)
        const proximaPago = calcularProximaFechaPago(fechaInicio)
        const dias = diasHastaFecha(proximaPago)

        return {
          ...negocio,
          fechaInicio,
          proximaPago,
          dias
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
                <TableCell>Inicio de suscripción</TableCell>
                <TableCell>Próximo pago</TableCell>
                <TableCell align='center'>Activa</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((fila) => (
                <TableRow key={fila.id} hover>
                  <TableCell>{fila.nombre}</TableCell>
                  <TableCell>{etiquetaPlan(fila.plan)}</TableCell>
                  <TableCell>{formatearFecha(fila.fechaInicio)}</TableCell>
                  <TableCell>
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Typography variant='body2'>
                        {formatearFecha(fila.proximaPago)}
                      </Typography>
                      {fila.dias < 0 ? (
                        <Chip size='small' color='error' label='Vencido' />
                      ) : fila.dias <= 3 ? (
                        <Chip size='small' color='warning' label='Pronto' />
                      ) : null}
                    </Stack>
                  </TableCell>
                  <TableCell align='center'>
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
