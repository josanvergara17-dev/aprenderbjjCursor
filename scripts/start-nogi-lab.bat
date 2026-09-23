@echo off
setlocal EnableExtensions
title No-Gi Lab

REM ============================================================
REM  No-Gi Lab — arranque local (Windows)
REM  1) Edita PROJECT_DIR si este .bat NO está dentro de la carpeta del repo.
REM  2) Guarda este archivo (o un acceso directo a él) en el Escritorio.
REM  3) Doble clic para encender el servidor y abrir el navegador.
REM ============================================================

REM Si el .bat vive en  <repo>\scripts\  deja esta línea.
REM Si lo copias al Escritorio, pon la ruta completa, por ejemplo:
REM   set "PROJECT_DIR=C:\Users\TU_USUARIO\Documents\aprenderbjjCursor"
set "PROJECT_DIR=%~dp0.."

cd /d "%PROJECT_DIR%" || (
  echo No se encuentra el proyecto en:
  echo   %PROJECT_DIR%
  echo Edita PROJECT_DIR al inicio de este archivo.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo Esta carpeta no parece el repo de No-Gi Lab:
  echo   %CD%
  echo Edita PROJECT_DIR.
  pause
  exit /b 1
)

if not exist ".env.local" (
  if exist ".env.example" (
    echo Creando .env.local desde .env.example...
    copy /Y ".env.example" ".env.local" >nul
    echo.
    echo IMPORTANTE: edita .env.local y pon tus claves de Supabase
    echo ^(NEXT_PUBLIC_USE_MOCK_AUTH=false^) si quieres videos reales.
    echo.
  )
)

where pnpm >nul 2>&1
if errorlevel 1 (
  echo pnpm no esta instalado. Intentando activarlo con corepack...
  where corepack >nul 2>&1
  if errorlevel 1 (
    echo Instala Node.js 22+ desde https://nodejs.org y vuelve a abrir esta ventana.
    pause
    exit /b 1
  )
  call corepack enable
  call corepack prepare pnpm@10.33.3 --activate
)

if not exist "node_modules\" (
  echo Instalando dependencias ^(pnpm install^)...
  call pnpm install
  if errorlevel 1 (
    echo Fallo pnpm install.
    pause
    exit /b 1
  )
)

echo Abriendo http://localhost:3000 en unos segundos...
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3000"

echo Arrancando Next.js...
echo Cierra esta ventana para parar el servidor.
echo.
call pnpm dev --port 3000

pause
