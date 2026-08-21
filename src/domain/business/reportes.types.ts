export type ClienteRecurrente = {
  clienteTelefono: string
  clienteNombre: string
  numeroVisitas: number
  ultimaVisita: Date
}

export type CitaParaClientes = {
  clienteTelefono: string
  clienteNombre: string
  fechaHora: Date
}

export type CitaParaReportes = {
  precio: number | null
  fechaHora: Date
  servicioNombre: string
}

export type ReportesNegocio = {
  ingresosUltimos30Dias: number
  ingresosTotales: number
  servicioMasSolicitado: string | null
  ticketPromedio: number | null
  citasCompletadas: number
}
