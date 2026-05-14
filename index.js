import path from 'path';
import { fileURLToPath } from 'url';
import { selectDraws } from './db.js';

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
app.get('/lotomania', async function (req, res) {
await initialDbSync();

// select last n drawings from db
const drawings = await selectDraws(25);

// parse JSON drawing_tens for template
const parsedDrawings = drawings.map(d => ({
  ...d,
  drawing_tens: JSON.parse(d.drawing_tens)
}));

res.render('table.ejs', { drawings: parsedDrawings });
});

// route to generate pdf
app.get('/download', async function (req, res) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const url = isDev ? `${baseUrl}/lotomania` : `${baseUrl}/lotomania/`;
    console.log(`Generating PDF from: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.addStyleTag({ content: '#dldBtn {display: none;}' });

    const date = new Date().toLocaleDateString();
    const dateFormater = (date) => {
      date = date.split('/');
      date[0] = date[0].padStart(2, '0');
      date[1] = date[1].padStart(2, '0');
      date = [date[1], date[0], date[2]];
      date = date.join('');
      return date;
    };
    const fileDateSufix = dateFormater(date);

    await page.pdf({
      path: './public/table.pdf',
      scale: 0.63,
      displayHeaderFooter: true,
      landscape: true,
      format: 'A4',
      printBackground: true,
    });

    await browser.close();
    res.download('./public/table.pdf', `LotoMania_${fileDateSufix}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

app.listen(3000, function () {
  console.log('Server started');
});
