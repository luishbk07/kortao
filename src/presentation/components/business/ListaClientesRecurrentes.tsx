'use client'

import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { ClienteRecurrente } from '@/domain/business/reportes.types'
import { exportarClientesAExcel } from '@/presentation/lib/exportarClientesExcel'
import { BarraHerramientasClientes } from './clientes/BarraHerramientasClientes'
import { FilaClienteTabla } from './clientes/FilaClienteTabla'
import { TarjetaClienteMovil } from './clientes/TarjetaClienteMovil'
import {
  TAMANO_PAGINA_CLIENTES,
  coincideBusquedaCliente
} from './clientes/helpersClientes'

type ListaClientesRecurrentesProps = {
  clientes: ClienteRecurrente[]
}

export const ListaClientesRecurrentes = ({
  clientes
}: ListaClientesRecurrentesProps) => {
  const [busqueda, setBusqueda] = useState('')
  const [minVisitas, setMinVisitas] = useState(2)
  const [visibles, setVisibles] = useState(TAMANO_PAGINA_CLIENTES)

  const filtrados = useMemo(() => {
    return clientes.filter(
      (cliente) =>
        cliente.numeroVisitas >= minVisitas &&
        coincideBusquedaCliente(cliente, busqueda)
    )
  }, [busqueda, clientes, minVisitas])

  const maxVisitas = useMemo(() => {
    return filtrados.reduce(
      (maximo, cliente) => Math.max(maximo, cliente.numeroVisitas),
      1
    )
  }, [filtrados])

  const pagina = filtrados.slice(0, visibles)
  const hayMas = visibles < filtrados.length

  if (clientes.length === 0) {
    return (
      <Typography color='text.secondary'>
        Aún no hay clientes con visitas registradas.
      </Typography>
    )
  }

  return (
    <Paper
      variant='outlined'
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      <BarraHerramientasClientes
        busqueda={busqueda}
        minVisitas={minVisitas}
        puedeExportar={filtrados.length > 0}
        onBusquedaChange={(valor) => {
          setBusqueda(valor)
          setVisibles(TAMANO_PAGINA_CLIENTES)
        }}
        onMinVisitasChange={(valor) => {
          setMinVisitas(valor)
          setVisibles(TAMANO_PAGINA_CLIENTES)
        }}
        onVerTodos={() => {
          setMinVisitas(1)
          setBusqueda('')
          setVisibles(TAMANO_PAGINA_CLIENTES)
        }}
        onExportar={() => {
          exportarClientesAExcel(filtrados)
        }}
      />

      {filtrados.length === 0 ? (
        <Box sx={{ px: 2, py: 4 }}>
          <Typography color='text.secondary' textAlign='center'>
            No hay clientes que coincidan con la búsqueda o el filtro.
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell
                    sx={{
                      bgcolor: (tema) => alpha(tema.palette.primary.main, 0.06),
                      width: 140
                    }}
                  >
                    Visitas
                  </TableCell>
                  <TableCell>Última visita</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagina.map((cliente) => (
                  <FilaClienteTabla
                    key={cliente.clienteTelefono}
                    cliente={cliente}
                    maxVisitas={maxVisitas}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack
            spacing={1.5}
            sx={{ display: { xs: 'flex', md: 'none' }, p: 2 }}
          >
            {pagina.map((cliente) => (
              <TarjetaClienteMovil
                key={cliente.clienteTelefono}
                cliente={cliente}
              />
            ))}
          </Stack>

          <Stack
            direction='row'
            justifyContent='flex-end'
            alignItems='center'
            spacing={2}
            sx={{
              px: 2,
              py: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              {pagina.length === 0 ? '0' : `1-${pagina.length}`} de{' '}
              {filtrados.length}
            </Typography>
            {hayMas ? (
              <Button
                variant='outlined'
                color='inherit'
                sx={{ borderRadius: 2 }}
                onClick={() => {
                  setVisibles((actual) => actual + TAMANO_PAGINA_CLIENTES)
                }}
              >
                Ver más
              </Button>
            ) : null}
          </Stack>
        </>
      )}
    </Paper>
  )
}
