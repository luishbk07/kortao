import type { SupabaseClient } from '@supabase/supabase-js'
import type { AfiliadosRepository } from '@/application/ports/afiliadosRepository.port'
import type {
  Afiliado,
  AfiliadoConMetricas,
  AfiliadoOpcion
} from '@/domain/admin/afiliado.types'
import { esPlanPremium } from '@/shared/utils/planes'
import { normalizarCodigoAfiliado } from '@/shared/utils/afiliado'

type AfiliadoFila = {
  id: string
  nombre: string
  codigo: string
  activo: boolean
  creado_en: string
}

type AfiliadoConNegociosFila = AfiliadoFila & {
  negocios:
    | { id: string; plan: string | null }[]
    | { id: string; plan: string | null }
    | null
}

const mapearAfiliado = (fila: AfiliadoFila): Afiliado => ({
  id: fila.id,
  nombre: fila.nombre,
  codigo: fila.codigo,
  activo: fila.activo,
  creadoEn: new Date(fila.creado_en)
})

const obtenerNegocios = (
  negocios: AfiliadoConNegociosFila['negocios']
): Array<{ id: string; plan: string | null }> => {
  if (!negocios) {
    return []
  }

  return Array.isArray(negocios) ? negocios : [negocios]
}

export const crearAfiliadosRepository = (
  cliente: SupabaseClient
): AfiliadosRepository => ({
  listarConMetricas: async () => {
    const { data, error } = await cliente
      .from('afiliados')
      .select('id, nombre, codigo, activo, creado_en, negocios(id, plan)')
      .order('creado_en', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return ((data as AfiliadoConNegociosFila[] | null) ?? []).map((fila) => {
      const referidos = obtenerNegocios(fila.negocios)
      const premium = referidos.filter((negocio) =>
        esPlanPremium(negocio.plan ?? 'estandar')
      )

      return {
        ...mapearAfiliado(fila),
        negociosReferidos: referidos.length,
        negociosPremium: premium.length
      }
    })
  },

  listarActivos: async () => {
    const { data, error } = await cliente
      .from('afiliados')
      .select('id, nombre, codigo')
      .eq('activo', true)
      .order('nombre', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return ((data as AfiliadoOpcion[] | null) ?? []).map((fila) => ({
      id: fila.id,
      nombre: fila.nombre,
      codigo: fila.codigo
    }))
  },

  crear: async (nombre, codigo) => {
    const nombreLimpio = nombre.trim()
    const codigoLimpio = normalizarCodigoAfiliado(codigo)

    if (nombreLimpio.length === 0) {
      throw new Error('El nombre no puede estar vacío')
    }

    if (codigoLimpio.length === 0) {
      throw new Error('El código no puede estar vacío')
    }

    const { data, error } = await cliente
      .from('afiliados')
      .insert({
        nombre: nombreLimpio,
        codigo: codigoLimpio,
        activo: true
      })
      .select('id, nombre, codigo, activo, creado_en')
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('Ese código de afiliado ya existe')
      }

      throw new Error(error.message)
    }

    return mapearAfiliado(data as AfiliadoFila)
  },

  actualizar: async (afiliadoId, nombre, codigo) => {
    const nombreLimpio = nombre.trim()
    const codigoLimpio = normalizarCodigoAfiliado(codigo)

    if (nombreLimpio.length === 0) {
      throw new Error('El nombre no puede estar vacío')
    }

    if (codigoLimpio.length === 0) {
      throw new Error('El código no puede estar vacío')
    }

    const { data, error } = await cliente
      .from('afiliados')
      .update({
        nombre: nombreLimpio,
        codigo: codigoLimpio
      })
      .eq('id', afiliadoId)
      .select('id, nombre, codigo, activo, creado_en')
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('Ese código de afiliado ya existe')
      }

      throw new Error(error.message)
    }

    return mapearAfiliado(data as AfiliadoFila)
  },

  actualizarActivo: async (afiliadoId, activo) => {
    const { error } = await cliente
      .from('afiliados')
      .update({ activo })
      .eq('id', afiliadoId)

    if (error) {
      throw new Error(error.message)
    }
  },

  eliminar: async (afiliadoId) => {
    const { error } = await cliente
      .from('afiliados')
      .delete()
      .eq('id', afiliadoId)

    if (error) {
      throw new Error(error.message)
    }
  },

  buscarActivoPorCodigo: async (codigo) => {
    const codigoLimpio = normalizarCodigoAfiliado(codigo)

    if (codigoLimpio.length === 0) {
      return null
    }

    const { data, error } = await cliente
      .from('afiliados')
      .select('id, nombre, codigo')
      .eq('codigo', codigoLimpio)
      .eq('activo', true)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return null
    }

    return {
      id: data.id,
      nombre: data.nombre,
      codigo: data.codigo
    }
  },

  existeCodigo: async (codigo, excluirAfiliadoId = null) => {
    const codigoLimpio = normalizarCodigoAfiliado(codigo)

    if (codigoLimpio.length === 0) {
      return false
    }

    let consulta = cliente
      .from('afiliados')
      .select('id')
      .eq('codigo', codigoLimpio)
      .limit(1)

    if (excluirAfiliadoId) {
      consulta = consulta.neq('id', excluirAfiliadoId)
    }

    const { data, error } = await consulta.maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data !== null
  }
})
