'use client'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DirectionsOutlinedIcon from '@mui/icons-material/DirectionsOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { BusinessHours } from '@/domain/booking/booking.types'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'
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
  disponible?: boolean
}

export const ReservarNegocio = ({
  negocio,
  servicios,
  horariosNegocio,
  disponible = true
}: ReservarNegocioProps) => {
  const flujo = useFlujoReservar({
    negocioId: negocio.id,
    negocioNombre: negocio.nombre,
    negocioDireccion: negocio.direccion,
    servicios,
    horariosNegocio
  })

  if (!disponible) {
    return (
      <Box component='main' bgcolor='background.default' minHeight='100vh'>
        <EncabezadoMarca />
        <Container maxWidth='sm' sx={{ py: { xs: 8, sm: 12 } }}>
          <Stack spacing={2} alignItems='center' textAlign='center'>
            <Typography variant='h4' component='h1' color='primary'>
              {negocio.nombre}
            </Typography>
            <Typography color='text.secondary'>
              Este negocio no está disponible en este momento.
            </Typography>
          </Stack>
        </Container>
      </Box>
    )
  }

  return (
    <Box component='main' bgcolor='background.default' minHeight='100vh'>
      <EncabezadoMarca />
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
            {negocio.latitud !== null && negocio.longitud !== null ? (
              <Button
                component='a'
                href={`https://www.google.com/maps/dir/?api=1&destination=${negocio.latitud},${negocio.longitud}`}
                target='_blank'
                rel='noopener noreferrer'
                variant='outlined'
                color='primary'
                size='small'
                startIcon={<DirectionsOutlinedIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                Cómo llegar
              </Button>
            ) : null}
            <Typography color='text.secondary'>
              Reserva tu cita en unos pasos.
            </Typography>
          </Stack>

          {flujo.mensajeExito ? (
            <Stack spacing={1.5}>
              <Alert
                severity='success'
                icon={<CheckCircleOutlineIcon fontSize='inherit' />}
              >
                {flujo.mensajeExito}
              </Alert>
              {flujo.enlaceGoogleCalendar ? (
                <Stack spacing={1}>
                  <Typography color='text.secondary'>
                    Te gustaría agregarla a Google Calendar?
                  </Typography>
                  <Button
                    component='a'
                    href={flujo.enlaceGoogleCalendar}
                    target='_blank'
                    rel='noopener noreferrer'
                    variant='outlined'
                    color='primary'
                    size='small'
                    startIcon={<EventOutlinedIcon />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Añadir a Google Calendar
                  </Button>
                </Stack>
              ) : null}
            </Stack>
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
              clienteCorreo={flujo.clienteCorreo}
              enviando={flujo.enviando}
              onCambiarNombre={flujo.setClienteNombre}
              onCambiarTelefono={flujo.setClienteTelefono}
              onCambiarCorreo={flujo.setClienteCorreo}
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
