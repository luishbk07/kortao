'use client'

import { useMemo, useState } from 'react'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import type { BloqueHorario, HorarioDiaInput } from '@/domain/business/business.types'
import { diasSemana } from '@/shared/constants/diasSemana'
import {
  bloquePorDefecto,
  construirDiasDesdeInicial,
  construirPayloadHorarios,
  validarBloquesDia,
  type DiaConfigurado
} from './configuradorHorarios.helpers'
import { EditorBloquesHorario } from './EditorBloquesHorario'

type ConfiguradorHorariosProps = {
  valorInicial: HorarioDiaInput[]
  onSave: (horarios: HorarioDiaInput[]) => Promise<void>
  etiquetaBoton?: string
}

export const ConfiguradorHorarios = ({
  valorInicial,
  onSave,
  etiquetaBoton = 'Guardar horarios'
}: ConfiguradorHorariosProps) => {
  const [aplicarATodos, setAplicarATodos] = useState(false)
  const [dias, setDias] = useState(() => construirDiasDesdeInicial(valorInicial))
  const [diasAbiertosCompartidos, setDiasAbiertosCompartidos] = useState<number[]>(
    [1, 2, 3, 4, 5]
  )
  const [bloquesCompartidos, setBloquesCompartidos] = useState<BloqueHorario[]>([
    bloquePorDefecto()
  ])
  const [guardando, setGuardando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const erroresPorDia = useMemo(() => {
    const mapa = new Map<number, string | null>()

    if (aplicarATodos) {
      if (diasAbiertosCompartidos.length > 0) {
        mapa.set(-1, validarBloquesDia(bloquesCompartidos))
      }
      return mapa
    }

    dias.forEach((dia) => {
      mapa.set(
        dia.diaSemana,
        dia.abierto ? validarBloquesDia(dia.bloques) : null
      )
    })

    return mapa
  }, [aplicarATodos, bloquesCompartidos, dias, diasAbiertosCompartidos])

  const hayErrores = Array.from(erroresPorDia.values()).some(Boolean)

  const actualizarDia = (
    diaSemana: number,
    cambios: Partial<DiaConfigurado>
  ) => {
    setDias((actuales) =>
      actuales.map((dia) =>
        dia.diaSemana === diaSemana ? { ...dia, ...cambios } : dia
      )
    )
  }

  const alternarDiaCompartido = (diaSemana: number, abierto: boolean) => {
    setDiasAbiertosCompartidos((actuales) => {
      if (abierto) {
        return actuales.includes(diaSemana)
          ? actuales
          : [...actuales, diaSemana].sort((a, b) => a - b)
      }

      return actuales.filter((valor) => valor !== diaSemana)
    })
  }

  const handleGuardar = async () => {
    if (hayErrores) {
      setErrorGeneral('Corrige los horarios marcados antes de guardar.')
      return
    }

    if (aplicarATodos && diasAbiertosCompartidos.length === 0) {
      setErrorGeneral('Selecciona al menos un día abierto.')
      return
    }

    setGuardando(true)
    setErrorGeneral(null)

    try {
      const payload = construirPayloadHorarios(
        aplicarATodos,
        dias,
        diasAbiertosCompartidos,
        bloquesCompartidos
      )
      await onSave(payload)
    } catch (error) {
      setErrorGeneral(
        error instanceof Error
          ? error.message
          : 'No se pudieron guardar los horarios.'
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Stack spacing={2}>
      <FormControlLabel
        control={
          <Switch
            checked={aplicarATodos}
            onChange={(evento) => setAplicarATodos(evento.target.checked)}
            color='secondary'
          />
        }
        label='Aplicar el mismo horario a todos los días'
      />

      {errorGeneral ? (
        <Alert severity='error' onClose={() => setErrorGeneral(null)}>
          {errorGeneral}
        </Alert>
      ) : null}

      {aplicarATodos ? (
        <Card variant='outlined'>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant='subtitle1' fontWeight={600}>
                Días abiertos
              </Typography>
              <Stack direction='row' flexWrap='wrap' useFlexGap spacing={0.5}>
                {diasSemana.map((dia) => (
                  <FormControlLabel
                    key={dia.valor}
                    control={
                      <Checkbox
                        checked={diasAbiertosCompartidos.includes(dia.valor)}
                        onChange={(evento) =>
                          alternarDiaCompartido(dia.valor, evento.target.checked)
                        }
                        color='secondary'
                      />
                    }
                    label={dia.etiqueta}
                  />
                ))}
              </Stack>
              {diasAbiertosCompartidos.length > 0 ? (
                <EditorBloquesHorario
                  bloques={bloquesCompartidos}
                  onChange={setBloquesCompartidos}
                  error={erroresPorDia.get(-1) ?? null}
                />
              ) : (
                <Typography color='text.secondary'>
                  Selecciona los días en los que atiendes.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {dias.map((dia) => {
            const etiqueta =
              diasSemana.find((item) => item.valor === dia.diaSemana)
                ?.etiqueta ?? ''

            return (
              <Card key={dia.diaSemana} variant='outlined'>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='center'
                    >
                      <Typography variant='h6' component='h2'>
                        {etiqueta}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={dia.abierto}
                            onChange={(evento) =>
                              actualizarDia(dia.diaSemana, {
                                abierto: evento.target.checked
                              })
                            }
                            color='secondary'
                          />
                        }
                        label={dia.abierto ? 'Abierto' : 'Cerrado'}
                      />
                    </Stack>
                    {dia.abierto ? (
                      <EditorBloquesHorario
                        bloques={dia.bloques}
                        onChange={(bloques) =>
                          actualizarDia(dia.diaSemana, { bloques })
                        }
                        error={erroresPorDia.get(dia.diaSemana) ?? null}
                      />
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            )
          })}
        </Stack>
      )}

      <Button
        variant='contained'
        color='secondary'
        size='large'
        startIcon={<SaveOutlinedIcon />}
        disabled={guardando || hayErrores}
        onClick={() => {
          void handleGuardar()
        }}
      >
        {guardando ? 'Guardando...' : etiquetaBoton}
      </Button>
    </Stack>
  )
}
