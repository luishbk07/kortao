'use client'

import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { TELEFONO_SOPORTE_KORTAO } from '@/shared/utils/planes'

type EnlaceAyudaCrearCuentaProps = {
  telefonoSoporte?: string | null
  alinear?: 'left' | 'center'
}

const MENSAJE_AYUDA_CUENTA =
  'Hola, necesito ayuda para crear mi cuenta en Kortao.'

const construirEnlace = (telefonoSoporte: string): string => {
  const digitos = telefonoSoporte.replace(/\D/g, '')
  const mensaje = encodeURIComponent(MENSAJE_AYUDA_CUENTA)
  return `https://wa.me/${digitos}?text=${mensaje}`
}

export const EnlaceAyudaCrearCuenta = ({
  telefonoSoporte,
  alinear = 'center'
}: EnlaceAyudaCrearCuentaProps) => {
  const telefono = telefonoSoporte?.trim() || TELEFONO_SOPORTE_KORTAO
  const digitos = telefono.replace(/\D/g, '')

  if (!digitos) {
    return null
  }

  return (
    <Typography
      variant='body2'
      color='text.secondary'
      textAlign={alinear}
      sx={{ lineHeight: 1.5 }}
    >
      <Link
        href={construirEnlace(digitos)}
        target='_blank'
        rel='noopener noreferrer'
        color='primary'
        underline='hover'
        sx={{ fontWeight: 500 }}
      >
        ¿Necesitas ayuda para crear tu cuenta? Escríbenos por WhatsApp
      </Link>
    </Typography>
  )
}
