export type DescuentoTipo = 'monto' | 'porcentaje'

export const calcularPrecioFinal = (
  precio: number,
  descuentoTipo: DescuentoTipo | null,
  descuentoValor: number | null
): number => {
  if (
    descuentoTipo === null ||
    descuentoValor === null ||
    !Number.isFinite(precio) ||
    !Number.isFinite(descuentoValor) ||
    descuentoValor <= 0
  ) {
    return Math.max(0, precio)
  }

  if (descuentoTipo === 'monto') {
    return Math.max(0, precio - descuentoValor)
  }

  const descuento = (precio * descuentoValor) / 100
  return Math.max(0, precio - descuento)
}

export const tieneDescuentoActivo = (
  descuentoTipo: DescuentoTipo | null,
  descuentoValor: number | null
): boolean => {
  return (
    descuentoTipo !== null &&
    descuentoValor !== null &&
    Number.isFinite(descuentoValor) &&
    descuentoValor > 0
  )
}
