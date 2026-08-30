import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { PanelShell } from '@/presentation/components/business/PanelShell'
import { CuentaPausada } from '@/presentation/components/business/CuentaPausada'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import {
  formatearFechaCalendario,
  parsearFechaCalendario
} from '@/shared/utils/fechas'
import { PRECIO_LISTA_PLAN_PREMIUM } from '@/shared/utils/planes'
import {
  calcularProximaFechaPago,
  debeMostrarAvisoPagoSuscripcion
} from '@/shared/utils/suscripcion'
import type { AccesoAdminPanel } from '@/presentation/components/business/NavegacionPanel'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
}

type PanelLayoutProps = {
  children: ReactNode
}

type NegocioMembresia = {
  suscripcion_activa: boolean
  plan: string | null
  precio_mensual: number | string | null
  fecha_inicio_suscripcion: string | null
}

type MembresiaFila = {
  negocio_id: string
  negocios: NegocioMembresia | NegocioMembresia[] | null
}

const obtenerNegocioMembresia = (
  negocios: MembresiaFila['negocios']
): NegocioMembresia | null => {
  if (!negocios) {
    return null
  }

  if (Array.isArray(negocios)) {
    return negocios[0] ?? null
  }

  return negocios
}

const mapearPrecioMensual = (valor: number | string | null): number => {
  if (typeof valor === 'number' && Number.isFinite(valor)) {
    return valor
  }

  if (typeof valor === 'string' && valor.trim().length > 0) {
    const numero = Number(valor)
    if (Number.isFinite(numero)) {
      return numero
    }
  }

  return PRECIO_LISTA_PLAN_PREMIUM
}

const PanelLayout = async ({ children }: PanelLayoutProps) => {
  const pathname = headers().get('x-pathname') ?? ''

  if (pathname === '/panel/restablecer-contrasena') {
    return children
  }

  const supabase = crearClienteServidor()

  let user: { id: string } | null = null

  try {
    const {
      data: { user: usuarioSesion },
      error
    } = await supabase.auth.getUser()

    if (!error && usuarioSesion) {
      user = usuarioSesion
    }
  } catch {
    user = null
  }

  let plan = 'estandar'
  let recordatorioPago: {
    precioMensual: number
    fechaProximoPago: string
  } | null = null
  let accesoAdmin: AccesoAdminPanel | undefined

  if (user) {
    const { data: membresia } = await supabase
      .from('usuarios_negocio')
      .select(
        'negocio_id, negocios(suscripcion_activa, plan, precio_mensual, fecha_inicio_suscripcion)'
      )
      .eq('auth_user_id', user.id)
      .maybeSingle()

    const negocio = obtenerNegocioMembresia(
      (membresia as MembresiaFila | null)?.negocios ?? null
    )

    if (negocio?.suscripcion_activa === false) {
      return <CuentaPausada />
    }

    plan = negocio?.plan ?? 'estandar'

    const fechaInicio =
      negocio?.fecha_inicio_suscripcion != null
        ? parsearFechaCalendario(
            negocio.fecha_inicio_suscripcion.slice(0, 10)
          )
        : null

    const negocioId = (membresia as MembresiaFila | null)?.negocio_id ?? null

    let fechaUltimoPago: Date | null = null

    if (negocioId && fechaInicio) {
      const { data: ultimosPagos } = await supabase
        .from('pagos_negocio')
        .select('fecha_pago')
        .eq('negocio_id', negocioId)
        .order('fecha_pago', { ascending: false })
        .limit(1)

      const fechaPagoRaw = ultimosPagos?.[0]?.fecha_pago

      if (fechaPagoRaw) {
        fechaUltimoPago = parsearFechaCalendario(
          String(fechaPagoRaw).slice(0, 10)
        )
      }
    }

    if (
      negocio &&
      debeMostrarAvisoPagoSuscripcion(
        plan,
        negocio.suscripcion_activa,
        fechaInicio,
        fechaUltimoPago
      ) &&
      fechaInicio
    ) {
      const proxima = calcularProximaFechaPago(fechaInicio)
      recordatorioPago = {
        precioMensual: mapearPrecioMensual(negocio.precio_mensual),
        fechaProximoPago: formatearFechaCalendario(proxima)
      }
    }

    const { data: admin } = await supabase
      .from('administradores_kortao')
      .select('auth_user_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (admin) {
      const { count } = await supabase
        .from('reportes_soporte')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente')

      accesoAdmin = {
        reportesPendientes: count ?? 0
      }
    }
  }

  return (
    <PanelShell
      plan={plan}
      recordatorioPago={recordatorioPago}
      {...(accesoAdmin ? { accesoAdmin } : {})}
    >
      {children}
    </PanelShell>
  )
}

export default PanelLayout
