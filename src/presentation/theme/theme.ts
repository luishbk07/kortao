'use client'

import { createTheme, type Theme } from '@mui/material/styles'
import {
  crearOpcionesPaleta,
  opcionesTemaCompartidas,
  type ModoColor
} from './palette'

export const crearTema = (modo: ModoColor): Theme => {
  return createTheme({
    ...opcionesTemaCompartidas,
    palette: crearOpcionesPaleta(modo)
  })
}

/** Default light theme (SSR / static imports). Prefer crearTema with ColorModeProvider. */
export const theme = crearTema('light')
