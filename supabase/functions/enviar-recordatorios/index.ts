// Kortao — enviar-recordatorios Edge Function
// Runs on a schedule (see pg_cron setup in the deployment notes).
// Uses the service_role key because it runs entirely server-side,
// never exposed to a browser — this is the one place in the project
// where bypassing RLS with the service role is appropriate.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN") ?? "";
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";

const HORAS_ANTES_RECORDATORIO = 24;
const VENTANA_MINUTOS = 20;

type CitaPendiente = {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  fecha_hora: string;
  negocios: { nombre: string } | null;
};

type PlantillaWhatsapp = {
  nombre: string;
  idioma: string;
  parametrosCuerpo: string[];
};

const normalizarTelefono = (telefono: string): string => {
  return telefono.replace(/\D/g, "");
};

const formatearFecha = (fecha: Date): string => {
  return fecha.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatearHora = (fecha: Date): string => {
  return fecha.toLocaleTimeString("es-DO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatearFechaHora = (fecha: Date): string => {
  return `${formatearFecha(fecha)}, ${formatearHora(fecha)}`;
};

const extraerCodigoErrorMeta = (detalle: string): number | undefined => {
  try {
    const jsonTexto = detalle.replace(/^Error al enviar WhatsApp:\s*/, "");
    const cuerpo = JSON.parse(jsonTexto) as {
      error?: { code?: number };
    };
    return typeof cuerpo.error?.code === "number"
      ? cuerpo.error.code
      : undefined;
  } catch {
    return undefined;
  }
};

const esPlantillaInexistenteONoAprobada = (detalle: string): boolean => {
  const codigo = extraerCodigoErrorMeta(detalle);
  if (codigo === 132001) {
    return true;
  }

  const mensaje = detalle.toLowerCase();
  return mensaje.includes("template") && mensaje.includes("does not exist");
};

const enviarMensajePlantilla = async (
  telefonoDestino: string,
  plantilla: PlantillaWhatsapp,
): Promise<void> => {
  const respuesta = await fetch(
    `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: telefonoDestino,
        type: "template",
        template: {
          name: plantilla.nombre,
          language: { code: plantilla.idioma },
          components: [
            {
              type: "body",
              parameters: plantilla.parametrosCuerpo.map((texto) => ({
                type: "text",
                text: texto,
              })),
            },
          ],
        },
      }),
    },
  );

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`Error al enviar WhatsApp: ${detalle}`);
  }
};

const enviarPlantillaConFallback = async (
  telefonoDestino: string,
  preferida: PlantillaWhatsapp,
  fallback: PlantillaWhatsapp,
): Promise<void> => {
  try {
    await enviarMensajePlantilla(telefonoDestino, preferida);
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error);

    if (!esPlantillaInexistenteONoAprobada(detalle)) {
      throw error;
    }

    console.warn(
      `Plantilla WhatsApp '${preferida.nombre}' no disponible o no aprobada; usando fallback '${fallback.nombre}'.`,
    );
    await enviarMensajePlantilla(telefonoDestino, fallback);
  }
};

const enviarMensajeRecordatorio = async (
  cita: CitaPendiente,
): Promise<void> => {
  const telefono = normalizarTelefono(cita.cliente_telefono);
  const fecha = new Date(cita.fecha_hora);
  const negocioNombre = cita.negocios?.nombre ?? "tu negocio";

  // Preferred: recordatorio_cita (pending Meta approval) — fallback expected until approved.
  await enviarPlantillaConFallback(
    telefono,
    {
      nombre: "recordatorio_cita",
      idioma: "es_DO",
      parametrosCuerpo: [
        cita.cliente_nombre,
        negocioNombre,
        formatearFecha(fecha),
        formatearHora(fecha),
      ],
    },
    {
      nombre: "jaspers_market_order_confirmation_v1",
      idioma: "en_US",
      parametrosCuerpo: [
        cita.cliente_nombre,
        cita.id.slice(0, 6),
        formatearFechaHora(fecha),
      ],
    },
  );
};

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const ahora = new Date();
  const objetivo = new Date(
    ahora.getTime() + HORAS_ANTES_RECORDATORIO * 60 * 60 * 1000,
  );
  const desde = new Date(objetivo.getTime() - VENTANA_MINUTOS * 60 * 1000);
  const hasta = new Date(objetivo.getTime() + VENTANA_MINUTOS * 60 * 1000);

  const { data: citas, error } = await supabase
    .from("citas")
    .select(
      "id, cliente_nombre, cliente_telefono, fecha_hora, negocios(nombre)",
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

  const resultados: Array<{ id: string; enviado: boolean; error?: string }> =
    [];

  for (const cita of (citas ?? []) as unknown as CitaPendiente[]) {
    try {
      await enviarMensajeRecordatorio(cita);
      await supabase
        .from("citas")
        .update({ recordatorio_enviado_en: new Date().toISOString() })
        .eq("id", cita.id);
      resultados.push({ id: cita.id, enviado: true });
    } catch (err) {
      resultados.push({
        id: cita.id,
        enviado: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return new Response(
    JSON.stringify({ procesadas: resultados.length, resultados }),
    { headers: { "Content-Type": "application/json" } },
  );
});
