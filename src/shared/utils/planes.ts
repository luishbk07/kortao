export const LIMITE_CITAS_FUTURAS_PLAN_GRATIS = 15;

/** Free/default plan is `estandar`; any other value is treated as premium. */
export const esPlanPremium = (plan: string): boolean => plan !== "estandar";

export const PRECIO_LISTA_PLAN_PREMIUM = 1000;

/** Default Kortao support WhatsApp (DR): (829) 812-5495 */
export const TELEFONO_SOPORTE_KORTAO = "18298125495";

export const BENEFICIOS_PLAN_PREMIUM = [
  "Sin anuncios en el panel",
  "Clientes recurrentes",
  "Reportes extendidos",
  "Personalización de color",
] as const;

export const formatearPrecioMensual = (precio: number): string => {
  return `RD$${new Intl.NumberFormat("es-DO").format(precio - 1)}/mes`;
};

export const construirEnlaceWhatsappSoporte = (
  telefonoSoporte: string,
  nombreNegocio: string,
): string => {
  const telefono = telefonoSoporte.replace(/\D/g, "");
  const mensaje = encodeURIComponent(
    `Hola, quiero activar el plan Premium de Kortao para ${nombreNegocio}`,
  );

  return `https://wa.me/${telefono}?text=${mensaje}`;
};
