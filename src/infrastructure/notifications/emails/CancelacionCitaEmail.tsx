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

export type CancelacionCitaEmailProps = PropsEmailCitaBase & {
  enlaceReservar: string | null
}

export const CancelacionCitaEmail = ({
  clienteNombre,
  negocioNombre,
  negocioLogoUrl,
  fechaFormateada,
  horaFormateada,
  enlaceReservar
}: CancelacionCitaEmailProps) => {
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
            <span style={estilosEmail.destacado}>{negocioNombre}</span> del{' '}
            <span style={estilosEmail.destacado}>{fechaFormateada}</span> a las{' '}
            <span style={estilosEmail.destacado}>{horaFormateada}</span> fue
            cancelada.
          </Text>
          <Text style={estilosEmail.parrafo}>
            Si deseas, puedes volver a reservar cuando quieras.
          </Text>
          {enlaceReservar ? (
            <Section style={estilosEmail.seccionBoton}>
              <Button href={enlaceReservar} style={estilosEmail.boton}>
                Reservar de nuevo
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

CancelacionCitaEmail.PreviewProps = {
  clienteNombre: 'María',
  negocioNombre: 'Luis Corte',
  negocioLogoUrl: null,
  fechaFormateada: '20 de agosto de 2026',
  horaFormateada: '10:30 a. m.',
  enlaceReservar: 'https://kortao.com/reservar/luis-corte'
} satisfies CancelacionCitaEmailProps

export default CancelacionCitaEmail
