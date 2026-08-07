import { crearAuthService } from '@/infrastructure/supabase/authService.supabase'
import { crearBusinessRepository } from '@/infrastructure/supabase/businessRepository.supabase'
import { crearClienteNavegador } from '@/infrastructure/supabase/clienteNavegador'

export const crearDependenciasPanelNavegador = () => {
  const cliente = crearClienteNavegador()

  return {
    authService: crearAuthService(cliente),
    businessRepository: crearBusinessRepository(cliente)
  }
}
