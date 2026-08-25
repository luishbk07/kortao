'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

const enlacesAdmin = [
  { href: '/admin', etiqueta: 'Negocios', esNegocios: true },
  { href: '/admin/soporte', etiqueta: 'Soporte', esNegocios: false }
]

export const NavegacionAdmin = () => {
  const pathname = usePathname()

  return (
    <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
      {enlacesAdmin.map((enlace) => {
        const activo = enlace.esNegocios
          ? pathname === '/admin' || pathname.startsWith('/admin/negocios')
          : pathname.startsWith(enlace.href)

        return (
          <Button
            key={enlace.href}
            component={Link}
            href={enlace.href}
            size='small'
            color={activo ? 'secondary' : 'primary'}
            variant={activo ? 'contained' : 'outlined'}
          >
            {enlace.etiqueta}
          </Button>
        )
      })}
    </Stack>
  )
}
