import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

export const EsqueletoListaCitas = () => {
  return (
    <Stack spacing={2}>
      {[0, 1, 2].map((indice) => (
        <Card key={indice} variant='outlined'>
          <CardContent>
            <Stack spacing={1.5}>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='flex-start'
                spacing={1}
              >
                <Stack spacing={0.75} flexGrow={1}>
                  <Skeleton variant='text' width='40%' height={32} />
                  <Skeleton variant='text' width='55%' height={24} />
                </Stack>
                <Skeleton variant='rounded' width={88} height={28} />
              </Stack>
              <Skeleton variant='text' width='70%' height={24} />
              <Skeleton variant='rounded' width={140} height={36} />
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
