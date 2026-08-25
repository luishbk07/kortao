'use client'

import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { BannerPromocional } from '@/presentation/components/business/BannerPromocional'
import { BannerAdSenseInferior } from '@/presentation/components/business/BannerAdSenseInferior'
import {
  BannerRecordatorioPago,
  type RecordatorioPagoPanel
} from '@/presentation/components/business/BannerRecordatorioPago'
import {
  NavegacionPanel,
  type AccesoAdminPanel
} from '@/presentation/components/business/NavegacionPanel'
import { ContadorReportesPendientesProvider } from '@/presentation/lib/contadorReportesPendientes'

type PanelShellProps = {
  children: ReactNode
  plan: string
  recordatorioPago?: RecordatorioPagoPanel | null
  accesoAdmin?: AccesoAdminPanel
}

const PanelShellContenido = ({
  children,
  plan,
  recordatorioPago,
  accesoAdmin
}: PanelShellProps) => {
  return (
    <Box
      bgcolor='background.default'
      minHeight='100vh'
      display='flex'
      flexDirection='column'
    >
      <NavegacionPanel accesoAdmin={accesoAdmin} />
      {recordatorioPago ? (
        <BannerRecordatorioPago recordatorio={recordatorioPago} />
      ) : (
        <BannerPromocional plan={plan} />
      )}
      <Container maxWidth='md' sx={{ py: { xs: 3, sm: 4 }, flex: 1 }}>
        {children}
      </Container>
      <BannerAdSenseInferior plan={plan} />
    </Box>
  )
}

export const PanelShell = ({
  children,
  plan,
  recordatorioPago = null,
  accesoAdmin
}: PanelShellProps) => {
  if (!accesoAdmin) {
    return (
      <PanelShellContenido
        plan={plan}
        recordatorioPago={recordatorioPago}
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
        recordatorioPago={recordatorioPago}
        accesoAdmin={accesoAdmin}
      >
        {children}
      </PanelShellContenido>
    </ContadorReportesPendientesProvider>
  )
}
