import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AvisoPlanPremium } from './AvisoPlanPremium'

type MensajePlanPremiumBloqueadoProps = {
  titulo: string
}

export const MensajePlanPremiumBloqueado = ({
  titulo
}: MensajePlanPremiumBloqueadoProps) => {
  return (
    <Stack spacing={3}>
      <Typography variant='h5' component='h1' color='primary'>
        {titulo}
      </Typography>
      <AvisoPlanPremium
        mensaje='Esta función forma parte del Plan Premium. Revisa los beneficios y solicita la activación desde la página de planes.'
      />
    </Stack>
  )
}
