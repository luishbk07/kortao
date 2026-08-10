import Link from 'next/link'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { LogoKortao } from '@/presentation/components/ui/LogoKortao'

export const EncabezadoMarca = () => {
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
        <Toolbar disableGutters sx={{ minHeight: 64 }}>
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
        </Toolbar>
      </Container>
    </AppBar>
  )
}
