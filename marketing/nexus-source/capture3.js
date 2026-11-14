const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const lang of ['ar', 'en']) for (const mobile of [true, false]) {
    const c = await b.newContext(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await c.addInitScript(([lang]) => { localStorage.setItem('aqz.lang', JSON.stringify(lang)); localStorage.setItem('aqz.cart', JSON.stringify({ OS01: 1, DK03: 2 })); }, [lang]);
    const p = await c.newPage(); await p.goto('http://localhost:8090/'); await p.waitForLoadState('networkidle');
    const h = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 400) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(60); }
    await p.evaluate(() => scrollTo(0, 0));
    await p.evaluate(async () => { await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); await document.fonts.ready; });
    await p.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
    const hidden = await p.evaluate(() => { const out = []; document.querySelectorAll('body *').forEach(e => { const s = getComputedStyle(e); if (s.position === 'fixed' && s.display !== 'none') { out.push(e.className || e.id); e.style.setProperty('display', 'none', 'important'); } }); return out; });
    console.log(lang, mobile, hidden.join(' | '));
    await p.waitForTimeout(400);
    await p.screenshot({ path: `cap/${mobile ? 'm' : 'd'}-${lang}-full.png`, fullPage: true });
    await c.close();
  }
  await b.close();
})();
