'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import { crearCerrarSesion } from '@/application/useCases/auth/cerrarSesion'
import { LogoKortao } from '@/presentation/components/ui/LogoKortao'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'

const enlaces = [
  {
    href: '/panel/citas',
    etiqueta: 'Citas',
    icono: CalendarMonthOutlinedIcon
  },
  {
    href: '/panel/clientes',
    etiqueta: 'Clientes',
    icono: PeopleOutlinedIcon
  },
  {
    href: '/panel/reportes',
    etiqueta: 'Reportes',
    icono: AssessmentOutlinedIcon
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
  },
  {
    href: '/panel/negocio',
    etiqueta: 'Negocio',
    icono: StorefrontOutlinedIcon
  }
]

export const NavegacionPanel = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    setMenuAbierto(false)
  }, [pathname])

  const handleCerrarSesion = async () => {
    const { authService } = crearDependenciasPanelNavegador()
    const cerrarSesion = crearCerrarSesion(authService)
    await cerrarSesion()
    router.replace('/login')
    router.refresh()
  }

  return (
    <>
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
        <Container maxWidth='lg'>
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 56, md: 64 },
              gap: { xs: 1, md: 2 },
              flexWrap: 'nowrap'
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <LogoKortao variant='horizontal' size={32} />
            </Box>

            <Stack
              direction='row'
              alignItems='center'
              justifyContent='center'
              spacing={0.25}
              sx={{
                display: { xs: 'none', md: 'flex' },
                flex: 1,
                minWidth: 0,
                flexWrap: 'nowrap'
              }}
            >
              {enlaces.map((enlace) => {
                const Icono = enlace.icono
                const activo = pathname.startsWith(enlace.href)

                return (
                  <Button
                    key={enlace.href}
                    component={Link}
                    href={enlace.href}
                    size='small'
                    startIcon={<Icono fontSize='small' />}
                    color={activo ? 'secondary' : 'primary'}
                    variant={activo ? 'contained' : 'text'}
                    sx={{
                      flexShrink: 0,
                      px: 1.25,
                      minWidth: 0,
                      whiteSpace: 'nowrap',
                      '& .MuiButton-startIcon': {
                        mr: 0.5
                      }
                    }}
                  >
                    {enlace.etiqueta}
                  </Button>
                )
              })}
            </Stack>

            <Button
              size='small'
              startIcon={<LogoutOutlinedIcon fontSize='small' />}
              color='primary'
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                flexShrink: 0,
                px: 1.25,
                whiteSpace: 'nowrap'
              }}
              onClick={() => {
                void handleCerrarSesion()
              }}
            >
              Salir
            </Button>

            <Box sx={{ flexGrow: 1, display: { xs: 'block', md: 'none' } }} />

            <IconButton
              color='primary'
              edge='end'
              aria-label='Abrir menú'
              onClick={() => setMenuAbierto(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            >
              <MenuOutlinedIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor='right'
        open={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        PaperProps={{
          sx: {
            width: 'min(100%, 300px)',
            bgcolor: 'background.paper'
          }
        }}
      >
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          px={2}
          py={1.5}
        >
          <LogoKortao variant='horizontal' size={32} />
          <IconButton
            color='primary'
            aria-label='Cerrar menú'
            onClick={() => setMenuAbierto(false)}
          >
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>
        <Divider />
        <List sx={{ px: 1, py: 1 }}>
          {enlaces.map((enlace) => {
            const Icono = enlace.icono
            const activo = pathname.startsWith(enlace.href)

            return (
              <ListItemButton
                key={enlace.href}
                component={Link}
                href={enlace.href}
                selected={activo}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'secondary.main',
                    color: 'secondary.contrastText',
                    '&:hover': {
                      bgcolor: 'secondary.main'
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'secondary.contrastText'
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                  <Icono />
                </ListItemIcon>
                <ListItemText primary={enlace.etiqueta} />
              </ListItemButton>
            )
          })}
        </List>
        <Divider />
        <Box px={1} py={1}>
          <ListItemButton
            onClick={() => {
              void handleCerrarSesion()
            }}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <LogoutOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary='Salir' />
          </ListItemButton>
        </Box>
      </Drawer>
    </>
  )
}
