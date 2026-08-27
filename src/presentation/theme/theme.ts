'use client'

import { createTheme, type PaletteMode, type Theme } from '@mui/material/styles'
import {
  crearOpcionesPaleta,
  opcionesTemaCompartidas
} from './palette'

export const crearTema = (modo: PaletteMode): Theme => {
  return createTheme({
    ...opcionesTemaCompartidas,
    palette: crearOpcionesPaleta(modo)
  })
}

/** Default light theme (SSR / static imports). Prefer crearTema with ColorModeProvider. */
export const theme = crearTema('light')
