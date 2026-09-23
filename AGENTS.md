# No-Gi Lab

Aplicación Next.js (App Router) para enseñar BJJ No-Gi. La fase actual es el mapa conceptual con datos en memoria.

## Desarrollo

```bash
pnpm install
pnpm dev
```

El servidor local queda en el puerto 3000.

## Estructura

- `src/app/page.tsx` — página principal; monta el mapa
- `src/app/layout.tsx` — layout, idioma `es` y fuentes
- `src/app/globals.css` — Tailwind v4 y tema oscuro
- `src/components/technique-map.tsx` — estado de navegación (`useState` del historial) y React Flow
- `src/components/technique-node.tsx` — círculo iluminado, recorrido o apagado
- `src/lib/techniques.ts` — técnicas de prueba y relaciones `children`
- `src/components/ui/button.tsx` — botón de shadcn/ui
- `PROYECTO.md` — mapa de arquitectura
- `TODO.md` — fases pendientes

No hay API, auth ni almacenamiento. El modal de vídeo, «Ahora Tú» y el panel de admin no están en esta fase.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
