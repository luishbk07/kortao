'use client'

import type { FormEvent } from 'react'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  esTelefonoCompleto,
  formatearTelefonoVisual,
  normalizarTelefonoValor
} from '@/shared/utils/telefono'

type FormularioClienteProps = {
  clienteNombre: string
  clienteTelefono: string
  enviando: boolean
  onCambiarNombre: (valor: string) => void
  onCambiarTelefono: (valor: string) => void
  onConfirmar: () => void
}

export const FormularioCliente = ({
  clienteNombre,
  clienteTelefono,
  enviando,
  onCambiarNombre,
  onCambiarTelefono,
  onConfirmar
}: FormularioClienteProps) => {
  const formularioValido =
    clienteNombre.trim().length > 1 && esTelefonoCompleto(clienteTelefono)

  const handleSubmit = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    onConfirmar()
  }

  const handleCambiarTelefono = (entrada: string) => {
    onCambiarTelefono(normalizarTelefonoValor(entrada))
  }

  return (
    <Stack spacing={2} component='form' onSubmit={handleSubmit}>
      <Stack direction='row' spacing={1} alignItems='center'>
        <PersonOutlineOutlinedIcon color='primary' />
        <Typography variant='h6' component='h2'>
          Tus datos
        </Typography>
      </Stack>
      <TextField
        label='Nombre'
        value={clienteNombre}
        onChange={(evento) => onCambiarNombre(evento.target.value)}
        autoComplete='name'
        fullWidth
        required
      />
      <TextField
        label='Teléfono'
        value={formatearTelefonoVisual(clienteTelefono)}
        onChange={(evento) => handleCambiarTelefono(evento.target.value)}
        placeholder='+1(809) 000-0000'
        autoComplete='tel'
        inputProps={{
          inputMode: 'tel',
          maxLength: 16
        }}
        fullWidth
        required
      />
      <Button
        type='submit'
        variant='contained'
        color='secondary'
        size='large'
        disabled={!formularioValido || enviando}
        fullWidth
      >
        {enviando ? 'Reservando...' : 'Confirmar reserva'}
      </Button>
    </Stack>
  )
}
