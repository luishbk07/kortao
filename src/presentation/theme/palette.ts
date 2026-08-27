import type { ThemeOptions } from '@mui/material/styles'

export type ModoColor = 'light' | 'dark'

/** Light palette — DISEÑO.md (cream + forest + terracotta). */
export const paletteClaro = {
  primary: {
    main: '#1F4B3F',
    light: '#3C7060',
    dark: '#123128',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#C1693A',
    contrastText: '#FFFFFF'
  },
  background: {
    default: '#FBF8F3',
    paper: '#FFFFFF'
  },
  text: {
    primary: '#1C1C1A',
    secondary: '#6B6862'
  },
  success: {
    main: '#3C7060'
  },
  error: {
    main: '#B3432B'
  },
  divider: '#E7E2D8'
} as const

/**
 * Dark palette — same brand family, tuned for WCAG AA contrast:
 * body text ~15:1, secondary text ≥4.5:1 on paper/default backgrounds.
 * Avoids pure black (less glare) and keeps warm cream undertones.
 */
export const paletteOscuro = {
  primary: {
    main: '#7EB5A3',
    light: '#A8D4C4',
    dark: '#3C7060',
    contrastText: '#0F1614'
  },
  secondary: {
    main: '#E08A5A',
    contrastText: '#1C1C1A'
  },
  background: {
    default: '#0F1614',
    paper: '#1A2420'
  },
  text: {
    primary: '#F5F2EC',
    secondary: '#B0AAA0'
  },
  success: {
    main: '#7EB5A3'
  },
  error: {
    main: '#E07A66'
  },
  divider: '#2F3C37'
} as const

/** @deprecated Prefer paletteClaro — kept for accent presets and legacy imports. */
export const palette = paletteClaro

export const CLAVE_MODO_COLOR = 'kortao-modo-color'

export const opcionesTemaCompartidas: ThemeOptions = {
  typography: {
    fontFamily: 'var(--font-inter), sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Smoother transitions when switching modes
          transition: 'background-color 150ms ease, color 150ms ease'
        }
      }
    }
  }
}

export const crearOpcionesPaleta = (modo: ModoColor): ThemeOptions['palette'] => {
  const colores = modo === 'dark' ? paletteOscuro : paletteClaro

  return {
    mode: modo,
    primary: { ...colores.primary },
    secondary: { ...colores.secondary },
    background: { ...colores.background },
    text: { ...colores.text },
    success: { ...colores.success },
    error: { ...colores.error },
    divider: colores.divider
  }
}
