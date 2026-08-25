import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { crearSupportRepository } from '@/infrastructure/supabase/supportRepository.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { TablaReportesSoporteAdmin } from '@/presentation/components/admin/TablaReportesSoporteAdmin'

const AdminSoportePage = async () => {
  const supabase = crearClienteServidor()
  const supportRepository = crearSupportRepository(supabase)
  const reportes = await supportRepository.listarTodosAdmin()

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant='h5' component='h1' color='primary'>
          Soporte
        </Typography>
        <Typography color='text.secondary'>
          Revisa y resuelve los reportes enviados por los negocios.
        </Typography>
      </Stack>

      <TablaReportesSoporteAdmin reportesIniciales={reportes} />
    </Stack>
  )
}

export default AdminSoportePage
