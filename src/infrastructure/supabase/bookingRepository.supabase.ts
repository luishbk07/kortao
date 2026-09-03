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
import type {
  CitaParaClientes,
  CitaParaReportes
} from '@/domain/business/reportes.types'
import { crearClienteNavegador } from './clienteNavegador'

type CitaFila = {
  id: string
  negocio_id: string
  servicio_id: string
  cliente_nombre: string
  cliente_telefono: string
  cliente_correo: string | null
  fecha_hora: string
  duracion_minutos: number
  precio: number | string | null
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
  cliente_correo: string | null
  fecha_hora: string
  duracion_minutos: number
  precio: number | null
  estado: EstadoCita
  creado_en: string
}

const columnasCita = `
  id,
  negocio_id,
  servicio_id,
  cliente_nombre,
  cliente_telefono,
  cliente_correo,
  fecha_hora,
  duracion_minutos,
  precio,
  estado,
  creado_en,
  servicios ( nombre )
`

const mapearNumeroOpcional = (
  valor: number | string | null | undefined
): number | null => {
  if (valor === null || valor === undefined || valor === '') {
    return null
  }

  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
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
  clienteCorreo: fila.cliente_correo ?? null,
  fechaHora: new Date(fila.fecha_hora),
  duracionMinutos: fila.duracion_minutos,
  precio: mapearNumeroOpcional(fila.precio),
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
    cliente_correo: input.clienteCorreo,
    fecha_hora: input.fechaHora.toISOString(),
    duracion_minutos: input.duracionMinutos,
    precio: input.precio,
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
      .select(columnasCita)
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

  contarCitasTotales: async (negocioId) => {
    const { count, error } = await cliente
      .from('citas')
      .select('*', { count: 'exact', head: true })
      .eq('negocio_id', negocioId)

    if (error) {
      lanzarErrorSupabase(error)
    }

    return count ?? 0
  },

  listarCitasParaClientesRecurrentes: async (negocioId) => {
    const { data, error } = await cliente
      .from('citas')
      .select('cliente_telefono, cliente_nombre, cliente_correo, fecha_hora')
      .eq('negocio_id', negocioId)
      .neq('estado', 'cancelada')
      .order('fecha_hora', { ascending: false })

    if (error) {
      lanzarErrorSupabase(error)
    }

    return ((data as {
      cliente_telefono: string
      cliente_nombre: string
      cliente_correo: string | null
      fecha_hora: string
    }[] | null) ?? []).map((fila): CitaParaClientes => ({
      clienteTelefono: fila.cliente_telefono,
      clienteNombre: fila.cliente_nombre,
      clienteCorreo: fila.cliente_correo ?? null,
      fechaHora: new Date(fila.fecha_hora)
    }))
  },


  listarCitasCompletadasParaReportes: async (negocioId) => {
    const { data, error } = await cliente
      .from('citas')
      .select('precio, fecha_hora, servicios ( nombre )')
      .eq('negocio_id', negocioId)
      .eq('estado', 'completada')
      .not('precio', 'is', null)
      .order('fecha_hora', { ascending: false })

    if (error) {
      lanzarErrorSupabase(error)
    }

    return ((data as {
      precio: number | string | null
      fecha_hora: string
      servicios?: { nombre: string } | { nombre: string }[] | null
    }[] | null) ?? []).map((fila): CitaParaReportes => ({
      precio: mapearNumeroOpcional(fila.precio),
      fechaHora: new Date(fila.fecha_hora),
      servicioNombre: obtenerNombreServicio(fila.servicios)
    }))
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

  obtenerCitaPorId: async (citaId) => {
    const { data, error } = await cliente
      .from('citas')
      .select(columnasCita)
      .eq('id', citaId)
      .maybeSingle()

    if (error) {
      lanzarErrorSupabase(error)
    }

    if (!data) {
      return null
    }

    return mapearFilaACita(data as CitaFila)
  },

  cancelarCita: async (citaId) => {
    const { data, error } = await cliente
      .from('citas')
      .update({ estado: 'cancelada' })
      .eq('id', citaId)
      .select(columnasCita)
      .single()

    if (error) {
      lanzarErrorSupabase(error)
    }

    if (!data) {
      throw new Error('Cita no encontrada')
    }

    return mapearFilaACita(data as CitaFila)
  },

  marcarCitaAtendida: async (citaId, precioFinal) => {
    const actualizacion: { estado: 'completada'; precio?: number } = {
      estado: 'completada'
    }

    if (precioFinal !== undefined && precioFinal !== null) {
      actualizacion.precio = precioFinal
    }

    const { data, error } = await cliente
      .from('citas')
      .update(actualizacion)
      .eq('id', citaId)
      .in('estado', ['pendiente', 'confirmada'])
      .select(columnasCita)
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
  contarCitasTotales: (negocioId) =>
    crearBookingRepository(crearClienteNavegador()).contarCitasTotales(
      negocioId
    ),
  listarCitasParaClientesRecurrentes: (negocioId) =>
    crearBookingRepository(
      crearClienteNavegador()
    ).listarCitasParaClientesRecurrentes(negocioId),
  listarCitasCompletadasParaReportes: (negocioId) =>
    crearBookingRepository(
      crearClienteNavegador()
    ).listarCitasCompletadasParaReportes(negocioId),
  crearCita: (input) =>
    crearBookingRepository(crearClienteNavegador()).crearCita(input),
  obtenerCitaPorId: (citaId) =>
    crearBookingRepository(crearClienteNavegador()).obtenerCitaPorId(citaId),
  cancelarCita: (citaId) =>
    crearBookingRepository(crearClienteNavegador()).cancelarCita(citaId),
  marcarCitaAtendida: (citaId, precioFinal) =>
    crearBookingRepository(crearClienteNavegador()).marcarCitaAtendida(
      citaId,
      precioFinal
    )
}
