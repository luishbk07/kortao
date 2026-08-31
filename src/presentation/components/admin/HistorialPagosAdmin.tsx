'use client'

import { useState } from 'react'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { registrarPagoAction } from '@/app/admin/actions'
import type { PagoNegocioAdmin } from '@/domain/admin/admin.types'
import {
  formatearFechaLegible,
  parsearFechaCalendario
} from '@/shared/utils/fechas'
import { formatearMontoRd } from '@/shared/utils/suscripcion'

type HistorialPagosAdminProps = {
  negocioId: string
  montoCiclo: number
  cicloFacturacion: 'mensual' | 'anual'
  pagos: PagoNegocioAdmin[]
  onPagosChange: (pagos: PagoNegocioAdmin[]) => void
  puedeRegistrar: boolean
}

export const HistorialPagosAdmin = ({
  negocioId,
  montoCiclo,
  cicloFacturacion,
  pagos,
  onPagosChange,
  puedeRegistrar
}: HistorialPagosAdminProps) => {
  const [registrando, setRegistrando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const etiquetaBoton =
    cicloFacturacion === 'anual'
      ? 'Registrar pago de este año'
      : 'Registrar pago de este mes'

  const handleRegistrar = async () => {
    setError(null)
    setRegistrando(true)

    try {
      const pago = await registrarPagoAction(negocioId, montoCiclo)
      const mapeado: PagoNegocioAdmin = {
        id: pago.id,
        fechaPago: parsearFechaCalendario(pago.fechaPago),
        monto: pago.monto
      }
      onPagosChange([mapeado, ...pagos])
    } catch {
      setError('No se pudo registrar el pago. Inténtalo de nuevo.')
    } finally {
      setRegistrando(false)
    }
  }

  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent='space-between'
      >
        <Typography variant='h6' component='h2' fontWeight={700}>
          Historial de pagos
        </Typography>
        {puedeRegistrar ? (
          <Button
            variant='contained'
            color='secondary'
            startIcon={<PaymentsOutlinedIcon />}
            disabled={registrando}
            onClick={() => {
              void handleRegistrar()
            }}
          >
            {registrando ? 'Registrando...' : etiquetaBoton}
          </Button>
        ) : null}
      </Stack>

      {error ? (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {pagos.length === 0 ? (
        <Typography color='text.secondary'>
          Aún no hay pagos registrados para este negocio.
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
                <TableCell>Fecha de pago</TableCell>
                <TableCell>Monto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagos.map((pago) => (
                <TableRow key={pago.id} hover>
                  <TableCell>
                    {formatearFechaLegible(pago.fechaPago, true)}
                  </TableCell>
                  <TableCell>{formatearMontoRd(pago.monto)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  )
}
