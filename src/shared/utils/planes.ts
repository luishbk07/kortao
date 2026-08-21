export const LIMITE_CITAS_FUTURAS_PLAN_GRATIS = 15

/** Free/default plan is `estandar`; any other value is treated as premium. */
export const esPlanPremium = (plan: string): boolean => plan !== 'estandar'
