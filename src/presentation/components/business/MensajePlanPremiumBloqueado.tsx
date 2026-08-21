import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

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
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.paper',
          px: { xs: 3, sm: 4 },
          py: { xs: 4, sm: 5 }
        }}
      >
        <Stack spacing={2} maxWidth={480}>
          <Typography color='text.secondary'>
            Esta función forma parte del Plan Premium. Revisa los beneficios y
            solicita la activación desde la página de plan.
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Mientras tanto, sigue gestionando tus citas con el plan estándar.
          </Typography>
          {titulo !== 'Plan Premium' ? (
            <Button
              component={Link}
              href='/panel/plan'
              variant='outlined'
              color='primary'
              sx={{ alignSelf: 'flex-start' }}
            >
              Ver plan
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Stack>
  )
}
