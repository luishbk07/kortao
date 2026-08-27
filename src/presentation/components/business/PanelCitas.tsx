'use client'

import { useCallback, useEffect, useState, type SyntheticEvent } from 'react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { crearObtenerCitasPorRango } from '@/application/useCases/booking/obtenerCitasPorRango'
import type { Booking, BusinessHours } from '@/domain/booking/booking.types'
import { bookingRepositorySupabase } from '@/infrastructure/supabase/bookingRepository.supabase'
import type { ServicioPublico } from '@/presentation/components/booking/tiposReservar'
import {
  obtenerRangoTabCitas,
  type TabCitas
} from '@/shared/utils/rangosCitas'
import { formatearFechaLegible } from '@/shared/utils/fechas'
import { DialogNuevaCita } from './DialogNuevaCita'
import { EnlaceReservaPublica } from './EnlaceReservaPublica'
import { EsqueletoListaCitas } from './EsqueletoListaCitas'
import { IndicadorUsoPlanGratis } from './IndicadorUsoPlanGratis'
import { ListaCitasPanel } from './ListaCitasPanel'

type PanelCitasProps = {
  negocioId: string
  negocioSlug: string
  citasFuturasActivas: number | null
  esPremium: boolean
  servicios: ServicioPublico[]
  horariosNegocio: BusinessHours[]
}

const obtenerCitasPorRango = crearObtenerCitasPorRango(
  bookingRepositorySupabase
)

const mensajesVacios: Record<TabCitas, string> = {
  hoy: 'No hay citas para hoy.',
  proximas: 'No hay citas próximas.',
  pasadas: 'No hay citas pasadas.'
}

const ordenarCitas = (citas: Booking[], tab: TabCitas): Booking[] => {
  if (tab !== 'pasadas') {
    return citas
  }

  return [...citas].sort(
    (a, b) => b.fechaHora.getTime() - a.fechaHora.getTime()
  )
}

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(precio)
}

const ResumenPasadas = ({ citas }: { citas: Booking[] }) => {
  const completadas = citas.filter((cita) => cita.estado === 'completada')
  const totalIngresos = completadas.reduce(
    (acumulado, cita) => acumulado + (cita.precio ?? 0),
    0
  )

  return (
    <Paper variant='outlined' sx={{ p: 2 }}>
      <Stack spacing={0.5}>
        <Typography variant='subtitle2' color='primary'>
          Resumen del período
        </Typography>
        <Typography color='text.secondary'>
          Citas atendidas: {completadas.length}
        </Typography>
        <Typography color='text.secondary'>
          Total: {formatearPrecio(totalIngresos)}
        </Typography>
      </Stack>
    </Paper>
  )
}

export const PanelCitas = ({
  negocioId,
  negocioSlug,
  citasFuturasActivas,
  esPremium,
  servicios,
  horariosNegocio
}: PanelCitasProps) => {
  const [tab, setTab] = useState<TabCitas>('hoy')
  const [citas, setCitas] = useState<Booking[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conteoCitasActivas, setConteoCitasActivas] = useState(
    citasFuturasActivas
  )
  const [dialogoNuevaCitaAbierto, setDialogoNuevaCitaAbierto] = useState(false)

  const fechaHoy = formatearFechaLegible(new Date(), false)

  const refrescarConteoPlanGratis = useCallback(async () => {
    if (citasFuturasActivas === null) {
      return
    }

    try {
      const conteo =
        await bookingRepositorySupabase.contarCitasFuturasActivas(negocioId)
      setConteoCitasActivas(conteo)
    } catch {
      // Keep the last known count if refresh fails.
    }
  }, [citasFuturasActivas, negocioId])

  const cargarCitas = useCallback(async (tabActiva: TabCitas) => {
    setCargando(true)
    setError(null)

    try {
      const { desde, hasta } = obtenerRangoTabCitas(tabActiva, new Date())
      const resultado = await obtenerCitasPorRango(negocioId, desde, hasta)
      setCitas(ordenarCitas(resultado, tabActiva))
    } catch {
      setCitas([])
      setError('No se pudieron cargar las citas. Inténtalo de nuevo.')
    } finally {
      setCargando(false)
    }
  }, [negocioId])

  useEffect(() => {
    void cargarCitas(tab)
  }, [tab, cargarCitas])

  useEffect(() => {
    setConteoCitasActivas(citasFuturasActivas)
  }, [citasFuturasActivas])

  const handleCambiarTab = (
    _evento: SyntheticEvent,
    nuevoValor: TabCitas
  ) => {
    setTab(nuevoValor)
  }

  const handleCitaCreada = () => {
    void cargarCitas(tab)
    void refrescarConteoPlanGratis()
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent='space-between'
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
      >
        <Stack spacing={0.5}>
          <Typography variant='h5' component='h1' color='primary'>
            Citas
          </Typography>
          <Typography
            color='text.secondary'
            sx={{ textTransform: 'capitalize' }}
          >
            {fechaHoy}
          </Typography>
        </Stack>

        {esPremium ? (
          <Button
            variant='contained'
            color='secondary'
            startIcon={<AddOutlinedIcon />}
            onClick={() => setDialogoNuevaCitaAbierto(true)}
          >
            Nueva cita
          </Button>
        ) : null}
      </Stack>

      {conteoCitasActivas !== null ? (
        <IndicadorUsoPlanGratis citasActivas={conteoCitasActivas} />
      ) : null}

      {negocioSlug ? (
        <EnlaceReservaPublica negocioSlug={negocioSlug} />
      ) : null}

      <Tabs
        value={tab}
        onChange={handleCambiarTab}
        variant='fullWidth'
        textColor='secondary'
        indicatorColor='secondary'
      >
        <Tab label='Hoy' value='hoy' />
        <Tab label='Próximas' value='proximas' />
        <Tab label='Pasadas' value='pasadas' />
      </Tabs>

      {error ? (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {cargando ? (
        <EsqueletoListaCitas />
      ) : (
        <Stack spacing={2}>
          {tab === 'pasadas' ? <ResumenPasadas citas={citas} /> : null}
          <ListaCitasPanel
            citas={citas}
            permitirCancelar={tab !== 'pasadas'}
            permitirMarcarAtendida
            mostrarFecha={tab !== 'hoy'}
            mensajeVacio={mensajesVacios[tab]}
            onCitaActualizada={() => {
              void cargarCitas(tab)
              void refrescarConteoPlanGratis()
            }}
          />
        </Stack>
      )}

      {esPremium ? (
        <DialogNuevaCita
          abierto={dialogoNuevaCitaAbierto}
          negocioId={negocioId}
          servicios={servicios}
          horariosNegocio={horariosNegocio}
          onCerrar={() => setDialogoNuevaCitaAbierto(false)}
          onExito={handleCitaCreada}
        />
      ) : null}
    </Stack>
  )
}
