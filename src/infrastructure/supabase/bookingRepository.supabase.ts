import type {
  BookingRepository,
  CrearCitaInput
} from '@/application/ports/bookingRepository.port'
import type {
  Booking,
  EstadoCita,
  OccupiedSlot
} from '@/domain/booking/booking.types'
import { supabaseClient } from './supabaseClient'

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

const mapearFilaACita = (fila: CitaFila): Booking => ({
  id: fila.id,
  negocioId: fila.negocio_id,
  servicioId: fila.servicio_id,
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

export const bookingRepositorySupabase: BookingRepository = {
  obtenerCitasPorRango: async (negocioId, desde, hasta) => {
    const { data, error } = await supabaseClient
      .from('citas')
      .select('*')
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
    const { data, error } = await supabaseClient
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

    const { error } = await supabaseClient.from('citas').insert(fila)

    if (error) {
      lanzarErrorSupabase(error)
    }

    return mapearFilaACita(fila)
  },

  cancelarCita: async (citaId) => {
    const { data, error } = await supabaseClient
      .from('citas')
      .update({ estado: 'cancelada' })
      .eq('id', citaId)
      .select('*')
      .single()

    if (error) {
      lanzarErrorSupabase(error)
    }

    if (!data) {
      throw new Error('Cita no encontrada')
    }

    return mapearFilaACita(data as CitaFila)
  }
}
