import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { OnboardingNegocio } from '@/presentation/components/business/OnboardingNegocio'

const leerTextoMetadata = (
  metadata: Record<string, unknown>,
  clave: string
): string => {
  const valor = metadata[clave]
  return typeof valor === 'string' ? valor : ''
}

const OnboardingPage = async () => {
  const supabase = crearClienteServidor()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membresia } = await supabase
    .from('usuarios_negocio')
    .select('negocio_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (membresia?.negocio_id) {
    redirect('/panel/citas')
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>

  return (
    <OnboardingNegocio
      nombreNegocioInicial={leerTextoMetadata(metadata, 'nombreNegocio')}
      telefonoWhatsappInicial={leerTextoMetadata(metadata, 'telefonoWhatsapp')}
      direccionInicial={leerTextoMetadata(metadata, 'direccion')}
    />
  )
}

export default OnboardingPage
