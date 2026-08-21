'use client'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { ClienteRecurrente } from '@/domain/business/reportes.types'
import {
  formatearFechaLegible,
  formatearHoraLegible
} from '@/shared/utils/fechas'
import { formatearTelefonoVisual } from '@/shared/utils/telefono'

type ListaClientesRecurrentesProps = {
  clientes: ClienteRecurrente[]
}

export const ListaClientesRecurrentes = ({
  clientes
}: ListaClientesRecurrentesProps) => {
  if (clientes.length === 0) {
    return (
      <Typography color='text.secondary'>
        Aún no hay clientes con 2 o más visitas.
      </Typography>
    )
  }

  return (
    <>
      <TableContainer
        component={Paper}
        variant='outlined'
        sx={{ display: { xs: 'none', sm: 'block' } }}
      >
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell align='right'>Visitas</TableCell>
              <TableCell>Última visita</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.clienteTelefono}>
                <TableCell>{cliente.clienteNombre}</TableCell>
                <TableCell>
                  {formatearTelefonoVisual(cliente.clienteTelefono)}
                </TableCell>
                <TableCell align='right'>{cliente.numeroVisitas}</TableCell>
                <TableCell>
                  {formatearFechaLegible(cliente.ultimaVisita, false)}
                  {' · '}
                  {formatearHoraLegible(cliente.ultimaVisita)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack spacing={1.5} sx={{ display: { xs: 'flex', sm: 'none' } }}>
        {clientes.map((cliente) => (
          <Box
            key={cliente.clienteTelefono}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
              px: 2,
              py: 1.5
            }}
          >
            <Typography fontWeight={600}>{cliente.clienteNombre}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {formatearTelefonoVisual(cliente.clienteTelefono)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {cliente.numeroVisitas} visitas ·{' '}
              {formatearFechaLegible(cliente.ultimaVisita, false)}
            </Typography>
          </Box>
        ))}
      </Stack>
    </>
  )
}
