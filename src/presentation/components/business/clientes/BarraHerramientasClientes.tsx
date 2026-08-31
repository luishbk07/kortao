'use client'

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { OPCIONES_MIN_VISITAS } from './helpersClientes'

type BarraHerramientasClientesProps = {
  busqueda: string
  minVisitas: number
  puedeExportar: boolean
  onBusquedaChange: (valor: string) => void
  onMinVisitasChange: (valor: number) => void
  onVerTodos: () => void
  onExportar: () => void
}

export const BarraHerramientasClientes = ({
  busqueda,
  minVisitas,
  puedeExportar,
  onBusquedaChange,
  onMinVisitasChange,
  onVerTodos,
  onExportar
}: BarraHerramientasClientesProps) => {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', md: 'center' }}
      sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <TextField
        size='small'
        placeholder='Buscar cliente (nombre, teléfono o email)...'
        value={busqueda}
        onChange={(evento) => {
          onBusquedaChange(evento.target.value)
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon fontSize='small' color='action' />
            </InputAdornment>
          )
        }}
        sx={{
          flex: 1,
          minWidth: { xs: '100%', md: 260 },
          '& .MuiOutlinedInput-root': { borderRadius: 2 }
        }}
      />
      <TextField
        select
        size='small'
        value={minVisitas}
        onChange={(evento) => {
          onMinVisitasChange(Number(evento.target.value))
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <FilterListIcon fontSize='small' color='action' />
            </InputAdornment>
          )
        }}
        sx={{
          minWidth: { xs: '100%', md: 180 },
          '& .MuiOutlinedInput-root': { borderRadius: 2 }
        }}
      >
        {OPCIONES_MIN_VISITAS.map((opcion) => (
          <MenuItem key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </MenuItem>
        ))}
      </TextField>
      <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
        <Button
          variant='outlined'
          color='inherit'
          sx={{ borderRadius: 2 }}
          onClick={onVerTodos}
        >
          Ver todos los clientes
        </Button>
        <Button
          variant='contained'
          color='primary'
          startIcon={<FileDownloadOutlinedIcon />}
          sx={{ borderRadius: 2 }}
          disabled={!puedeExportar}
          onClick={onExportar}
        >
          Exportar lista
        </Button>
      </Stack>
    </Stack>
  )
}
