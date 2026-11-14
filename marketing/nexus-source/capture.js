const { chromium } = require('playwright');
const O = 'cap/';
async function prep(p) {
  await p.waitForLoadState('networkidle'); 
  // scroll through to trigger lazy images
  const h = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 400) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(60); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
  await p.evaluate(async () => { await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); await document.fonts.ready; });
  await p.addStyleTag({ content: '*{animation:none!important;transition:none!important;caret-color:transparent!important} .toast{display:none!important}' });
  await p.waitForTimeout(300);
}
async function ctx(b, lang, mobile) {
  const c = await b.newContext(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await c.addInitScript(([lang]) => { localStorage.setItem('aqz.lang', JSON.stringify(lang)); localStorage.setItem('aqz.cart', JSON.stringify({ OS01: 1, DK03: 2 })); }, [lang]);
  const p = await c.newPage(); await p.goto('http://localhost:8090/'); await prep(p); return p;
}
(async () => {
  const b = await chromium.launch();
  for (const lang of ['ar', 'en']) {
    // desktop
    let p = await ctx(b, lang, false);
    await p.screenshot({ path: O + `d-${lang}-hero.png` });
    await p.screenshot({ path: O + `d-${lang}-full.png`, fullPage: true });
    for (const [sel, n] of [['header.header', 'header'], ['section.hero', 'herosec'], ['#cats', 'cats'], ['#collection', 'collection'], ['footer.footer', 'footer']]) {
      const el = await p.$(sel); if (el) await el.screenshot({ path: O + `d-${lang}-el-${n}.png` });
    }
    await p.evaluate(() => { const r = document.getElementById('collection').getBoundingClientRect(); scrollTo(0, r.top + scrollY - 60); }); await p.waitForTimeout(300);
    await p.screenshot({ path: O + `d-${lang}-collection.png` });
    await p.click('[data-cart-open]'); await p.waitForTimeout(600);
    await p.screenshot({ path: O + `d-${lang}-cart.png` });
    await p.click('#cart [data-checkout]'); await p.waitForTimeout(600);
    await p.fill('#coForm [name=name]', lang === 'ar' ? 'سلمى أحمد' : 'Salma Ahmed').catch(() => {});
    await p.screenshot({ path: O + `d-${lang}-checkout.png` });
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await p.evaluate(() => scrollTo(0, 0));
    await p.click('#heroArch'); await p.waitForTimeout(800);
    await p.screenshot({ path: O + `d-${lang}-modal.png` });
    await p.context().close();
    // mobile
    p = await ctx(b, lang, true);
    await p.screenshot({ path: O + `m-${lang}-home.png` });
    await p.screenshot({ path: O + `m-${lang}-full.png`, fullPage: true });
    await p.evaluate(() => { const r = document.getElementById('collection').getBoundingClientRect(); scrollTo(0, r.top + scrollY - 70); }); await p.waitForTimeout(300);
    await p.screenshot({ path: O + `m-${lang}-collection.png` });
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(200);
    await p.click('#heroArch'); await p.waitForTimeout(800);
    await p.screenshot({ path: O + `m-${lang}-modal.png` });
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await p.evaluate(() => document.querySelector('[data-cart-open]').click()); await p.waitForTimeout(600);
    await p.screenshot({ path: O + `m-${lang}-cart.png` });
    await p.evaluate(() => document.querySelector('#cart [data-checkout]').click()); await p.waitForTimeout(600);
    await p.screenshot({ path: O + `m-${lang}-checkout.png` });
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    await p.evaluate(() => document.querySelector('[data-search]').click()); await p.waitForTimeout(400);
    await p.type('#searchBig', lang === 'ar' ? 'عود' : 'oud', { delay: 30 }); await p.waitForTimeout(500);
    await p.screenshot({ path: O + `m-${lang}-search.png` });
    await p.context().close();
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
