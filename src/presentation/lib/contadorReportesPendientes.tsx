'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'

type ContadorReportesPendientesContexto = {
  reportesPendientes: number
  ajustarReportesPendientes: (delta: number) => void
}

const ContadorReportesPendientesContext =
  createContext<ContadorReportesPendientesContexto | null>(null)

type ContadorReportesPendientesProviderProps = {
  inicial: number
  children: ReactNode
}

export const ContadorReportesPendientesProvider = ({
  inicial,
  children
}: ContadorReportesPendientesProviderProps) => {
  const [reportesPendientes, setReportesPendientes] = useState(inicial)

  useEffect(() => {
    setReportesPendientes(inicial)
  }, [inicial])

  const ajustarReportesPendientes = useCallback((delta: number) => {
    setReportesPendientes((actual) => Math.max(0, actual + delta))
  }, [])

  const valor = useMemo(
    () => ({
      reportesPendientes,
      ajustarReportesPendientes
    }),
    [reportesPendientes, ajustarReportesPendientes]
  )

  return (
    <ContadorReportesPendientesContext.Provider value={valor}>
      {children}
    </ContadorReportesPendientesContext.Provider>
  )
}

export const useContadorReportesPendientes = () => {
  return useContext(ContadorReportesPendientesContext)
}
