import { notFound } from 'next/navigation'
import { PanelPlan } from '@/presentation/components/business/PanelPlan'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { exigirRolDueñoORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { parsearFechaCalendario } from '@/shared/utils/fechas'

const PlanPage = async () => {
  const { negocioId } = await exigirRolDueñoORedirigir()
  const { businessRepository } = crearDependenciasPanelServidor()
  const negocio = await businessRepository.obtenerNegocioPorId(negocioId)

  if (!negocio) {
    notFound()
  }

  const telefonoSoporte = process.env.SOPORTE_WHATSAPP?.trim() || null

  const supabase = crearClienteServidor()
  const { data: ultimosPagos } = await supabase
    .from('pagos_negocio')
    .select('fecha_pago')
    .eq('negocio_id', negocioId)
    .order('fecha_pago', { ascending: false })
    .limit(1)

  const fechaPagoRaw = ultimosPagos?.[0]?.fecha_pago
  const fechaUltimoPago = fechaPagoRaw
    ? parsearFechaCalendario(String(fechaPagoRaw).slice(0, 10))
    : null

  return (
    <PanelPlan
      nombreNegocio={negocio.nombre}
      plan={negocio.plan}
      precioMensual={negocio.precioMensual}
      cicloFacturacion={negocio.cicloFacturacion}
      fechaInicioSuscripcion={negocio.fechaInicioSuscripcion}
      fechaUltimoPago={fechaUltimoPago}
      telefonoSoporte={telefonoSoporte}
    />
  )
}

export default PlanPage
