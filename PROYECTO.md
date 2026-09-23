# No-Gi Lab — mapa del proyecto

Aplicación web de aprendizaje **No-Gi BJJ**: mapa de técnicas desbloqueable, catálogo filtrable y envío de vídeos al instructor (“Ahora Tú”).

Origen: export de **Figma Make**. Stack: React 19, TypeScript, Vite 8, Tailwind CSS v4, pnpm.

Hoy es un **prototipo de frontend**: todo el estado vive en memoria (se pierde al recargar). No hay API, auth ni persistencia.

## Arranque

```bash
pnpm install
pnpm dev
```

Servidor Vite (puerto `PORT` o **8443**). Scripts: `build`, `preview`, `format` (`oxfmt`).

## Arquitectura lógica

```
index.html → src/main.tsx → App (src/App.tsx)
                              ├─ lee INITIAL_NODES (src/data.ts)
                              ├─ tabs: mapa | tecnicas | ahorat
                              ├─ MapView (SVG + edges)
                              ├─ TechniquesView (filtros + grid)
                              ├─ AhoraTuView (form + historial mock)
                              └─ NodeModal (detalle + completar)
```

- **Progreso:** marcar un nodo `completed` recorre el grafo y pasa a `available` a los hijos cuyos padres están todos completados.
- **Alias:** `@/` apunta a `src/`.

## Carpetas y archivos

| Ruta | Para qué sirve |
|------|----------------|
| `src/` | Código de la app. Único sitio a tocar para producto. |
| `src/App.tsx` | UI completa: header, tabs, mapa SVG, listado, formulario, modal. |
| `src/data.ts` | Tipos del dominio y `INITIAL_NODES` (grafo, textos, tips, coordenadas). |
| `src/main.tsx` | Monta React en `#root` e importa estilos. |
| `src/index.css` | Tailwind v4, `@theme`, fuentes, animaciones (pulse, scan, scroll del mapa). |
| `src/vite-env.d.ts` | Tipos de Vite. |
| `index.html` | Shell HTML (slots Figma: lang/title). |
| `vite.config.ts` | Vite + React + Tailwind + plugins Figma Make (site, overlay, kit). |
| `package.json` / `pnpm-lock.yaml` | Dependencias y scripts. |
| `tsconfig.json` | TS strict, paths `@/*`. |
| `.mise.toml` | Versiones: Node 22, pnpm 10. |
| `.gitignore` | Ignora `node_modules`, `dist`, `.env*`, etc. |
| `.figma/make/` | Config y scripts del entorno Figma Make (no es lógica de BJJ). |
| `.figma/make/site.json` | Título/SEO/robots del preview Figma. |
| `AGENTS.md` / `CLAUDE.md` | Notas del scaffold Figma para agentes. |
| `.cursorrules` | Directrices de estilo y stack para Cursor. |
| `TODO.md` | Backlog de trabajo. |

No hay `public/`, tests, router ni carpeta de componentes extraída todavía.

## Superficies de producto

1. **Mapa de técnicas** — canvas SVG (~1050×490), leyenda por categoría, nodos bloqueados/disponibles/completados.
2. **Técnicas** — stats + filtros categoría/dificultad + tarjetas.
3. **Ahora Tú** — subida de vídeo (solo estado local) e historial con mocks (`Carlos M.`, `Ana R.`).

## Decisiones actuales (no romperlas sin motivo)

- Un solo árbol de técnicas, no curriculum por cinturón.
- Completar es auto-servicio del alumno (sin validación de profesor).
- Vídeo de técnica en el modal: placeholder.
- Envíos de alumno: UI lista; sin almacenamiento real.
