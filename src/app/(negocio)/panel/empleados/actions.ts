'use server'

import { crearAuthService } from '@/infrastructure/supabase/authService.supabase'
import { crearBusinessRepository } from '@/infrastructure/supabase/businessRepository.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { crearEmpleadosRepository } from '@/infrastructure/supabase/empleadosRepository.supabase'
import { esRolDueño } from '@/domain/business/rolUsuario.types'
import { generarCodigoInvitacion } from '@/shared/utils/codigoInvitacion'
import { esPlanMultiUsuario } from '@/shared/utils/planes'

const obtenerContextoDueñoEmpleados = async () => {
  const supabase = crearClienteServidor()
  const authService = crearAuthService(supabase)
  const businessRepository = crearBusinessRepository(supabase)
  const empleadosRepository = crearEmpleadosRepository(supabase)

  const usuario = await authService.obtenerUsuarioActual()

  if (!usuario) {
    throw new Error('No hay una sesión activa')
  }

  const membresia = await businessRepository.obtenerMembresiaPorUsuario(
    usuario.id
  )

  if (!membresia) {
    throw new Error('Tu usuario no está vinculado a un negocio')
  }

  if (!esRolDueño(membresia.rol)) {
    throw new Error('Solo el dueño puede gestionar empleados')
  }

  const negocio = await businessRepository.obtenerNegocioPorId(
    membresia.negocioId
  )

  if (!negocio || !esPlanMultiUsuario(negocio.plan)) {
    throw new Error(
      'La gestión de empleados requiere un plan Premium o Max'
    )
  }

  return {
    usuarioId: usuario.id,
    negocioId: membresia.negocioId,
    negocioNombre: negocio.nombre,
    empleadosRepository
  }
}

export const generarInvitacionEmpleadoAction = async (): Promise<{
  id: string
  codigo: string
  creadoEn: string
}> => {
  const { usuarioId, negocioId, empleadosRepository } =
    await obtenerContextoDueñoEmpleados()

  let ultimoError: unknown = null

  for (let intento = 0; intento < 5; intento += 1) {
    const codigo = generarCodigoInvitacion()

    try {
      const invitacion = await empleadosRepository.crearInvitacion(
        negocioId,
        usuarioId,
        codigo
      )

      return {
        id: invitacion.id,
        codigo: invitacion.codigo,
        creadoEn: invitacion.creadoEn.toISOString()
      }
    } catch (error) {
      ultimoError = error
    }
  }

  throw ultimoError instanceof Error
    ? ultimoError
    : new Error('No se pudo generar el código de invitación')
}

export const revocarInvitacionEmpleadoAction = async (
  invitacionId: string
): Promise<void> => {
  const { negocioId, empleadosRepository } =
    await obtenerContextoDueñoEmpleados()
  await empleadosRepository.revocarInvitacion(negocioId, invitacionId)
}

export const quitarEmpleadoAction = async (
  membresiaId: string
): Promise<void> => {
  const { negocioId, empleadosRepository } =
    await obtenerContextoDueñoEmpleados()
  await empleadosRepository.quitarEmpleado(negocioId, membresiaId)
}

export const registrarEmpleadoConCodigoAction = async (
  codigo: string,
  identidad: {
    nombre: string
    tipoDocumento: 'cedula' | 'rnc' | 'pasaporte'
    numeroDocumento: string
    telefono: string
  }
): Promise<void> => {
  const supabase = crearClienteServidor()
  const authService = crearAuthService(supabase)
  const empleadosRepository = crearEmpleadosRepository(supabase)

  const usuario = await authService.obtenerUsuarioActual()

  if (!usuario) {
    throw new Error('No hay una sesión activa')
  }

  try {
    await empleadosRepository.registrarConCodigo(codigo, identidad)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes('código inválido')
    ) {
      throw new Error(
        'El código de invitación no es válido o ya fue utilizado.'
      )
    }

    throw error
  }
}
