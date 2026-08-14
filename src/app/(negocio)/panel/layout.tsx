import type { ReactNode } from 'react'
import { PanelShell } from '@/presentation/components/business/PanelShell'
import { CuentaPausada } from '@/presentation/components/business/CuentaPausada'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'

type PanelLayoutProps = {
  children: ReactNode
}

type MembresiaFila = {
  negocio_id: string
  negocios: { suscripcion_activa: boolean } | { suscripcion_activa: boolean }[] | null
}

const obtenerSuscripcionActiva = (
  negocios: MembresiaFila['negocios']
): boolean | null => {
  if (!negocios) {
    return null
  }

  if (Array.isArray(negocios)) {
    return negocios[0]?.suscripcion_activa ?? null
  }

  return negocios.suscripcion_activa
}

const PanelLayout = async ({ children }: PanelLayoutProps) => {
  const supabase = crearClienteServidor()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user) {
    const { data: membresia } = await supabase
      .from('usuarios_negocio')
      .select('negocio_id, negocios(suscripcion_activa)')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    const suscripcionActiva = obtenerSuscripcionActiva(
      (membresia as MembresiaFila | null)?.negocios ?? null
    )

    if (suscripcionActiva === false) {
      return <CuentaPausada />
    }
  }

  return <PanelShell>{children}</PanelShell>
}

export default PanelLayout
