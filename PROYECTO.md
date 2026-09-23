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
2. Ejecuta `supabase/migrations/001_init.sql` en el SQL Editor.
3. Crea buckets `technique-videos` y `practice-videos` (públicos para lectura de thumbnails/vídeos oficiales; prácticas con políticas según el SQL).
4. Copia URL y anon key a `.env.local` y pon `NEXT_PUBLIC_USE_MOCK_AUTH=false`.
5. El primer usuario que se registre con email que contenga `master` obtiene rol `master` (o actualiza `profiles.role` a mano).

### Cuentas demo (modo mock)

| Email | Contraseña | Rol |
| --- | --- | --- |
| `alumno@nogi.lab` | `demo1234` | student |
| `maestro@nogi.lab` | `demo1234` | master |

También puedes registrarte: si el email contiene `master` o `maestro`, el rol será `master`.

## Roles

- **student**: mapa, galería de solo lectura, subir vídeo de práctica y ver estado.
- **master**: todo lo del alumno + «Subir Nueva Técnica» en `/videos` + bandeja de revisión en `/evaluacion`.

Protección de rutas: `src/proxy.ts` (convención Next.js 16; equivalente al antiguo middleware). Sin sesión → `/login`. Rutas `/videos/subir` solo master.

## Rutas

| Ruta | Quién | Qué |
| --- | --- | --- |
| `/login`, `/register` | público | Auth email/contraseña |
| `/` | autenticado | Mapa de técnicas (fase 1) |
| `/videos` | autenticado | Galería grid 5 columnas, máx. 50/página |
| `/videos/subir` | master | Formulario de técnica oficial |
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

## Galería

- CSS Grid `grid-cols-5`, thumbnail + título debajo.
- Máximo 10 filas = 50 vídeos por página. Paginación: números + Anterior / Siguiente.
- Botón maestro «Subir Nueva Técnica».
