import type { ReactNode } from 'react'
import { PanelShell } from '@/presentation/components/business/PanelShell'

type PanelLayoutProps = {
  children: ReactNode
}

const PanelLayout = ({ children }: PanelLayoutProps) => {
  return <PanelShell>{children}</PanelShell>
}

export default PanelLayout
