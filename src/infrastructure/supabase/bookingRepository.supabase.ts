import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BookingRepository,
  CrearCitaInput
} from '@/application/ports/bookingRepository.port'
import type {
  Booking,
  EstadoCita,
  OccupiedSlot
} from '@/domain/booking/booking.types'
import { crearClienteNavegador } from './clienteNavegador'

type CitaFila = {
  id: string
  negocio_id: string
  servicio_id: string
  cliente_nombre: string
  cliente_telefono: string
  fecha_hora: string
  duracion_minutos: number
  estado: EstadoCita
  creado_en: string
  servicios?: { nombre: string } | { nombre: string }[] | null
}

type SlotOcupadoFila = {
  fecha_hora: string
  duracion_minutos: number
  estado: EstadoCita
}

type CitaInsertFila = {
  id: string
  negocio_id: string
  servicio_id: string
  cliente_nombre: string
  cliente_telefono: string
  fecha_hora: string
  duracion_minutos: number
  estado: EstadoCita
  creado_en: string
}

const obtenerNombreServicio = (
  servicios: CitaFila['servicios']
): string => {
  if (!servicios) {
    return 'Servicio'
  }

  if (Array.isArray(servicios)) {
    return servicios[0]?.nombre ?? 'Servicio'
  }

  return servicios.nombre
}

const mapearFilaACita = (fila: CitaFila): Booking => ({
  id: fila.id,
  negocioId: fila.negocio_id,
  servicioId: fila.servicio_id,
  servicioNombre: obtenerNombreServicio(fila.servicios),
  clienteNombre: fila.cliente_nombre,
  clienteTelefono: fila.cliente_telefono,
  fechaHora: new Date(fila.fecha_hora),
  duracionMinutos: fila.duracion_minutos,
  estado: fila.estado,
  creadoEn: new Date(fila.creado_en)
})

const mapearFilaASlotOcupado = (fila: SlotOcupadoFila): OccupiedSlot => ({
  fechaHora: new Date(fila.fecha_hora),
  duracionMinutos: fila.duracion_minutos,
  estado: fila.estado
})

const mapearCitaAFila = (input: CrearCitaInput): CitaInsertFila => {
  const ahora = new Date()

  return {
    id: crypto.randomUUID(),
    negocio_id: input.negocioId,
    servicio_id: input.servicioId,
    cliente_nombre: input.clienteNombre,
    cliente_telefono: input.clienteTelefono,
    fecha_hora: input.fechaHora.toISOString(),
    duracion_minutos: input.duracionMinutos,
    estado: 'pendiente',
    creado_en: ahora.toISOString()
  }
}

const lanzarErrorSupabase = (error: { message: string }): never => {
  throw new Error(error.message)
}

export const crearBookingRepository = (
  cliente: SupabaseClient
): BookingRepository => ({
  obtenerCitasPorRango: async (negocioId, desde, hasta) => {
    const { data, error } = await cliente
      .from('citas')
      .select(`
        id,
        negocio_id,
        servicio_id,
        cliente_nombre,
        cliente_telefono,
        fecha_hora,
        duracion_minutos,
        estado,
        creado_en,
        servicios ( nombre )
      `)
      .eq('negocio_id', negocioId)
      .gte('fecha_hora', desde.toISOString())
      .lte('fecha_hora', hasta.toISOString())
      .order('fecha_hora', { ascending: true })

    if (error) {
      lanzarErrorSupabase(error)
    }

    return ((data as CitaFila[] | null) ?? []).map(mapearFilaACita)
  },

  obtenerSlotsOcupados: async (negocioId, desde, hasta) => {
    const { data, error } = await cliente
      .from('disponibilidad_citas')
      .select('fecha_hora, duracion_minutos, estado')
      .eq('negocio_id', negocioId)
      .gte('fecha_hora', desde.toISOString())
      .lte('fecha_hora', hasta.toISOString())
      .order('fecha_hora', { ascending: true })

    if (error) {
      lanzarErrorSupabase(error)
    }

    return ((data as SlotOcupadoFila[] | null) ?? []).map(mapearFilaASlotOcupado)
  },

  crearCita: async (input) => {
    const fila = mapearCitaAFila(input)

    // Insert without SELECT: anon RLS allows insert but not reading citas (PII).
    const { error } = await cliente.from('citas').insert(fila)

    if (error) {
      lanzarErrorSupabase(error)
    }

    return mapearFilaACita(fila)
  },

  cancelarCita: async (citaId) => {
    const { data, error } = await cliente
      .from('citas')
      .update({ estado: 'cancelada' })
      .eq('id', citaId)
      .select(`
        id,
        negocio_id,
        servicio_id,
        cliente_nombre,
        cliente_telefono,
        fecha_hora,
        duracion_minutos,
        estado,
        creado_en,
        servicios ( nombre )
      `)
      .single()

    if (error) {
      lanzarErrorSupabase(error)
    }

    if (!data) {
      throw new Error('Cita no encontrada')
    }

    return mapearFilaACita(data as CitaFila)
  }
})

export const bookingRepositorySupabase: BookingRepository = {
  obtenerCitasPorRango: (negocioId, desde, hasta) =>
    crearBookingRepository(crearClienteNavegador()).obtenerCitasPorRango(
      negocioId,
      desde,
      hasta
    ),
  obtenerSlotsOcupados: (negocioId, desde, hasta) =>
    crearBookingRepository(crearClienteNavegador()).obtenerSlotsOcupados(
      negocioId,
      desde,
      hasta
    ),
  crearCita: (input) =>
    crearBookingRepository(crearClienteNavegador()).crearCita(input),
  cancelarCita: (citaId) =>
    crearBookingRepository(crearClienteNavegador()).cancelarCita(citaId)
}
