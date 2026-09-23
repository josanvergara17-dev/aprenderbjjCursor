# No-Gi Lab

Aplicación Next.js (App Router) para enseñar BJJ No-Gi.

## Fase actual: 2

Auth + RBAC (`student` | `master`), galería `/videos` y «Revisión de Técnicas» en `/evaluacion`. El mapa de la fase 1 sigue en `/`.

## Desarrollo

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Por defecto `NEXT_PUBLIC_USE_MOCK_AUTH=true` (sin Supabase). Cuentas demo: `alumno@nogi.lab` / `maestro@nogi.lab` — contraseña `demo1234`.

Para Supabase real: ejecuta `supabase/migrations/001_init.sql`, crea buckets, pon URL + anon key y `NEXT_PUBLIC_USE_MOCK_AUTH=false`.

Detalle de carpetas: `PROYECTO.md`. Backlog: `TODO.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
