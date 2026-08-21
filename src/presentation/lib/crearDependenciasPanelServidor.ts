import { crearAuthService } from '@/infrastructure/supabase/authService.supabase'
import { crearBookingRepository } from '@/infrastructure/supabase/bookingRepository.supabase'
import { crearBusinessRepository } from '@/infrastructure/supabase/businessRepository.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'

export const crearDependenciasPanelServidor = () => {
  const cliente = crearClienteServidor()

  return {
    authService: crearAuthService(cliente),
    businessRepository: crearBusinessRepository(cliente),
    bookingRepository: crearBookingRepository(cliente)
  }
}
