import { notFound } from 'next/navigation'
import type { BusinessHours } from '@/domain/booking/booking.types'
import { supabaseClient } from '@/infrastructure/supabase/supabaseClient'
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
}

type ServicioFila = {
  id: string
  nombre: string
  duracion_minutos: number
  precio: number | string
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
  colorAcento: fila.color_acento
})

const mapearServicio = (fila: ServicioFila): ServicioPublico => ({
  id: fila.id,
  nombre: fila.nombre,
  duracionMinutos: fila.duracion_minutos,
  precio: Number(fila.precio)
})

const mapearHorario = (fila: HorarioFila): BusinessHours => ({
  diaSemana: fila.dia_semana,
  horaInicio: fila.hora_inicio.slice(0, 5),
  horaFin: fila.hora_fin.slice(0, 5)
})

const ReservarPage = async ({ params }: ReservarPageProps) => {
  const { data: negocioFila, error: errorNegocio } = await supabaseClient
    .from('negocios')
    .select('id, nombre, slug, telefono_whatsapp, direccion, color_acento')
    .eq('slug', params.negocioSlug)
    .maybeSingle()

  if (errorNegocio || !negocioFila) {
    notFound()
  }

  const negocio = mapearNegocio(negocioFila as NegocioFila)

  const [resultadoServicios, resultadoHorarios] = await Promise.all([
    supabaseClient
      .from('servicios')
      .select('id, nombre, duracion_minutos, precio')
      .eq('negocio_id', negocio.id)
      .eq('activo', true)
      .order('nombre', { ascending: true }),
    supabaseClient
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
    />
  )
}

export default ReservarPage
