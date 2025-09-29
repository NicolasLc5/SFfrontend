# Usar Node.js como base
FROM node:18

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos del frontend
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Construir el frontend
RUN npm run build

# Servir el frontend con un servidor web ligero (ej. nginx)
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
