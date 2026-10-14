# ==========================================
# Multi-stage Dockerfile for Victoria Frontend (Vite + React + Nginx)
# ==========================================

# 1. Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Parámetros de entorno configurables en build time
ARG VITE_API_URL=http://localhost:3000/api/v1
ARG VITE_UPLOADS_URL=http://localhost:3000
ARG VITE_STORE_WHATSAPP_NUMBER=573235087561

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_UPLOADS_URL=$VITE_UPLOADS_URL
ENV VITE_STORE_WHATSAPP_NUMBER=$VITE_STORE_WHATSAPP_NUMBER

# Copiar manifiestos e instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar SPA estática a /app/dist
RUN npm run build

# ==========================================
# 2. Production Static Server (Nginx Alpine)
# ==========================================
FROM nginx:1.27-alpine AS runner

ENV PORT=80

# Copiar configuración como plantilla para que envsubst sustituya ${PORT} automáticamente
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copiar bundle compilado desde el builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
