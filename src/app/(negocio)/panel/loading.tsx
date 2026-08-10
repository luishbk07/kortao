import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

const PanelLoading = () => {
  return (
    <Stack spacing={3}>
      <Stack spacing={0.75}>
        <Skeleton variant='text' width={140} height={40} />
        <Skeleton variant='text' width='70%' height={28} />
      </Stack>
      <Skeleton variant='rounded' height={56} />
      {[0, 1, 2].map((indice) => (
        <Skeleton key={indice} variant='rounded' height={108} />
      ))}
    </Stack>
  )
}

export default PanelLoading
