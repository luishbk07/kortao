import type { SupabaseClient } from '@supabase/supabase-js'
import type { AdminRepository } from '@/application/ports/adminRepository.port'
import type {
  CitaAdminResumen,
  DetalleNegocioAdmin,
  MetricasNegocioAdmin,
  NegocioAdminDetalle
} from '@/domain/admin/admin.types'
import type { EstadoCita } from '@/domain/booking/booking.types'

type NegocioFila = {
  id: string
  nombre: string
  slug: string
  plan: string | null
  precio_mensual: number | string | null
  fecha_inicio_suscripcion: string
  suscripcion_activa: boolean
}

type CitaFila = {
  id: string
  fecha_hora: string
  cliente_nombre: string
  estado: EstadoCita
  precio: number | string | null
  servicios?: { nombre: string } | { nombre: string }[] | null
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

const mapearNegocio = (fila: NegocioFila): NegocioAdminDetalle => ({
  id: fila.id,
  nombre: fila.nombre,
  slug: fila.slug,
  plan: fila.plan ?? 'estandar',
  precioMensual: mapearNumeroOpcional(fila.precio_mensual),
  fechaInicioSuscripcion: new Date(fila.fecha_inicio_suscripcion),
  suscripcionActiva: fila.suscripcion_activa
})

const calcularMetricas = (citas: CitaFila[]): MetricasNegocioAdmin => {
  const completadas = citas.filter((cita) => cita.estado === 'completada')
  const canceladas = citas.filter((cita) => cita.estado === 'cancelada')
  const ingresosTotales = completadas.reduce((total, cita) => {
    return total + (mapearNumeroOpcional(cita.precio) ?? 0)
  }, 0)

  const fechaCitaMasReciente =
    citas.length > 0 ? new Date(citas[0].fecha_hora) : null

  return {
    totalCitas: citas.length,
    citasCompletadas: completadas.length,
    citasCanceladas: canceladas.length,
    ingresosTotales,
    fechaCitaMasReciente
  }
}

const mapearCitasRecientes = (citas: CitaFila[]): CitaAdminResumen[] => {
  return citas.slice(0, 10).map((fila) => ({
    id: fila.id,
    fechaHora: new Date(fila.fecha_hora),
    clienteNombre: fila.cliente_nombre,
    servicioNombre: obtenerNombreServicio(fila.servicios),
    estado: fila.estado
  }))
}

export const crearAdminRepository = (
  cliente: SupabaseClient
): AdminRepository => ({
  obtenerDetalleNegocio: async (negocioId) => {
    const { data: negocioData, error: errorNegocio } = await cliente
      .from('negocios')
      .select(
        'id, nombre, slug, plan, precio_mensual, fecha_inicio_suscripcion, suscripcion_activa'
      )
      .eq('id', negocioId)
      .maybeSingle()

    if (errorNegocio) {
      throw new Error(errorNegocio.message)
    }

    if (!negocioData) {
      return null
    }

    const { data: citasData, error: errorCitas } = await cliente
      .from('citas')
      .select(
        'id, fecha_hora, cliente_nombre, estado, precio, servicios ( nombre )'
      )
      .eq('negocio_id', negocioId)
      .order('fecha_hora', { ascending: false })

    if (errorCitas) {
      throw new Error(errorCitas.message)
    }

    const citas = (citasData as CitaFila[] | null) ?? []
    const detalle: DetalleNegocioAdmin = {
      negocio: mapearNegocio(negocioData as NegocioFila),
      metricas: calcularMetricas(citas),
      citasRecientes: mapearCitasRecientes(citas)
    }

    return detalle
  }
})
