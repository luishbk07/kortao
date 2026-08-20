import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Section,
  Text
} from '@react-email/components'
import {
  estilosEmail,
  obtenerAltLogoEmail,
  obtenerUrlLogoEmail,
  type PropsEmailCitaBase
} from './estilosEmail'

export type ConfirmacionCitaEmailProps = PropsEmailCitaBase & {
  enlaceGoogleCalendar: string | null
}

export const ConfirmacionCitaEmail = ({
  clienteNombre,
  negocioNombre,
  negocioLogoUrl,
  fechaFormateada,
  horaFormateada,
  enlaceGoogleCalendar
}: ConfirmacionCitaEmailProps) => {
  return (
    <Html lang='es'>
      <Head />
      <Body style={estilosEmail.body}>
        <Container style={estilosEmail.contenedor}>
          <Img
            src={obtenerUrlLogoEmail(negocioLogoUrl)}
            alt={obtenerAltLogoEmail(negocioLogoUrl, negocioNombre)}
            style={estilosEmail.logo}
          />
          <Text style={estilosEmail.saludo}>Hola {clienteNombre},</Text>
          <Text style={estilosEmail.parrafo}>
            Tu cita en{' '}
            <span style={estilosEmail.destacado}>{negocioNombre}</span> está
            confirmada para el{' '}
            <span style={estilosEmail.destacado}>{fechaFormateada}</span> a las{' '}
            <span style={estilosEmail.destacado}>{horaFormateada}</span>.
          </Text>
          <Text style={estilosEmail.parrafo}>Te esperamos.</Text>
          {enlaceGoogleCalendar ? (
            <Section style={estilosEmail.seccionBoton}>
              <Button
                href={enlaceGoogleCalendar}
                style={estilosEmail.boton}
              >
                Añadir a Google Calendar
              </Button>
            </Section>
          ) : null}
          <Hr style={estilosEmail.divisor} />
          <Text style={estilosEmail.pie}>Kortao</Text>
        </Container>
      </Body>
    </Html>
  )
}

ConfirmacionCitaEmail.PreviewProps = {
  clienteNombre: 'María',
  negocioNombre: 'Luis Corte',
  negocioLogoUrl: null,
  fechaFormateada: '20 de agosto de 2026',
  horaFormateada: '10:30 a. m.',
  enlaceGoogleCalendar:
    'https://calendar.google.com/calendar/render?action=TEMPLATE'
} satisfies ConfirmacionCitaEmailProps

export default ConfirmacionCitaEmail
