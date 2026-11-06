// usage: node render_web.js <outDir> <w> <h> <fps> [times]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const [out, w, h, fps, only] = [process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5] || 30, process.argv[6]];
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(`http://localhost:8091/web.html?w=${w}&h=${h}`); await p.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  const D = await p.evaluate(() => window.DURATION);
  const times = only ? only.split(',').map(Number) : Array.from({ length: Math.round(D * fps) }, (_, i) => i / fps);
  for (let i = 0; i < times.length; i++) {
    await p.evaluate(t => window.render(t), times[i]);
    await p.screenshot({ path: path.join(out, only ? `t${times[i].toFixed(2)}.png` : `f${String(i).padStart(5, '0')}.jpg`), ...(only ? { type: 'png' } : { type: 'jpeg', quality: 97 }) });
  }
  console.log('frames', times.length, 'errors', JSON.stringify(errs)); await b.close();
})();
