'use client'

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useModoColor } from '@/presentation/theme/ProveedorModoColor'

type BotonModoColorProps = {
  edge?: 'start' | 'end' | false
}

export const BotonModoColor = ({ edge = false }: BotonModoColorProps) => {
  const { modo, alternarModo } = useModoColor()
  const esOscuro = modo === 'dark'

  return (
    <Tooltip title={esOscuro ? 'Modo claro' : 'Modo oscuro'}>
      <IconButton
        color='primary'
        edge={edge}
        onClick={alternarModo}
        aria-label={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        aria-pressed={esOscuro}
        size='small'
      >
        {esOscuro ? (
          <LightModeOutlinedIcon fontSize='small' />
        ) : (
          <DarkModeOutlinedIcon fontSize='small' />
        )}
      </IconButton>
    </Tooltip>
  )
}
