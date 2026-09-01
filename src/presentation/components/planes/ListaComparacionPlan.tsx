import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import type { FilaComparacionPlan } from './filasComparacionPlanes'

type ListaComparacionPlanProps = {
  filas: FilaComparacionPlan[]
}

export const ListaComparacionPlan = ({
  filas
}: ListaComparacionPlanProps) => {
  return (
    <List dense disablePadding>
      {filas.map((fila) => (
        <ListItem key={fila.etiqueta} disableGutters sx={{ py: 0.5 }}>
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: fila.disponible ? 'success.main' : 'text.disabled'
            }}
          >
            {fila.disponible ? (
              <CheckCircleOutlineIcon fontSize='small' />
            ) : (
              <CloseOutlinedIcon fontSize='small' />
            )}
          </ListItemIcon>
          <ListItemText
            primary={fila.etiqueta}
            primaryTypographyProps={{
              color: fila.disponible ? 'text.primary' : 'text.disabled',
              fontWeight: fila.destacado ? 700 : 400
            }}
          />
        </ListItem>
      ))}
    </List>
  )
}
