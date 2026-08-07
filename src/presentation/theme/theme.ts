'use client'

import { createTheme } from '@mui/material/styles'
import { palette } from './palette'

export const theme = createTheme({
  palette: {
    primary: {
      main: palette.primary.main,
      light: palette.primary.light,
      dark: palette.primary.dark
    },
    secondary: {
      main: palette.secondary.main
    },
    background: {
      default: palette.background.default,
      paper: palette.background.paper
    },
    text: {
      primary: palette.text.primary,
      secondary: palette.text.secondary
    },
    success: {
      main: palette.success.main
    },
    error: {
      main: palette.error.main
    },
    divider: palette.divider
  },
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
    }
  }
})
