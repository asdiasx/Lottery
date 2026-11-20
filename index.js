import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { selectDraws, selectDbLastDraw } from './db.js';

import { initialDbSync } from './helpers.js';
import puppeteer from 'puppeteer';
import express from 'express';

const app = express();
const myDirName = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(myDirName + '/public'));
app.set('view engine', 'ejs');

const isDev = process.env.NODE_ENV !== 'production';
const baseUrl = isDev ? 'http://localhost:3000' : (process.env.APP_URL || 'https://seek4k.com.br');

// route for ejs table
// Health check: responde na hora, SEM chamar a API da Caixa; só confere que o banco abre.
// Usado pelo Docker, pelo `make deploy` e pelo monitor de disponibilidade (UptimeRobot).
app.get('/up', async function (req, res) {
  try {
    await selectDbLastDraw();
    res.set('Cache-Control', 'no-store').type('text/plain').send('ok');
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).type('text/plain').send('unavailable');
  }
});

app.get('/lotomania', async function (req, res) {
try { await initialDbSync(); } catch (e) { console.error('Sync failed (serving cached data):', e.message); }

// select last n drawings from db
const drawings = await selectDraws(25);

// parse JSON drawing_tens for template
const parsedDrawings = drawings.map(d => ({
  ...d,
  drawing_tens: JSON.parse(d.drawing_tens)
}));

res.render('table.ejs', { drawings: parsedDrawings });
});

// PDF da tabela: gerado com Chromium (caro), por isso fica em cache por alguns minutos
// e nunca é gerado em paralelo (pedidos simultâneos esperam a mesma geração).
const PDF_PATH = './public/table.pdf';
const PDF_TTL_MS = 10 * 60 * 1000;
let pdfInProgress = null;

function fileDateSuffix() {
  const parts = new Date().toLocaleDateString().split('/');
  parts[0] = parts[0].padStart(2, '0');
  parts[1] = parts[1].padStart(2, '0');
  return [parts[1], parts[0], parts[2]].join('');
}

async function generatePdf() {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const url = isDev ? `${baseUrl}/lotomania` : `${baseUrl}/lotomania/`;
    console.log(`Generating PDF from: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.addStyleTag({ content: '#dldBtn {display: none;}' });
    await page.pdf({
      path: PDF_PATH,
      scale: 0.63,
      displayHeaderFooter: true,
      landscape: true,
      format: 'A4',
      printBackground: true,
    });
  } finally {
    // Fecha o Chrome mesmo em caso de erro (antes ficavam processos órfãos).
    if (browser) await browser.close().catch(() => {});
  }
}

async function ensureFreshPdf() {
  try {
    const stat = await fs.promises.stat(PDF_PATH);
    if (Date.now() - stat.mtimeMs < PDF_TTL_MS) return;
  } catch { /* ainda não existe */ }
  if (!pdfInProgress) pdfInProgress = generatePdf().finally(() => { pdfInProgress = null; });
  await pdfInProgress;
}

app.get('/download', async function (req, res) {
  try {
    await ensureFreshPdf();
    res.download(PDF_PATH, `LotoMania_${fileDateSuffix()}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

app.listen(3000, function () {
  console.log('Server started');
});
