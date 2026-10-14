# ==========================================
# Multi-stage Dockerfile for Victoria Backend (NestJS + Prisma)
# Built on Debian Bookworm Slim for 100% glibc + OpenSSL stability
# ==========================================

# 1. Base / Dependencies & Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Instalar OpenSSL, certificados y herramientas requeridas para compilar módulos nativos
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar manifiestos de dependencias y esquema Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias completas y compilar Prisma Client
RUN npm ci
RUN npx prisma generate

# Copiar código fuente y configuración de compilación
COPY tsconfig*.json nest-cli.json ./
COPY src ./src/

# Compilar NestJS y el script de seed para producción
RUN npm run build
RUN npx tsc prisma/seed.ts --outDir dist/prisma --target ES2022 --module CommonJS --moduleResolution node --esModuleInterop --skipLibCheck

# Remover dependencias de desarrollo para aligerar la imagen final
RUN npm prune --omit=dev

# ==========================================
# 2. Production Runner stage
# ==========================================
FROM node:20-slim AS runner

WORKDIR /app

# Instalar dumb-init para correcto manejo de señales PID 1, OpenSSL y certificados
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

# En Debian node:20-slim el usuario 'node' (uid: 1000) ya existe con su /home/node
# Crear directorio de subida de archivos y asignar permisos
RUN mkdir -p /app/uploads && chown -R node:node /app

# Copiar script de inicialización y dar permisos
COPY --chown=node:node docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Copiar artefactos de compilación y dependencias de producción
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/package.json ./package.json

USER node

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--", "./docker-entrypoint.sh"]
CMD ["node", "dist/src/main"]
