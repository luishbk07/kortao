'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

export type CoordenadasUbicacion = {
  latitud: number
  longitud: number
}

type SelectorUbicacionProps = {
  valorInicial?: CoordenadasUbicacion | null
  onChange: (coordenadas: CoordenadasUbicacion) => void
}

type SugerenciaNominatim = {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

const SANTO_DOMINGO: CoordenadasUbicacion = {
  latitud: 18.4861,
  longitud: -69.9312
}

const MapaSelectorUbicacion = dynamic(
  () =>
    import('./MapaSelectorUbicacion').then(
      (modulo) => modulo.MapaSelectorUbicacion
    ),
  {
    ssr: false,
    loading: () => (
      <Stack
        alignItems='center'
        justifyContent='center'
        sx={{
          height: 280,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <CircularProgress size={28} />
      </Stack>
    )
  }
)

const buscarNominatim = async (
  consulta: string
): Promise<SugerenciaNominatim[]> => {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', consulta)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '5')
  url.searchParams.set('countrycodes', 'do')

  const respuesta = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'es'
    }
  })

  if (!respuesta.ok) {
    return []
  }

  return (await respuesta.json()) as SugerenciaNominatim[]
}

export const SelectorUbicacion = ({
  valorInicial = null,
  onChange
}: SelectorUbicacionProps) => {
  const [coordenadas, setCoordenadas] = useState<CoordenadasUbicacion>(
    valorInicial ?? SANTO_DOMINGO
  )
  const [consulta, setConsulta] = useState('')
  const [opciones, setOpciones] = useState<SugerenciaNominatim[]>([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    const texto = consulta.trim()

    if (texto.length < 3) {
      setOpciones([])
      return undefined
    }

    const temporizador = window.setTimeout(() => {
      setCargando(true)
      void buscarNominatim(texto)
        .then((resultado) => {
          setOpciones(resultado)
        })
        .catch(() => {
          setOpciones([])
        })
        .finally(() => {
          setCargando(false)
        })
    }, 400)

    return () => {
      window.clearTimeout(temporizador)
    }
  }, [consulta])

  const actualizarCoordenadas = (nuevas: CoordenadasUbicacion) => {
    setCoordenadas(nuevas)
    onChange(nuevas)
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction='row' spacing={0.75} alignItems='center'>
        <PlaceOutlinedIcon color='primary' fontSize='small' />
        <Typography variant='subtitle1' color='primary' fontWeight={600}>
          Ubicación en el mapa
        </Typography>
      </Stack>
      <Typography variant='body2' color='text.secondary'>
        Busca tu dirección o arrastra el marcador para afinar la ubicación.
      </Typography>

      <Autocomplete
        options={opciones}
        loading={cargando}
        filterOptions={(x) => x}
        getOptionLabel={(opcion) => opcion.display_name}
        inputValue={consulta}
        onInputChange={(_evento, valor) => {
          setConsulta(valor)
        }}
        onChange={(_evento, opcion) => {
          if (!opcion) {
            return
          }

          actualizarCoordenadas({
            latitud: Number(opcion.lat),
            longitud: Number(opcion.lon)
          })
        }}
        noOptionsText={
          consulta.trim().length < 3
            ? 'Escribe al menos 3 caracteres'
            : 'Sin resultados'
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label='Buscar dirección'
            placeholder='Ej. Calle el Conde, Santo Domingo'
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {cargando ? <CircularProgress color='inherit' size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />

      <MapaSelectorUbicacion
        coordenadas={coordenadas}
        onChange={actualizarCoordenadas}
      />
    </Stack>
  )
}
