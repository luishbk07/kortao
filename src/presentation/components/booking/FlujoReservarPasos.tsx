'use client'

import { useEffect, useRef, useState, type SyntheticEvent } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { calcularPrecioFinal } from '@/domain/business/servicio.rules'
import type { TimeSlot } from '@/domain/booking/booking.types'
import type { ServicioPublico } from '@/presentation/components/booking/tiposReservar'
import {
  FormularioCliente,
  esFormularioClienteValido
} from '@/presentation/components/booking/FormularioCliente'
import { ListaServicios } from '@/presentation/components/booking/ListaServicios'
import { ListaSlots } from '@/presentation/components/booking/ListaSlots'
import { ResumenReserva } from '@/presentation/components/booking/ResumenReserva'
import { SelectorFecha } from '@/presentation/components/booking/SelectorFecha'
import { desplazarAElemento } from '@/shared/utils/desplazamiento'
import {
  formatearHoraLegible,
  ZONA_HORARIA_NEGOCIO
} from '@/shared/utils/fechas'

type PasoReservar = 'servicio' | 'fecha' | 'horario' | 'datos'

type FlujoReservarPasosProps = {
  servicios: ServicioPublico[]
  servicioId: string | null
  servicioSeleccionado: ServicioPublico | null
  fecha: string
  fechaMinima: string
  slots: TimeSlot[]
  slotSeleccionado: TimeSlot | null
  cargandoSlots: boolean
  clienteNombre: string
  clienteTelefono: string
  clienteCorreo: string
  enviando: boolean
  onSeleccionarServicio: (servicioId: string) => void
  onCambiarFecha: (fecha: string) => void
  onSeleccionarSlot: (slot: TimeSlot) => void
  onCambiarNombre: (valor: string) => void
  onCambiarTelefono: (valor: string) => void
  onCambiarCorreo: (valor: string) => void
  onConfirmar: () => void
}

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(precio)
}

const formatearFechaResumen = (fecha: Date): string => {
  return new Intl.DateTimeFormat('es-DO', {
    timeZone: ZONA_HORARIA_NEGOCIO,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(fecha)
}


export const FlujoReservarPasos = ({
  servicios,
  servicioId,
  servicioSeleccionado,
  fecha,
  fechaMinima,
  slots,
  slotSeleccionado,
  cargandoSlots,
  clienteNombre,
  clienteTelefono,
  clienteCorreo,
  enviando,
  onSeleccionarServicio,
  onCambiarFecha,
  onSeleccionarSlot,
  onCambiarNombre,
  onCambiarTelefono,
  onCambiarCorreo,
  onConfirmar
}: FlujoReservarPasosProps) => {
  const tema = useTheme()
  const esEscritorio = useMediaQuery(tema.breakpoints.up('md'))
  const [pestana, setPestana] = useState<PasoReservar>('servicio')

  const refFecha = useRef<HTMLDivElement | null>(null)
  const refHorario = useRef<HTMLDivElement | null>(null)
  const refDatos = useRef<HTMLDivElement | null>(null)

  const puedeFecha = Boolean(servicioSeleccionado)
  const puedeHorario = Boolean(servicioSeleccionado && fecha)
  const puedeDatos = Boolean(slotSeleccionado)

  const formularioValido = esFormularioClienteValido(
    clienteNombre,
    clienteTelefono,
    clienteCorreo
  )

  const enfocarPaso = (paso: PasoReservar) => {
    if (esEscritorio) {
      setPestana(paso)
      return
    }

    const destino =
      paso === 'fecha'
        ? refFecha.current
        : paso === 'horario'
          ? refHorario.current
          : paso === 'datos'
            ? refDatos.current
            : null

    window.setTimeout(() => {
      desplazarAElemento(destino)
    }, 80)
  }

  useEffect(() => {
    if (!esEscritorio) {
      return
    }

    if (pestana === 'fecha' && !puedeFecha) {
      setPestana('servicio')
      return
    }

    if (pestana === 'horario' && !puedeHorario) {
      setPestana(puedeFecha ? 'fecha' : 'servicio')
      return
    }

    if (pestana === 'datos' && !puedeDatos) {
      setPestana(puedeHorario ? 'horario' : puedeFecha ? 'fecha' : 'servicio')
    }
  }, [esEscritorio, pestana, puedeDatos, puedeFecha, puedeHorario])

  const handleSeleccionarServicio = (id: string) => {
    onSeleccionarServicio(id)
    enfocarPaso('fecha')
  }

  const handleCambiarFecha = (nuevaFecha: string) => {
    onCambiarFecha(nuevaFecha)
    enfocarPaso('horario')
  }

  const handleSeleccionarSlot = (slot: TimeSlot) => {
    onSeleccionarSlot(slot)
    if (slot.disponible) {
      enfocarPaso('datos')
    }
  }

  const handleCambiarPestana = (
    _evento: SyntheticEvent,
    valor: PasoReservar
  ) => {
    if (valor === 'fecha' && !puedeFecha) {
      return
    }
    if (valor === 'horario' && !puedeHorario) {
      return
    }
    if (valor === 'datos' && !puedeDatos) {
      return
    }
    setPestana(valor)
  }

  const precioFinal = servicioSeleccionado
    ? calcularPrecioFinal(
        servicioSeleccionado.precio,
        servicioSeleccionado.descuentoTipo,
        servicioSeleccionado.descuentoValor
      )
    : 0

  const bloqueServicio = (
    <Stack spacing={1.5}>
      <Typography variant='h6' component='h2'>
        Elige un servicio
      </Typography>
      <ListaServicios
        servicios={servicios}
        servicioSeleccionadoId={servicioId}
        onSeleccionar={handleSeleccionarServicio}
      />
    </Stack>
  )

  const bloqueFecha = puedeFecha ? (
    <Box ref={refFecha}>
      <SelectorFecha
        fecha={fecha}
        fechaMinima={fechaMinima}
        onCambiarFecha={handleCambiarFecha}
      />
    </Box>
  ) : null

  const bloqueHorario = puedeHorario ? (
    <Box ref={refHorario}>
      <ListaSlots
        slots={slots}
        slotSeleccionado={slotSeleccionado}
        cargando={cargandoSlots}
        onSeleccionar={handleSeleccionarSlot}
      />
    </Box>
  ) : null

  const bloqueDatos = puedeDatos && servicioSeleccionado && slotSeleccionado ? (
    <Stack spacing={2.5} ref={refDatos}>
      <FormularioCliente
        clienteNombre={clienteNombre}
        clienteTelefono={clienteTelefono}
        clienteCorreo={clienteCorreo}
        enviando={enviando}
        onCambiarNombre={onCambiarNombre}
        onCambiarTelefono={onCambiarTelefono}
        onCambiarCorreo={onCambiarCorreo}
        onConfirmar={onConfirmar}
        mostrarBoton={false}
      />
      <ResumenReserva
        servicioNombre={servicioSeleccionado.nombre}
        precioFormateado={formatearPrecio(precioFinal)}
        fechaFormateada={formatearFechaResumen(slotSeleccionado.inicio)}
        horaFormateada={formatearHoraLegible(slotSeleccionado.inicio)}
        mostrarBoton
        botonDeshabilitado={!formularioValido || enviando}
        textoBoton={enviando ? 'Reservando...' : 'Confirmar reserva'}
        onConfirmar={onConfirmar}
      />
    </Stack>
  ) : null

  if (esEscritorio) {
    return (
      <Stack spacing={2.5}>
        <Tabs
          value={pestana}
          onChange={handleCambiarPestana}
          variant='fullWidth'
          textColor='secondary'
          indicatorColor='secondary'
        >
          <Tab label='Servicio' value='servicio' />
          <Tab label='Fecha' value='fecha' disabled={!puedeFecha} />
          <Tab label='Horario' value='horario' disabled={!puedeHorario} />
          <Tab label='Tus datos' value='datos' disabled={!puedeDatos} />
        </Tabs>

        {pestana === 'servicio' ? bloqueServicio : null}
        {pestana === 'fecha' ? bloqueFecha : null}
        {pestana === 'horario' ? bloqueHorario : null}
        {pestana === 'datos' ? bloqueDatos : null}
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      {bloqueServicio}
      {bloqueFecha}
      {bloqueHorario}
      {bloqueDatos}
    </Stack>
  )
}
