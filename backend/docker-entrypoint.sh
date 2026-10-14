#!/bin/sh
set -e

echo "=========================================="
echo " Victoria Store Backend - Container Boot"
echo "=========================================="

# 1. Esperar y sincronizar esquema con Prisma (Reintentos automáticos si la BD aún está iniciando)
echo "==> [1/3] Sincronizando esquema de base de datos..."
MAX_RETRIES=15
RETRY_COUNT=0
SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if node node_modules/prisma/build/index.js db push --accept-data-loss --skip-generate; then
    echo "==> [1/3] Base de datos sincronizada exitosamente con Prisma."
    SUCCESS=true
    break
  else
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo "--> [1/3] Intento $RETRY_COUNT de $MAX_RETRIES. La base de datos aún no responde. Reintentando en 3s..."
    sleep 3
  fi
done

if [ "$SUCCESS" = false ]; then
  echo "ERROR CRÍTICO: No fue posible conectar con la base de datos tras $MAX_RETRIES intentos."
  exit 1
fi

# 2. Poblar datos iniciales si RUN_SEED está activo
if [ "$RUN_SEED" = "true" ]; then
  echo "==> [2/3] Variable RUN_SEED activada. Poblando catálogo..."
  if [ -f "dist/prisma/seed.js" ]; then
    node dist/prisma/seed.js || echo "Aviso: Seed finalizó con observaciones."
  else
    echo "Aviso: dist/prisma/seed.js no encontrado. Omitiendo seed."
  fi
else
  echo "==> [2/3] RUN_SEED no solicitado. Omitiendo seed."
fi

# 3. Lanzar servidor NestJS
echo "==> [3/3] Lanzando servidor NestJS en producción..."
if [ -f "dist/src/main.js" ]; then
  exec node dist/src/main.js
elif [ -f "dist/main.js" ]; then
  exec node dist/main.js
else
  exec "$@"
fi
