import { PanelCitas } from '@/presentation/components/business/PanelCitas'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { obtenerNegocioIdORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'
import { esPlanPremium } from '@/shared/utils/planes'

const CitasPanelPage = async () => {
  const negocioId = await obtenerNegocioIdORedirigir()
  const { businessRepository, bookingRepository } =
    crearDependenciasPanelServidor()

  const [negocioSlug, negocio] = await Promise.all([
    businessRepository.obtenerSlugPorNegocioId(negocioId),
    businessRepository.obtenerNegocioPorId(negocioId)
  ])

  const mostrarLimitePlanGratis = Boolean(
    negocio && !esPlanPremium(negocio.plan)
  )

  const citasFuturasActivas = mostrarLimitePlanGratis
    ? await bookingRepository.contarCitasFuturasActivas(negocioId)
    : null

  return (
    <PanelCitas
      negocioId={negocioId}
      negocioSlug={negocioSlug ?? ''}
      citasFuturasActivas={citasFuturasActivas}
    />
  )
}

export default CitasPanelPage
