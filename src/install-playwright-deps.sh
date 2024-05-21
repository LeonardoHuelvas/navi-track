#!/bin/bash

# Instala las dependencias necesarias para Playwright
apt-get update && \
apt-get install -y \
    libnss3 \
    libnspr4 \
    libgbm1

# Luego, instala los navegadores de Playwright
npx playwright install-deps
npx playwright install
