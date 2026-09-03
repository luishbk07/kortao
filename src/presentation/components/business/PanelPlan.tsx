import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TarjetaComparacionPlan } from '@/presentation/components/planes/TarjetaComparacionPlan'
import {
  FILAS_PLAN_ESTANDAR,
  FILAS_PLAN_PREMIUM
} from '@/presentation/components/planes/filasComparacionPlanes'
import {
  calcularMontoCiclo,
  construirEnlaceWhatsappSoporte,
  esPlanPagado,
  etiquetaPlanNegocio,
  formatearPrecioMensual,
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

export const PanelPlan = ({
  nombreNegocio,
  plan,
  precioMensual,
  cicloFacturacion,
  fechaInicioSuscripcion,
  fechaUltimoPago = null,
  telefonoSoporte
}: PanelPlanProps) => {
  const esPremium = esPlanPagado(plan)
  const etiquetaPlan = etiquetaPlanNegocio(plan)
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
            ? `Tu negocio ya tiene acceso a las herramientas del plan ${etiquetaPlan}.`
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
              Tu plan actual: {etiquetaPlan}
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
        <TarjetaComparacionPlan
          titulo='Estándar'
          precio='Gratis'
          filas={FILAS_PLAN_ESTANDAR}
          chipActual={!esPremium}
        />
        <TarjetaComparacionPlan
          titulo='Premium'
          precio={esPremium ? precioPremiumActual : precioLista}
          filas={FILAS_PLAN_PREMIUM}
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
                Los primeros 10 negocios en actualizar pagan solo RD$
                {PRECIO_LISTA_PLAN_PREMIUM / 2 - 1}/mes de por vida
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
