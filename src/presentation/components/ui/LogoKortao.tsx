'use client'

import { useTheme } from '@mui/material/styles'

type LogoKortaoProps = {
  variant?: 'horizontal' | 'icon'
  size?: number
}

export const LogoKortao = ({
  variant = 'horizontal',
  size
}: LogoKortaoProps) => {
  const theme = useTheme()
  const colorMarca = theme.palette.primary.main
  const colorIcono = theme.palette.background.default
  const colorAcento = theme.palette.secondary.main

  if (variant === 'icon') {
    const altura = size ?? 32

    return (
      <svg
        width={altura}
        height={altura}
        viewBox='0 0 120 120'
        xmlns='http://www.w3.org/2000/svg'
        role='img'
        aria-label='Kortao'
      >
        <rect width='120' height='120' rx='28' fill={colorMarca} />
        <path
          d='M38 30V90M38 60L70 30M38 60L70 90'
          stroke={colorIcono}
          strokeWidth='9'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />
        <circle cx='84' cy='34' r='6' fill={colorAcento} />
      </svg>
    )
  }

  const altura = size ?? 40
  const ancho = (altura * 220) / 56

  return (
    <svg
      width={ancho}
      height={altura}
      viewBox='0 0 220 56'
      xmlns='http://www.w3.org/2000/svg'
      role='img'
      aria-label='Kortao'
    >
      <rect width='56' height='56' rx='14' fill={colorMarca} />
      <path
        d='M18 14V42M18 28L33 14M18 28L33 42'
        stroke={colorIcono}
        strokeWidth='4.2'
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
      />
      <circle cx='39.5' cy='16' r='2.8' fill={colorAcento} />
      <text
        x='70'
        y='37'
        fontFamily="var(--font-inter), 'Inter', sans-serif"
        fontWeight='700'
        fontSize='30'
        fill={colorMarca}
      >
        Kortao
      </text>
    </svg>
  )
}
