'use client'

import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
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
import { actualizarEstadoReporteSoporteAction } from '@/app/admin/actions'
import type {
  EstadoReporteSoporte,
  ReporteSoporteAdmin
} from '@/domain/support/support.types'
import {
  formatearFechaLegible,
  formatearHoraLegible
} from '@/shared/utils/fechas'
import { useContadorReportesPendientes } from '@/presentation/lib/contadorReportesPendientes'

type TablaReportesSoporteAdminProps = {
  reportesIniciales: ReporteSoporteAdmin[]
}

const etiquetaEstado = (estado: EstadoReporteSoporte): string => {
  return estado === 'resuelto' ? 'Resuelto' : 'Pendiente'
}

const colorEstado = (
  estado: EstadoReporteSoporte
): 'success' | 'warning' => {
  return estado === 'resuelto' ? 'success' : 'warning'
}

const ordenarReportes = (
  reportes: ReporteSoporteAdmin[]
): ReporteSoporteAdmin[] => {
  return [...reportes].sort((a, b) => {
    if (a.estado !== b.estado) {
      if (a.estado === 'pendiente') {
        return -1
      }

      if (b.estado === 'pendiente') {
        return 1
      }
    }

    return b.creadoEn.getTime() - a.creadoEn.getTime()
  })
}

export const TablaReportesSoporteAdmin = ({
  reportesIniciales
}: TablaReportesSoporteAdminProps) => {
  const [reportes, setReportes] = useState(reportesIniciales)
  const [actualizandoId, setActualizandoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ordenados = useMemo(() => ordenarReportes(reportes), [reportes])
  const contador = useContadorReportesPendientes()

  const handleToggleEstado = async (reporte: ReporteSoporteAdmin) => {
    const siguienteEstado: EstadoReporteSoporte =
      reporte.estado === 'pendiente' ? 'resuelto' : 'pendiente'
    const deltaPendientes = siguienteEstado === 'resuelto' ? -1 : 1

    setError(null)
    setActualizandoId(reporte.id)
    setReportes((actuales) =>
      actuales.map((item) =>
        item.id === reporte.id
          ? { ...item, estado: siguienteEstado }
          : item
      )
    )
    contador?.ajustarReportesPendientes(deltaPendientes)

    try {
      await actualizarEstadoReporteSoporteAction(reporte.id, siguienteEstado)
    } catch {
      setReportes((actuales) =>
        actuales.map((item) =>
          item.id === reporte.id
            ? { ...item, estado: reporte.estado }
            : item
        )
      )
      contador?.ajustarReportesPendientes(-deltaPendientes)
      setError('No se pudo actualizar el estado. Inténtalo de nuevo.')
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

      {ordenados.length === 0 ? (
        <Typography color='text.secondary'>
          No hay reportes de soporte todavía.
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
                <TableCell>Negocio</TableCell>
                <TableCell>Mensaje</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align='right'>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordenados.map((reporte) => (
                <TableRow key={reporte.id} hover>
                  <TableCell sx={{ verticalAlign: 'top', fontWeight: 600 }}>
                    {reporte.negocioNombre}
                  </TableCell>
                  <TableCell
                    sx={{
                      verticalAlign: 'top',
                      whiteSpace: 'pre-wrap',
                      maxWidth: 420
                    }}
                  >
                    {reporte.mensaje}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    {formatearFechaLegible(reporte.creadoEn, true)}
                    <br />
                    {formatearHoraLegible(reporte.creadoEn)}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Chip
                      size='small'
                      label={etiquetaEstado(reporte.estado)}
                      color={colorEstado(reporte.estado)}
                    />
                  </TableCell>
                  <TableCell align='right' sx={{ verticalAlign: 'top' }}>
                    <Button
                      size='small'
                      variant='outlined'
                      color='primary'
                      disabled={actualizandoId === reporte.id}
                      onClick={() => {
                        void handleToggleEstado(reporte)
                      }}
                    >
                      {reporte.estado === 'pendiente'
                        ? 'Marcar resuelto'
                        : 'Marcar pendiente'}
                    </Button>
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
