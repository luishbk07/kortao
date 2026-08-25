'use client'

import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { NavegacionAdmin } from '@/presentation/components/admin/NavegacionAdmin'
import { ContadorReportesPendientesProvider } from '@/presentation/lib/contadorReportesPendientes'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'

type AdminShellProps = {
  children: ReactNode
  reportesPendientes: number
}

export const AdminShell = ({
  children,
  reportesPendientes
}: AdminShellProps) => {
  return (
    <ContadorReportesPendientesProvider inicial={reportesPendientes}>
      <Box bgcolor='background.default' minHeight='100vh'>
        <EncabezadoMarca />
        <Container maxWidth='lg' sx={{ py: { xs: 3, sm: 4 } }}>
          <Stack spacing={3}>
            <NavegacionAdmin />
            {children}
          </Stack>
        </Container>
      </Box>
    </ContadorReportesPendientesProvider>
  )
}
