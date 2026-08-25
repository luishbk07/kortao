import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { AdminShell } from '@/presentation/components/admin/AdminShell'

type AdminLayoutProps = {
  children: ReactNode
}

const AdminLayout = async ({ children }: AdminLayoutProps) => {
  const supabase = crearClienteServidor()
  const {
    data: { user }
  } = await supabase.auth.getUser()

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
