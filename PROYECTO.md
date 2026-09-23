# No-Gi Lab — mapa del proyecto

Aplicación web para enseñar **BJJ No-Gi**. El núcleo es un mapa conceptual de técnicas y, más adelante, feedback en vídeo.

Fase actual: **1, mockup visual**. El mapa usa datos fijos en código. No hay modal de vídeo, subida de archivos, auth ni base de datos.

## Stack

- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS v4
- React Flow (`@xyflow/react`) para nodos y conexiones
- shadcn/ui (Radix) y Lucide para la interfaz
- pnpm, Node 22

Supabase o Firebase queda para la fase de backend. No está instalado.

## Arranque

```bash
pnpm install
pnpm dev
```

Abre `http://localhost:3000`. Scripts: `build`, `start`, `lint`.

## Cómo se mueve el mapa

`path` es el historial de nodos en los que el alumno ha entrado.

- En la raíz solo están iluminadas las posturas base: Montada, Guardia cerrada y Media guardia. El resto se ve apagado.
- Pulsar un nodo iluminado lo apaga (queda recorrido) y enciende a sus hijos.
- «Volver atrás» deshace un nivel: apaga el nivel actual y vuelve a iluminar el anterior.
- Si la técnica no tiene hijos, un aviso lo dice. El reproductor de vídeo llega en la fase 2; hoy el clic cambia el mapa al momento.

## Carpetas y archivos

| Ruta | Para qué sirve |
| --- | --- |
| `src/app/` | Rutas, layout y estilos globales. |
| `src/components/technique-map.tsx` | Lienzo, historial y botón de retroceso. |
| `src/components/technique-node.tsx` | Círculo de cada técnica. |
| `src/components/ui/` | Componentes de shadcn/ui. |
| `src/lib/techniques.ts` | Datos de prueba y la regla de qué está iluminado. |
| `src/lib/utils.ts` | Helper `cn`. |
| `public/` | No se usa todavía. |
| `components.json` | Configuración del CLI de shadcn. |

No hay `public/` con assets, tests, ni carpeta de API.
