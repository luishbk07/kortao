import type { ClienteRecurrente } from '@/domain/business/reportes.types'
import {
  formatearFechaLegible,
  formatearHoraLegible
} from '@/shared/utils/fechas'
import { formatearTelefonoVisual } from '@/shared/utils/telefono'

export const TAMANO_PAGINA_CLIENTES = 10

export const OPCIONES_MIN_VISITAS = [
  { valor: 1, etiqueta: 'Todas las visitas' },
  { valor: 2, etiqueta: 'Visitas ≥ 2' },
  { valor: 5, etiqueta: 'Visitas ≥ 5' },
  { valor: 10, etiqueta: 'Visitas ≥ 10' }
] as const

export const comoFecha = (valor: Date | string): Date => {
  return valor instanceof Date ? valor : new Date(valor)
}

export const obtenerIniciales = (nombre: string): string => {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) {
    return '?'
  }
  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase()
  }
  return `${partes[0][0] ?? ''}${partes[1][0] ?? ''}`.toUpperCase()
}

export const coincideBusquedaCliente = (
  cliente: ClienteRecurrente,
  busqueda: string
): boolean => {
  const termino = busqueda.trim().toLowerCase()
  if (!termino) {
    return true
  }

  const telefono = cliente.clienteTelefono.toLowerCase()
  const telefonoVisual = formatearTelefonoVisual(cliente.clienteTelefono)
    .toLowerCase()
  const nombre = cliente.clienteNombre.toLowerCase()
  const correo = (cliente.clienteCorreo ?? '').toLowerCase()

  return (
    nombre.includes(termino) ||
    telefono.includes(termino) ||
    telefonoVisual.includes(termino) ||
    correo.includes(termino)
  )
}

export const formatearUltimaVisitaCliente = (
  ultimaVisita: Date | string
): string => {
  const fecha = comoFecha(ultimaVisita)
  return `${formatearFechaLegible(fecha, false)} · ${formatearHoraLegible(fecha)}`
}
