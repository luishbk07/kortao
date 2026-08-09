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

const enviarMensajeRecordatorio = async (
  cita: CitaPendiente,
): Promise<void> => {
  const telefono = normalizarTelefono(cita.cliente_telefono);
  const fecha = new Date(cita.fecha_hora);
  const negocioNombre = cita.negocios?.nombre ?? "tu negocio";

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
        to: telefono,
        type: "template",
        template: {
          // Placeholder while 'recordatorio_cita' is pending Meta approval.
          // Swap to the real template + real body params once approved.
          name: "jaspers_market_order_confirmation_v1",
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: cita.cliente_nombre },
                { type: "text", text: cita.id.slice(0, 6) },
                {
                  type: "text",
                  text: `${formatearFecha(fecha)}, ${formatearHora(fecha)}`,
                },
              ],
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
