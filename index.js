import 'dotenv/config';
import express from 'express';
import { chromium } from 'playwright';
import helmet from 'helmet';
import { check, validationResult } from 'express-validator';

const app = express();

app.use(helmet());

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self'; frame-src 'self'; report-uri /csp-violation-report-endpoint"
    );
    next();
});

app.use((req, res, next) => {
    console.log('Solicitud recibida en:', req.path);
    next();
});

app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API REST' });
});

const validateGetDataZIM = [
    check('number').trim().isLength({ min: 1 }).withMessage('El parámetro number es requerido.'),
    check('type').trim().isLength({ min: 1 }).withMessage('El parámetro type es requerido.'),
    check('sealine').trim().isLength({ min: 1 }).withMessage('El parámetro sealine es requerido.')
];

app.get('/getDataZIM', validateGetDataZIM, async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { number, type, sealine } = req.query;

    try {
        console.log('Calling getDataZIM with parameters:', { number, type, sealine });
        const htmls = await getDataZIM(number, type, sealine);
        console.log('Response from getDataZIM:', htmls);
        res.json(htmls);
    } catch (error) {
        console.error('Error en la ruta /getDataZIM:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

app.post('/csp-violation-report-endpoint', express.json(), (req, res) => {
    console.log('CSP Violation:', req.body);
    res.status(204).end();
});

async function getDataZIM(number, type, sealine) {
    console.log('getDataZIM called with parameters:', { number, type, sealine });

    if (!number || !type || !sealine) {
        throw new Error("Invalid input parameters. Please provide number, type, and sealine.");
    }


    const url = `https://www.searates.com/es/container/tracking/?number=${number}&type=${type}&sealine=${sealine}`;
    let browser = null;

    try {
        const executablePath = process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath();

        if (!executablePath) {
            throw new Error("Chromium executable path not found");
        }

        browser = await chromium.launch({
            args: chromium.args,
            executablePath,
            headless: true,
        });

        console.log('Launching Playwright browser...');
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle' });

        const html1 = await page.evaluate(() => {
            const shadowRoot = document.querySelector("#tracking_system_root").shadowRoot;
            const trackingElement = shadowRoot.querySelector("#app-root > div.jNVSgr > div.sTC0fR > div.OZ_R4c");
            return trackingElement ? trackingElement.outerHTML : null;
        });

        console.log('Scraping completed successfully');
        return { html1 };
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