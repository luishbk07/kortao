import * as XLSX from 'xlsx'
import type { ClienteRecurrente } from '@/domain/business/reportes.types'
import {
  formatearFechaLegible,
  formatearHoraLegible
} from '@/shared/utils/fechas'
import { formatearTelefonoVisual } from '@/shared/utils/telefono'

const comoFecha = (valor: Date | string): Date => {
  return valor instanceof Date ? valor : new Date(valor)
}

const formatearUltimaVisitaExport = (ultimaVisita: Date | string): string => {
  const fecha = comoFecha(ultimaVisita)
  return `${formatearFechaLegible(fecha, true)} · ${formatearHoraLegible(fecha)}`
}

export const exportarClientesAExcel = (clientes: ClienteRecurrente[]): void => {
  const filas = clientes.map((cliente) => ({
    Cliente: cliente.clienteNombre,
    Teléfono: formatearTelefonoVisual(cliente.clienteTelefono),
    Email: cliente.clienteCorreo ?? '',
    Visitas: cliente.numeroVisitas,
    'Última visita': formatearUltimaVisitaExport(cliente.ultimaVisita)
  }))

  const hoja = XLSX.utils.json_to_sheet(filas)
  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, hoja, 'Clientes')

  const fechaArchivo = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(libro, `clientes-${fechaArchivo}.xlsx`)
}
