'use client'

import { useCallback, useEffect, useState, type SyntheticEvent } from 'react'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { crearObtenerCitasPorRango } from '@/application/useCases/booking/obtenerCitasPorRango'
import type { Booking } from '@/domain/booking/booking.types'
import { bookingRepositorySupabase } from '@/infrastructure/supabase/bookingRepository.supabase'
import {
  obtenerRangoTabCitas,
  type TabCitas
} from '@/shared/utils/rangosCitas'
import { formatearFechaLegible } from '@/shared/utils/fechas'
import { EnlaceReservaPublica } from './EnlaceReservaPublica'
import { EsqueletoListaCitas } from './EsqueletoListaCitas'
import { ListaCitasPanel } from './ListaCitasPanel'

type PanelCitasProps = {
  negocioId: string
  negocioSlug: string
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

export const PanelCitas = ({ negocioId, negocioSlug }: PanelCitasProps) => {
  const [tab, setTab] = useState<TabCitas>('hoy')
  const [citas, setCitas] = useState<Booking[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fechaHoy = formatearFechaLegible(new Date(), false)

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

  const handleCambiarTab = (
    _evento: SyntheticEvent,
    nuevoValor: TabCitas
  ) => {
    setTab(nuevoValor)
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant='h5' component='h1' color='primary'>
          Citas
        </Typography>
        <Typography color='text.secondary' sx={{ textTransform: 'capitalize' }}>
          {fechaHoy}
        </Typography>
      </Stack>

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
            }}
          />
        </Stack>
      )}
    </Stack>
  )
}
