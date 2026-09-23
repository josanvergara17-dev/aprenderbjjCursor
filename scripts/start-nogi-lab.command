#!/bin/bash
# ============================================================
#  No-Gi Lab — arranque local (macOS / Linux)
#  1) Edita PROJECT_DIR si este archivo NO está dentro de scripts/ del repo.
#  2) En Mac: renómbralo a .command o deja este .command y hazlo ejecutable.
#  3) Doble clic (o alias en el Escritorio) para encender la app.
# ============================================================

set -euo pipefail

# Si el script vive en <repo>/scripts/, deja esta línea.
# Si lo copias al Escritorio, pon la ruta absoluta, por ejemplo:
#   PROJECT_DIR="/Users/TU_USUARIO/Documents/aprenderbjjCursor"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="${PROJECT_DIR:-$SCRIPT_DIR/..}"

cd "$PROJECT_DIR" || {
  echo "No se encuentra el proyecto en: $PROJECT_DIR"
  echo "Edita PROJECT_DIR al inicio de este archivo."
  read -r -p "Pulsa Enter para cerrar..."
  exit 1
}

if [[ ! -f package.json ]]; then
  echo "Esta carpeta no parece el repo de No-Gi Lab:"
  echo "  $(pwd)"
  echo "Edita PROJECT_DIR."
  read -r -p "Pulsa Enter para cerrar..."
  exit 1
fi

if [[ ! -f .env.local && -f .env.example ]]; then
  echo "Creando .env.local desde .env.example..."
  cp .env.example .env.local
  echo
  echo "IMPORTANTE: edita .env.local y pon tus claves de Supabase"
  echo "(NEXT_PUBLIC_USE_MOCK_AUTH=false) si quieres videos reales."
  echo
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm no está instalado. Intentando activarlo con corepack..."
  if ! command -v corepack >/dev/null 2>&1; then
    echo "Instala Node.js 22+ desde https://nodejs.org y vuelve a intentar."
    read -r -p "Pulsa Enter para cerrar..."
    exit 1
  fi
  corepack enable
  corepack prepare pnpm@10.33.3 --activate
fi

if [[ ! -d node_modules ]]; then
  echo "Instalando dependencias (pnpm install)..."
  pnpm install
fi

# Abre el navegador cuando el puerto responda (máx. ~20 s)
(
  for _ in $(seq 1 40); do
    if curl -sf "http://localhost:3000" >/dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done
  if command -v open >/dev/null 2>&1; then
    open "http://localhost:3000"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:3000"
  fi
) &

echo "Arrancando Next.js en http://localhost:3000"
echo "Cierra esta ventana (Ctrl+C) para parar el servidor."
echo
pnpm dev --port 3000
