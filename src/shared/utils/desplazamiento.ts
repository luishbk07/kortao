/** Scrolls the page to the top in a way that works on mobile Safari/Chrome. */
export const desplazarAlInicio = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  // Immediate jump first — smooth scroll is unreliable on many mobile browsers.
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  try {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  } catch {
    // Older browsers may not support ScrollToOptions.
  }
};

const OFFSET_SUPERIOR_PX = 20;

/** Smoothly scrolls an element into view when present in the document. */
export const desplazarAElemento = (
  elemento: HTMLElement | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _bloque: ScrollLogicalPosition = "start",
): void => {
  if (!elemento || typeof window === "undefined") {
    return;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const destino =
    elemento.getBoundingClientRect().top + window.scrollY - OFFSET_SUPERIOR_PX;

  try {
    window.scrollTo({
      top: Math.max(0, destino),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  } catch {
    window.scrollTo(0, Math.max(0, destino));
  }
};
