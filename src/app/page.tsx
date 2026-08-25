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
          'Plataforma de reservas online para barberías, salones y negocios de belleza.'
      },
      {
        '@type': 'WebSite',
        '@id': `${origen}/#website`,
        url: origen,
        name: 'Kortao',
        description:
          'Reservas online para barberías, salones y negocios de belleza.',
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
          'Agenda citas, configura servicios y horarios, y notifica a tus clientes por WhatsApp y correo.',
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
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    const jsonLd = construirJsonLd()

    return (
      <>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LandingKortao />
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
