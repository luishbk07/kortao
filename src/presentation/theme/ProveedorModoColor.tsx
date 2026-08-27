'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode
} from 'react'
import { CLAVE_MODO_COLOR, type ModoColor } from './palette'

type ContextoModoColor = {
  modo: ModoColor
  alternarModo: () => void
}

type Suscriptor = () => void

const ModoColorContext = createContext<ContextoModoColor | null>(null)

const esModoValido = (valor: string | null): valor is ModoColor => {
  return valor === 'light' || valor === 'dark'
}

const leerModoDesdeStorage = (): ModoColor => {
  try {
    const guardado = localStorage.getItem(CLAVE_MODO_COLOR)
    if (esModoValido(guardado)) {
      return guardado
    }
  } catch {
    // Private mode / blocked storage
  }

  return 'light'
}

const aplicarModoEnDocumento = (modo: ModoColor): void => {
  document.documentElement.setAttribute('data-color-mode', modo)
  document.documentElement.style.colorScheme = modo
  document.documentElement.style.backgroundColor =
    modo === 'dark' ? '#0F1614' : '#FBF8F3'
}

let modoEnMemoria: ModoColor | null = null
const suscriptores = new Set<Suscriptor>()

const obtenerModoCliente = (): ModoColor => {
  if (modoEnMemoria === null) {
    modoEnMemoria = leerModoDesdeStorage()
  }

  return modoEnMemoria
}

const notificarSuscriptores = (): void => {
  suscriptores.forEach((suscriptor) => {
    suscriptor()
  })
}

const establecerModo = (modo: ModoColor): void => {
  modoEnMemoria = modo

  try {
    localStorage.setItem(CLAVE_MODO_COLOR, modo)
  } catch {
    // Ignore persistence failures
  }

  aplicarModoEnDocumento(modo)
  notificarSuscriptores()
}

const suscribirse = (callback: Suscriptor): (() => void) => {
  suscriptores.add(callback)

  return () => {
    suscriptores.delete(callback)
  }
}

const snapshotServidor = (): ModoColor => 'light'

type ProveedorModoColorProps = {
  children: ReactNode
}

export const ProveedorModoColor = ({ children }: ProveedorModoColorProps) => {
  const modo = useSyncExternalStore(
    suscribirse,
    obtenerModoCliente,
    snapshotServidor
  )

  useEffect(() => {
    // Sync after hydration: SSR always starts as light.
    const guardado = leerModoDesdeStorage()
    establecerModo(guardado)
  }, [])

  const alternarModo = useCallback(() => {
    const actual = obtenerModoCliente()
    establecerModo(actual === 'light' ? 'dark' : 'light')
  }, [])

  const valor = useMemo(
    () => ({
      modo,
      alternarModo
    }),
    [modo, alternarModo]
  )

  return (
    <ModoColorContext.Provider value={valor}>
      {children}
    </ModoColorContext.Provider>
  )
}

export const useModoColor = (): ContextoModoColor => {
  const contexto = useContext(ModoColorContext)

  if (!contexto) {
    throw new Error('useModoColor debe usarse dentro de ProveedorModoColor')
  }

  return contexto
}
