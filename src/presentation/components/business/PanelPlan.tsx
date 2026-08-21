import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  BENEFICIOS_PLAN_PREMIUM,
  construirEnlaceWhatsappSoporte,
  esPlanPremium,
  formatearPrecioMensual,
  PRECIO_LISTA_PLAN_PREMIUM,
  TELEFONO_SOPORTE_KORTAO
} from '@/shared/utils/planes'

type PanelPlanProps = {
  nombreNegocio: string
  plan: string
  precioMensual: number | null
  telefonoSoporte?: string | null
}

const ListaBeneficios = () => {
  return (
    <List dense disablePadding>
      {BENEFICIOS_PLAN_PREMIUM.map((beneficio) => (
        <ListItem key={beneficio} disableGutters sx={{ py: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
            <CheckCircleOutlineIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText primary={beneficio} />
        </ListItem>
      ))}
    </List>
  )
}

export const PanelPlan = ({
  nombreNegocio,
  plan,
  precioMensual,
  telefonoSoporte
}: PanelPlanProps) => {
  const esPremium = esPlanPremium(plan)
  const precioMostrado = esPremium
    ? formatearPrecioMensual(precioMensual ?? PRECIO_LISTA_PLAN_PREMIUM)
    : formatearPrecioMensual(PRECIO_LISTA_PLAN_PREMIUM)

  const enlaceWhatsapp = construirEnlaceWhatsappSoporte(
    telefonoSoporte?.trim() || TELEFONO_SOPORTE_KORTAO,
    nombreNegocio
  )

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant='h5' component='h1' color='primary'>
          Plan
        </Typography>
        <Typography color='text.secondary'>
          {esPremium
            ? 'Tu negocio ya tiene acceso a las herramientas Premium.'
            : 'Actualiza a Premium para crecer sin límites del plan gratuito.'}
        </Typography>
      </Stack>

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.paper',
          px: { xs: 3, sm: 4 },
          py: { xs: 3, sm: 4 }
        }}
      >
        <Stack spacing={2.5} maxWidth={520}>
          {esPremium ? (
            <>
              <Stack spacing={0.5}>
                <Typography variant='h6' component='h2' fontWeight={700}>
                  Tu plan actual: Premium
                </Typography>
                <Typography color='text.secondary'>{precioMostrado}</Typography>
              </Stack>
              <Typography variant='subtitle2' fontWeight={600}>
                Incluye
              </Typography>
              <ListaBeneficios />
            </>
          ) : (
            <>
              <Stack spacing={0.5}>
                <Typography variant='h6' component='h2' fontWeight={700}>
                  Plan Premium
                </Typography>
                <Typography variant='h5' color='primary' fontWeight={700}>
                  {precioMostrado}
                </Typography>
              </Stack>

              <Typography variant='subtitle2' fontWeight={600}>
                Beneficios
              </Typography>
              <ListaBeneficios />

              <Box
                sx={{
                  borderRadius: 2,
                  bgcolor: 'primary.dark',
                  color: 'common.white',
                  px: 2,
                  py: 1.5
                }}
              >
                <Typography variant='body2'>
                  Los primeros 10 negocios en actualizar pagan solo RD$500/mes
                  de por vida
                </Typography>
              </Box>

              <Button
                component='a'
                href={enlaceWhatsapp}
                target='_blank'
                rel='noopener noreferrer'
                variant='contained'
                color='secondary'
                startIcon={<WhatsAppIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                Solicitar activación
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}
