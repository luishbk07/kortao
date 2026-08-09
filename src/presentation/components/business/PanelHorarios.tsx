'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { crearGuardarHorarios } from '@/application/useCases/business/guardarHorarios'
import type { HorarioNegocio } from '@/domain/business/business.types'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'
import { ConfiguradorHorarios } from './ConfiguradorHorarios'
import { mapearHorariosNegocioAInputs } from './configuradorHorarios.helpers'

type PanelHorariosProps = {
  negocioId: string
  horariosIniciales: HorarioNegocio[]
}

export const PanelHorarios = ({
  negocioId,
  horariosIniciales
}: PanelHorariosProps) => {
  const router = useRouter()
  const [mensaje, setMensaje] = useState<string | null>(null)

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant='h5' component='h1' color='primary'>
          Horarios
        </Typography>
        <Typography color='text.secondary'>
          Define la apertura de cada día. Puedes agregar varios bloques para
          pausas (por ejemplo, 9:00-12:00 y 14:00-18:00).
        </Typography>
      </Stack>

      {mensaje ? (
        <Alert severity='success' onClose={() => setMensaje(null)}>
          {mensaje}
        </Alert>
      ) : null}

      <ConfiguradorHorarios
        valorInicial={mapearHorariosNegocioAInputs(horariosIniciales)}
        onSave={async (horarios) => {
          const { businessRepository } = crearDependenciasPanelNavegador()
          const guardarHorarios = crearGuardarHorarios(businessRepository)
          await guardarHorarios(negocioId, horarios)
          setMensaje('Horarios guardados correctamente.')
          router.refresh()
        }}
      />
    </Stack>
  )
}
