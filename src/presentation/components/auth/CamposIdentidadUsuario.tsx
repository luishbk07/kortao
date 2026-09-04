'use client'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import type {
  DatosIdentidadUsuario,
  TipoDocumentoUsuario
} from '@/domain/business/identidadUsuario.types'
import { normalizarNumeroDocumento } from '@/domain/business/identidadUsuario.types'
import {
  formatearTelefonoVisual,
  normalizarTelefonoValor
} from '@/shared/utils/telefono'

type CamposIdentidadUsuarioProps = {
  valor: DatosIdentidadUsuario
  onChange: (valor: DatosIdentidadUsuario) => void
  etiquetaNombre?: string
  etiquetaTelefono?: string
}

export const CamposIdentidadUsuario = ({
  valor,
  onChange,
  etiquetaNombre = 'Nombre completo',
  etiquetaTelefono = 'Teléfono'
}: CamposIdentidadUsuarioProps) => {
  return (
    <Stack spacing={2}>
      <TextField
        label={etiquetaNombre}
        value={valor.nombre}
        onChange={(evento) =>
          onChange({ ...valor, nombre: evento.target.value })
        }
        fullWidth
        required
      />
      <FormControl fullWidth required>
        <InputLabel id='tipo-documento-label'>Tipo de documento</InputLabel>
        <Select
          labelId='tipo-documento-label'
          label='Tipo de documento'
          value={valor.tipoDocumento}
          onChange={(evento) =>
            onChange({
              ...valor,
              tipoDocumento: evento.target.value as TipoDocumentoUsuario,
              numeroDocumento: ''
            })
          }
        >
          <MenuItem value='cedula'>Cédula</MenuItem>
          <MenuItem value='rnc'>RNC</MenuItem>
          <MenuItem value='pasaporte'>Pasaporte</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label={
          valor.tipoDocumento === 'rnc'
            ? 'Número de RNC'
            : valor.tipoDocumento === 'pasaporte'
              ? 'Número de pasaporte'
              : 'Número de cédula'
        }
        value={valor.numeroDocumento}
        onChange={(evento) =>
          onChange({
            ...valor,
            numeroDocumento: normalizarNumeroDocumento(
              evento.target.value,
              valor.tipoDocumento
            )
          })
        }
        inputProps={{
          inputMode: valor.tipoDocumento === 'pasaporte' ? 'text' : 'numeric',
          maxLength: valor.tipoDocumento === 'pasaporte' ? 20 : 11
        }}
        helperText={
          valor.tipoDocumento === 'rnc'
            ? '9 u 11 dígitos'
            : valor.tipoDocumento === 'pasaporte'
              ? '6 a 20 caracteres (letras y números)'
              : '11 dígitos'
        }
        fullWidth
        required
      />
      <TextField
        label={etiquetaTelefono}
        value={formatearTelefonoVisual(valor.telefono)}
        onChange={(evento) =>
          onChange({
            ...valor,
            telefono: normalizarTelefonoValor(evento.target.value)
          })
        }
        placeholder='+1(809) 000-0000'
        inputProps={{ inputMode: 'tel', maxLength: 16 }}
        fullWidth
        required
      />
    </Stack>
  )
}
