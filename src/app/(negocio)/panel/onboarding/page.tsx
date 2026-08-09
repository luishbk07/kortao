import { redirect } from 'next/navigation'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { OnboardingNegocio } from '@/presentation/components/business/OnboardingNegocio'

const OnboardingPage = async () => {
  const { authService, businessRepository } = crearDependenciasPanelServidor()
  const usuario = await authService.obtenerUsuarioActual()

  if (!usuario) {
    redirect('/login')
  }

  const negocioId = await businessRepository.obtenerNegocioIdPorUsuario(
    usuario.id
  )

  if (negocioId) {
    redirect('/panel/citas')
  }

  return (
    <OnboardingNegocio
      nombreNegocioInicial={usuario.metadata?.nombreNegocio ?? ''}
      telefonoWhatsappInicial={usuario.metadata?.telefonoWhatsapp ?? ''}
      direccionInicial={usuario.metadata?.direccion ?? ''}
    />
  )
}

export default OnboardingPage
