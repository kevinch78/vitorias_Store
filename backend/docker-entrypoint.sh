#!/bin/sh
set -e

echo "=========================================="
echo " Victoria Store Backend - Container Boot"
echo "=========================================="

echo "==> [1/3] Verificando y aplicando esquema con Prisma..."
npx prisma db push --skip-generate

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

echo "==> [3/3] Lanzando servidor NestJS en producción..."
exec "$@"
