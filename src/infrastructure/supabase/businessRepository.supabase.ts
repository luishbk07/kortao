import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ActualizarNegocioInput,
  ActualizarServicioInput,
  BusinessRepository,
  CrearServicioInput,
  NegocioDetalle
} from '@/application/ports/businessRepository.port'
import type {
  CitaPanel,
  HorarioDiaInput,
  HorarioNegocio,
  Servicio
} from '@/domain/business/business.types'
import type { EstadoCita } from '@/domain/booking/booking.types'
import { finDelDia, inicioDelDia } from '@/shared/utils/fechas'

type NegocioFila = {
  id: string
  nombre: string
  slug: string
  telefono_whatsapp: string
  direccion: string | null
  latitud: number | string | null
  longitud: number | string | null
  logo_url: string | null
}

type ServicioFila = {
  id: string
  negocio_id: string
  nombre: string
  duracion_minutos: number
  precio: number | string
  activo: boolean
}

const mapearNumeroOpcional = (
  valor: number | string | null | undefined
): number | null => {
  if (valor === null || valor === undefined || valor === '') {
    return null
  }

  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

const mapearNegocioDetalle = (fila: NegocioFila): NegocioDetalle => ({
  id: fila.id,
  nombre: fila.nombre,
  slug: fila.slug,
  telefonoWhatsapp: fila.telefono_whatsapp,
  direccion: fila.direccion,
  latitud: mapearNumeroOpcional(fila.latitud),
  longitud: mapearNumeroOpcional(fila.longitud),
  logoUrl: fila.logo_url ?? null
})

const columnasNegocioDetalle =
  'id, nombre, slug, telefono_whatsapp, direccion, latitud, longitud, logo_url'

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

  obtenerNegocioPublicoPorId: async (negocioId) => {
    const { data, error } = await cliente
      .from('negocios')
      .select('nombre, slug, logo_url')
      .eq('id', negocioId)
      .maybeSingle()

    if (error) {
      lanzarErrorSupabase(error)
    }

    if (!data?.nombre || !data?.slug) {
      return null
    }

    return {
      nombre: data.nombre,
      slug: data.slug,
      logoUrl: data.logo_url ?? null
    }
  },

  obtenerNegocioPorId: async (negocioId) => {
    const { data, error } = await cliente
      .from('negocios')
      .select(columnasNegocioDetalle)
      .eq('id', negocioId)
      .maybeSingle()

    if (error) {
      lanzarErrorSupabase(error)
    }

    if (!data) {
      return null
    }

    return mapearNegocioDetalle(data as NegocioFila)
  },

  actualizarNegocio: async (negocioId, input: ActualizarNegocioInput) => {
    const actualizacion: Record<string, unknown> = {
      nombre: input.nombre,
      telefono_whatsapp: input.telefonoWhatsapp,
      direccion: input.direccion,
      latitud: input.latitud,
      longitud: input.longitud
    }

    if (input.logoUrl !== undefined) {
      actualizacion.logo_url = input.logoUrl
    }

    const { data, error } = await cliente
      .from('negocios')
      .update(actualizacion)
      .eq('id', negocioId)
      .select(columnasNegocioDetalle)
      .single()

    if (error) {
      lanzarErrorSupabase(error)
    }

    if (!data) {
      throw new Error('No se pudo actualizar el negocio')
    }

    return mapearNegocioDetalle(data as NegocioFila)
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
