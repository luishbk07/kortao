'use client'

import { useEffect, useMemo, useRef } from 'react'
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
import { desplazarAlInicio } from '@/shared/utils/desplazamiento'
import { esPlanPagado } from '@/shared/utils/planes'
import { construirUrlMapas } from '@/shared/utils/sitio'
import { FlujoReservarPasos } from './FlujoReservarPasos'
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
  if (!esPlanPagado(plan) || !colorAcento?.trim()) {
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

  const refResultado = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!flujo.mensajeExito && !flujo.mensajeError) {
      return
    }

    desplazarAlInicio()
    refResultado.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }, [flujo.mensajeExito, flujo.mensajeError])

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
      <Container maxWidth='md' sx={{ py: { xs: 3, sm: 5 }, flex: 1 }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            {!tieneLogo ? (
              <Typography variant='h4' component='h1' color='primary'>
                {negocio.nombre}
              </Typography>
            ) : null}
            {negocio.direccion ? (
              <Link
                href={construirUrlMapas(
                  negocio.direccion,
                  negocio.latitud,
                  negocio.longitud
                )}
                target='_blank'
                rel='noopener noreferrer'
                underline='hover'
                color='primary'
                aria-label={`Abrir ubicación en mapas: ${negocio.direccion}`}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  maxWidth: '100%',
                  alignSelf: tieneLogo ? 'center' : 'flex-start',
                  fontWeight: 500
                }}
              >
                <PlaceOutlinedIcon fontSize='small' color='primary' />
                <Typography
                  component='span'
                  color='inherit'
                  sx={{ textDecoration: 'none', textUnderlineOffset: 3 }}
                >
                  {negocio.direccion}
                </Typography>
                <DirectionsOutlinedIcon
                  fontSize='small'
                  color='secondary'
                  sx={{
                    '&:hover': {
                      color: 'secondary.dark',
                    },
                  }}
                />
              </Link>
            ) : null}
            {negocio.latitud !== null && negocio.longitud !== null ? (
              <Button
                component='a'
                href={construirUrlMapas(
                  negocio.direccion ?? negocio.nombre,
                  negocio.latitud,
                  negocio.longitud
                )}
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

          <Box ref={refResultado}>
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
                sx={{ mt: flujo.mensajeExito ? 1.5 : 0 }}
              >
                {flujo.mensajeError}
              </Alert>
            ) : null}
          </Box>

          <FlujoReservarPasos
            servicios={servicios}
            servicioId={flujo.servicioId}
            servicioSeleccionado={flujo.servicioSeleccionado}
            fecha={flujo.fecha}
            fechaMinima={flujo.fechaMinima}
            slots={flujo.slots}
            slotSeleccionado={flujo.slotSeleccionado}
            cargandoSlots={flujo.cargandoSlots}
            clienteNombre={flujo.clienteNombre}
            clienteTelefono={flujo.clienteTelefono}
            clienteCorreo={flujo.clienteCorreo}
            enviando={flujo.enviando}
            onSeleccionarServicio={flujo.seleccionarServicio}
            onCambiarFecha={flujo.cambiarFecha}
            onSeleccionarSlot={flujo.seleccionarSlot}
            onCambiarNombre={flujo.setClienteNombre}
            onCambiarTelefono={flujo.setClienteTelefono}
            onCambiarCorreo={flujo.setClienteCorreo}
            onConfirmar={() => {
              void flujo.confirmarReserva()
            }}
          />
        </Stack>
      </Container>
      <Container maxWidth='sm' sx={{ pb: 3 }}>
        <PieCreadoConKortao />
      </Container>
    </Box>
  )

  return <ThemeProvider theme={temaReservar}>{contenido}</ThemeProvider>
}
