'use client'

import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { BannerPromocional } from '@/presentation/components/business/BannerPromocional'
import {
  BannerRecordatorioPago,
  type RecordatorioPagoPanel
} from '@/presentation/components/business/BannerRecordatorioPago'
import { NavegacionPanel } from '@/presentation/components/business/NavegacionPanel'

type PanelShellProps = {
  children: ReactNode
  plan: string
  recordatorioPago?: RecordatorioPagoPanel | null
}

export const PanelShell = ({
  children,
  plan,
  recordatorioPago = null
}: PanelShellProps) => {
  return (
    <Box bgcolor='background.default' minHeight='100vh'>
      <NavegacionPanel />
      {recordatorioPago ? (
        <BannerRecordatorioPago recordatorio={recordatorioPago} />
      ) : (
        <BannerPromocional plan={plan} />
      )}
      <Container maxWidth='md' sx={{ py: { xs: 3, sm: 4 } }}>
        {children}
      </Container>
    </Box>
  )
}
