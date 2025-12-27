# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve
FROM nginx:alpine
# Copiamos el build de Angular al directorio de Nginx
COPY --from=build /app/dist/helpdesk-frontend/browser /usr/share/nginx/html
# Copiamos una config básica de Nginx para manejar el routing de Angular
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80