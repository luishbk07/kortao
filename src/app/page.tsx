import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

const HomePage = () => {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2
      }}
    >
      <Typography variant="h1" color="primary">
        Kortao
      </Typography>
    </Box>
  )
}

export default HomePage
