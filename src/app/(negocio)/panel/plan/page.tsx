import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const PlanPage = () => {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        px: { xs: 3, sm: 4 },
        py: { xs: 4, sm: 5 }
      }}
    >
      <Stack spacing={2} maxWidth={480}>
        <Typography variant='h5' component='h1' fontWeight={700}>
          Plan Premium
        </Typography>
        <Typography color='text.secondary'>
          Pronto podrás actualizar tu plan desde aquí para quitar anuncios y
          desbloquear herramientas avanzadas. El pago aún no está disponible.
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Mientras tanto, sigue gestionando tus citas con el plan estándar.
        </Typography>
      </Stack>
    </Box>
  )
}

export default PlanPage
