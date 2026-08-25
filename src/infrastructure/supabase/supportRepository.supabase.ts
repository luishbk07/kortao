import type { SupabaseClient } from '@supabase/supabase-js'
import type { SupportRepository } from '@/application/ports/supportRepository.port'
import type {
  EstadoReporteSoporte,
  ReporteSoporte,
  ReporteSoporteAdmin
} from '@/domain/support/support.types'

type ReporteFila = {
  id: string
  negocio_id: string
  mensaje: string
  estado: EstadoReporteSoporte
  creado_en: string
}

type ReporteAdminFila = ReporteFila & {
  negocios: { nombre: string } | { nombre: string }[] | null
}

const obtenerNombreNegocio = (
  negocios: ReporteAdminFila['negocios']
): string => {
  if (!negocios) {
    return 'Negocio'
  }

  if (Array.isArray(negocios)) {
    return negocios[0]?.nombre ?? 'Negocio'
  }

  return negocios.nombre
}

const mapearReporte = (fila: ReporteFila): ReporteSoporte => ({
  id: fila.id,
  negocioId: fila.negocio_id,
  mensaje: fila.mensaje,
  estado: fila.estado,
  creadoEn: new Date(fila.creado_en)
})

const mapearReporteAdmin = (fila: ReporteAdminFila): ReporteSoporteAdmin => ({
  ...mapearReporte(fila),
  negocioNombre: obtenerNombreNegocio(fila.negocios)
})

const ordenarReportesAdmin = (
  reportes: ReporteSoporteAdmin[]
): ReporteSoporteAdmin[] => {
  return [...reportes].sort((a, b) => {
    if (a.estado !== b.estado) {
      if (a.estado === 'pendiente') {
        return -1
      }

      if (b.estado === 'pendiente') {
        return 1
      }
    }

    return b.creadoEn.getTime() - a.creadoEn.getTime()
  })
}

export const crearSupportRepository = (
  cliente: SupabaseClient
): SupportRepository => ({
  crearReporte: async (negocioId, mensaje) => {
    const mensajeLimpio = mensaje.trim()

    if (mensajeLimpio.length === 0) {
      throw new Error('El mensaje no puede estar vacío')
    }

    const { data, error } = await cliente
      .from('reportes_soporte')
      .insert({
        negocio_id: negocioId,
        mensaje: mensajeLimpio
      })
      .select('id, negocio_id, mensaje, estado, creado_en')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return mapearReporte(data as ReporteFila)
  },

  listarPorNegocio: async (negocioId) => {
    const { data, error } = await cliente
      .from('reportes_soporte')
      .select('id, negocio_id, mensaje, estado, creado_en')
      .eq('negocio_id', negocioId)
      .order('creado_en', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return ((data as ReporteFila[] | null) ?? []).map(mapearReporte)
  },

  listarTodosAdmin: async () => {
    const { data, error } = await cliente
      .from('reportes_soporte')
      .select(
        'id, negocio_id, mensaje, estado, creado_en, negocios ( nombre )'
      )

    if (error) {
      throw new Error(error.message)
    }

    const reportes = ((data as ReporteAdminFila[] | null) ?? []).map(
      mapearReporteAdmin
    )

    return ordenarReportesAdmin(reportes)
  },

  actualizarEstado: async (reporteId, estado) => {
    const { data, error } = await cliente
      .from('reportes_soporte')
      .update({ estado })
      .eq('id', reporteId)
      .select(
        'id, negocio_id, mensaje, estado, creado_en, negocios ( nombre )'
      )
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return mapearReporteAdmin(data as ReporteAdminFila)
  }
})
