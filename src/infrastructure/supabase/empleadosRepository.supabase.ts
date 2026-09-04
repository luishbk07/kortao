import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  EmpleadoNegocio,
  EmpleadosRepository,
  InvitacionEmpleado
} from '@/application/ports/empleadosRepository.port'
import {
  esTipoDocumentoUsuario,
  normalizarNumeroDocumento,
  type TipoDocumentoUsuario
} from '@/domain/business/identidadUsuario.types'
import { crearClienteServicioOpcional } from '@/infrastructure/supabase/clienteServicio'

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

const mapearTipoDocumento = (
  valor: string | null | undefined
): TipoDocumentoUsuario | null => {
  if (!valor || !esTipoDocumentoUsuario(valor)) {
    return null
  }

  return valor
}

const esErrorCodigoInvalido = (mensaje: string): boolean => {
  const normalizado = mensaje.toLowerCase()
  return (
    (normalizado.includes('código') || normalizado.includes('codigo')) &&
    (normalizado.includes('inválido') ||
      normalizado.includes('invalido') ||
      normalizado.includes('utilizado'))
  )
}

const obtenerCorreoUsuario = async (
  clienteServicio: SupabaseClient,
  authUserId: string
): Promise<string | null> => {
  const { data, error } = await clienteServicio.auth.admin.getUserById(
    authUserId
  )

  if (error || !data.user?.email) {
    return null
  }

  return data.user.email
}

const enriquecerEmpleadosConCorreo = async (
  empleados: EmpleadoNegocio[]
): Promise<EmpleadoNegocio[]> => {
  if (empleados.length === 0) {
    return empleados
  }

  const clienteServicio = crearClienteServicioOpcional()

  if (!clienteServicio) {
    return empleados
  }

  return Promise.all(
    empleados.map(async (empleado) => {
      if (empleado.correo) {
        return empleado
      }

      const correo = await obtenerCorreoUsuario(
        clienteServicio,
        empleado.authUserId
      )

      return {
        ...empleado,
        correo
      }
    })
  )
}

type EmpleadoFila = {
  id: string
  auth_user_id: string
  correo?: string | null
  nombre?: string | null
  tipo_documento?: string | null
  numero_documento?: string | null
  telefono?: string | null
}

const mapearEmpleado = (fila: EmpleadoFila): EmpleadoNegocio => ({
  id: fila.id,
  authUserId: fila.auth_user_id,
  correo: fila.correo ?? null,
  nombre: fila.nombre ?? null,
  tipoDocumento: mapearTipoDocumento(fila.tipo_documento),
  numeroDocumento: fila.numero_documento ?? null,
  telefono: fila.telefono ?? null
})

export const crearEmpleadosRepository = (
  cliente: SupabaseClient
): EmpleadosRepository => ({
  listarEmpleados: async (negocioId) => {
    const { data: dataRpc, error: errorRpc } = await cliente.rpc(
      'listar_empleados_negocio',
      { p_negocio_id: negocioId }
    )

    if (!errorRpc) {
      const empleados = ((dataRpc as EmpleadoFila[] | null) ?? []).map(
        mapearEmpleado
      )
      return enriquecerEmpleadosConCorreo(empleados)
    }

    const { data, error } = await cliente
      .from('usuarios_negocio')
      .select(
        'id, auth_user_id, nombre, tipo_documento, numero_documento, telefono'
      )
      .eq('negocio_id', negocioId)
      .eq('rol', 'empleado')
      .order('nombre', { ascending: true, nullsFirst: false })

    if (error) {
      lanzarErrorSupabase(errorRpc)
    }

    const empleados = ((data as EmpleadoFila[] | null) ?? []).map(mapearEmpleado)
    return enriquecerEmpleadosConCorreo(empleados)
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

    return mapearInvitacion(
      data as {
        id: string
        codigo: string
        creado_en: string
      }
    )
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

  registrarConCodigo: async (codigo, identidad) => {
    const { data, error } = await cliente.rpc('registrar_empleado', {
      codigo_param: codigo.trim().toUpperCase(),
      nombre_param: identidad.nombre.trim(),
      tipo_documento_param: identidad.tipoDocumento,
      numero_documento_param: normalizarNumeroDocumento(
        identidad.numeroDocumento,
        identidad.tipoDocumento
      ),
      telefono_param: identidad.telefono.trim()
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
