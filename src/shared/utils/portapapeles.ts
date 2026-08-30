const copiarConAreaDeTexto = (texto: string): void => {
  const area = document.createElement('textarea')
  area.value = texto
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.top = '0'
  area.style.left = '0'
  area.style.width = '1px'
  area.style.height = '1px'
  area.style.padding = '0'
  area.style.border = 'none'
  area.style.outline = 'none'
  area.style.boxShadow = 'none'
  area.style.background = 'transparent'
  area.style.opacity = '0'

  document.body.appendChild(area)

  const seleccion = document.getSelection()
  const rangoPrevio =
    seleccion && seleccion.rangeCount > 0 ? seleccion.getRangeAt(0) : null

  area.focus()
  area.select()
  area.setSelectionRange(0, texto.length)

  const copiado = document.execCommand('copy')

  document.body.removeChild(area)

  if (rangoPrevio && seleccion) {
    seleccion.removeAllRanges()
    seleccion.addRange(rangoPrevio)
  }

  if (!copiado) {
    throw new Error('No se pudo copiar al portapapeles')
  }
}

/**
 * Copies text to the clipboard. Uses the Clipboard API when available,
 * with a textarea/execCommand fallback for browsers that block it
 * (notably Chrome on iPad).
 */
export const copiarAlPortapapeles = async (texto: string): Promise<void> => {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard?.writeText === 'function' &&
    typeof window !== 'undefined' &&
    window.isSecureContext
  ) {
    try {
      await navigator.clipboard.writeText(texto)
      return
    } catch {
      // Fall through to legacy method (iPad Chrome often rejects clipboard API).
    }
  }

  copiarConAreaDeTexto(texto)
}
