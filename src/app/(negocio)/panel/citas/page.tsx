import { crearListarHorarios } from '@/application/useCases/business/listarHorarios'
import { crearListarServicios } from '@/application/useCases/business/listarServicios'
import type { BusinessHours } from '@/domain/booking/booking.types'
import type { ServicioPublico } from '@/presentation/components/booking/tiposReservar'
import { PanelCitas } from '@/presentation/components/business/PanelCitas'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { obtenerNegocioIdORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'
import { esPlanPagado } from '@/shared/utils/planes'

const mapearServicioPublico = (servicio: {
  id: string
  nombre: string
  duracionMinutos: number
  precio: number | null
  descuentoTipo: 'monto' | 'porcentaje' | null
  descuentoValor: number | null
  activo: boolean
}): ServicioPublico => ({
  id: servicio.id,
  nombre: servicio.nombre,
  duracionMinutos: servicio.duracionMinutos,
  precio: servicio.precio,
  descuentoTipo: servicio.descuentoTipo,
  descuentoValor: servicio.descuentoValor
})

const mapearHorario = (horario: {
  diaSemana: number
  horaInicio: string
  horaFin: string
}): BusinessHours => ({
  diaSemana: horario.diaSemana,
  horaInicio: horario.horaInicio.slice(0, 5),
  horaFin: horario.horaFin.slice(0, 5)
})

const CitasPanelPage = async () => {
  const negocioId = await obtenerNegocioIdORedirigir()
  const { businessRepository, bookingRepository } =
    crearDependenciasPanelServidor()

  const listarServicios = crearListarServicios(businessRepository)
  const listarHorarios = crearListarHorarios(businessRepository)

  const [negocioSlug, negocio, servicios, horarios] = await Promise.all([
    businessRepository.obtenerSlugPorNegocioId(negocioId),
    businessRepository.obtenerNegocioPorId(negocioId),
    listarServicios(negocioId),
    listarHorarios(negocioId)
  ])

  const esPremium = Boolean(negocio && esPlanPagado(negocio.plan))
  const mostrarLimitePlanGratis = Boolean(negocio && !esPremium)

  const citasTotales = mostrarLimitePlanGratis
    ? await bookingRepository.contarCitasTotales(negocioId)
    : null

  const serviciosActivos = servicios
    .filter((servicio) => servicio.activo)
    .map(mapearServicioPublico)

  return (
    <PanelCitas
      negocioId={negocioId}
      negocioSlug={negocioSlug ?? ''}
      citasTotales={citasTotales}
      esPremium={esPremium}
      servicios={serviciosActivos}
      horariosNegocio={horarios.map(mapearHorario)}
    />
  )
}

export default CitasPanelPage
