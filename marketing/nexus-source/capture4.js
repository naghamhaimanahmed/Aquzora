// Close-up captures for the "Every detail" chapter
const { chromium } = require('playwright');
const O = 'cap/';
async function page(b, lang, mobile, cart) {
  const c = await b.newContext(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await c.addInitScript(([lang, cart]) => { localStorage.setItem('aqz.lang', JSON.stringify(lang)); localStorage.setItem('aqz.cart', JSON.stringify(cart)); }, [lang, cart]);
  const p = await c.newPage(); await p.goto('http://localhost:8090/'); await p.waitForLoadState('networkidle');
  await p.addStyleTag({ content: '*{animation:none!important;transition:none!important;caret-color:transparent!important} .toast,.wa-float{display:none!important}' });
  await p.evaluate(async () => { await document.fonts.ready; }); return p;
}
async function pad(p, sel, path, m = 14) {
  const el = await p.$(sel); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  const r = await el.boundingBox(); await p.screenshot({ path, clip: { x: Math.max(0, r.x - m), y: Math.max(0, r.y - m), width: r.width + 2 * m, height: r.height + 2 * m } });
}
(async () => {
  const b = await chromium.launch();
  let p = await page(b, 'en', true, { OS01: 1 });
  await p.click('#heroArch'); await p.waitForTimeout(700);
  await pad(p, '#modal .dt__notes', O + 'x-notes.png', 16);
  await p.context().close();
  p = await page(b, 'en', true, { DK03: 1 });
  await p.evaluate(() => document.querySelector('[data-cart-open]').click()); await p.waitForTimeout(600);
  await pad(p, '#shipBar', O + 'x-ship.png', 16);
  await p.context().close();
  p = await page(b, 'en', true, {});
  await p.evaluate(() => document.querySelector('[data-search]').click()); await p.waitForTimeout(400);
  await p.type('#searchBig', 'laverne', { delay: 20 }); await p.waitForTimeout(600);
  await p.screenshot({ path: O + 'x-search.png', clip: { x: 0, y: 0, width: 390, height: 560 } });
  await p.context().close();
  p = await page(b, 'ar', true, { OS01: 1 });
  await p.evaluate(() => document.querySelector('[data-cart-open]').click()); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('#cart [data-checkout]').click()); await p.waitForTimeout(500);
  await p.fill('#coPhone', '٠١٠ ١٢٣٤ ٥٦٧٨'); await p.fill('#coName', 'سلمى أحمد'); await p.evaluate(() => document.activeElement.blur());
  await pad(p, '[data-field=name]', O + 'x-name-ar.png', 12);
  const r1 = await (await p.$('[data-field=name]')).boundingBox(), r2 = await (await p.$('[data-field=phone]')).boundingBox();
  await p.screenshot({ path: O + 'x-digits.png', clip: { x: r1.x - 14, y: r1.y - 14, width: r1.width + 28, height: r2.y + r2.height - r1.y + 28 } });
  await p.context().close();
  p = await page(b, 'en', false, {});
  await pad(p, '.gal-chips', O + 'x-chips.png', 24);
  await pad(p, '.newsletter', O + 'x-news.png', 0);
  await pad(p, '.film', O + 'x-film.png', 0);
  await p.context().close();
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  p = await c.newPage(); await p.goto('http://localhost:8090/terms.html'); await p.waitForLoadState('networkidle'); await p.evaluate(async () => { await document.fonts.ready; });
  await p.screenshot({ path: O + 'x-terms.png' });
  await c.close(); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
