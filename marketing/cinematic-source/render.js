// usage: node render.js <outDir> <fps> [times]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const out = process.argv[2], fps = +process.argv[3] || 30, only = process.argv[4];
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('http://localhost:8091/scene.html'); await p.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  const D = await p.evaluate(() => window.DURATION);
  const times = only ? only.split(',').map(Number) : Array.from({ length: Math.round(D * fps) }, (_, i) => i / fps);
  for (let i = 0; i < times.length; i++) {
    await p.evaluate(t => window.render(t), times[i]);
    await p.screenshot({ path: path.join(out, only ? `t${times[i].toFixed(2)}.jpg` : `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 96 });
  }
  console.log('frames', times.length, 'errors', JSON.stringify(errs)); await b.close();
})();
