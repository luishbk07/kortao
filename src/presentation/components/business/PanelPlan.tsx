import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  calcularMontoCiclo,
  construirEnlaceWhatsappSoporte,
  esPlanPremium,
  formatearPrecioMensual,
  LIMITE_CITAS_PLAN_GRATIS,
  PRECIO_LISTA_PLAN_PREMIUM,
  TELEFONO_SOPORTE_KORTAO,
  type CicloFacturacion
} from '@/shared/utils/planes'
import {
  calcularProximaFechaPago,
  formatearMontoRd
} from '@/shared/utils/suscripcion'
import { formatearFechaLegible } from '@/shared/utils/fechas'

type PanelPlanProps = {
  nombreNegocio: string
  plan: string
  precioMensual: number | null
  cicloFacturacion: CicloFacturacion
  fechaInicioSuscripcion: Date | null
  fechaUltimoPago?: Date | null
  telefonoSoporte?: string | null
}

type FilaComparacion = {
  etiqueta: string
  disponible: boolean
  destacado?: boolean
}

const FILAS_ESTANDAR: FilaComparacion[] = [
  { etiqueta: 'Confirmación por WhatsApp y email', disponible: true },
  {
    etiqueta: `Hasta ${LIMITE_CITAS_PLAN_GRATIS} citas en total`,
    disponible: true
  },
  { etiqueta: 'Anuncios en el panel', disponible: true },
  { etiqueta: 'Clientes recurrentes', disponible: false },
  { etiqueta: 'Reportes extendidos', disponible: false },
  { etiqueta: 'Crear tus propias citas', disponible: false },
  { etiqueta: 'Código QR para tu negocio', disponible: false },
  { etiqueta: 'Personalización de color', disponible: false }
]

const FILAS_PREMIUM: FilaComparacion[] = [
  { etiqueta: 'Confirmación por WhatsApp y email', disponible: true },
  {
    etiqueta: 'Citas ilimitadas',
    disponible: true,
    destacado: true
  },
  { etiqueta: 'Sin anuncios en el panel', disponible: true },
  { etiqueta: 'Clientes recurrentes', disponible: true },
  { etiqueta: 'Reportes extendidos', disponible: true },
  { etiqueta: 'Crear tus propias citas', disponible: true },
  { etiqueta: 'Código QR para tu negocio', disponible: true },
  { etiqueta: 'Personalización de color', disponible: true }
]

const ListaComparacion = ({ filas }: { filas: FilaComparacion[] }) => {
  return (
    <List dense disablePadding>
      {filas.map((fila) => (
        <ListItem key={fila.etiqueta} disableGutters sx={{ py: 0.5 }}>
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: fila.disponible ? 'success.main' : 'text.disabled'
            }}
          >
            {fila.disponible ? (
              <CheckCircleOutlineIcon fontSize='small' />
            ) : (
              <CloseOutlinedIcon fontSize='small' />
            )}
          </ListItemIcon>
          <ListItemText
            primary={fila.etiqueta}
            primaryTypographyProps={{
              color: fila.disponible ? 'text.primary' : 'text.disabled',
              fontWeight: fila.destacado ? 700 : 400
            }}
          />
        </ListItem>
      ))}
    </List>
  )
}

const TarjetaPlan = ({
  titulo,
  precio,
  filas,
  destacado,
  chipActual
}: {
  titulo: string
  precio: string
  filas: FilaComparacion[]
  destacado?: boolean
  chipActual?: boolean
}) => {
  return (
    <Box
      sx={{
        flex: '1 1 260px',
        minWidth: 0,
        border: '1px solid',
        borderColor: destacado ? 'primary.main' : 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        px: { xs: 2.5, sm: 3 },
        py: { xs: 2.5, sm: 3 },
        boxShadow: destacado ? '0 0 0 1px rgba(31, 75, 63, 0.12)' : 'none'
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          spacing={1}
        >
          <Typography variant='h6' component='h2' fontWeight={700}>
            {titulo}
          </Typography>
          {chipActual ? (
            <Chip size='small' color='primary' label='Actual' />
          ) : null}
        </Stack>
        <Typography
          variant={destacado ? 'h5' : 'subtitle1'}
          color={destacado ? 'primary' : 'text.secondary'}
          fontWeight={700}
        >
          {precio}
        </Typography>
        <ListaComparacion filas={filas} />
      </Stack>
    </Box>
  )
}

export const PanelPlan = ({
  nombreNegocio,
  plan,
  precioMensual,
  cicloFacturacion,
  fechaInicioSuscripcion,
  fechaUltimoPago = null,
  telefonoSoporte
}: PanelPlanProps) => {
  const esPremium = esPlanPremium(plan)
  const precioLista = formatearPrecioMensual(PRECIO_LISTA_PLAN_PREMIUM)
  const precioBase = precioMensual ?? PRECIO_LISTA_PLAN_PREMIUM
  const montoCiclo = calcularMontoCiclo(precioBase, cicloFacturacion)
  const precioPremiumActual =
    cicloFacturacion === 'anual'
      ? `${formatearMontoRd(montoCiclo)}/año`
      : formatearPrecioMensual(precioBase)

  const proximaPago =
    esPremium && fechaInicioSuscripcion
      ? calcularProximaFechaPago(
          fechaInicioSuscripcion,
          cicloFacturacion,
          new Date(),
          fechaUltimoPago
        )
      : null

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
            : 'Compara los planes y elige el que mejor se adapte a tu negocio.'}
        </Typography>
      </Stack>

      {esPremium ? (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'background.paper',
            px: { xs: 3, sm: 4 },
            py: { xs: 2.5, sm: 3 }
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant='h6' component='h2' fontWeight={700}>
              Tu plan actual: Premium
            </Typography>
            <Typography color='text.secondary'>
              {precioPremiumActual}
              {cicloFacturacion === 'anual' ? ' (facturación anual)' : ''}
            </Typography>
            {proximaPago ? (
              <Typography color='text.secondary' sx={{ pt: 0.5 }}>
                {cicloFacturacion === 'anual'
                  ? 'Próximo pago anual'
                  : 'Próximo pago mensual'}
                {': '}
                {formatearFechaLegible(proximaPago, true)}
                {' · '}
                {formatearMontoRd(montoCiclo)}
              </Typography>
            ) : null}
          </Stack>
        </Box>
      ) : null}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems='stretch'
      >
        <TarjetaPlan
          titulo='Estándar'
          precio='Gratis'
          filas={FILAS_ESTANDAR}
          chipActual={!esPremium}
        />
        <TarjetaPlan
          titulo='Premium'
          precio={esPremium ? precioPremiumActual : precioLista}
          filas={FILAS_PREMIUM}
          destacado
          chipActual={esPremium}
        />
      </Stack>

      {!esPremium ? (
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
          <Stack spacing={2} maxWidth={520}>
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
                Los primeros 10 negocios en actualizar pagan solo RD${(PRECIO_LISTA_PLAN_PREMIUM / 2) - 1}/mes de
                por vida
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
          </Stack>
        </Box>
      ) : null}
    </Stack>
  )
}
