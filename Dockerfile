# Establece la imagen base usando Node.js v20.10.0
FROM node:20.10.0

# Crea un directorio para la aplicación
WORKDIR /usr/src/app

# Copia el script de instalación de Playwright dentro del contenedor desde la carpeta src
COPY src/install-playwright-deps.sh ./

# Concede permisos de ejecución al script
RUN chmod +x ./install-playwright-deps.sh

# Ejecuta el script para instalar las dependencias de Playwright
RUN ./install-playwright-deps.sh

# Copia package.json y package-lock.json e instala las dependencias de la aplicación
COPY package*.json ./
RUN npm install

# Copia el código fuente de la aplicación dentro del contenedor
COPY . .

# Expone el puerto que usa tu aplicación
EXPOSE 4000

# Define el comando para ejecutar la aplicación
CMD [ "node", "index.js" ]
