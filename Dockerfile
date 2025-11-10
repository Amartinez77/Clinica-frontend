# Multi-stage Dockerfile para la aplicación Angular (Clinica-frontend)
# Stage 1: build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar cache
COPY package.json package-lock.json* ./

# Instalar dependencias (incluye devDependencies para poder compilar)
RUN npm ci --silent

# Copiar el resto del proyecto y construir
COPY . .
RUN npm run build --configuration=production

# Stage 2: servidor Nginx para servir los archivos estáticos
FROM nginx:stable-alpine AS production

# Copiar artefactos compilados desde el stage de build
COPY --from=builder /app/dist/frontend /usr/share/nginx/html

# Copiar configuración personalizada de nginx (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
