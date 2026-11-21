# ==============================================================================
# Build Stage: Compilación Angular
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Aprovechar caché de dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente y compilar bundle para producción
COPY . .
RUN npm run build

# ==============================================================================
# Runtime Stage: Nginx Servidor Web y Proxy Inverso
# ==============================================================================
FROM nginx:1.27-alpine AS runner

# Limpiar configuraciones predeterminadas de Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copiar configuración personalizada optimizada con SPA y Proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los artefactos estáticos compilados de Angular
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Exponer el puerto estándar HTTP
EXPOSE 80

# Ejecución de Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
