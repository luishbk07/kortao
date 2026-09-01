'use client'

import Box from '@mui/material/Box'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'
import { HeroLanding } from '@/presentation/components/auth/landing/HeroLanding'
import { SeccionProblema } from '@/presentation/components/auth/landing/SeccionProblema'
import { SeccionComoFunciona } from '@/presentation/components/auth/landing/SeccionComoFunciona'
import { SeccionCaracteristicas } from '@/presentation/components/auth/landing/SeccionCaracteristicas'
import { SeccionPlanesLanding } from '@/presentation/components/auth/landing/SeccionPlanesLanding'
import { SeccionCtaFinal } from '@/presentation/components/auth/landing/SeccionCtaFinal'
import { PieLanding } from '@/presentation/components/auth/landing/PieLanding'

type LandingKortaoProps = {
  telefonoSoporte?: string | null
}

export const LandingKortao = ({
  telefonoSoporte = null
}: LandingKortaoProps) => {
  return (
    <Box
      component='main'
      minHeight='100vh'
      sx={{
        bgcolor: 'background.default',
        backgroundImage: (tema) =>
          tema.palette.mode === 'dark'
            ? `radial-gradient(ellipse 90% 50% at 50% -8%, ${tema.palette.primary.dark}66 0%, transparent 55%),
               radial-gradient(ellipse 45% 35% at 100% 30%, ${tema.palette.secondary.main}14 0%, transparent 50%)`
            : `radial-gradient(ellipse 90% 45% at 50% -5%, ${tema.palette.primary.light}20 0%, transparent 55%),
               radial-gradient(ellipse 40% 30% at 100% 20%, ${tema.palette.secondary.main}12 0%, transparent 50%)`
      }}
    >
      <EncabezadoMarca anchoMaximo='md' />
      <HeroLanding telefonoSoporte={telefonoSoporte} />
      <SeccionProblema />
      <SeccionComoFunciona />
      <SeccionCaracteristicas />
      <SeccionPlanesLanding />
      <SeccionCtaFinal />
      <PieLanding telefonoSoporte={telefonoSoporte} />
    </Box>
  )
}
