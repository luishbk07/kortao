'use client'

import { VistaError } from '@/presentation/components/ui/VistaError'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

const PanelErrorPage = ({ error, reset }: ErrorPageProps) => {
  return (
    <VistaError error={error} onReintentar={reset} mostrarVolverInicio />
  )
}

export default PanelErrorPage
