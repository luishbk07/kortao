import type {
  Afiliado,
  AfiliadoConMetricas,
  AfiliadoOpcion
} from '@/domain/admin/afiliado.types'

export type AfiliadosRepository = {
  listarConMetricas: () => Promise<AfiliadoConMetricas[]>
  listarActivos: () => Promise<AfiliadoOpcion[]>
  crear: (nombre: string, codigo: string) => Promise<Afiliado>
  actualizar: (
    afiliadoId: string,
    nombre: string,
    codigo: string
  ) => Promise<Afiliado>
  actualizarActivo: (afiliadoId: string, activo: boolean) => Promise<void>
  eliminar: (afiliadoId: string) => Promise<void>
  buscarActivoPorCodigo: (codigo: string) => Promise<AfiliadoOpcion | null>
  existeCodigo: (
    codigo: string,
    excluirAfiliadoId?: string | null
  ) => Promise<boolean>
}
