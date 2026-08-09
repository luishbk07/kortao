const generarSufijo = (): string => {
  return Math.random().toString(36).slice(2, 6)
}

export const generarSlug = (nombre: string): string => {
  const base = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `${base || 'negocio'}-${generarSufijo()}`
}
