import Link from 'next/link'
import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

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
          <Typography
            component={Link}
            href='/'
            variant='h6'
            color='primary'
            sx={{
              textDecoration: 'none',
              fontWeight: 700
            }}
          >
            Kortao
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
