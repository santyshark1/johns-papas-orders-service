FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema 
RUN apk add --no-cache libc6-compat

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código
COPY . .

# Build
RUN npm run build

# Exponer puerto (Render usa variable PORT)
EXPOSE 3000

# IMPORTANTE: usar el puerto dinámico de Render
CMD ["sh", "-c", "npm run start -- -p $PORT"]