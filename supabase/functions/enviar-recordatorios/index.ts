// Kortao — enviar-recordatorios Edge Function
// Runs on a schedule via pg_cron (see migration 0005).
// Uses the service_role key because it runs entirely server-side,
// never exposed to a browser.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN") ?? "";
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

const HORAS_ANTES_RECORDATORIO = 24;
const VENTANA_MINUTOS = 20;
const LOGO_KORTAO_RESPALDO = "https://kortao.com/brand/kortao-email-logo.png";

type CitaPendiente = {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_correo: string | null;
  fecha_hora: string;
  negocios: { nombre: string; logo_url: string | null } | null;
};

const normalizarTelefono = (telefono: string): string => {
  return telefono.replace(/\D/g, "");
};

const formatearFecha = (fecha: Date): string => {
  return fecha.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "long",
    timeZone: "America/Santo_Domingo",
  });
};

const formatearHora = (fecha: Date): string => {
  return fecha.toLocaleTimeString("es-DO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Santo_Domingo",
  });
};

const enviarPlantillaWhatsapp = async (
  telefono: string,
  nombrePlantilla: string,
  idioma: string,
  parametros: string[],
): Promise<Response> => {
  return fetch(
    `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: telefono,
        type: "template",
        template: {
          name: nombrePlantilla,
          language: { code: idioma },
          components: [
            {
              type: "body",
              parameters: parametros.map((texto) => ({ type: "text", text: texto })),
            },
          ],
        },
      }),
    },
  );
};

const enviarWhatsappConFallback = async (cita: CitaPendiente): Promise<void> => {
  const telefono = normalizarTelefono(cita.cliente_telefono);
  const fecha = new Date(cita.fecha_hora);
  const negocioNombre = cita.negocios?.nombre ?? "tu negocio";
  const fechaTexto = formatearFecha(fecha);
  const horaTexto = formatearHora(fecha);

  const respuestaReal = await enviarPlantillaWhatsapp(
    telefono,
    "recordatorio_cita_v2",
    "es_DO",
    [cita.cliente_nombre, negocioNombre, fechaTexto, horaTexto],
  );

  if (respuestaReal.ok) {
    return;
  }

  const detalleError = await respuestaReal.text();
  console.warn(
    `[recordatorio] plantilla real falló para cita ${cita.id}, usando fallback:`,
    detalleError,
  );

  const respuestaFallback = await enviarPlantillaWhatsapp(
    telefono,
    "jaspers_market_order_confirmation_v1",
    "en_US",
    [cita.cliente_nombre, cita.id.slice(0, 6), `${fechaTexto}, ${horaTexto}`],
  );

  if (!respuestaFallback.ok) {
    const detalleFallback = await respuestaFallback.text();
    throw new Error(`WhatsApp falló (real y fallback): ${detalleFallback}`);
  }
};

const construirHtmlCorreoRecordatorio = (cita: CitaPendiente): string => {
  const fecha = new Date(cita.fecha_hora);
  const negocioNombre = cita.negocios?.nombre ?? "tu negocio";
  const logoUrl = cita.negocios?.logo_url ?? LOGO_KORTAO_RESPALDO;
  const alturaLogo = cita.negocios?.logo_url ? "60" : "40";

  return `
    <div style="background-color:#FBF8F3;padding:32px 16px;font-family:sans-serif;">
      <div style="max-width:480px;margin:0 auto;background-color:#FFFFFF;border-radius:16px;padding:32px;">
        <img src="${logoUrl}" alt="${negocioNombre}" style="max-height:${alturaLogo}px;display:block;margin:0 auto 24px;" />
        <p style="color:#1C1C1A;font-size:16px;">Hola ${cita.cliente_nombre},</p>
        <p style="color:#1C1C1A;font-size:16px;">
          Te recordamos tu cita en <strong style="color:#1F4B3F;">${negocioNombre}</strong>
          mañana <strong style="color:#1F4B3F;">${formatearFecha(fecha)}</strong>
          a las <strong style="color:#1F4B3F;">${formatearHora(fecha)}</strong>.
        </p>
        <p style="color:#1C1C1A;font-size:16px;">¡Te esperamos!</p>
        <hr style="border:none;border-top:1px solid #E7E2D8;margin:24px 0;" />
        <p style="color:#6B6862;font-size:13px;text-align:center;">Kortao</p>
      </div>
    </div>
  `;
};

const enviarCorreoRecordatorio = async (cita: CitaPendiente): Promise<void> => {
  if (!cita.cliente_correo) {
    return;
  }

  const negocioNombre = cita.negocios?.nombre ?? "tu negocio";

  const respuesta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Kortao <noreply@kortao.com>",
      to: cita.cliente_correo,
      subject: `Recordatorio: tu cita en ${negocioNombre} es mañana`,
      html: construirHtmlCorreoRecordatorio(cita),
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`Resend falló: ${detalle}`);
  }
};

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const ahora = new Date();
  const objetivo = new Date(ahora.getTime() + HORAS_ANTES_RECORDATORIO * 60 * 60 * 1000);
  const desde = new Date(objetivo.getTime() - VENTANA_MINUTOS * 60 * 1000);
  const hasta = new Date(objetivo.getTime() + VENTANA_MINUTOS * 60 * 1000);

  const { data: citas, error } = await supabase
    .from("citas")
    .select(
      "id, cliente_nombre, cliente_telefono, cliente_correo, fecha_hora, negocios(nombre, logo_url)",
    )
    .in("estado", ["pendiente", "confirmada"])
    .is("recordatorio_enviado_en", null)
    .gte("fecha_hora", desde.toISOString())
    .lte("fecha_hora", hasta.toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const resultados: Array<
    { id: string; whatsapp: boolean; correo: boolean; error?: string }
  > = [];

  for (const cita of (citas ?? []) as unknown as CitaPendiente[]) {
    let whatsappOk = false;
    let correoOk = false;
    let errorTexto: string | undefined;

    try {
      await enviarWhatsappConFallback(cita);
      whatsappOk = true;
    } catch (err) {
      errorTexto = err instanceof Error ? err.message : String(err);
      console.error(`[recordatorio] WhatsApp falló para cita ${cita.id}:`, errorTexto);
    }

    try {
      await enviarCorreoRecordatorio(cita);
      correoOk = cita.cliente_correo != null;
    } catch (err) {
      const detalleCorreo = err instanceof Error ? err.message : String(err);
      console.error(`[recordatorio] Correo falló para cita ${cita.id}:`, detalleCorreo);
    }

    if (whatsappOk) {
      await supabase
        .from("citas")
        .update({ recordatorio_enviado_en: new Date().toISOString() })
        .eq("id", cita.id);
    }

    resultados.push({ id: cita.id, whatsapp: whatsappOk, correo: correoOk, error: errorTexto });
  }

  return new Response(
    JSON.stringify({ procesadas: resultados.length, resultados }),
    { headers: { "Content-Type": "application/json" } },
  );
});