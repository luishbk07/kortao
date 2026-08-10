import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { EncabezadoMarca } from '@/presentation/components/ui/EncabezadoMarca'

const ReservarLoading = () => {
  return (
    <Box component='main' bgcolor='background.default' minHeight='100vh'>
      <EncabezadoMarca />
      <Container maxWidth='sm' sx={{ py: { xs: 3, sm: 5 } }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Skeleton variant='text' width='70%' height={48} />
            <Skeleton variant='text' width='50%' height={24} />
            <Skeleton variant='text' width='80%' height={24} />
          </Stack>

          <Stack spacing={1.5}>
            <Skeleton variant='text' width={160} height={32} />
            {[0, 1, 2].map((indice) => (
              <Skeleton
                key={indice}
                variant='rounded'
                height={88}
              />
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default ReservarLoading
