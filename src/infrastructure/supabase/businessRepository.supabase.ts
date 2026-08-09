import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ActualizarServicioInput,
  BusinessRepository,
  CrearServicioInput
} from '@/application/ports/businessRepository.port'
import type {
  CitaPanel,
  HorarioDiaInput,
  HorarioNegocio,
  Servicio
} from '@/domain/business/business.types'
import type { EstadoCita } from '@/domain/booking/booking.types'
import { finDelDia, inicioDelDia } from '@/shared/utils/fechas'

type ServicioFila = {
  id: string
  negocio_id: string
  nombre: string
  duracion_minutos: number
  precio: number | string
  activo: boolean
}

type HorarioFila = {
  id: string
  negocio_id: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}

type CitaPanelFila = {
  id: string
  cliente_nombre: string
  cliente_telefono: string
  fecha_hora: string
  estado: EstadoCita
  duracion_minutos: number
  servicios: { nombre: string } | { nombre: string }[] | null
}

const lanzarErrorSupabase = (error: { message: string }): never => {
  throw new Error(error.message)
}

const mapearServicio = (fila: ServicioFila): Servicio => ({
  id: fila.id,
  negocioId: fila.negocio_id,
  nombre: fila.nombre,
  duracionMinutos: fila.duracion_minutos,
  precio: Number(fila.precio),
  activo: fila.activo
})

const mapearHorario = (fila: HorarioFila): HorarioNegocio => ({
  id: fila.id,
  negocioId: fila.negocio_id,
  diaSemana: fila.dia_semana,
  horaInicio: fila.hora_inicio.slice(0, 5),
  horaFin: fila.hora_fin.slice(0, 5)
})

const obtenerNombreServicio = (
  servicios: CitaPanelFila['servicios']
): string => {
  if (!servicios) {
    return 'Servicio'
  }

  if (Array.isArray(servicios)) {
    return servicios[0]?.nombre ?? 'Servicio'
  }

  return servicios.nombre
}

const mapearCitaPanel = (fila: CitaPanelFila): CitaPanel => ({
  id: fila.id,
  clienteNombre: fila.cliente_nombre,
  clienteTelefono: fila.cliente_telefono,
  fechaHora: new Date(fila.fecha_hora),
  estado: fila.estado,
  servicioNombre: obtenerNombreServicio(fila.servicios),
  duracionMinutos: fila.duracion_minutos
})

export const crearBusinessRepository = (
  cliente: SupabaseClient
): BusinessRepository => ({
  obtenerNegocioIdPorUsuario: async (authUserId) => {
    const { data, error } = await cliente
      .from('usuarios_negocio')
      .select('negocio_id')
      .eq('auth_user_id', authUserId)
      .maybeSingle()

    if (error) {
      lanzarErrorSupabase(error)
    }

    return data?.negocio_id ?? null
  },

  obtenerSlugPorNegocioId: async (negocioId) => {
    const { data, error } = await cliente
      .from('negocios')
      .select('slug')
      .eq('id', negocioId)
      .maybeSingle()

    if (error) {
      lanzarErrorSupabase(error)
    }

    return data?.slug ?? null
  },

  listarServicios: async (negocioId) => {
    const { data, error } = await cliente
      .from('servicios')
      .select('id, negocio_id, nombre, duracion_minutos, precio, activo')
      .eq('negocio_id', negocioId)
      .order('nombre', { ascending: true })

    if (error) {
      lanzarErrorSupabase(error)
    }

    return ((data as ServicioFila[] | null) ?? []).map(mapearServicio)
  },

  crearServicio: async (input: CrearServicioInput) => {
    const { data, error } = await cliente
      .from('servicios')
      .insert({
        negocio_id: input.negocioId,
        nombre: input.nombre,
        duracion_minutos: input.duracionMinutos,
        precio: input.precio,
        activo: true
      })
      .select('id, negocio_id, nombre, duracion_minutos, precio, activo')
      .single()

    if (error) {
      lanzarErrorSupabase(error)
    }

    return mapearServicio(data as ServicioFila)
  },

  actualizarServicio: async (servicioId, input: ActualizarServicioInput) => {
    const { data, error } = await cliente
      .from('servicios')
      .update({
        nombre: input.nombre,
        duracion_minutos: input.duracionMinutos,
        precio: input.precio,
        activo: input.activo
      })
      .eq('id', servicioId)
      .select('id, negocio_id, nombre, duracion_minutos, precio, activo')
      .single()

    if (error) {
      lanzarErrorSupabase(error)
    }

    return mapearServicio(data as ServicioFila)
  },

  listarHorarios: async (negocioId) => {
    const { data, error } = await cliente
      .from('horarios_negocio')
      .select('id, negocio_id, dia_semana, hora_inicio, hora_fin')
      .eq('negocio_id', negocioId)
      .order('dia_semana', { ascending: true })

    if (error) {
      lanzarErrorSupabase(error)
    }

    return ((data as HorarioFila[] | null) ?? []).map(mapearHorario)
  },

  reemplazarHorarios: async (negocioId, horarios: HorarioDiaInput[]) => {
    const { error: errorBorrado } = await cliente
      .from('horarios_negocio')
      .delete()
      .eq('negocio_id', negocioId)

    if (errorBorrado) {
      lanzarErrorSupabase(errorBorrado)
    }

    const filas = horarios
      .filter((horario) => !horario.cerrado)
      .flatMap((horario) =>
        horario.bloques.map((bloque) => ({
          negocio_id: negocioId,
          dia_semana: horario.diaSemana,
          hora_inicio: bloque.horaInicio,
          hora_fin: bloque.horaFin
        }))
      )

    if (filas.length === 0) {
      return []
    }

    const { data, error } = await cliente
      .from('horarios_negocio')
      .insert(filas)
      .select('id, negocio_id, dia_semana, hora_inicio, hora_fin')

    if (error) {
      lanzarErrorSupabase(error)
    }

    return ((data as HorarioFila[] | null) ?? []).map(mapearHorario)
  },

  listarCitasDelDia: async (negocioId, fecha) => {
    const { data, error } = await cliente
      .from('citas')
      .select(`
        id,
        cliente_nombre,
        cliente_telefono,
        fecha_hora,
        estado,
        duracion_minutos,
        servicios ( nombre )
      `)
      .eq('negocio_id', negocioId)
      .gte('fecha_hora', inicioDelDia(fecha).toISOString())
      .lte('fecha_hora', finDelDia(fecha).toISOString())
      .order('fecha_hora', { ascending: true })

    if (error) {
      lanzarErrorSupabase(error)
    }

    return ((data as CitaPanelFila[] | null) ?? []).map(mapearCitaPanel)
  }
})
