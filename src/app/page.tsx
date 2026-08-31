import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { LandingKortao } from '@/presentation/components/auth/LandingKortao'
import { obtenerOrigenSitio } from '@/shared/utils/sitio'

export const metadata: Metadata = {
  alternates: {
    canonical: '/'
  }
}

const construirJsonLd = () => {
  const origen = obtenerOrigenSitio()

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origen}/#organization`,
        name: 'Kortao',
        url: origen,
        logo: `${origen}/icons/icon-512.png`,
        description:
          'Agenda y reservas online para negocios en República Dominicana.'
      },
      {
        '@type': 'WebSite',
        '@id': `${origen}/#website`,
        url: origen,
        name: 'Kortao',
        description:
          'Gestiona citas, comparte un enlace de reservas y envía recordatorios automáticos.',
        publisher: {
          '@id': `${origen}/#organization`
        },
        inLanguage: 'es'
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Kortao',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: origen,
        description:
          'Los negocios gestionan su agenda; los clientes reservan online; WhatsApp y correo recuerdan cada cita.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'DOP'
        }
      }
    ]
  }
}

const HomePage = async () => {
  const supabase = crearClienteServidor()

  let user: { id: string } | null = null

  try {
    const {
      data: { user: usuarioSesion },
      error
    } = await supabase.auth.getUser()

    if (!error && usuarioSesion) {
      user = usuarioSesion
    }
  } catch {
    user = null
  }

  if (!user) {
    const jsonLd = construirJsonLd()
    const telefonoSoporte = process.env.SOPORTE_WHATSAPP?.trim() || null

    return (
      <>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LandingKortao telefonoSoporte={telefonoSoporte} />
      </>
    )
  }

  const { data: membresia } = await supabase
    .from('usuarios_negocio')
    .select('negocio_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (membresia?.negocio_id) {
    redirect('/panel/citas')
  }

  redirect('/panel/onboarding')
}

export default HomePage
