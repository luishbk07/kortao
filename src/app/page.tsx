import { redirect } from 'next/navigation'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { LandingKortao } from '@/presentation/components/auth/LandingKortao'

const HomePage = async () => {
  const supabase = crearClienteServidor()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return <LandingKortao />
  }

  const { data: membresia } = await supabase
    .from('usuarios_negocio')
    .select('negocio_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (membresia?.negocio_id) {
    redirect('/panel/citas')
  }

  redirect('/panel/onboarding')
}

export default HomePage
