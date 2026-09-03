import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  EmpleadoNegocio,
  EmpleadosRepository,
  InvitacionEmpleado
} from '@/application/ports/empleadosRepository.port'

const lanzarErrorSupabase = (error: { message: string }): never => {
  throw new Error(error.message)
}

const mapearInvitacion = (fila: {
  id: string
  codigo: string
  creado_en: string
}): InvitacionEmpleado => ({
  id: fila.id,
  codigo: fila.codigo,
  creadoEn: new Date(fila.creado_en)
})

const esErrorCodigoInvalido = (mensaje: string): boolean => {
  const normalizado = mensaje.toLowerCase()
  return (
    normalizado.includes('código') ||
    normalizado.includes('codigo')
  ) && (
    normalizado.includes('inválido') ||
    normalizado.includes('invalido') ||
    normalizado.includes('utilizado')
  )
}

export const crearEmpleadosRepository = (
  cliente: SupabaseClient
): EmpleadosRepository => ({
  listarEmpleados: async (negocioId) => {
    const { data, error } = await cliente
      .from('usuarios_negocio')
      .select('id, auth_user_id')
      .eq('negocio_id', negocioId)
      .eq('rol', 'empleado')
      .order('id', { ascending: true })

    if (error) {
      lanzarErrorSupabase(error)
    }

    return ((data as {
      id: string
      auth_user_id: string
    }[] | null) ?? []).map((fila): EmpleadoNegocio => ({
      id: fila.id,
      authUserId: fila.auth_user_id,
      correo: null
    }))
  },

  quitarEmpleado: async (negocioId, membresiaId) => {
    const { error } = await cliente
      .from('usuarios_negocio')
      .delete()
      .eq('id', membresiaId)
      .eq('negocio_id', negocioId)
      .eq('rol', 'empleado')

    if (error) {
      lanzarErrorSupabase(error)
    }
  },

  listarInvitacionesPendientes: async (negocioId) => {
    const { data, error } = await cliente
      .from('invitaciones_empleado')
      .select('id, codigo, creado_en')
      .eq('negocio_id', negocioId)
      .eq('usado', false)
      .order('creado_en', { ascending: false })

    if (error) {
      lanzarErrorSupabase(error)
    }

    return ((data as {
      id: string
      codigo: string
      creado_en: string
    }[] | null) ?? []).map(mapearInvitacion)
  },

  crearInvitacion: async (negocioId, _creadoPor, codigo) => {
    const { data, error } = await cliente
      .from('invitaciones_empleado')
      .insert({
        negocio_id: negocioId,
        codigo,
        usado: false
      })
      .select('id, codigo, creado_en')
      .single()

    if (error) {
      lanzarErrorSupabase(error)
    }

    return mapearInvitacion(data as {
      id: string
      codigo: string
      creado_en: string
    })
  },

  revocarInvitacion: async (negocioId, invitacionId) => {
    const { error } = await cliente
      .from('invitaciones_empleado')
      .delete()
      .eq('id', invitacionId)
      .eq('negocio_id', negocioId)
      .eq('usado', false)

    if (error) {
      lanzarErrorSupabase(error)
    }
  },

  registrarConCodigo: async (codigo) => {
    const { data, error } = await cliente.rpc('registrar_empleado', {
      codigo_param: codigo.trim().toUpperCase()
    })

    if (error) {
      if (esErrorCodigoInvalido(error.message)) {
        throw new Error('código inválido')
      }
      lanzarErrorSupabase(error)
    }

    return data as string
  }
})
