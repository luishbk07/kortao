'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { esPlanPremium } from '@/shared/utils/planes'

type BannerPromocionalProps = {
  plan: string
}

type VentanaAdsByGoogle = Window & {
  adsbygoogle?: Record<string, unknown>[]
}

const obtenerSlotAdSenseSuperior = (): string | null => {
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID_SUPERIOR?.trim()
  return slot || null
}

const activarUnidadAdSense = (): void => {
  const ventana = window as VentanaAdsByGoogle
  ventana.adsbygoogle = ventana.adsbygoogle ?? []
  ventana.adsbygoogle.push({})
}

export const BannerPromocional = ({ plan }: BannerPromocionalProps) => {
  const [descartado, setDescartado] = useState(false)
  const slotAdSense = obtenerSlotAdSenseSuperior()

  useEffect(() => {
    if (!slotAdSense || esPlanPremium(plan) || descartado) {
      return
    }

    try {
      activarUnidadAdSense()
    } catch {
      // AdSense may throw if the script is not ready yet.
    }
  }, [slotAdSense, plan, descartado])

  if (esPlanPremium(plan) || descartado) {
    return null
  }

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'primary.dark',
        color: 'common.white'
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent='space-between'
        spacing={1.5}
        sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}
      >
        {slotAdSense ? (
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
        ) : (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1.5}
            sx={{ flex: 1, minWidth: 0 }}
          >
            <RocketLaunchOutlinedIcon sx={{ opacity: 0.9 }} />
            <Typography variant='body2' sx={{ flex: 1 }}>
              Haz crecer tu negocio sin anuncios y desbloquea herramientas
              avanzadas
            </Typography>
            <Button
              component={Link}
              href='/panel/plan'
              variant='contained'
              color='secondary'
              size='small'
              sx={{ flexShrink: 0 }}
            >
              Ver plan
            </Button>
          </Stack>
        )}

        <IconButton
          aria-label='Cerrar anuncio'
          onClick={() => setDescartado(true)}
          size='small'
          sx={{
            color: 'common.white',
            alignSelf: { xs: 'flex-end', sm: 'center' }
          }}
        >
          <CloseOutlinedIcon fontSize='small' />
        </IconButton>
      </Stack>
    </Box>
  )
}
