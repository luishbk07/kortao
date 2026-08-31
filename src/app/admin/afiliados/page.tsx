import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { crearAfiliadosRepository } from '@/infrastructure/supabase/afiliadosRepository.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { PanelAfiliadosAdmin } from '@/presentation/components/admin/PanelAfiliadosAdmin'

const AdminAfiliadosPage = async () => {
  const supabase = crearClienteServidor()
  const afiliadosRepository = crearAfiliadosRepository(supabase)
  const afiliados = await afiliadosRepository.listarConMetricas()

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant='h5' component='h1' color='primary'>
          Afiliados
        </Typography>
        <Typography color='text.secondary'>
          Gestiona códigos de referidos y revisa cuántos negocios trae cada
          afiliado.
        </Typography>
      </Stack>

      <PanelAfiliadosAdmin afiliadosIniciales={afiliados} />
    </Stack>
  )
}

export default AdminAfiliadosPage
