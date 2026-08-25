'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useContadorReportesPendientes } from '@/presentation/lib/contadorReportesPendientes'

const enlacesAdmin = [
  { href: '/admin', etiqueta: 'Negocios', esNegocios: true },
  { href: '/admin/soporte', etiqueta: 'Soporte', esNegocios: false }
]

export const NavegacionAdmin = () => {
  const pathname = usePathname()
  const contador = useContadorReportesPendientes()
  const reportesPendientes = contador?.reportesPendientes ?? 0

  return (
    <Stack
      direction='row'
      spacing={1}
      flexWrap='wrap'
      useFlexGap
      alignItems='center'
      justifyContent='space-between'
    >
      <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
        {enlacesAdmin.map((enlace) => {
          const activo = enlace.esNegocios
            ? pathname === '/admin' || pathname.startsWith('/admin/negocios')
            : pathname.startsWith(enlace.href)
          const esSoporte = enlace.href === '/admin/soporte'

          return (
            <Button
              key={enlace.href}
              component={Link}
              href={enlace.href}
              size='small'
              color={activo ? 'secondary' : 'primary'}
              variant={activo ? 'contained' : 'outlined'}
            >
              {esSoporte ? (
                <Badge
                  badgeContent={reportesPendientes}
                  color='error'
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      position: 'relative',
                      transform: 'none',
                      ml: 1
                    }
                  }}
                >
                  {enlace.etiqueta}
                </Badge>
              ) : (
                enlace.etiqueta
              )}
            </Button>
          )
        })}
      </Stack>

      <Button
        component={Link}
        href='/'
        size='small'
        color='primary'
        variant='text'
        startIcon={<HomeOutlinedIcon fontSize='small' />}
      >
        Inicio
      </Button>
    </Stack>
  )
}
