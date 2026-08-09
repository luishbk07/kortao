'use client'

import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { NavegacionPanel } from '@/presentation/components/business/NavegacionPanel'

type PanelShellProps = {
  children: ReactNode
}

export const PanelShell = ({ children }: PanelShellProps) => {
  return (
    <Box bgcolor='background.default' minHeight='100vh'>
      <NavegacionPanel />
      <Container maxWidth='md' sx={{ py: { xs: 3, sm: 4 } }}>
        {children}
      </Container>
    </Box>
  )
}
