# Development plan — Kortao (niche: barbershops & salons)

How to use this document: each phase has a prompt ready to paste into
Cursor's chat (using Agent/Composer, not just autocomplete). Before
Phase 1, make sure `.cursorrules`, `ARQUITECTURA.md` and `DISEÑO.md` are
in the repo root — Cursor will pick them up as context.

Stack: Next.js 14+ (App Router) · TypeScript · MUI v5 · Supabase
(Auth + Postgres + Storage) · deployed on Vercel.

Note: domain terms in the prompts below (table names, field names, use
case names like `crearReserva`) are intentionally kept in Spanish,
matching the app's ubiquitous language. Everything else is in English
for clarity to the AI.

---

## Phase 0 — Repo setup

1. Create the GitHub repo: `github.com/luishbk07/reservas-app`
2. Clone it locally and open the folder in Cursor
3. Copy `.cursorrules`, `ARQUITECTURA.md` and `DISEÑO.md` into it

**Prompt for Cursor:**

```
Initialize a Next.js 14 project called "kortao" (use this as the
package.json name) with App Router and TypeScript, using
create-next-app. Set up MUI v5 (with Emotion as the styling engine) and
the Inter font via next/font/google. Create the folder structure
described in ARQUITECTURA.md inside /src, with .gitkeep files in empty
folders. Apply the theme from DISEÑO.md in a ThemeProvider wrapping the
whole app in the root layout. Set the page title/metadata to "Kortao"
in the root layout. Follow all rules in .cursorrules (no semicolons,
single quotes, arrow functions, camelCase, no any). Keep domain names
(folders like negocio, cliente, citas; functions like crearReserva) in
Spanish exactly as written in ARQUITECTURA.md — do not translate them
to English.
```

---

## Phase 1 — Data model in Supabase

Before writing code, define the schema. Base tables for the MVP:

- `negocios` (id, nombre, slug, telefonoWhatsapp, direccion, colorAcento, creadoEn)
- `servicios` (id, negocioId, nombre, duracionMinutos, precio, activo)
- `horariosNegocio` (id, negocioId, diaSemana, horaInicio, horaFin)
- `citas` (id, negocioId, servicioId, clienteNombre, clienteTelefono, fechaHora, estado, creadoEn)
- `usuariosNegocio` (id, negocioId, authUserId, rol) — links the Supabase Auth login to the business

**Prompt for Cursor:**

```
Generate the SQL migration for Supabase with the tables negocios,
servicios, horariosNegocio, citas and usuariosNegocio according to this
schema: [paste the schema above]. Include foreign keys, indexes on the
fields that will be filtered often (negocioId, fechaHora, slug), and
basic Row Level Security: a negocio can only read/write its own data,
but availability data must be publicly readable so a client can view
open time slots without logging in.
```

---

## Phase 2 — Domain and application layers (business logic, no UI yet)

**Prompt for Cursor:**

```
In src/domain/booking, create booking.types.ts with the types Booking,
TimeSlot and BusinessHours, and booking.rules.ts with pure functions:
esHorarioDisponible(horariosNegocio, citasExistentes, fechaHoraPropuesta,
duracionServicio) and generarSlotsDisponibles(horariosNegocio,
citasExistentes, fecha, duracionServicio). Everything must be pure
functions with no external dependencies, following .cursorrules. Then in
src/application/ports, define the interfaces bookingRepository.port.ts
and notificationService.port.ts that infrastructure will implement
later. Don't implement Supabase yet, only the types and interfaces.
Keep all domain/function names in Spanish exactly as given above.
```

---

## Phase 3 — Supabase infrastructure

**Prompt for Cursor:**

```
Create src/infrastructure/supabase/supabaseClient.ts with the Supabase
client using environment variables. Then create
bookingRepository.supabase.ts implementing the bookingRepository.port
interface defined earlier, with functions to: fetch a negocio's citas
within a date range, create a cita, cancel a cita. Only use the Supabase
client inside this file, never exposed directly to application or
domain.
```

---

## Phase 4 — Client-side UI (book an appointment, public, no login)

**Prompt for Cursor:**

```
Create the page
src/presentation/app/(cliente)/reservar/[negocioSlug]/page.tsx showing:
business info, list of servicios (using MUI Card components), a date
picker, and the available time slots for that day using
generarSlotsDisponibles. When a slot is selected, ask for the client's
name and phone in a simple form, and on confirm call the crearReserva
use case. Use the theme from DISEÑO.md, MUI Icons in outlined style,
mobile-first layout, no inline styles unless truly necessary. All UI
copy (labels, buttons, messages) must be in Spanish since that's the
app's language — only the code itself follows the English-instruction,
Spanish-domain-naming convention.
```

---

## Phase 5 — Business-side UI (admin panel, with login)

**Prompt for Cursor:**

```
Implement authentication with Supabase Auth (email/password) for the
business panel at src/presentation/app/(negocio)/panel. Create the
pages: citas/page.tsx (list of today's citas with status, using MUI
DataGrid or a list of Cards), servicios/page.tsx (CRUD for servicios),
horarios/page.tsx (configure business hours per day of week). Protect
these routes with middleware that redirects to login if there's no
active session. UI copy in Spanish, code and comments in English.
```

---

## Phase 6 — WhatsApp notifications

**Prompt for Cursor:**

```
Create src/infrastructure/whatsapp/whatsappNotificationService.ts
implementing notificationService.port.ts, using the WhatsApp Business
Cloud API (Meta) to send: an immediate confirmation when a cita is
created, and a scheduled reminder. Implement the functions
enviarConfirmacion and enviarRecordatorio, calling Meta's API over HTTP
with fetch, reading the token from environment variables. For the
scheduled reminder, use Supabase Edge Functions with a cron job that
checks upcoming citas at a regular interval.
```

---

## Phase 7 — Polish, PWA and deploy

**Prompt for Cursor:**

```
Configure the project as an installable PWA (manifest.json, icon, basic
service worker with next-pwa or Next 14's native config). Set the PWA
name to "Kortao" and short_name to "Kortao" in manifest.json, using the
primary color from DISEÑO.md (#1F4B3F) as theme_color and
background.default (#FBF8F3) as background_color. Add consistent
loading and error states across the app using MUI components (Skeleton,
Alert). Check that no component uses unnecessary inline styles, and
that MUI's default forced-uppercase text is disabled everywhere.
```

Then: connect the repo to Vercel for automatic deploy on every push to
`main`, and configure the Supabase and WhatsApp environment variables in
the Vercel dashboard (never in the code or the repo).

---

## Recommended real-world work order

Don't fully finish each phase before moving to the next — it's healthier
to go end-to-end with the bare minimum first:

1. Phases 0-3 complete (technical foundation)
2. Phase 4 minimal: a client can view a test negocio and book a cita
3. Phase 5 minimal: the negocio can see that cita in its panel
4. At that point you have a full end-to-end flow to test with a real
   business
5. Phase 6 (WhatsApp) and Phase 7 (polish/PWA) after that, once the
   basic flow is validated and useful to someone
