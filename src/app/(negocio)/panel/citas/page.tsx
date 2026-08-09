import { PanelCitas } from '@/presentation/components/business/PanelCitas'
import { obtenerNegocioIdORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'

const CitasPanelPage = async () => {
  const negocioId = await obtenerNegocioIdORedirigir()

  return <PanelCitas negocioId={negocioId} />
}

export default CitasPanelPage
