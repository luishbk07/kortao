'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { crearGuardarHorarios } from '@/application/useCases/business/guardarHorarios'
import { crearClienteNavegador } from '@/infrastructure/supabase/clienteNavegador'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'
import {
  esTelefonoCompleto,
  formatearTelefonoVisual,
  normalizarTelefonoValor
} from '@/shared/utils/telefono'
import { generarSlug } from '@/shared/utils/slug'
import { ConfiguradorHorarios } from './ConfiguradorHorarios'
import {
  SelectorUbicacion,
  type CoordenadasUbicacion
} from './SelectorUbicacion'

type OnboardingNegocioProps = {
  nombreNegocioInicial: string
  telefonoWhatsappInicial: string
  direccionInicial: string
}

export const OnboardingNegocio = ({
  nombreNegocioInicial,
  telefonoWhatsappInicial,
  direccionInicial
}: OnboardingNegocioProps) => {
  const router = useRouter()
  const [nombreNegocio, setNombreNegocio] = useState(nombreNegocioInicial)
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState(
    normalizarTelefonoValor(telefonoWhatsappInicial)
  )
  const [direccion, setDireccion] = useState(direccionInicial)
  const [ubicacion, setUbicacion] = useState<CoordenadasUbicacion | null>(null)
  const [error, setError] = useState<string | null>(null)

  const datosNegocioValidos =
    nombreNegocio.trim().length > 1 && esTelefonoCompleto(telefonoWhatsapp)

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant='h5' component='h1' color='primary'>
          Configura tu negocio
        </Typography>
        <Typography color='text.secondary'>
          Revisa los datos de tu negocio y define tus horarios de atención.
        </Typography>
      </Stack>

      {error ? (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Stack spacing={2}>
        <Typography variant='h6' component='h2'>
          Datos del negocio
        </Typography>
        <TextField
          label='Nombre del negocio'
          value={nombreNegocio}
          onChange={(evento) => setNombreNegocio(evento.target.value)}
          fullWidth
          required
        />
        <TextField
          label='Teléfono WhatsApp'
          value={formatearTelefonoVisual(telefonoWhatsapp)}
          onChange={(evento) =>
            setTelefonoWhatsapp(normalizarTelefonoValor(evento.target.value))
          }
          placeholder='+1(809) 000-0000'
          inputProps={{ inputMode: 'tel', maxLength: 16 }}
          fullWidth
          required
        />
        <TextField
          label='Dirección'
          value={direccion}
          onChange={(evento) => setDireccion(evento.target.value)}
          fullWidth
        />
        <SelectorUbicacion onChange={setUbicacion} />
      </Stack>

      <Stack spacing={1}>
        <Typography variant='h6' component='h2'>
          Horarios
        </Typography>
        <Typography color='text.secondary'>
          Indica qué días atiendes y en qué franjas.
        </Typography>
      </Stack>

      <ConfiguradorHorarios
        valorInicial={[]}
        etiquetaBoton='Finalizar y ir al panel'
        onSave={async (horarios) => {
          if (!datosNegocioValidos) {
            setError('Completa el nombre y el teléfono del negocio.')
            throw new Error('Datos del negocio incompletos')
          }

          setError(null)
          const supabase = crearClienteNavegador()

          const { data: negocioId, error: errorRpc } = await supabase.rpc(
            'registrar_negocio',
            {
              nombre_param: nombreNegocio.trim(),
              slug_param: generarSlug(nombreNegocio),
              telefono_whatsapp_param: telefonoWhatsapp,
              direccion_param: direccion.trim() || null,
              latitud_param: ubicacion?.latitud ?? null,
              longitud_param: ubicacion?.longitud ?? null
            }
          )

          if (errorRpc || !negocioId) {
            setError(
              errorRpc?.message ??
                'No se pudo registrar el negocio. Inténtalo de nuevo.'
            )
            throw errorRpc ?? new Error('No se pudo registrar el negocio')
          }

          const { businessRepository } = crearDependenciasPanelNavegador()
          const guardarHorarios = crearGuardarHorarios(businessRepository)
          await guardarHorarios(String(negocioId), horarios)

          router.replace('/panel/citas')
          router.refresh()
        }}
      />
    </Stack>
  )
}
