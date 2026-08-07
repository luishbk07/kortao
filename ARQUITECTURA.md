# Architecture — Kortao

Layered architecture (inspired by Clean Architecture / Hexagonal),
adapted for a small Next.js project maintained by a single developer.

Core idea: **the business logic doesn't know Supabase exists.**
If you migrate from Supabase to another database tomorrow, or from web
to React Native, `domain` and `application` barely change — only
`infrastructure` and `presentation` get rewritten.

Note: domain/table/field names below are in Spanish on purpose — that's
the app's ubiquitous language, matching the real business vocabulary
(citas, negocio, cliente...). Folder/layer names (domain, application,
infrastructure, presentation) stay in English as standard architecture
terms.

```
/src
  /domain
    /booking
      booking.types.ts        → types: Booking, TimeSlot, BusinessHours...
      booking.rules.ts        → pure rules: is this time slot available?
      booking.errors.ts       → domain errors (HorarioNoDisponibleError...)
    /business
      business.types.ts
    /client
      client.types.ts

  /application
    /ports                    → interfaces that infrastructure must implement
      bookingRepository.port.ts
      notificationService.port.ts
      authService.port.ts
    /useCases
      /booking
        crearReserva.ts
        cancelarReserva.ts
        obtenerDisponibilidad.ts
      /business
        crearServicio.ts
        actualizarHorarios.ts

  /infrastructure
    /supabase
      supabaseClient.ts
      bookingRepository.supabase.ts     → implements bookingRepository.port
      businessRepository.supabase.ts
      authService.supabase.ts
    /whatsapp
      whatsappNotificationService.ts    → implements notificationService.port

  /presentation
    /app                       → Next.js routes (App Router)
      /(cliente)/reservar/[negocioSlug]/page.tsx
      /(negocio)/panel/citas/page.tsx
      /(negocio)/panel/servicios/page.tsx
      /(negocio)/panel/horarios/page.tsx
      layout.tsx
    /components
      /ui                      → MUI wrappers (Button, Card, Input...)
      /booking                 → AvailabilityCalendar, BookingCard...
      /business                → ServiceForm, HoursList...
    /hooks
      useDisponibilidad.ts
      useReservas.ts
    /theme
      theme.ts                 → color palette, typography, MUI tokens
      palette.ts

  /shared
    /utils
      fechas.ts
      validaciones.ts
    /constants
      diasSemana.ts
```

## Booking flow (concrete example)

1. `presentation/app/(cliente)/reservar/[negocioSlug]/page.tsx` renders the
   calendar and calls the `useDisponibilidad` hook
2. The hook calls the `obtenerDisponibilidad` use case (`application/useCases`)
3. The use case relies on `bookingRepository` (an interface,
   `application/ports`) without knowing Supabase sits behind it
4. `infrastructure/supabase/bookingRepository.supabase.ts` is the real
   implementation that does know Supabase — it's the only piece that does
5. When the client confirms, the `crearReserva` use case validates pure
   business rules in `domain/booking/booking.rules.ts` (e.g.: is the slot
   still free?, does it respect the minimum lead time?) before saving
6. After saving, `notificationService.enviarConfirmacion(...)` fires,
   whose real implementation (`whatsappNotificationService`) lives in
   `infrastructure/whatsapp`

## Why this matters for you specifically

- **Easy to maintain**: if WhatsApp sending breaks, you know the problem
  lives in one file inside `infrastructure/whatsapp`, not scattered
  across the whole app
- **Easy to scale to another niche**: when you want to add "clinics" or
  "gyms" after barbershops, you add a new folder under `domain` and
  reuse the whole `application` and `presentation` layer that already
  handles bookings in general
- **Easy to migrate to a native app**: if in 6 months you decide to build
  a React Native version for the business owner, `domain` and
  `application` copy over almost untouched — you only rewrite
  `presentation` with React Native components instead of MUI
- **Easy to test**: business rules in `domain` are pure functions, so
  they're testable without a real database or complicated mocks
