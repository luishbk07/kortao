import type { Metadata } from 'next'
import { FormularioUnirse } from '@/presentation/components/auth/FormularioUnirse'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'

export const metadata: Metadata = {
  title: 'Unirse al equipo | Kortao',
  robots: {
    index: false,
    follow: false
  }
}

type UnirsePageProps = {
  searchParams?: {
    codigo?: string
  }
}

const UnirsePage = async ({ searchParams }: UnirsePageProps) => {
  const codigoInicial = (searchParams?.codigo ?? '').trim().toUpperCase()
  const supabase = crearClienteServidor()

  let yaAutenticado = false

  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    yaAutenticado = Boolean(!error && user)
  } catch {
    yaAutenticado = false
  }

  return (
    <FormularioUnirse
      codigoInicial={codigoInicial}
      yaAutenticado={yaAutenticado}
    />
  )
}

export default UnirsePage
