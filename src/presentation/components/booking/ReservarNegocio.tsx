'use client'

import { useEffect, useMemo } from 'react'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DirectionsOutlinedIcon from '@mui/icons-material/DirectionsOutlined'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import type { Theme } from '@mui/material/styles'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import type { BusinessHours } from '@/domain/booking/booking.types'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'
import { useFlujoReservar } from '@/presentation/hooks/useFlujoReservar'
import { crearTema } from '@/presentation/theme/theme'
import { CLAVE_MODO_COLOR } from '@/presentation/theme/palette'
import { esPlanPremium } from '@/shared/utils/planes'
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

const crearTemaReservar = (
  temaBase: Theme,
  plan: string,
  colorAcento: string | null
) => {
  if (!esPlanPremium(plan) || !colorAcento?.trim()) {
    return temaBase
  }

  return createTheme(temaBase, {
    palette: {
      secondary: {
        main: colorAcento.trim()
      }
    }
  })
}

const PieCreadoConKortao = () => {
  return (
    <Typography
      variant='caption'
      color='text.secondary'
      textAlign='center'
      sx={{ display: 'block', pt: 2 }}
    >
      Creado con{' '}
      <Link
        href='https://kortao.com'
        target='_blank'
        rel='noopener noreferrer'
        color='inherit'
        underline='hover'
      >
        Kortao
      </Link>
    </Typography>
  )
}

const EncabezadoIdentidadNegocio = ({
  negocio
}: {
  negocio: NegocioPublico
}) => {
  if (!negocio.logoUrl) {
    return null
  }

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        py: { xs: 2.5, sm: 3 }
      }}
    >
      <Container maxWidth='sm'>
        <Stack spacing={1.5} alignItems='center' textAlign='center'>
          <Box
            component='img'
            src={negocio.logoUrl}
            alt={`Logo de ${negocio.nombre}`}
            sx={{
              maxHeight: { xs: 72, sm: 96 },
              maxWidth: '100%',
              objectFit: 'contain'
            }}
          />
          <Typography variant='h4' component='h1' color='primary'>
            {negocio.nombre}
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}

export const ReservarNegocio = ({
  negocio,
  servicios,
  horariosNegocio,
  disponible = true
}: ReservarNegocioProps) => {
  // Public booking links always stay light — clients share them; dark mode is for the panel.
  const temaReservar = useMemo(
    () =>
      crearTemaReservar(crearTema('light'), negocio.plan, negocio.colorAcento),
    [negocio.plan, negocio.colorAcento]
  )

  const flujo = useFlujoReservar({
    negocioId: negocio.id,
    negocioNombre: negocio.nombre,
    negocioDireccion: negocio.direccion,
    servicios,
    horariosNegocio
  })

  useEffect(() => {
    const html = document.documentElement

    html.style.backgroundColor = '#FBF8F3'
    html.style.colorScheme = 'light'
    html.setAttribute('data-color-mode', 'light')

    return () => {
      let preferido = 'light'
      try {
        const guardado = localStorage.getItem(CLAVE_MODO_COLOR)
        if (guardado === 'dark' || guardado === 'light') {
          preferido = guardado
        }
      } catch {
        // Ignore
      }

      html.style.backgroundColor =
        preferido === 'dark' ? '#0F1614' : '#FBF8F3'
      html.style.colorScheme = preferido
      html.setAttribute('data-color-mode', preferido)
    }
  }, [])

  const tieneLogo = Boolean(negocio.logoUrl)

  const contenido = !disponible ? (
    <Box
      component='main'
      bgcolor='background.default'
      minHeight='100vh'
      display='flex'
      flexDirection='column'
    >
      {tieneLogo ? (
        <EncabezadoIdentidadNegocio negocio={negocio} />
      ) : (
        <EncabezadoMarca mostrarModoColor={false} />
      )}
      <Container maxWidth='sm' sx={{ py: { xs: 8, sm: 12 }, flex: 1 }}>
        <Stack spacing={2} alignItems='center' textAlign='center'>
          {!tieneLogo ? (
            <Typography variant='h4' component='h1' color='primary'>
              {negocio.nombre}
            </Typography>
          ) : null}
          <Typography color='text.secondary'>
            Este negocio no está disponible en este momento.
          </Typography>
        </Stack>
      </Container>
      <Container maxWidth='sm' sx={{ pb: 3 }}>
        <PieCreadoConKortao />
      </Container>
    </Box>
  ) : (
    <Box
      component='main'
      bgcolor='background.default'
      minHeight='100vh'
      display='flex'
      flexDirection='column'
    >
      {tieneLogo ? (
        <EncabezadoIdentidadNegocio negocio={negocio} />
      ) : (
        <EncabezadoMarca mostrarModoColor={false} />
      )}
      <Container maxWidth='sm' sx={{ py: { xs: 3, sm: 5 }, flex: 1 }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            {!tieneLogo ? (
              <Typography variant='h4' component='h1' color='primary'>
                {negocio.nombre}
              </Typography>
            ) : null}
            {negocio.direccion ? (
              <Stack
                direction='row'
                spacing={0.75}
                alignItems='center'
                justifyContent={tieneLogo ? 'center' : 'flex-start'}
              >
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
                sx={{
                  alignSelf: tieneLogo ? 'center' : 'flex-start'
                }}
              >
                Cómo llegar
              </Button>
            ) : null}
            <Typography
              color='text.secondary'
              textAlign={tieneLogo ? 'center' : 'left'}
            >
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
      <Container maxWidth='sm' sx={{ pb: 3 }}>
        <PieCreadoConKortao />
      </Container>
    </Box>
  )

  return <ThemeProvider theme={temaReservar}>{contenido}</ThemeProvider>
}
