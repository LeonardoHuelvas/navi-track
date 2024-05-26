# Proyecto de Web Scraping con Playwright y Despliegue en Google Cloud Run

Este proyecto consiste en una aplicación Node.js que utiliza Playwright para realizar web scraping. La aplicación está desplegada en Google Cloud Run para garantizar escalabilidad y fiabilidad.

## Requisitos

- Node.js (versión 14 o superior)
- Google Cloud SDK
- Cuenta de Google Cloud con un proyecto configurado
- Docker (opcional, para pruebas locales)

## Configuración del Proyecto

### 1. Clonar el repositorio

```sh
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio

2. Instalar dependencias

sh

npm install

3. Configurar las variables de entorno

Crea un archivo .env en la raíz del proyecto y añade las variables necesarias. Por ejemplo:

env

API_KEY=tu_api_key

4. Ejecutar la aplicación localmente

Puedes probar la aplicación localmente utilizando Node.js:

sh

npm start

5. Crear un contenedor Docker (opcional)

Para probar la aplicación en un entorno Docker:

sh

docker build -t tu-imagen .
docker run -p 8080:8080 tu-imagen
