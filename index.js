import 'dotenv/config';
import express from 'express';
import { chromium } from 'playwright';
import helmet from 'helmet';
import { check, validationResult } from 'express-validator';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de __dirname para módulos ES
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet()); // Añade seguridad a la aplicación
app.use(express.json()); // Permite el análisis de JSON en las solicitudes

// Configuración para servir archivos estáticos desde el directorio "data"
const staticDir = path.join(__dirname, 'data');
app.use('/data', express.static(staticDir));

// Middleware para validar los parámetros
const validateParams = [
    check('number').trim().isLength({ min: 1 }).withMessage('El parámetro number es requerido.'),
    check('type').trim().isLength({ min: 1 }).withMessage('El parámetro type es requerido.'),
    check('sealine').trim().isLength({ min: 1 }).withMessage('El parámetro sealine es requerido.')
];

// Ruta principal
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API REST' });
});

// Ruta para obtener datos de ZIM
app.get('/getDataZIM', validateParams, async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { number, type, sealine } = req.query;

    try {
        const result = await getDataZIM(number, type, sealine);
        res.json(result);
    } catch (error) {
        console.error('Error en la ruta /getDataZIM:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

// Función para obtener datos de ZIM
async function getDataZIM(number, type, sealine) {
    console.log('getDataZIM called with parameters:', { number, type, sealine });

    const url = `https://www.searates.com/es/container/tracking/?number=${number}&type=${type}&sealine=${sealine}`;
    let browser = null;

    try {
        // Iniciar el navegador Chromium
        browser = await chromium.launch({
            headless: true,
        });

        console.log('Launching Playwright browser...');
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle' });

        // Evaluar el HTML de un elemento específico
        const element1 = await page.evaluateHandle(() => {
            return document.querySelector("#tracking_system_root").shadowRoot.querySelector("#app-root > div.jNVSgr > div.sTC0fR > div.OZ_R4c");
        });

        const html1 = await page.evaluate(element => element.outerHTML, element1);

        // Tomar una captura de pantalla de otro elemento específico (el mapa)
        const element2 = await page.evaluateHandle(() => {
            return document.querySelector("#tracking_system_root").shadowRoot.querySelector("#app-root > div.jNVSgr > div.bQFM_E");
        });

        const screenshotPath = path.join(staticDir, 'element2.png');
        await element2.screenshot({ path: screenshotPath });

        console.log('Scraping and screenshot completed successfully');
        return { html1, screenshotPath: '/data/element2.png' };
    } catch (error) {
        console.error("Error occurred while getting data from ZIM:", error);
        throw new Error(`Failed to get data from ZIM: ${error.message}`);
    } finally {
        if (browser) {
            console.log('Closing Playwright browser...');
            await browser.close();
        }
    }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

export default app;