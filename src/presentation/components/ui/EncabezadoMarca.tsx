'use client'

import Link from 'next/link'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { BotonModoColor } from '@/presentation/components/ui/BotonModoColor'
import { LogoKortao } from '@/presentation/components/ui/LogoKortao'

type EncabezadoMarcaProps = {
  mostrarModoColor?: boolean
}

export const EncabezadoMarca = ({
  mostrarModoColor = true
}: EncabezadoMarcaProps) => {
  return (
    <AppBar
      position='sticky'
      color='transparent'
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Container maxWidth='sm'>
        <Toolbar
          disableGutters
          sx={{
            minHeight: 64,
            justifyContent: mostrarModoColor ? 'space-between' : 'flex-start',
            gap: 1
          }}
        >
          <Box
            component={Link}
            href='/'
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none'
            }}
          >
            <LogoKortao variant='horizontal' />
          </Box>
          {mostrarModoColor ? <BotonModoColor edge='end' /> : null}
        </Toolbar>
      </Container>
    </AppBar>
  )
}
