'use client'

import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import Box from '@mui/material/Box'
import { configurarIconoLeaflet } from './configurarIconoLeaflet'
import 'leaflet/dist/leaflet.css'

type Coordenadas = {
  latitud: number
  longitud: number
}

type MapaSelectorUbicacionProps = {
  coordenadas: Coordenadas
  onChange: (coordenadas: Coordenadas) => void
}

const ActualizarVistaMapa = ({ centro }: { centro: LatLngExpression }) => {
  const mapa = useMap()

  useEffect(() => {
    mapa.setView(centro, mapa.getZoom())
  }, [centro, mapa])

  return null
}

export const MapaSelectorUbicacion = ({
  coordenadas,
  onChange
}: MapaSelectorUbicacionProps) => {
  useEffect(() => {
    configurarIconoLeaflet()
  }, [])

  const centro: LatLngExpression = [coordenadas.latitud, coordenadas.longitud]

  return (
    <Box
      sx={{
        height: 280,
        width: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <MapContainer
        center={centro}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <ActualizarVistaMapa centro={centro} />
        <Marker
          position={centro}
          draggable
          eventHandlers={{
            dragend: (evento) => {
              const marcador = evento.target
              const posicion = marcador.getLatLng()
              onChange({
                latitud: posicion.lat,
                longitud: posicion.lng
              })
            }
          }}
        />
      </MapContainer>
    </Box>
  )
}
