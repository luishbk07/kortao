'use client'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { BusinessHours } from '@/domain/booking/booking.types'
import { useFlujoReservar } from '@/presentation/hooks/useFlujoReservar'
import { FormularioCliente } from './FormularioCliente'
import { ListaServicios } from './ListaServicios'
import { ListaSlots } from './ListaSlots'
import { SelectorFecha } from './SelectorFecha'
import type { NegocioPublico, ServicioPublico } from './tiposReservar'

type ReservarNegocioProps = {
  negocio: NegocioPublico
  servicios: ServicioPublico[]
  horariosNegocio: BusinessHours[]
}

export const ReservarNegocio = ({
  negocio,
  servicios,
  horariosNegocio
}: ReservarNegocioProps) => {
  const flujo = useFlujoReservar({
    negocioId: negocio.id,
    servicios,
    horariosNegocio
  })

  return (
    <Box component='main' bgcolor='background.default' minHeight='100vh'>
      <Container maxWidth='sm' sx={{ py: { xs: 3, sm: 5 } }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant='h4' component='h1' color='primary'>
              {negocio.nombre}
            </Typography>
            {negocio.direccion ? (
              <Stack direction='row' spacing={0.75} alignItems='center'>
                <PlaceOutlinedIcon fontSize='small' color='action' />
                <Typography color='text.secondary'>
                  {negocio.direccion}
                </Typography>
              </Stack>
            ) : null}
            <Typography color='text.secondary'>
              Reserva tu cita en unos pasos.
            </Typography>
          </Stack>

          {flujo.mensajeExito ? (
            <Alert
              severity='success'
              icon={<CheckCircleOutlineIcon fontSize='inherit' />}
            >
              {flujo.mensajeExito}
            </Alert>
          ) : null}

          {flujo.mensajeError ? (
            <Alert
              severity='error'
              onClose={() => flujo.setMensajeError(null)}
            >
              {flujo.mensajeError}
            </Alert>
          ) : null}

          <Stack spacing={1.5}>
            <Typography variant='h6' component='h2'>
              Elige un servicio
            </Typography>
            <ListaServicios
              servicios={servicios}
              servicioSeleccionadoId={flujo.servicioId}
              onSeleccionar={flujo.seleccionarServicio}
            />
          </Stack>

          {flujo.servicioSeleccionado ? (
            <SelectorFecha
              fecha={flujo.fecha}
              fechaMinima={flujo.fechaMinima}
              onCambiarFecha={flujo.cambiarFecha}
            />
          ) : null}

          {flujo.servicioSeleccionado && flujo.fecha ? (
            <ListaSlots
              slots={flujo.slots}
              slotSeleccionado={flujo.slotSeleccionado}
              cargando={flujo.cargandoSlots}
              onSeleccionar={flujo.seleccionarSlot}
            />
          ) : null}

          {flujo.slotSeleccionado ? (
            <FormularioCliente
              clienteNombre={flujo.clienteNombre}
              clienteTelefono={flujo.clienteTelefono}
              enviando={flujo.enviando}
              onCambiarNombre={flujo.setClienteNombre}
              onCambiarTelefono={flujo.setClienteTelefono}
              onConfirmar={() => {
                void flujo.confirmarReserva()
              }}
            />
          ) : null}
        </Stack>
      </Container>
    </Box>
  )
}
