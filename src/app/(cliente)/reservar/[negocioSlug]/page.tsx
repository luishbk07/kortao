import { notFound } from 'next/navigation'
import type { BusinessHours } from '@/domain/booking/booking.types'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { ReservarNegocio } from '@/presentation/components/booking/ReservarNegocio'
import type {
  NegocioPublico,
  ServicioPublico
} from '@/presentation/components/booking/tiposReservar'

type ReservarPageProps = {
  params: {
    negocioSlug: string
  }
}

type NegocioFila = {
  id: string
  nombre: string
  slug: string
  telefono_whatsapp: string
  direccion: string | null
  color_acento: string | null
  latitud: number | string | null
  longitud: number | string | null
  logo_url: string | null
  suscripcion_activa: boolean
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

type ServicioFila = {
  id: string
  nombre: string
  duracion_minutos: number
  precio: number | string
  descuento_tipo: 'monto' | 'porcentaje' | null
  descuento_valor: number | string | null
}

type HorarioFila = {
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}

const mapearNegocio = (fila: NegocioFila): NegocioPublico => ({
  id: fila.id,
  nombre: fila.nombre,
  slug: fila.slug,
  telefonoWhatsapp: fila.telefono_whatsapp,
  direccion: fila.direccion,
  colorAcento: fila.color_acento,
  latitud: mapearNumeroOpcional(fila.latitud),
  longitud: mapearNumeroOpcional(fila.longitud),
  logoUrl: fila.logo_url ?? null
})

const mapearServicio = (fila: ServicioFila): ServicioPublico => {
  const descuentoTipo =
    fila.descuento_tipo === 'monto' || fila.descuento_tipo === 'porcentaje'
      ? fila.descuento_tipo
      : null
  const descuentoValor =
    fila.descuento_valor === null || fila.descuento_valor === undefined
      ? null
      : Number(fila.descuento_valor)

  return {
    id: fila.id,
    nombre: fila.nombre,
    duracionMinutos: fila.duracion_minutos,
    precio: Number(fila.precio),
    descuentoTipo,
    descuentoValor: Number.isFinite(descuentoValor) ? descuentoValor : null
  }
}

const mapearHorario = (fila: HorarioFila): BusinessHours => ({
  diaSemana: fila.dia_semana,
  horaInicio: fila.hora_inicio.slice(0, 5),
  horaFin: fila.hora_fin.slice(0, 5)
})

const ReservarPage = async ({ params }: ReservarPageProps) => {
  const supabase = crearClienteServidor()

  const { data: negocioFila, error: errorNegocio } = await supabase
    .from('negocios')
    .select(
      'id, nombre, slug, telefono_whatsapp, direccion, color_acento, latitud, longitud, logo_url, suscripcion_activa'
    )
    .eq('slug', params.negocioSlug)
    .maybeSingle()

  if (errorNegocio || !negocioFila) {
    notFound()
  }

  const negocioFilaTipada = negocioFila as NegocioFila
  const negocio = mapearNegocio(negocioFilaTipada)

  if (!negocioFilaTipada.suscripcion_activa) {
    return (
      <ReservarNegocio
        negocio={negocio}
        servicios={[]}
        horariosNegocio={[]}
        disponible={false}
      />
    )
  }

  const [resultadoServicios, resultadoHorarios] = await Promise.all([
    supabase
      .from('servicios')
      .select('id, nombre, duracion_minutos, precio, descuento_tipo, descuento_valor')
      .eq('negocio_id', negocio.id)
      .eq('activo', true)
      .order('nombre', { ascending: true }),
    supabase
      .from('horarios_negocio')
      .select('dia_semana, hora_inicio, hora_fin')
      .eq('negocio_id', negocio.id)
      .order('dia_semana', { ascending: true })
  ])

  if (resultadoServicios.error || resultadoHorarios.error) {
    throw new Error('No se pudieron cargar los datos del negocio')
  }

  const servicios = ((resultadoServicios.data as ServicioFila[] | null) ?? [])
    .map(mapearServicio)

  const horariosNegocio = ((resultadoHorarios.data as HorarioFila[] | null) ?? [])
    .map(mapearHorario)

  return (
    <ReservarNegocio
      negocio={negocio}
      servicios={servicios}
      horariosNegocio={horariosNegocio}
      disponible
    />
  )
}

export default ReservarPage
