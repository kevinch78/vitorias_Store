# ==========================================
# Multi-stage Dockerfile for Victoria Backend (NestJS + Prisma)
# ==========================================

# 1. Base / Dependencies & Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias necesarias para compilar módulos nativos (bcrypt, sharp) y OpenSSL para Prisma
RUN apk add --no-cache libc6-compat python3 make g++ openssl

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
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar dumb-init para correcto manejo de señales PID 1, libc6-compat y OpenSSL para Prisma engine
RUN apk add --no-cache dumb-init libc6-compat openssl

ENV NODE_ENV=production
ENV PORT=3000

# Crear usuario sin privilegios para seguridad y blindaje
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Crear directorio de subida de archivos y asignar permisos
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# Copiar script de inicialización y dar permisos
COPY --chown=nodejs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Copiar artefactos de compilación y dependencias de producción
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--", "./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
