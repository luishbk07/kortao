'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  actualizarAfiliadoAction,
  actualizarAfiliadoActivoAction,
  crearAfiliadoAction,
  eliminarAfiliadoAction
} from '@/app/admin/actions'
import type { AfiliadoConMetricas } from '@/domain/admin/afiliado.types'
import {
  codigoAfiliadoEstaOcupado,
  normalizarCodigoAfiliado,
  sugerirCodigoAfiliado
} from '@/shared/utils/afiliado'

type PanelAfiliadosAdminProps = {
  afiliadosIniciales: AfiliadoConMetricas[]
}

type AfiliadoFilaVista = {
  id: string
  nombre: string
  codigo: string
  activo: boolean
  negociosReferidos: number
  negociosPremium: number
}

const mapearIniciales = (
  afiliados: AfiliadoConMetricas[]
): AfiliadoFilaVista[] => {
  return afiliados.map((afiliado) => ({
    id: afiliado.id,
    nombre: afiliado.nombre,
    codigo: afiliado.codigo,
    activo: afiliado.activo,
    negociosReferidos: afiliado.negociosReferidos,
    negociosPremium: afiliado.negociosPremium
  }))
}

export const PanelAfiliadosAdmin = ({
  afiliadosIniciales
}: PanelAfiliadosAdminProps) => {
  const [afiliados, setAfiliados] = useState(() =>
    mapearIniciales(afiliadosIniciales)
  )
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [codigoEditadoManual, setCodigoEditadoManual] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [actualizandoId, setActualizandoId] = useState<string | null>(null)

  const [editando, setEditando] = useState<AfiliadoFilaVista | null>(null)
  const [nombreEdicion, setNombreEdicion] = useState('')
  const [codigoEdicion, setCodigoEdicion] = useState('')
  const [codigoEdicionManual, setCodigoEdicionManual] = useState(false)
  const [errorCodigoEdicion, setErrorCodigoEdicion] = useState<string | null>(
    null
  )
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)

  const [eliminando, setEliminando] = useState<AfiliadoFilaVista | null>(null)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)

  const codigosExistentes = useMemo(
    () => afiliados.map((afiliado) => afiliado.codigo),
    [afiliados]
  )

  useEffect(() => {
    setAfiliados(mapearIniciales(afiliadosIniciales))
  }, [afiliadosIniciales])

  const validarCodigoNuevo = (valor: string): string | null => {
    const normalizado = normalizarCodigoAfiliado(valor)

    if (normalizado.length === 0) {
      return 'El código no puede estar vacío'
    }

    if (codigoAfiliadoEstaOcupado(normalizado, codigosExistentes)) {
      return 'Ese código de afiliado ya existe'
    }

    return null
  }

  const validarCodigoEdicion = (
    valor: string,
    codigoActual: string
  ): string | null => {
    const normalizado = normalizarCodigoAfiliado(valor)

    if (normalizado.length === 0) {
      return 'El código no puede estar vacío'
    }

    if (
      codigoAfiliadoEstaOcupado(normalizado, codigosExistentes, codigoActual)
    ) {
      return 'Ese código de afiliado ya existe'
    }

    return null
  }

  const handleNombreChange = (valor: string) => {
    setNombre(valor)

    if (!codigoEditadoManual) {
      const sugerido = sugerirCodigoAfiliado(valor, codigosExistentes)
      setCodigo(sugerido)
      setErrorCodigo(validarCodigoNuevo(sugerido))
    }
  }

  const handleCodigoChange = (valor: string) => {
    setCodigoEditadoManual(true)
    const normalizado = normalizarCodigoAfiliado(valor)
    setCodigo(normalizado)
    setErrorCodigo(validarCodigoNuevo(normalizado))
  }

  const handleCrear = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setError(null)
    setExito(null)

    const errorValidacion = validarCodigoNuevo(codigo)

    if (errorValidacion) {
      setErrorCodigo(errorValidacion)
      return
    }

    setEnviando(true)

    try {
      const creado = await crearAfiliadoAction(nombre, codigo)
      setAfiliados((actuales) => [
        {
          id: creado.id,
          nombre: creado.nombre,
          codigo: creado.codigo,
          activo: creado.activo,
          negociosReferidos: 0,
          negociosPremium: 0
        },
        ...actuales
      ])
      setNombre('')
      setCodigo('')
      setCodigoEditadoManual(false)
      setErrorCodigo(null)
      setExito('Afiliado creado correctamente.')
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : 'No se pudo crear el afiliado. Inténtalo de nuevo.'

      if (mensaje.toLowerCase().includes('ya existe')) {
        setErrorCodigo(mensaje)
      } else {
        setError(mensaje)
      }
    } finally {
      setEnviando(false)
    }
  }

  const handleCambiarActivo = async (
    afiliadoId: string,
    activo: boolean
  ) => {
    setError(null)
    setExito(null)
    setActualizandoId(afiliadoId)

    const anteriores = afiliados
    setAfiliados((actuales) =>
      actuales.map((afiliado) =>
        afiliado.id === afiliadoId ? { ...afiliado, activo } : afiliado
      )
    )

    try {
      await actualizarAfiliadoActivoAction(afiliadoId, activo)
    } catch {
      setAfiliados(anteriores)
      setError('No se pudo actualizar el estado del afiliado.')
    } finally {
      setActualizandoId(null)
    }
  }

  const abrirEdicion = (afiliado: AfiliadoFilaVista) => {
    setEditando(afiliado)
    setNombreEdicion(afiliado.nombre)
    setCodigoEdicion(afiliado.codigo)
    setCodigoEdicionManual(false)
    setErrorCodigoEdicion(null)
    setError(null)
    setExito(null)
  }

  const cerrarEdicion = () => {
    if (guardandoEdicion) {
      return
    }

    setEditando(null)
    setErrorCodigoEdicion(null)
  }

  const handleNombreEdicionChange = (valor: string) => {
    setNombreEdicion(valor)

    if (!codigoEdicionManual && editando) {
      const sugerido = sugerirCodigoAfiliado(
        valor,
        codigosExistentes,
        editando.codigo
      )
      setCodigoEdicion(sugerido)
      setErrorCodigoEdicion(validarCodigoEdicion(sugerido, editando.codigo))
    }
  }

  const handleCodigoEdicionChange = (valor: string) => {
    if (!editando) {
      return
    }

    setCodigoEdicionManual(true)
    const normalizado = normalizarCodigoAfiliado(valor)
    setCodigoEdicion(normalizado)
    setErrorCodigoEdicion(validarCodigoEdicion(normalizado, editando.codigo))
  }

  const handleGuardarEdicion = async () => {
    if (!editando) {
      return
    }

    const errorValidacion = validarCodigoEdicion(
      codigoEdicion,
      editando.codigo
    )

    if (errorValidacion) {
      setErrorCodigoEdicion(errorValidacion)
      return
    }

    setGuardandoEdicion(true)
    setError(null)

    try {
      const actualizado = await actualizarAfiliadoAction(
        editando.id,
        nombreEdicion,
        codigoEdicion
      )

      setAfiliados((actuales) =>
        actuales.map((afiliado) =>
          afiliado.id === editando.id
            ? {
                ...afiliado,
                nombre: actualizado.nombre,
                codigo: actualizado.codigo
              }
            : afiliado
        )
      )
      setEditando(null)
      setExito('Afiliado actualizado correctamente.')
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el afiliado.'

      if (mensaje.toLowerCase().includes('ya existe')) {
        setErrorCodigoEdicion(mensaje)
      } else {
        setError(mensaje)
        setEditando(null)
      }
    } finally {
      setGuardandoEdicion(false)
    }
  }

  const handleEliminar = async () => {
    if (!eliminando) {
      return
    }

    setConfirmandoEliminar(true)
    setError(null)

    try {
      await eliminarAfiliadoAction(eliminando.id)
      setAfiliados((actuales) =>
        actuales.filter((afiliado) => afiliado.id !== eliminando.id)
      )
      setEliminando(null)
      setExito('Afiliado eliminado correctamente.')
    } catch {
      setError('No se pudo eliminar el afiliado. Inténtalo de nuevo.')
      setEliminando(null)
    } finally {
      setConfirmandoEliminar(false)
    }
  }

  const puedeCrear =
    !enviando &&
    nombre.trim().length > 0 &&
    codigo.length > 0 &&
    errorCodigo === null

  const puedeGuardarEdicion =
    !guardandoEdicion &&
    nombreEdicion.trim().length > 0 &&
    codigoEdicion.length > 0 &&
    errorCodigoEdicion === null

  return (
    <Stack spacing={3}>
      {error ? (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}
      {exito ? (
        <Alert severity='success' onClose={() => setExito(null)}>
          {exito}
        </Alert>
      ) : null}

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.paper',
          px: { xs: 2, sm: 3 },
          py: { xs: 2.5, sm: 3 }
        }}
      >
        <Stack
          component='form'
          spacing={2}
          onSubmit={(evento) => {
            void handleCrear(evento)
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant='h6' component='h2' fontWeight={700}>
              Nuevo afiliado
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Crea un código para que los negocios lo usen al registrarse.
            </Typography>
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ sm: 'flex-start' }}
          >
            <TextField
              label='Nombre'
              value={nombre}
              onChange={(evento) => handleNombreChange(evento.target.value)}
              fullWidth
              required
            />
            <TextField
              label='Código'
              value={codigo}
              onChange={(evento) => handleCodigoChange(evento.target.value)}
              error={Boolean(errorCodigo)}
              helperText={
                errorCodigo ??
                'Se sugiere desde el nombre; si ya existe, se agrega un número.'
              }
              fullWidth
              required
            />
            <Button
              type='submit'
              variant='contained'
              color='secondary'
              startIcon={<PersonAddAltOutlinedIcon />}
              disabled={!puedeCrear}
              sx={{ flexShrink: 0, mt: { sm: 0.5 } }}
            >
              {enviando ? 'Creando...' : 'Crear'}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {afiliados.length === 0 ? (
        <Typography color='text.secondary'>
          Aún no hay afiliados registrados.
        </Typography>
      ) : (
        <TableContainer
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'background.paper'
          }}
        >
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Código</TableCell>
                <TableCell align='right'>Negocios</TableCell>
                <TableCell align='right'>Premium</TableCell>
                <TableCell align='center'>Activo</TableCell>
                <TableCell align='right'>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {afiliados.map((afiliado) => (
                <TableRow key={afiliado.id} hover>
                  <TableCell>{afiliado.nombre}</TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      label={afiliado.codigo}
                      variant='outlined'
                      color='primary'
                    />
                  </TableCell>
                  <TableCell align='right'>
                    {afiliado.negociosReferidos}
                  </TableCell>
                  <TableCell align='right'>
                    {afiliado.negociosPremium}
                  </TableCell>
                  <TableCell align='center'>
                    <Switch
                      checked={afiliado.activo}
                      color='secondary'
                      disabled={actualizandoId === afiliado.id}
                      onChange={(evento) => {
                        void handleCambiarActivo(
                          afiliado.id,
                          evento.target.checked
                        )
                      }}
                      inputProps={{
                        'aria-label': `Estado de ${afiliado.nombre}`
                      }}
                    />
                  </TableCell>
                  <TableCell align='right'>
                    <Stack
                      direction='row'
                      spacing={0.5}
                      justifyContent='flex-end'
                    >
                      <IconButton
                        size='small'
                        color='primary'
                        aria-label={`Editar ${afiliado.nombre}`}
                        onClick={() => abrirEdicion(afiliado)}
                      >
                        <EditOutlinedIcon fontSize='small' />
                      </IconButton>
                      <IconButton
                        size='small'
                        color='error'
                        aria-label={`Eliminar ${afiliado.nombre}`}
                        onClick={() => setEliminando(afiliado)}
                      >
                        <DeleteOutlineOutlinedIcon fontSize='small' />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={editando !== null} onClose={cerrarEdicion} fullWidth maxWidth='sm'>
        <DialogTitle>Editar afiliado</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label='Nombre'
              value={nombreEdicion}
              onChange={(evento) =>
                handleNombreEdicionChange(evento.target.value)
              }
              fullWidth
              required
            />
            <TextField
              label='Código'
              value={codigoEdicion}
              onChange={(evento) =>
                handleCodigoEdicionChange(evento.target.value)
              }
              error={Boolean(errorCodigoEdicion)}
              helperText={
                errorCodigoEdicion ??
                'Si el código ya existe, elige otro o deja que se numere solo.'
              }
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrarEdicion} disabled={guardandoEdicion}>
            Cancelar
          </Button>
          <Button
            variant='contained'
            color='secondary'
            disabled={!puedeGuardarEdicion}
            onClick={() => {
              void handleGuardarEdicion()
            }}
          >
            {guardandoEdicion ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={eliminando !== null}
        onClose={() => {
          if (!confirmandoEliminar) {
            setEliminando(null)
          }
        }}
      >
        <DialogTitle>Eliminar afiliado</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {eliminando
              ? `¿Seguro que quieres eliminar a ${eliminando.nombre} (${eliminando.codigo})? Los negocios referidos quedarán sin afiliado.`
              : null}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setEliminando(null)}
            disabled={confirmandoEliminar}
          >
            Cancelar
          </Button>
          <Button
            color='error'
            variant='contained'
            disabled={confirmandoEliminar}
            onClick={() => {
              void handleEliminar()
            }}
          >
            {confirmandoEliminar ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
