'use client'

import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { BannerPromocional } from '@/presentation/components/business/BannerPromocional'
import { NavegacionPanel } from '@/presentation/components/business/NavegacionPanel'

type PanelShellProps = {
  children: ReactNode
  plan: string
}

export const PanelShell = ({ children, plan }: PanelShellProps) => {
  return (
    <Box bgcolor='background.default' minHeight='100vh'>
      <NavegacionPanel />
      <BannerPromocional plan={plan} />
      <Container maxWidth='md' sx={{ py: { xs: 3, sm: 4 } }}>
        {children}
      </Container>
    </Box>
  )
}
