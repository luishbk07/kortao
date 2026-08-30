'use client'

import { useMemo, type ReactNode } from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { ProveedorModoColor, useModoColor } from './ProveedorModoColor'
import { crearTema } from './theme'
import { IndicadorAmbientePruebas } from '@/presentation/components/ui/IndicadorAmbientePruebas'

type ThemeRegistryProps = {
  children: ReactNode
}

const ThemeRegistryInterno = ({ children }: ThemeRegistryProps) => {
  const { modo } = useModoColor()
  const tema = useMemo(() => crearTema(modo), [modo])

  return (
    <ThemeProvider theme={tema}>
      <CssBaseline enableColorScheme />
      <IndicadorAmbientePruebas />
      {children}
    </ThemeProvider>
  )
}

export const ThemeRegistry = ({ children }: ThemeRegistryProps) => {
  return (
    <AppRouterCacheProvider>
      <ProveedorModoColor>
        <ThemeRegistryInterno>{children}</ThemeRegistryInterno>
      </ProveedorModoColor>
    </AppRouterCacheProvider>
  )
}
