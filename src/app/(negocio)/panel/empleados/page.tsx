import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AvisoPlanPremium } from '@/presentation/components/business/AvisoPlanPremium'
import { PanelEmpleados } from '@/presentation/components/business/PanelEmpleados'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { exigirRolDueñoORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'
import { crearEmpleadosRepository } from '@/infrastructure/supabase/empleadosRepository.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { esPlanMultiUsuario } from '@/shared/utils/planes'

const EmpleadosPanelPage = async () => {
  const { negocioId } = await exigirRolDueñoORedirigir()
  const { businessRepository } = crearDependenciasPanelServidor()
  const negocio = await businessRepository.obtenerNegocioPorId(negocioId)

  if (!negocio || !esPlanMultiUsuario(negocio.plan)) {
    return (
      <Stack spacing={3}>
        <Typography variant='h5' component='h1' color='primary'>
          Empleados
        </Typography>
        <AvisoPlanPremium
          titulo='Disponible en Premium y Max'
          mensaje='La gestión de empleados forma parte de los planes multi-usuario. Activa Premium para invitar a tu equipo.'
        />
      </Stack>
    )
  }

  const empleadosRepository = crearEmpleadosRepository(crearClienteServidor())
  const [empleados, invitaciones] = await Promise.all([
    empleadosRepository.listarEmpleados(negocioId),
    empleadosRepository.listarInvitacionesPendientes(negocioId)
  ])

  return (
    <PanelEmpleados
      negocioNombre={negocio.nombre}
      empleadosIniciales={empleados}
      invitacionesIniciales={invitaciones}
    />
  )
}

export default EmpleadosPanelPage
