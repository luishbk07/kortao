import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { PanelShell } from '@/presentation/components/business/PanelShell'
import { CuentaPausada } from '@/presentation/components/business/CuentaPausada'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'

type PanelLayoutProps = {
  children: ReactNode
}

type NegocioMembresia = {
  suscripcion_activa: boolean
  plan: string | null
}

type MembresiaFila = {
  negocio_id: string
  negocios: NegocioMembresia | NegocioMembresia[] | null
}

const obtenerNegocioMembresia = (
  negocios: MembresiaFila['negocios']
): NegocioMembresia | null => {
  if (!negocios) {
    return null
  }

  if (Array.isArray(negocios)) {
    return negocios[0] ?? null
  }

  return negocios
}

const PanelLayout = async ({ children }: PanelLayoutProps) => {
  const pathname = headers().get('x-pathname') ?? ''

  if (pathname === '/panel/restablecer-contrasena') {
    return children
  }

  const supabase = crearClienteServidor()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  let plan = 'estandar'

  if (user) {
    const { data: membresia } = await supabase
      .from('usuarios_negocio')
      .select('negocio_id, negocios(suscripcion_activa, plan)')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    const negocio = obtenerNegocioMembresia(
      (membresia as MembresiaFila | null)?.negocios ?? null
    )

    if (negocio?.suscripcion_activa === false) {
      return <CuentaPausada />
    }

    plan = negocio?.plan ?? 'estandar'
  }

  return <PanelShell plan={plan}>{children}</PanelShell>
}

export default PanelLayout
