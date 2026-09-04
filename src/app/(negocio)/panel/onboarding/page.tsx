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
      afiliadoIdInicial={usuario.metadata?.afiliadoId ?? null}
      identidadInicial={{
        nombre: usuario.metadata?.nombre,
        tipoDocumento: usuario.metadata?.tipoDocumento as
          | 'cedula'
          | 'rnc'
          | 'pasaporte'
          | undefined,
        numeroDocumento: usuario.metadata?.numeroDocumento,
        telefono: usuario.metadata?.telefono
      }}
    />
  )
}

export default OnboardingPage
