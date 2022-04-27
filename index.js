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

// route for ejs table
app.get('/lotomania', async function (req, res) {
await initialDbSync();

// select last n drawings from db
const drawings = await selectDraws(25);

res.render('table.ejs', { drawings });
res.end();
});

// route to generate pdf
app.get('/download', async function (req, res) {
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// update url to the page you want to render in pdf
 await page.goto('https://seek4k.com.br/lotomania/', {
   waitUntil: 'networkidle0',
 });

 await page.addStyleTag({ content: '#dldBtn {display: none;}' });

 await page.pdf({
   path: './public/table.pdf',
   scale: 0.63,
   displayHeaderFooter: true,
   landscape: true,
   format: 'A4',
   printBackground: true,
 });
 await browser.close();

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

 res.download('./public/table.pdf', `LotoMania_${fileDateSufix}.pdf`);
});

app.listen(3000, function () {
  console.log('Server started');
});
