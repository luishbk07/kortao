'use client'

import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { NavegacionPanel } from '@/presentation/components/business/NavegacionPanel'

type PanelLayoutProps = {
  children: ReactNode
}

const PanelLayout = ({ children }: PanelLayoutProps) => {
  return (
    <Box bgcolor='background.default' minHeight='100vh'>
      <NavegacionPanel />
      <Container maxWidth='md' sx={{ py: { xs: 3, sm: 4 } }}>
        {children}
      </Container>
    </Box>
  )
}

export default PanelLayout
