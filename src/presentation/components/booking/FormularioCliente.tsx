'use client'

import type { FormEvent } from 'react'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { esCorreoValido } from '@/shared/utils/correo'
import {
  esTelefonoCompleto,
  formatearTelefonoVisual,
  normalizarTelefonoValor
} from '@/shared/utils/telefono'

type FormularioClienteProps = {
  clienteNombre: string
  clienteTelefono: string
  clienteCorreo: string
  enviando: boolean
  onCambiarNombre: (valor: string) => void
  onCambiarTelefono: (valor: string) => void
  onCambiarCorreo: (valor: string) => void
  onConfirmar: () => void
  titulo?: string
  textoBoton?: string
  textoBotonCargando?: string
  helperCorreo?: string
}

export const FormularioCliente = ({
  clienteNombre,
  clienteTelefono,
  clienteCorreo,
  enviando,
  onCambiarNombre,
  onCambiarTelefono,
  onCambiarCorreo,
  onConfirmar,
  titulo = 'Tus datos',
  textoBoton = 'Confirmar reserva',
  textoBotonCargando = 'Reservando...',
  helperCorreo = 'Opcional. Te enviamos la confirmación por correo.'
}: FormularioClienteProps) => {
  const correoTrim = clienteCorreo.trim()
  const correoOk = correoTrim.length === 0 || esCorreoValido(correoTrim)

  const formularioValido =
    clienteNombre.trim().length > 1 &&
    esTelefonoCompleto(clienteTelefono) &&
    correoOk

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
          {titulo}
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
      <TextField
        label='Correo electrónico'
        type='email'
        value={clienteCorreo}
        onChange={(evento) => onCambiarCorreo(evento.target.value)}
        autoComplete='email'
        helperText={helperCorreo}
        error={correoTrim.length > 0 && !correoOk}
        fullWidth
      />
      <Button
        type='submit'
        variant='contained'
        color='secondary'
        size='large'
        disabled={!formularioValido || enviando}
        fullWidth
      >
        {enviando ? textoBotonCargando : textoBoton}
      </Button>
    </Stack>
  )
}
