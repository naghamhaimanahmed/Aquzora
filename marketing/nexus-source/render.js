// usage: node render.js <outDir> <fps> [times|start:end] ; env DSF (default 2), SCENE
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const out = process.argv[2], fps = +process.argv[3] || 30, arg = process.argv[4] || '';
const DSF = +(process.env.DSF || 2);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: DSF });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('http://localhost:8092/' + (process.env.SCENE || 'scene.html'));
  await p.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  const D = await p.evaluate(() => window.DURATION);
  fs.writeFileSync(path.join(out, '..', 'cues.json'), JSON.stringify(await p.evaluate(() => window.CUES)));
  let frames;
  if (arg.includes(':')) { const [a, z] = arg.split(':').map(Number); frames = []; for (let i = a; i < Math.min(z, Math.round(D * fps)); i++) frames.push([i, i / fps]); }
  else if (arg) frames = arg.split(',').map(Number).map(t => [null, t]);
  else frames = Array.from({ length: Math.round(D * fps) }, (_, i) => [i, i / fps]);
  for (const [i, t] of frames) {
    await p.evaluate(t => window.render(t), t);
    const name = i == null ? `t${t.toFixed(2)}.jpg` : `f${String(i).padStart(5, '0')}.jpg`;
    await p.screenshot({ path: path.join(out, name), type: 'jpeg', quality: 95 });
  }
  console.log('frames', frames.length, 'errors', JSON.stringify(errs)); await b.close();
})();
