const { chromium } = require('playwright');
const O = 'cap/';
async function prep(p) {
  await p.waitForLoadState('networkidle');
  await p.evaluate(async () => { await document.fonts.ready; });
  await p.addStyleTag({ content: '*{animation:none!important;transition:none!important;caret-color:transparent!important} .toast{display:none!important}' });
  await p.waitForTimeout(300);
}
async function ctx(b, lang, mobile) {
  const c = await b.newContext(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await c.addInitScript(([lang]) => { localStorage.setItem('aqz.lang', JSON.stringify(lang)); localStorage.setItem('aqz.cart', JSON.stringify({ OS01: 1, DK03: 2 })); }, [lang]);
  const p = await c.newPage(); await p.goto('http://localhost:8090/'); await prep(p); return p;
}
async function fill(p, lang) {
  await p.fill('#coName', lang === 'ar' ? 'سلمى أحمد' : 'Salma Ahmed');
  await p.fill('#coPhone', '010 1234 5678');
  await p.selectOption('#coGov', { index: 1 });
  await p.fill('#coAddress', lang === 'ar' ? 'شارع الكورنيش، عمارة ١٢، الدور ٣' : '12 Corniche St, building 4, floor 3');
  await p.evaluate(() => document.getElementById('coAddress').blur()); await p.waitForTimeout(300);
}
(async () => {
  const b = await chromium.launch();
  for (const lang of ['ar', 'en']) {
    let p = await ctx(b, lang, false);
    await p.click('[data-cart-open]'); await p.waitForTimeout(500);
    await p.click('#cart [data-checkout]'); await p.waitForTimeout(500);
    await fill(p, lang);
    await p.screenshot({ path: O + `d-${lang}-checkout.png` });
    await p.context().close();
    p = await ctx(b, lang, true);
    await p.evaluate(() => document.querySelector('[data-cart-open]').click()); await p.waitForTimeout(500);
    await p.evaluate(() => document.querySelector('#cart [data-checkout]').click()); await p.waitForTimeout(500);
    await fill(p, lang);
    await p.evaluate(() => { const m = document.querySelector('#modal .modal__panel, #modal [class*=panel], #modalContent'); (m.closest('[class*=panel]') || m).scrollTop = 0; document.querySelectorAll('#modal *').forEach(e => { if (e.scrollTop) e.scrollTop = 0; }); });
    await p.waitForTimeout(200);
    await p.screenshot({ path: O + `m-${lang}-checkout.png` });
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await p.evaluate(() => document.querySelector('[data-search]').click()); await p.waitForTimeout(400);
    await p.type('#searchBig', lang === 'ar' ? 'لافيرن' : 'rose', { delay: 30 }); await p.waitForTimeout(800);
    await p.screenshot({ path: O + `m-${lang}-search.png` });
    await p.context().close();
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
