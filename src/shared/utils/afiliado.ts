/** Slug-like affiliate codes: lowercase, hyphens, no accents. */
export const normalizarCodigoAfiliado = (valor: string): string => {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Suggestion from the display name. If the base code is already taken,
 * appends -2, -3, … so duplicate names stay unique.
 */
export const sugerirCodigoAfiliado = (
  nombre: string,
  codigosExistentes: string[] = [],
  excluirCodigo?: string | null
): string => {
  const base = normalizarCodigoAfiliado(nombre) || 'afiliado'
  const ocupados = new Set(
    codigosExistentes
      .map((codigo) => normalizarCodigoAfiliado(codigo))
      .filter((codigo) => codigo.length > 0 && codigo !== excluirCodigo)
  )

  if (!ocupados.has(base)) {
    return base
  }

  let sufijo = 2

  while (ocupados.has(`${base}-${sufijo}`)) {
    sufijo += 1
  }

  return `${base}-${sufijo}`
}

export const codigoAfiliadoEstaOcupado = (
  codigo: string,
  codigosExistentes: string[],
  excluirCodigo?: string | null
): boolean => {
  const normalizado = normalizarCodigoAfiliado(codigo)

  if (normalizado.length === 0) {
    return false
  }

  return codigosExistentes.some((existente) => {
    const otro = normalizarCodigoAfiliado(existente)
    return otro === normalizado && otro !== excluirCodigo
  })
}
