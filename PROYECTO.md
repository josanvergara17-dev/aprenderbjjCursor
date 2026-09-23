# No-Gi Lab — mapa del proyecto

Aplicación web para enseñar **BJJ No-Gi**. El núcleo es un mapa conceptual de técnicas, una galería de vídeos oficiales y una cola de revisión de prácticas del alumno.

Fase actual: **2 — Auth, galería y evaluación**. El mapa de la fase 1 sigue activo. Backend preferido: **Supabase**. Sin credenciales la app arranca en **modo mock** (sesión por cookie + datos en memoria del servidor) para poder ejercitar la UI.

## Stack

- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS v4
- React Flow (`@xyflow/react`) para nodos y conexiones
- shadcn/ui (Radix) y Lucide para la interfaz
- Supabase Auth + Postgres + Storage (`@supabase/ssr`, `@supabase/supabase-js`)
- pnpm, Node 22

## Arranque

```bash
pnpm install
cp .env.example .env.local   # o deja USE_MOCK_AUTH=true
pnpm dev
```

Abre `http://localhost:3000`. Scripts: `build`, `start`, `lint`.

Atajos de escritorio (doble clic): `scripts/start-nogi-lab.bat` (Windows), `scripts/start-nogi-lab.command` (Mac), `scripts/start-nogi-lab.sh` (Linux/Mac).

### Supabase real

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ejecuta las migraciones `001`, `002` y `003` en el SQL Editor.
3. Buckets: `technique-videos`, `practice-videos`, `technique-covers` (creados por SQL).
4. Copia URL y anon key a `.env.local` y pon `NEXT_PUBLIC_USE_MOCK_AUTH=false`.
5. El primer usuario que se registre con email que contenga `master` obtiene rol `master` (o actualiza `profiles.role` a mano).

### Cuentas demo (modo mock)

| Email | Contraseña | Rol |
| --- | --- | --- |
| `alumno@nogi.lab` | `demo1234` | student |
| `maestro@nogi.lab` | `demo1234` | master |
| `admin@nogi.lab` | `demo1234` | admin |

También puedes registrarte: si el email contiene `master` o `maestro`, el rol será `master`.

## Roles

- **student**: mapa, galería de solo lectura, subir vídeo de práctica y ver estado.
- **master** / **admin**: revisión en `/evaluacion`; subida de clases en `/videos/subir`.
- **admin**: además panel `/admin/techniques`.

Protección de rutas: `src/proxy.ts`. `/videos/subir` → reviewer (master/admin). `/admin/*` → admin.

## Rutas

| Ruta | Quién | Qué |
| --- | --- | --- |
| `/login`, `/register` | público | Auth email/contraseña |
| `/` | autenticado | Mapa de técnicas (fase 1) |
| `/videos` | autenticado | Galería grid 5 columnas, máx. 50/página |
| `/videos/subir` | master/admin | Subida de clase (Mux o mock) |
| `/admin/techniques` | admin | Grafo, fotos y conexiones |
| `/evaluacion` | autenticado | Alumno: envío; Maestro: inbox + nota |

## Cómo se mueve el mapa

`path` es el historial de nodos en los que el alumno ha entrado.

- En la raíz solo están iluminadas las posturas base: Montada, Guardia cerrada y Media guardia. El resto se ve apagado.
- Pulsar un nodo iluminado abre un modal con la clase oficial (`VideoPlayer`). Al cerrar, el nodo queda recorrido y se encienden sus hijos.
- Pestaña «Ahora tú» en el modal para enviar práctica de la técnica seleccionada.
- Defensas (violeta) vs progresiones (cian) en nodos y aristas.
- «Volver atrás» deshace un nivel; con el modal abierto, solo cierra el modal.

## Carpetas y archivos

| Ruta | Para qué sirve |
| --- | --- |
| `src/app/(auth)/` | Login y registro. |
| `src/app/(app)/` | Shell con nav: mapa, vídeos, evaluación. |
| `src/app/actions/` | Server actions de auth, vídeos y entregas. |
| `src/components/` | Mapa, galería, evaluación, shell. |
| `src/lib/techniques.ts` | Datos de prueba del mapa. |
| `src/lib/supabase/` | Clientes browser/server y flag mock. |
| `src/lib/mock/` | Store en memoria + seed de vídeos. |
| `src/lib/auth/` | Tipos de sesión y helpers de rol. |
| `src/proxy.ts` | Protección de rutas y RBAC (Next.js 16). |
| `supabase/migrations/` | Schema SQL + RLS. |
| `.env.example` | Variables públicas/privadas esperadas. |

## Vídeo: Mux vs Supabase Storage

| Contenido | Dónde | Reproducción |
| --- | --- | --- |
| **Clases oficiales** (mapa + galería) | **Mux** (Direct Upload + webhook) | HLS adaptativo vía `VideoPlayer` + hls.js |
| **Prácticas de alumnos** (`submissions`) | **Supabase Storage** (`practice-videos`) | MP4 progresivo (suficiente para revisión) |

Configura `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` y el webhook `POST /api/webhooks/mux` en el dashboard de Mux.

Migraciones SQL: `001_init.sql` → `002_techniques_graph.sql` → `003_mux_covers_admin.sql`.

En producción, deja `NEXT_PUBLIC_USE_STATIC_GRAPH_FALLBACK` sin definir para que el mapa dependa de la tabla `techniques` (no del TS estático).

## Admin del mapa

- Ruta `/admin/techniques` solo rol **admin**.
- CRUD de técnicas, portadas (`technique-covers`), posiciones React Flow y conexiones padre → hijo.

## Galería

- CSS Grid `grid-cols-5`, thumbnail + título debajo.
- **Clic en tarjeta** abre reproductor (`VideoPlayer`).
- Máximo 10 filas = 50 vídeos por página. Paginación: números + Anterior / Siguiente.
- Botón maestro «Subir Nueva Técnica» (Mux si está configurado).
