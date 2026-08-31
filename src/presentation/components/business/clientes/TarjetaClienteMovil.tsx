'use client'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ClienteRecurrente } from '@/domain/business/reportes.types'
import {
  construirEnlaceWhatsapp,
  formatearTelefonoVisual
} from '@/shared/utils/telefono'
import {
  formatearUltimaVisitaCliente,
  obtenerIniciales
} from './helpersClientes'

type TarjetaClienteMovilProps = {
  cliente: ClienteRecurrente
}

export const TarjetaClienteMovil = ({ cliente }: TarjetaClienteMovilProps) => {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        px: 2,
        py: 1.5
      }}
    >
      <Stack direction='row' spacing={1.5} alignItems='center' mb={1}>
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
        <Box>
          <Typography fontWeight={600}>{cliente.clienteNombre}</Typography>
          <Typography variant='body2' color='text.secondary'>
            {cliente.numeroVisitas} visitas ·{' '}
            {formatearUltimaVisitaCliente(cliente.ultimaVisita)}
          </Typography>
        </Box>
      </Stack>
      <Stack spacing={0.5}>
        <Link
          href={construirEnlaceWhatsapp(cliente.clienteTelefono)}
          target='_blank'
          rel='noopener noreferrer'
          underline='hover'
          color='primary'
          variant='body2'
        >
          {formatearTelefonoVisual(cliente.clienteTelefono)}
        </Link>
        {cliente.clienteCorreo ? (
          <Link
            href={`mailto:${cliente.clienteCorreo}`}
            underline='hover'
            color='primary'
            variant='body2'
          >
            {cliente.clienteCorreo}
          </Link>
        ) : null}
      </Stack>
    </Box>
  )
}
