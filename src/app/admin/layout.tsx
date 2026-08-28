import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { AdminShell } from '@/presentation/components/admin/AdminShell'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
}

type AdminLayoutProps = {
  children: ReactNode
}

const AdminLayout = async ({ children }: AdminLayoutProps) => {
  const supabase = crearClienteServidor()

  let user: { id: string } | null = null

  try {
    const {
      data: { user: usuarioSesion },
      error
    } = await supabase.auth.getUser()

    if (!error && usuarioSesion) {
      user = usuarioSesion
    }
  } catch {
    user = null
  }

  if (!user) {
    redirect('/')
  }

  const { data: admin } = await supabase
    .from('administradores_kortao')
    .select('auth_user_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!admin) {
    redirect('/')
  }

  const { count } = await supabase
    .from('reportes_soporte')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'pendiente')

  return (
    <AdminShell reportesPendientes={count ?? 0}>{children}</AdminShell>
  )
}

export default AdminLayout
