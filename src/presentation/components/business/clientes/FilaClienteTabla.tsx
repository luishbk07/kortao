'use client'

import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { ClienteRecurrente } from '@/domain/business/reportes.types'
import {
  construirEnlaceWhatsapp,
  formatearTelefonoVisual
} from '@/shared/utils/telefono'
import {
  formatearUltimaVisitaCliente,
  obtenerIniciales
} from './helpersClientes'

type FilaClienteTablaProps = {
  cliente: ClienteRecurrente
  maxVisitas: number
}

export const FilaClienteTabla = ({
  cliente,
  maxVisitas
}: FilaClienteTablaProps) => {
  const porcentaje = Math.max(
    18,
    (cliente.numeroVisitas / maxVisitas) * 100
  )

  return (
    <TableRow
      hover
      sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}
    >
      <TableCell>
        <Stack direction='row' spacing={1.5} alignItems='center'>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: 13,
              fontWeight: 600,
              bgcolor: 'primary.main',
              color: 'primary.contrastText'
            }}
          >
            {obtenerIniciales(cliente.clienteNombre)}
          </Avatar>
          <Typography fontWeight={600}>{cliente.clienteNombre}</Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction='row' spacing={0.75} alignItems='center'>
          <PhoneOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Link
            href={construirEnlaceWhatsapp(cliente.clienteTelefono)}
            target='_blank'
            rel='noopener noreferrer'
            underline='hover'
            color='primary'
          >
            {formatearTelefonoVisual(cliente.clienteTelefono)}
          </Link>
        </Stack>
      </TableCell>
      <TableCell>
        {cliente.clienteCorreo ? (
          <Link
            href={`mailto:${cliente.clienteCorreo}`}
            underline='hover'
            color='primary'
          >
            {cliente.clienteCorreo}
          </Link>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            —
          </Typography>
        )}
      </TableCell>
      <TableCell
        sx={{
          bgcolor: (tema) => alpha(tema.palette.primary.main, 0.06),
          py: 1.25
        }}
      >
        <Box
          sx={{
            position: 'relative',
            height: 28,
            borderRadius: 1.5,
            bgcolor: (tema) => alpha(tema.palette.primary.main, 0.18),
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              width: `${porcentaje}%`,
              bgcolor: 'primary.main',
              borderRadius: 1.5
            }}
          />
          <Typography
            variant='body2'
            fontWeight={700}
            sx={{
              position: 'relative',
              zIndex: 1,
              px: 1.25,
              lineHeight: '28px',
              textAlign: 'right',
              color: porcentaje >= 55 ? 'primary.contrastText' : 'primary.dark'
            }}
          >
            {cliente.numeroVisitas}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant='body2' color='text.secondary'>
          {formatearUltimaVisitaCliente(cliente.ultimaVisita)}
        </Typography>
      </TableCell>
    </TableRow>
  )
}
