'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { crearCerrarSesion } from '@/application/useCases/auth/cerrarSesion'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'

const enlaces = [
  {
    href: '/panel/citas',
    etiqueta: 'Citas',
    icono: CalendarMonthOutlinedIcon
  },
  {
    href: '/panel/servicios',
    etiqueta: 'Servicios',
    icono: ContentCutOutlinedIcon
  },
  {
    href: '/panel/horarios',
    etiqueta: 'Horarios',
    icono: ScheduleOutlinedIcon
  }
]

export const NavegacionPanel = () => {
  const pathname = usePathname()
  const router = useRouter()

  const handleCerrarSesion = async () => {
    const { authService } = crearDependenciasPanelNavegador()
    const cerrarSesion = crearCerrarSesion(authService)
    await cerrarSesion()
    router.replace('/login')
    router.refresh()
  }

  return (
    <AppBar
      position='sticky'
      color='transparent'
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Container maxWidth='md'>
        <Toolbar disableGutters sx={{ py: 1, gap: 1, flexWrap: 'wrap' }}>
          <Typography
            variant='h6'
            color='primary'
            sx={{ mr: { xs: 0, sm: 2 }, flexGrow: { xs: 1, sm: 0 } }}
          >
            Kortao
          </Typography>
          <Stack direction='row' spacing={0.5} flexWrap='wrap' useFlexGap>
            {enlaces.map((enlace) => {
              const Icono = enlace.icono
              const activo = pathname.startsWith(enlace.href)

              return (
                <Button
                  key={enlace.href}
                  component={Link}
                  href={enlace.href}
                  startIcon={<Icono />}
                  color={activo ? 'secondary' : 'primary'}
                  variant={activo ? 'contained' : 'text'}
                >
                  {enlace.etiqueta}
                </Button>
              )
            })}
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            startIcon={<LogoutOutlinedIcon />}
            color='primary'
            onClick={() => {
              void handleCerrarSesion()
            }}
          >
            Salir
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
