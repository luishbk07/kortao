/** Scrolls the page to the top in a way that works on mobile Safari/Chrome. */
export const desplazarAlInicio = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  // Immediate jump first — smooth scroll is unreliable on many mobile browsers.
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  } catch {
    // Older browsers may not support ScrollToOptions.
  }
}
