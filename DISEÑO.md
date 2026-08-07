# Visual design — Kortao

## Concept

No generic blue-and-white SaaS template. For barbershops/salons the tone
should feel warm, premium, and with character — somewhere between a
design studio and a wellness space, not a spreadsheet with buttons.

Palette: **deep forest green as the brand color + warm cream/bone as the
background + a terracotta/rust accent for important actions.** Avoid the
typical "SaaS blue" already used by a thousand products that says
nothing about the industry (beauty/style).

## Color palette

| Token | Hex | Use |
|---|---|---|
| `primary.main` | `#1F4B3F` | Deep forest green — brand, headers, primary buttons |
| `primary.light` | `#3C7060` | Hover states, secondary brand elements |
| `primary.dark` | `#123128` | Text on light backgrounds with brand accent |
| `secondary.main` | `#C1693A` | Warm terracotta/rust — highlighted actions (confirm booking, CTA) |
| `background.default` | `#FBF8F3` | Warm cream/bone — overall background, not pure white |
| `background.paper` | `#FFFFFF` | Cards, modals |
| `text.primary` | `#1C1C1A` | Main text, near-black with warmth |
| `text.secondary` | `#6B6862` | Secondary text, metadata |
| `success.main` | `#3C7060` | Confirmations (shares tone with primary.light) |
| `error.main` | `#B3432B` | Errors, cancellations |
| `divider` | `#E7E2D8` | Subtle borders and separators |

## Typography

- Primary font: **Inter** or **Plus Jakarta Sans** (modern, very
  readable, free on Google Fonts, good variable-weight support)
- Headings at weight 600-700, body text at weight 400-500
- Avoid overly condensed typefaces — must stay comfortable to read on
  mobile

## UI principles

- Moderate rounded corners (`borderRadius: 12` in the theme), not fully
  square or excessively "pill"-shaped
- Soft, subtle shadows, never the hard Material shadows from ~2015
- Generous whitespace/spacing — don't cram information
- MUI Icons in `outlined` or `rounded` style (not `filled`) — reads as
  more modern, less "Android 2016"
- Micro-interactions: smooth transitions on hover/click (150-200ms),
  nothing abrupt

## Theme starting point (MUI v5+)

```ts
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1F4B3F',
      light: '#3C7060',
      dark: '#123128'
    },
    secondary: {
      main: '#C1693A'
    },
    background: {
      default: '#FBF8F3',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1C1C1A',
      secondary: '#6B6862'
    },
    error: {
      main: '#B3432B'
    },
    divider: '#E7E2D8'
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
```

`textTransform: 'none'` on buttons matters — it avoids MUI's default
dated "ALL CAPS BUTTON" look.
