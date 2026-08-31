'use client'

import { useEffect, useState, type MouseEvent } from 'react'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  listarNotificacionesAction,
  marcarNotificacionLeidaAction,
  marcarTodasNotificacionesLeidasAction,
  type NotificacionPanelDto
} from '@/app/(negocio)/panel/notificaciones/actions'
import { formatearTiempoRelativo } from '@/shared/utils/fechas'

type MenuNotificacionesPanelProps = {
  noLeidasInicial: number
}

export const MenuNotificacionesPanel = ({
  noLeidasInicial
}: MenuNotificacionesPanelProps) => {
  const [ancla, setAncla] = useState<HTMLElement | null>(null)
  const [noLeidas, setNoLeidas] = useState(noLeidasInicial)
  const [notificaciones, setNotificaciones] = useState<
    NotificacionPanelDto[]
  >([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [marcandoTodas, setMarcandoTodas] = useState(false)

  useEffect(() => {
    setNoLeidas(noLeidasInicial)
  }, [noLeidasInicial])

  const menuAbierto = ancla !== null

  const cargarNotificaciones = async () => {
    setCargando(true)
    setError(null)

    try {
      const listado = await listarNotificacionesAction()
      setNotificaciones(listado)
    } catch {
      setError('No se pudieron cargar las notificaciones')
    } finally {
      setCargando(false)
    }
  }

  const handleAbrir = (evento: MouseEvent<HTMLElement>) => {
    setAncla(evento.currentTarget)
    void cargarNotificaciones()
  }

  const handleCerrar = () => {
    setAncla(null)
  }

  const handleMarcarLeida = async (notificacion: NotificacionPanelDto) => {
    if (notificacion.leida) {
      return
    }

    setNotificaciones((actuales) =>
      actuales.map((item) =>
        item.id === notificacion.id ? { ...item, leida: true } : item
      )
    )
    setNoLeidas((actual) => Math.max(0, actual - 1))

    try {
      await marcarNotificacionLeidaAction(notificacion.id)
    } catch {
      setNotificaciones((actuales) =>
        actuales.map((item) =>
          item.id === notificacion.id ? { ...item, leida: false } : item
        )
      )
      setNoLeidas((actual) => actual + 1)
    }
  }

  const handleMarcarTodas = async () => {
    if (noLeidas === 0 || marcandoTodas) {
      return
    }

    setMarcandoTodas(true)
    const anteriores = notificaciones

    setNotificaciones((actuales) =>
      actuales.map((item) => ({ ...item, leida: true }))
    )
    setNoLeidas(0)

    try {
      await marcarTodasNotificacionesLeidasAction()
    } catch {
      setNotificaciones(anteriores)
      setNoLeidas(anteriores.filter((item) => !item.leida).length)
    } finally {
      setMarcandoTodas(false)
    }
  }

  return (
    <>
      <IconButton
        color='primary'
        aria-label='Notificaciones'
        aria-haspopup='true'
        aria-expanded={menuAbierto ? 'true' : undefined}
        onClick={handleAbrir}
      >
        <Badge
          badgeContent={noLeidas}
          color='error'
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.65rem',
              minWidth: 18,
              height: 18
            }
          }}
        >
          <NotificationsOutlinedIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={ancla}
        open={menuAbierto}
        onClose={handleCerrar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 'min(100vw - 24px, 360px)',
              maxHeight: 420,
              mt: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }
          }
        }}
      >
        <Box px={2} pt={1.5} pb={1}>
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            spacing={1}
          >
            <Typography variant='subtitle1' fontWeight={600}>
              Notificaciones
            </Typography>
            <Button
              size='small'
              color='secondary'
              disabled={noLeidas === 0 || marcandoTodas || cargando}
              onClick={() => {
                void handleMarcarTodas()
              }}
              sx={{ textTransform: 'none', flexShrink: 0 }}
            >
              Marcar todas como leídas
            </Button>
          </Stack>
        </Box>
        <Divider />

        {cargando ? (
          <Box display='flex' justifyContent='center' py={4}>
            <CircularProgress size={28} color='primary' />
          </Box>
        ) : null}

        {!cargando && error ? (
          <Box px={2} py={3}>
            <Typography variant='body2' color='text.secondary' textAlign='center'>
              {error}
            </Typography>
          </Box>
        ) : null}

        {!cargando && !error && notificaciones.length === 0 ? (
          <Box px={2} py={3}>
            <Typography variant='body2' color='text.secondary' textAlign='center'>
              No tienes notificaciones todavía.
            </Typography>
          </Box>
        ) : null}

        {!cargando &&
          !error &&
          notificaciones.map((notificacion) => (
            <MenuItem
              key={notificacion.id}
              onClick={() => {
                void handleMarcarLeida(notificacion)
              }}
              sx={{
                alignItems: 'flex-start',
                whiteSpace: 'normal',
                py: 1.5,
                px: 2,
                bgcolor: notificacion.leida
                  ? 'transparent'
                  : 'action.hover',
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-of-type': {
                  borderBottom: 'none'
                }
              }}
            >
              <Stack spacing={0.5} width='100%'>
                <Typography
                  variant='body2'
                  color='text.primary'
                  fontWeight={notificacion.leida ? 400 : 600}
                >
                  {notificacion.mensaje}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {formatearTiempoRelativo(new Date(notificacion.creadoEn))}
                </Typography>
              </Stack>
            </MenuItem>
          ))}
      </Menu>
    </>
  )
}
