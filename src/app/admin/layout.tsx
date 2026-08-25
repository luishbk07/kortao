import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { NavegacionAdmin } from '@/presentation/components/admin/NavegacionAdmin'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'

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

  return (
    <Box bgcolor='background.default' minHeight='100vh'>
      <EncabezadoMarca />
      <Container maxWidth='lg' sx={{ py: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          <NavegacionAdmin />
          {children}
        </Stack>
      </Container>
    </Box>
  )
}

export default AdminLayout
