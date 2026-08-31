import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import {
  TablaNegociosAdmin,
  type NegocioAdminFila
} from '@/presentation/components/admin/TablaNegociosAdmin'
import { normalizarCicloFacturacion } from '@/shared/utils/planes'

type NegocioAdminDb = {
  id: string
  nombre: string
  plan: string
  fecha_inicio_suscripcion: string
  suscripcion_activa: boolean
  precio_mensual: number | string | null
  ciclo_facturacion: string | null
}

const mapearPrecioMensual = (
  valor: number | string | null
): number | null => {
  if (valor === null || valor === '') {
    return null
  }

  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : null
}

const AdminPage = async () => {
  const supabase = crearClienteServidor()
  const { data, error } = await supabase
    .from('negocios')
    .select(
      'id, nombre, plan, fecha_inicio_suscripcion, suscripcion_activa, precio_mensual, ciclo_facturacion'
    )

  if (error) {
    throw new Error('No se pudieron cargar los negocios')
  }

  const negocios: NegocioAdminFila[] = (
    (data as NegocioAdminDb[] | null) ?? []
  ).map((fila) => ({
    id: fila.id,
    nombre: fila.nombre,
    plan: fila.plan,
    fechaInicioSuscripcion: fila.fecha_inicio_suscripcion,
    suscripcionActiva: fila.suscripcion_activa,
    precioMensual: mapearPrecioMensual(fila.precio_mensual),
    cicloFacturacion: normalizarCicloFacturacion(fila.ciclo_facturacion)
  }))

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant='h5' component='h1' color='primary'>
          Administración Kortao
        </Typography>
        <Typography color='text.secondary'>
          Gestiona las suscripciones de todos los negocios.
        </Typography>
      </Stack>

      <TablaNegociosAdmin negociosIniciales={negocios} />
    </Stack>
  )
}

export default AdminPage
