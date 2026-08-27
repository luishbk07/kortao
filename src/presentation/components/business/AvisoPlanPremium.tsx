import Link from 'next/link'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type AvisoPlanPremiumProps = {
  titulo?: string
  mensaje: string
}

export const AvisoPlanPremium = ({
  titulo,
  mensaje
}: AvisoPlanPremiumProps) => {
  return (
    <Box
      sx={{
        borderRadius: 3,
        bgcolor: 'primary.dark',
        color: 'common.white',
        px: 2.5,
        py: 2
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
      >
        <RocketLaunchOutlinedIcon sx={{ opacity: 0.9, flexShrink: 0 }} />
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          {titulo ? (
            <Typography variant='subtitle1' fontWeight={600}>
              {titulo}
            </Typography>
          ) : null}
          <Typography variant='body2' sx={{ opacity: 0.9 }}>
            {mensaje}
          </Typography>
        </Stack>
        <Button
          component={Link}
          href='/panel/plan'
          variant='contained'
          color='secondary'
          size='small'
          sx={{ flexShrink: 0 }}
        >
          Ver planes
        </Button>
      </Stack>
    </Box>
  )
}
