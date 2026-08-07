'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import { crearActualizarServicio } from '@/application/useCases/business/actualizarServicio'
import { crearAlternarServicioActivo } from '@/application/useCases/business/alternarServicioActivo'
import { crearCrearServicio } from '@/application/useCases/business/crearServicio'
import type { Servicio } from '@/domain/business/business.types'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'

type PanelServiciosProps = {
  negocioId: string
  serviciosIniciales: Servicio[]
}

type FormularioServicioEstado = {
  nombre: string
  duracionMinutos: string
  precio: string
}

const formularioVacio: FormularioServicioEstado = {
  nombre: '',
  duracionMinutos: '30',
  precio: '0'
}

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(precio)
}

export const PanelServicios = ({
  negocioId,
  serviciosIniciales
}: PanelServiciosProps) => {
  const router = useRouter()
  const [servicios, setServicios] = useState(serviciosIniciales)
  const [abierto, setAbierto] = useState(false)
  const [editando, setEditando] = useState<Servicio | null>(null)
  const [formulario, setFormulario] = useState(formularioVacio)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abrirCrear = () => {
    setEditando(null)
    setFormulario(formularioVacio)
    setAbierto(true)
    setError(null)
  }

  const abrirEditar = (servicio: Servicio) => {
    setEditando(servicio)
    setFormulario({
      nombre: servicio.nombre,
      duracionMinutos: String(servicio.duracionMinutos),
      precio: String(servicio.precio)
    })
    setAbierto(true)
    setError(null)
  }

  const handleGuardar = async () => {
    const duracionMinutos = Number(formulario.duracionMinutos)
    const precio = Number(formulario.precio)

    if (!formulario.nombre.trim() || duracionMinutos <= 0 || precio < 0) {
      setError('Revisa el nombre, la duración y el precio.')
      return
    }

    setGuardando(true)
    setError(null)

    try {
      const { businessRepository } = crearDependenciasPanelNavegador()

      if (editando) {
        const actualizarServicio = crearActualizarServicio(businessRepository)
        const actualizado = await actualizarServicio(editando.id, {
          nombre: formulario.nombre,
          duracionMinutos,
          precio,
          activo: editando.activo
        })
        setServicios((actuales) =>
          actuales.map((servicio) =>
            servicio.id === actualizado.id ? actualizado : servicio
          )
        )
      } else {
        const crearServicio = crearCrearServicio(businessRepository)
        const creado = await crearServicio({
          negocioId,
          nombre: formulario.nombre,
          duracionMinutos,
          precio
        })
        setServicios((actuales) => [...actuales, creado])
      }

      setAbierto(false)
      router.refresh()
    } catch {
      setError('No se pudo guardar el servicio. Inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const handleAlternarActivo = async (servicio: Servicio) => {
    setError(null)

    try {
      const { businessRepository } = crearDependenciasPanelNavegador()
      const alternar = crearAlternarServicioActivo(businessRepository)
      const actualizado = await alternar(servicio)
      setServicios((actuales) =>
        actuales.map((item) =>
          item.id === actualizado.id ? actualizado : item
        )
      )
      router.refresh()
    } catch {
      setError('No se pudo actualizar el estado del servicio.')
    }
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        spacing={2}
      >
        <Typography variant='h5' component='h1' color='primary'>
          Servicios
        </Typography>
        <Button
          variant='contained'
          color='secondary'
          startIcon={<AddOutlinedIcon />}
          onClick={abrirCrear}
        >
          Nuevo
        </Button>
      </Stack>

      {error ? (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {servicios.length === 0 ? (
        <Typography color='text.secondary'>
          Aún no tienes servicios. Crea el primero.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {servicios.map((servicio) => (
            <Card key={servicio.id} variant='outlined'>
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent='space-between'
                  spacing={1.5}
                >
                  <Stack spacing={0.5}>
                    <Typography variant='h6' component='h2'>
                      {servicio.nombre}
                    </Typography>
                    <Typography color='text.secondary'>
                      {servicio.duracionMinutos} min ·{' '}
                      {formatearPrecio(servicio.precio)}
                    </Typography>
                  </Stack>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={servicio.activo}
                          onChange={() => {
                            void handleAlternarActivo(servicio)
                          }}
                          color='secondary'
                        />
                      }
                      label={servicio.activo ? 'Activo' : 'Inactivo'}
                    />
                    <Button
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => abrirEditar(servicio)}
                    >
                      Editar
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog
        open={abierto}
        onClose={() => setAbierto(false)}
        fullWidth
        maxWidth='xs'
      >
        <DialogTitle>
          {editando ? 'Editar servicio' : 'Nuevo servicio'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label='Nombre'
              value={formulario.nombre}
              onChange={(evento) =>
                setFormulario((actual) => ({
                  ...actual,
                  nombre: evento.target.value
                }))
              }
              fullWidth
              required
            />
            <TextField
              label='Duración (minutos)'
              type='number'
              value={formulario.duracionMinutos}
              onChange={(evento) =>
                setFormulario((actual) => ({
                  ...actual,
                  duracionMinutos: evento.target.value
                }))
              }
              inputProps={{ min: 5, step: 5 }}
              fullWidth
              required
            />
            <TextField
              label='Precio (RD$)'
              type='number'
              value={formulario.precio}
              onChange={(evento) =>
                setFormulario((actual) => ({
                  ...actual,
                  precio: evento.target.value
                }))
              }
              inputProps={{ min: 0, step: 50 }}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAbierto(false)}>Cancelar</Button>
          <Button
            variant='contained'
            color='secondary'
            disabled={guardando}
            onClick={() => {
              void handleGuardar()
            }}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
