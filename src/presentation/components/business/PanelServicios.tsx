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
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { crearActualizarServicio } from '@/application/useCases/business/actualizarServicio'
import { crearAlternarServicioActivo } from '@/application/useCases/business/alternarServicioActivo'
import { crearCrearServicio } from '@/application/useCases/business/crearServicio'
import type { Servicio } from '@/domain/business/business.types'
import type { DescuentoTipo } from '@/domain/business/servicio.rules'
import {
  calcularPrecioFinal,
  tieneDescuentoActivo
} from '@/domain/business/servicio.rules'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'

type PanelServiciosProps = {
  negocioId: string
  serviciosIniciales: Servicio[]
}

type FormularioServicioEstado = {
  nombre: string
  duracionMinutos: string
  precio: string
  agregarPromocion: boolean
  descuentoTipo: DescuentoTipo
  descuentoValor: string
}

const formularioVacio: FormularioServicioEstado = {
  nombre: '',
  duracionMinutos: '30',
  precio: '0',
  agregarPromocion: false,
  descuentoTipo: 'monto',
  descuentoValor: ''
}

const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(precio)
}

const obtenerDescuentoGuardado = (
  formulario: FormularioServicioEstado
): {
  descuentoTipo: DescuentoTipo | null
  descuentoValor: number | null
} => {
  if (!formulario.agregarPromocion) {
    return { descuentoTipo: null, descuentoValor: null }
  }

  const descuentoValor = Number(formulario.descuentoValor)

  if (!Number.isFinite(descuentoValor) || descuentoValor <= 0) {
    return { descuentoTipo: null, descuentoValor: null }
  }

  return {
    descuentoTipo: formulario.descuentoTipo,
    descuentoValor
  }
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
    const conPromocion = tieneDescuentoActivo(
      servicio.descuentoTipo,
      servicio.descuentoValor
    )

    setEditando(servicio)
    setFormulario({
      nombre: servicio.nombre,
      duracionMinutos: String(servicio.duracionMinutos),
      precio: String(servicio.precio),
      agregarPromocion: conPromocion,
      descuentoTipo: servicio.descuentoTipo ?? 'monto',
      descuentoValor:
        servicio.descuentoValor !== null ? String(servicio.descuentoValor) : ''
    })
    setAbierto(true)
    setError(null)
  }

  const handleGuardar = async () => {
    const duracionMinutos = Number(formulario.duracionMinutos)
    const precio = Number(formulario.precio)
    const descuento = obtenerDescuentoGuardado(formulario)

    if (!formulario.nombre.trim() || duracionMinutos <= 0 || precio < 0) {
      setError('Revisa el nombre, la duración y el precio.')
      return
    }

    if (
      formulario.agregarPromocion &&
      (descuento.descuentoValor === null || descuento.descuentoValor <= 0)
    ) {
      setError('Indica un valor de promoción válido.')
      return
    }

    if (
      formulario.agregarPromocion &&
      formulario.descuentoTipo === 'porcentaje' &&
      (descuento.descuentoValor ?? 0) > 100
    ) {
      setError('El porcentaje de descuento no puede superar 100.')
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
          descuentoTipo: descuento.descuentoTipo,
          descuentoValor: descuento.descuentoValor,
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
          precio,
          descuentoTipo: descuento.descuentoTipo,
          descuentoValor: descuento.descuentoValor
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
          {servicios.map((servicio) => {
            const conDescuento = tieneDescuentoActivo(
              servicio.descuentoTipo,
              servicio.descuentoValor
            )
            const precioFinal = calcularPrecioFinal(
              servicio.precio,
              servicio.descuentoTipo,
              servicio.descuentoValor
            )

            return (
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
                        {conDescuento
                          ? `${formatearPrecio(servicio.precio)} → ${formatearPrecio(precioFinal)}`
                          : formatearPrecio(servicio.precio)}
                      </Typography>
                      {conDescuento ? (
                        <Typography variant='body2' color='secondary.main'>
                          Promoción activa
                        </Typography>
                      ) : null}
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
            )
          })}
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
            <FormControlLabel
              control={
                <Switch
                  checked={formulario.agregarPromocion}
                  onChange={(evento) =>
                    setFormulario((actual) => ({
                      ...actual,
                      agregarPromocion: evento.target.checked
                    }))
                  }
                  color='secondary'
                />
              }
              label='Agregar promoción'
            />
            {formulario.agregarPromocion ? (
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id='descuento-tipo-label'>
                    Tipo de descuento
                  </InputLabel>
                  <Select
                    labelId='descuento-tipo-label'
                    label='Tipo de descuento'
                    value={formulario.descuentoTipo}
                    onChange={(evento) =>
                      setFormulario((actual) => ({
                        ...actual,
                        descuentoTipo: evento.target.value as DescuentoTipo
                      }))
                    }
                  >
                    <MenuItem value='monto'>Monto fijo</MenuItem>
                    <MenuItem value='porcentaje'>Porcentaje</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label={
                    formulario.descuentoTipo === 'porcentaje'
                      ? 'Descuento (%)'
                      : 'Descuento (RD$)'
                  }
                  type='number'
                  value={formulario.descuentoValor}
                  onChange={(evento) =>
                    setFormulario((actual) => ({
                      ...actual,
                      descuentoValor: evento.target.value
                    }))
                  }
                  inputProps={{
                    min: 0,
                    step: formulario.descuentoTipo === 'porcentaje' ? 1 : 50,
                    max:
                      formulario.descuentoTipo === 'porcentaje'
                        ? 100
                        : undefined
                  }}
                  fullWidth
                  required
                />
              </Stack>
            ) : null}
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
