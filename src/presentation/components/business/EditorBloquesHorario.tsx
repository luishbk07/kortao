'use client'

import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { BloqueHorario } from '@/domain/business/business.types'
import { SelectorHora } from '@/presentation/components/ui/SelectorHora'
import { bloquePorDefecto } from './configuradorHorarios.helpers'

type EditorBloquesHorarioProps = {
  bloques: BloqueHorario[]
  onChange: (bloques: BloqueHorario[]) => void
  error: string | null
}

export const EditorBloquesHorario = ({
  bloques,
  onChange,
  error
}: EditorBloquesHorarioProps) => {
  const actualizarBloque = (
    indice: number,
    cambios: Partial<BloqueHorario>
  ) => {
    onChange(
      bloques.map((bloque, i) =>
        i === indice ? { ...bloque, ...cambios } : bloque
      )
    )
  }

  const agregarBloque = () => {
    onChange([...bloques, bloquePorDefecto()])
  }

  const eliminarBloque = (indice: number) => {
    if (bloques.length <= 1) {
      return
    }

    onChange(bloques.filter((_, i) => i !== indice))
  }

  return (
    <Stack spacing={1.5}>
      {bloques.map((bloque, indice) => (
        <Stack
          key={`bloque-${indice}`}
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ sm: 'center' }}
        >
          <SelectorHora
            label='Hora inicio'
            valor={bloque.horaInicio}
            onChange={(horaInicio) =>
              actualizarBloque(indice, { horaInicio })
            }
          />
          <SelectorHora
            label='Hora fin'
            valor={bloque.horaFin}
            onChange={(horaFin) => actualizarBloque(indice, { horaFin })}
          />
          <IconButton
            aria-label='Eliminar bloque'
            color='error'
            disabled={bloques.length <= 1}
            onClick={() => eliminarBloque(indice)}
          >
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </Stack>
      ))}

      <Button
        startIcon={<AddOutlinedIcon />}
        onClick={agregarBloque}
        sx={{ alignSelf: 'flex-start' }}
      >
        + Agregar bloque
      </Button>

      {error ? (
        <Typography variant='body2' color='error'>
          {error}
        </Typography>
      ) : null}
    </Stack>
  )
}
