'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { crearGuardarHorarios } from '@/application/useCases/business/guardarHorarios'
import type {
  HorarioDiaInput,
  HorarioNegocio
} from '@/domain/business/business.types'
import { crearDependenciasPanelNavegador } from '@/presentation/lib/crearDependenciasPanelNavegador'
import { diasSemana } from '@/shared/constants/diasSemana'

type PanelHorariosProps = {
  negocioId: string
  horariosIniciales: HorarioNegocio[]
}

const construirEstadoInicial = (
  horarios: HorarioNegocio[]
): HorarioDiaInput[] => {
  return diasSemana.map((dia) => {
    const existente = horarios.find(
      (horario) => horario.diaSemana === dia.valor
    )

    if (!existente) {
      return {
        diaSemana: dia.valor,
        cerrado: true,
        horaInicio: '09:00',
        horaFin: '18:00'
      }
    }

    return {
      diaSemana: dia.valor,
      cerrado: false,
      horaInicio: existente.horaInicio,
      horaFin: existente.horaFin
    }
  })
}

export const PanelHorarios = ({
  negocioId,
  horariosIniciales
}: PanelHorariosProps) => {
  const router = useRouter()
  const [horarios, setHorarios] = useState(
    construirEstadoInicial(horariosIniciales)
  )
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const actualizarDia = (
    diaSemana: number,
    cambios: Partial<HorarioDiaInput>
  ) => {
    setHorarios((actuales) =>
      actuales.map((horario) =>
        horario.diaSemana === diaSemana
          ? { ...horario, ...cambios }
          : horario
      )
    )
  }

  const handleGuardar = async () => {
    setGuardando(true)
    setError(null)
    setMensaje(null)

    try {
      const { businessRepository } = crearDependenciasPanelNavegador()
      const guardarHorarios = crearGuardarHorarios(businessRepository)
      await guardarHorarios(negocioId, horarios)
      setMensaje('Horarios guardados correctamente.')
      router.refresh()
    } catch (err) {
      const texto =
        err instanceof Error
          ? err.message
          : 'No se pudieron guardar los horarios.'
      setError(texto)
    } finally {
      setGuardando(false)
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
          Horarios
        </Typography>
        <Button
          variant='contained'
          color='secondary'
          startIcon={<SaveOutlinedIcon />}
          disabled={guardando}
          onClick={() => {
            void handleGuardar()
          }}
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </Button>
      </Stack>

      <Typography color='text.secondary'>
        Define la apertura de cada día. Los días cerrados no mostrarán citas
        disponibles.
      </Typography>

      {mensaje ? (
        <Alert severity='success' onClose={() => setMensaje(null)}>
          {mensaje}
        </Alert>
      ) : null}

      {error ? (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Stack spacing={1.5}>
        {diasSemana.map((dia) => {
          const horario = horarios.find(
            (item) => item.diaSemana === dia.valor
          )

          if (!horario) {
            return null
          }

          return (
            <Card key={dia.valor} variant='outlined'>
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                  >
                    <Typography variant='h6' component='h2'>
                      {dia.etiqueta}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!horario.cerrado}
                          onChange={(evento) =>
                            actualizarDia(dia.valor, {
                              cerrado: !evento.target.checked
                            })
                          }
                          color='secondary'
                        />
                      }
                      label={horario.cerrado ? 'Cerrado' : 'Abierto'}
                    />
                  </Stack>
                  {!horario.cerrado ? (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label='Hora inicio'
                        type='time'
                        value={horario.horaInicio}
                        onChange={(evento) =>
                          actualizarDia(dia.valor, {
                            horaInicio: evento.target.value
                          })
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <TextField
                        label='Hora fin'
                        type='time'
                        value={horario.horaFin}
                        onChange={(evento) =>
                          actualizarDia(dia.valor, {
                            horaFin: evento.target.value
                          })
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Stack>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          )
        })}
      </Stack>
    </Stack>
  )
}
