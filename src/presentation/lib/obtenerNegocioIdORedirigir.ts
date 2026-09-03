import { redirect } from 'next/navigation'
import {
  esRolDueño,
  normalizarRolUsuarioNegocio,
  type RolUsuarioNegocio
} from '@/domain/business/rolUsuario.types'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'

export type ContextoPanelAutenticado = {
  negocioId: string
  rol: RolUsuarioNegocio
}

export const obtenerContextoPanelORedirigir =
  async (): Promise<ContextoPanelAutenticado> => {
    const { authService, businessRepository } = crearDependenciasPanelServidor()
    const usuario = await authService.obtenerUsuarioActual()

    if (!usuario) {
      redirect('/login')
    }

    const membresia = await businessRepository.obtenerMembresiaPorUsuario(
      usuario.id
    )

    if (!membresia) {
      redirect('/panel/onboarding')
    }

    return {
      negocioId: membresia.negocioId,
      rol: membresia.rol
    }
  }

export const obtenerNegocioIdORedirigir = async (): Promise<string> => {
  const { negocioId } = await obtenerContextoPanelORedirigir()
  return negocioId
}

/** Dueño-only pages and actions. Empleados are sent to Citas. */
export const exigirRolDueñoORedirigir =
  async (): Promise<ContextoPanelAutenticado> => {
    const contexto = await obtenerContextoPanelORedirigir()

    if (!esRolDueño(contexto.rol)) {
      redirect('/panel/citas')
    }

    return contexto
  }

export const mapearRolDesdeFila = (
  rol: string | null | undefined
): RolUsuarioNegocio => {
  return normalizarRolUsuarioNegocio(rol)
}
