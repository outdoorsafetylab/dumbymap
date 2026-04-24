import { chromium } from 'playwright';

const browser = await chromium.launch();
const testPages = [
  'example/01-basic-maps.html',
  'example/04-layouts.html',
  'example/10-semantic-html.html',
  'example/11-html-auto-blocks.html',
];

for (const p of testPages) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8888/' + p, { waitUntil: 'networkidle', timeout: 20000 });
  try { await page.waitForSelector('.Dumby,.mapclay', { timeout: 6000 }); } catch(e) {}
  const dumby = await page.$('.Dumby');
  const maps  = await page.$$('.mapclay');
  const status = errors.length ? 'ERROR: ' + errors[0].slice(0, 120) : 'ok';
  console.log(p + ' | .Dumby=' + (dumby ? 'yes' : 'no') + ' .mapclay=' + maps.length + ' | ' + status);
  await page.close();
}

await browser.close();
