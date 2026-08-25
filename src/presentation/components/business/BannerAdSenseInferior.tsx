'use client'

import { useEffect } from 'react'
import Box from '@mui/material/Box'
import { esPlanPremium } from '@/shared/utils/planes'

type BannerAdSenseInferiorProps = {
  plan: string
}

type VentanaAdsByGoogle = Window & {
  adsbygoogle?: Record<string, unknown>[]
}

const obtenerSlotAdSenseInferior = (): string | null => {
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID_INFERIOR?.trim()
  return slot || null
}

const activarUnidadAdSense = (): void => {
  const ventana = window as VentanaAdsByGoogle
  ventana.adsbygoogle = ventana.adsbygoogle ?? []
  ventana.adsbygoogle.push({})
}

export const BannerAdSenseInferior = ({ plan }: BannerAdSenseInferiorProps) => {
  const slotAdSense = obtenerSlotAdSenseInferior()

  useEffect(() => {
    if (!slotAdSense || esPlanPremium(plan)) {
      return
    }

    try {
      activarUnidadAdSense()
    } catch {
      // AdSense may throw if the script is not ready yet.
    }
  }, [slotAdSense, plan])

  if (esPlanPremium(plan) || !slotAdSense) {
    return null
  }

  return (
    <Box
      component='aside'
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        px: { xs: 2, sm: 3 },
        py: 2
      }}
    >
      <Box sx={{ maxWidth: 'md', mx: 'auto', minWidth: 0 }}>
        <ins
          className='adsbygoogle'
          style={{ display: 'block' }}
          data-ad-client={
            process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || undefined
          }
          data-ad-slot={slotAdSense}
          data-ad-format='auto'
          data-full-width-responsive='true'
        />
      </Box>
    </Box>
  )
}
