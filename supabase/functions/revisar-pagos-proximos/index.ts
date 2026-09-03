// Kortao — revisar-pagos-proximos Edge Function
// Runs once daily (schedule via Supabase cron / pg_cron, same pattern as
// enviar-recordatorios). Uses the service_role key server-side only.
//
// Keep calcularMontoCiclo / calcularProximaFechaPago in sync with
// src/shared/utils/planes.ts and src/shared/utils/suscripcion.ts.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const LOGO_KORTAO = "https://kortao.com/brand/kortao-email-logo.png";
const ZONA_HORARIA = "America/Santo_Domingo";
const DIAS_AVISO = 5;

type CicloFacturacion = "mensual" | "anual";

type NegocioPremium = {
  id: string;
  nombre: string;
  precio_mensual: number | string | null;
  ciclo_facturacion: string | null;
  fecha_inicio_suscripcion: string;
  usuarios_negocio:
    | { auth_user_id: string; rol: string }
    | Array<{ auth_user_id: string; rol: string }>
    | null;
};

type TipoRecordatorioPago = "en_5_dias" | "vence_hoy";

const normalizarCicloFacturacion = (
  valor: string | null | undefined,
): CicloFacturacion => {
  return valor === "anual" ? "anual" : "mensual";
};

/** Must match src/shared/utils/planes.ts calcularMontoCiclo. */
const calcularMontoCiclo = (
  precioMensual: number,
  ciclo: CicloFacturacion,
): number => {
  if (ciclo === "anual") {
    return precioMensual * 12 * 0.9;
  }

  return precioMensual;
};

const parsearFechaCalendario = (valor: string): Date => {
  const soloFecha = valor.slice(0, 10);
  const [anio, mes, dia] = soloFecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
};

const inicioDelDia = (fecha: Date): Date => {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
};

/** Matches dayjs add(1, 'month') clamping (e.g. Jan 31 → Feb 28/29). */
const sumarUnMes = (fecha: Date): Date => {
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth(); // 0-indexed
  const dia = fecha.getDate();
  const mesSiguiente = mes + 1;
  const anioSiguiente = mesSiguiente === 12 ? anio + 1 : anio;
  const indiceMesSiguiente = mesSiguiente % 12;
  const ultimoDiaDelMes = new Date(
    Date.UTC(anioSiguiente, indiceMesSiguiente + 1, 0),
  ).getUTCDate();
  const diaAjustado = Math.min(dia, ultimoDiaDelMes);

  return new Date(anioSiguiente, indiceMesSiguiente, diaAjustado);
};

const sumarMeses = (fecha: Date, cantidadMeses: number): Date => {
  let resultado = fecha;

  for (let indice = 0; indice < cantidadMeses; indice += 1) {
    resultado = sumarUnMes(resultado);
  }

  return resultado;
};

/**
 * Same stepping as src/shared/utils/suscripcion.ts calcularProximaFechaPago
 * (inclusive: on or after `hoy`; skips due dates already covered by payment).
 */
const calcularProximaFechaPago = (
  fechaInicioSuscripcion: Date,
  ciclo: CicloFacturacion,
  hoy: Date,
  fechaUltimoPago: Date | null = null,
): Date => {
  let proxima = inicioDelDia(fechaInicioSuscripcion);
  const referencia = inicioDelDia(hoy);
  const meses = ciclo === "anual" ? 12 : 1;

  if (Number.isNaN(proxima.getTime())) {
    throw new Error(
      `fecha_inicio_suscripcion inválida: ${String(fechaInicioSuscripcion)}`,
    );
  }

  while (proxima.getTime() < referencia.getTime()) {
    proxima = sumarMeses(proxima, meses);
  }

  if (fechaUltimoPago !== null) {
    const ultimoPago = inicioDelDia(fechaUltimoPago);

    while (ultimoPago.getTime() >= proxima.getTime()) {
      proxima = sumarMeses(proxima, meses);
    }
  }

  return proxima;
};

const obtenerHoySantoDomingo = (): Date => {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const anio = Number(partes.find((parte) => parte.type === "year")?.value);
  const mes = Number(partes.find((parte) => parte.type === "month")?.value);
  const dia = Number(partes.find((parte) => parte.type === "day")?.value);

  return new Date(anio, mes - 1, dia);
};

const diasHastaFecha = (fecha: Date, hoy: Date): number => {
  const ms =
    inicioDelDia(fecha).getTime() - inicioDelDia(hoy).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
};

const formatearFecha = (fecha: Date): string => {
  // `fecha` is a calendar Date built from Y/M/D in the function runtime;
  // format those components directly to avoid timezone day-shifts.
  return fecha.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatearMontoRd = (monto: number): string => {
  return `RD$${new Intl.NumberFormat("es-DO").format(monto)}`;
};

const mapearPrecioMensual = (valor: number | string | null): number => {
  if (typeof valor === "number" && Number.isFinite(valor)) {
    return valor;
  }

  if (typeof valor === "string" && valor.trim().length > 0) {
    const numero = Number(valor);
    if (Number.isFinite(numero)) {
      return numero;
    }
  }

  return 1000;
};

const obtenerMiembros = (
  miembros: NegocioPremium["usuarios_negocio"],
): Array<{ auth_user_id: string; rol: string }> => {
  if (!miembros) {
    return [];
  }

  return Array.isArray(miembros) ? miembros : [miembros];
};

const etiquetaPagoCiclo = (ciclo: CicloFacturacion): string => {
  return ciclo === "anual" ? "pago anual" : "pago mensual";
};

const construirHtmlCorreoPago = (params: {
  nombreNegocio: string;
  montoTexto: string;
  fechaTexto: string;
  tipo: TipoRecordatorioPago;
  ciclo: CicloFacturacion;
}): string => {
  const etiqueta = etiquetaPagoCiclo(params.ciclo);
  const titulo =
    params.tipo === "vence_hoy"
      ? `Tu ${etiqueta} vence hoy`
      : `Tu próximo ${etiqueta} es en 5 días`;

  const cuerpo =
    params.tipo === "vence_hoy"
      ? `Hoy vence el ${etiqueta} de <strong style="color:#1F4B3F;">${params.montoTexto}</strong> del plan Premium de <strong style="color:#1F4B3F;">${params.nombreNegocio}</strong>. Coordínalo para mantener tu cuenta activa.`
      : `El <strong style="color:#1F4B3F;">${params.fechaTexto}</strong> vence el ${etiqueta} de <strong style="color:#1F4B3F;">${params.montoTexto}</strong> del plan Premium de <strong style="color:#1F4B3F;">${params.nombreNegocio}</strong>. Te quedan 5 días para coordinarlo.`;

  return `
    <div style="background-color:#FBF8F3;padding:32px 16px;font-family:sans-serif;">
      <div style="max-width:480px;margin:0 auto;background-color:#FFFFFF;border-radius:16px;padding:32px;">
        <img src="${LOGO_KORTAO}" alt="Kortao" style="max-height:40px;display:block;margin:0 auto 24px;" />
        <p style="color:#1C1C1A;font-size:18px;font-weight:600;margin:0 0 16px;">${titulo}</p>
        <p style="color:#1C1C1A;font-size:16px;">Hola,</p>
        <p style="color:#1C1C1A;font-size:16px;">${cuerpo}</p>
        <p style="color:#1C1C1A;font-size:16px;">Si ya coordinaste el pago, puedes ignorar este mensaje.</p>
        <hr style="border:none;border-top:1px solid #E7E2D8;margin:24px 0;" />
        <p style="color:#6B6862;font-size:13px;text-align:center;">Kortao</p>
      </div>
    </div>
  `;
};

const enviarCorreoPago = async (params: {
  correo: string;
  nombreNegocio: string;
  monto: number;
  fechaPago: Date;
  tipo: TipoRecordatorioPago;
  ciclo: CicloFacturacion;
}): Promise<void> => {
  const montoTexto = formatearMontoRd(params.monto);
  const fechaTexto = formatearFecha(params.fechaPago);
  const etiqueta = etiquetaPagoCiclo(params.ciclo);
  const asunto =
    params.tipo === "vence_hoy"
      ? `Tu ${etiqueta} vence hoy`
      : `Tu próximo ${etiqueta} es en 5 días`;

  const respuesta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Kortao <noreply@kortao.com>",
      to: params.correo,
      subject: asunto,
      html: construirHtmlCorreoPago({
        nombreNegocio: params.nombreNegocio,
        montoTexto,
        fechaTexto,
        tipo: params.tipo,
        ciclo: params.ciclo,
      }),
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`Resend falló: ${detalle}`);
  }
};

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const hoy = obtenerHoySantoDomingo();

  const { data: negocios, error } = await supabase
    .from("negocios")
    .select(
      "id, nombre, precio_mensual, ciclo_facturacion, fecha_inicio_suscripcion, usuarios_negocio(auth_user_id, rol)",
    )
    .eq("plan", "premium")
    .eq("suscripcion_activa", true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resultados: Array<{
    negocioId: string;
    tipo?: TipoRecordatorioPago;
    correo?: string;
    enviado: boolean;
    error?: string;
  }> = [];

  for (const negocio of (negocios ?? []) as unknown as NegocioPremium[]) {
    if (!negocio.fecha_inicio_suscripcion) {
      resultados.push({
        negocioId: negocio.id,
        enviado: false,
        error: "Sin fecha_inicio_suscripcion",
      });
      continue;
    }

    const ciclo = normalizarCicloFacturacion(negocio.ciclo_facturacion);

    const { data: ultimosPagos } = await supabase
      .from("pagos_negocio")
      .select("fecha_pago")
      .eq("negocio_id", negocio.id)
      .order("fecha_pago", { ascending: false })
      .limit(1);

    const fechaPagoRaw = ultimosPagos?.[0]?.fecha_pago ?? null;
    const fechaUltimoPago = fechaPagoRaw
      ? parsearFechaCalendario(String(fechaPagoRaw))
      : null;

    let proximaPago: Date;
    try {
      proximaPago = calcularProximaFechaPago(
        parsearFechaCalendario(negocio.fecha_inicio_suscripcion),
        ciclo,
        hoy,
        fechaUltimoPago,
      );
    } catch (err) {
      resultados.push({
        negocioId: negocio.id,
        enviado: false,
        error: err instanceof Error ? err.message : String(err),
      });
      continue;
    }

    const dias = diasHastaFecha(proximaPago, hoy);
    let tipo: TipoRecordatorioPago | null = null;

    if (dias === DIAS_AVISO) {
      tipo = "en_5_dias";
    } else if (dias === 0) {
      tipo = "vence_hoy";
    }

    if (!tipo) {
      continue;
    }

    const owner = obtenerMiembros(negocio.usuarios_negocio).find(
      (miembro) => miembro.rol === "dueño" || miembro.rol === "owner",
    );

    if (!owner) {
      resultados.push({
        negocioId: negocio.id,
        tipo,
        enviado: false,
        error: "Sin owner en usuarios_negocio",
      });
      continue;
    }

    const { data: usuarioData, error: errorUsuario } = await supabase.auth
      .admin.getUserById(owner.auth_user_id);

    if (errorUsuario || !usuarioData.user?.email) {
      resultados.push({
        negocioId: negocio.id,
        tipo,
        enviado: false,
        error: errorUsuario?.message ?? "Owner sin correo",
      });
      continue;
    }

    const correo = usuarioData.user.email;
    const precioMensual = mapearPrecioMensual(negocio.precio_mensual);

    try {
      await enviarCorreoPago({
        correo,
        nombreNegocio: negocio.nombre,
        monto: calcularMontoCiclo(precioMensual, ciclo),
        fechaPago: proximaPago,
        tipo,
        ciclo,
      });

      resultados.push({
        negocioId: negocio.id,
        tipo,
        correo,
        enviado: true,
      });
    } catch (err) {
      const detalle = err instanceof Error ? err.message : String(err);
      console.error(`[pagos] Correo falló para negocio ${negocio.id}:`, detalle);
      resultados.push({
        negocioId: negocio.id,
        tipo,
        correo,
        enviado: false,
        error: detalle,
      });
    }
  }

  return new Response(
    JSON.stringify({ procesadas: resultados.length, resultados }),
    { headers: { "Content-Type": "application/json" } },
  );
});
