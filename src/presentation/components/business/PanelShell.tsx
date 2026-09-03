'use client'

import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { BannerPromocional } from '@/presentation/components/business/BannerPromocional'
import {
  BannerRecordatorioPago,
  type RecordatorioPagoPanel
} from '@/presentation/components/business/BannerRecordatorioPago'
import {
  NavegacionPanel,
  type AccesoAdminPanel
} from '@/presentation/components/business/NavegacionPanel'
import { ContadorReportesPendientesProvider } from '@/presentation/lib/contadorReportesPendientes'
import type { RolUsuarioNegocio } from '@/domain/business/rolUsuario.types'
import { esRolDueño } from '@/domain/business/rolUsuario.types'

type PanelShellProps = {
  children: ReactNode
  plan: string
  rol?: RolUsuarioNegocio
  recordatorioPago?: RecordatorioPagoPanel | null
  accesoAdmin?: AccesoAdminPanel
  notificacionesNoLeidas?: number
}

const PanelShellContenido = ({
  children,
  plan,
  rol = 'dueño',
  recordatorioPago,
  accesoAdmin,
  notificacionesNoLeidas = 0
}: PanelShellProps) => {
  const mostrarPromoYPago = esRolDueño(rol)

  return (
    <Box
      bgcolor='background.default'
      minHeight='100vh'
      display='flex'
      flexDirection='column'
    >
      <NavegacionPanel
        accesoAdmin={accesoAdmin}
        notificacionesNoLeidas={notificacionesNoLeidas}
        rol={rol}
      />
      {mostrarPromoYPago && recordatorioPago ? (
        <BannerRecordatorioPago recordatorio={recordatorioPago} />
      ) : mostrarPromoYPago ? (
        <BannerPromocional plan={plan} />
      ) : null}
      <Container maxWidth='md' sx={{ py: { xs: 3, sm: 4 }, flex: 1 }}>
        {children}
      </Container>
    </Box>
  )
}

export const PanelShell = ({
  children,
  plan,
  rol = 'dueño',
  recordatorioPago = null,
  accesoAdmin,
  notificacionesNoLeidas = 0
}: PanelShellProps) => {
  if (!accesoAdmin) {
    return (
      <PanelShellContenido
        plan={plan}
        rol={rol}
        recordatorioPago={recordatorioPago}
        notificacionesNoLeidas={notificacionesNoLeidas}
      >
        {children}
      </PanelShellContenido>
    )
  }

  return (
    <ContadorReportesPendientesProvider
      inicial={accesoAdmin.reportesPendientes}
    >
      <PanelShellContenido
        plan={plan}
        rol={rol}
        recordatorioPago={recordatorioPago}
        accesoAdmin={accesoAdmin}
        notificacionesNoLeidas={notificacionesNoLeidas}
      >
        {children}
      </PanelShellContenido>
    </ContadorReportesPendientesProvider>
  )
}
