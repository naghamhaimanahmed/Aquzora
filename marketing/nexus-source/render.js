// Renders scene.html frame by frame (deterministic time) with real motion blur.
// usage: node render.js <outDir> <fps> [times | start:end[,start:end…]]
// env: DSF (default 2), VW/VH (viewport, default 1920x1080), SCENE (default scene.html), MB=0 to switch motion blur off
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const sharp = require('sharp');
const out = process.argv[2], fps = +process.argv[3] || 30, arg = process.argv[4] || '';
const DSF = +(process.env.DSF || 2), MB = process.env.MB !== '0', SHUTTER = 0.55; // fraction of the frame the "shutter" stays open
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +(process.env.VW || 1920), height: +(process.env.VH || 1080) }, deviceScaleFactor: DSF });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('http://localhost:8092/' + (process.env.SCENE || 'scene.html'));
  await p.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  const D = await p.evaluate(() => window.DURATION);
  fs.writeFileSync(path.join(out, '..', 'cues.json'), JSON.stringify(await p.evaluate(() => window.CUES)));
  let frames;
  if (arg.includes(':')) { frames = []; arg.split(',').forEach(r => { const [a, z] = r.split(':').map(Number); for (let i = a; i < Math.min(z, Math.round(D * fps)); i++) frames.push([i, i / fps]); }); }  // one or more frame ranges: 0:645 or 220:260,390:410
  else if (arg) frames = arg.split(',').map(Number).map(t => [null, t]);
  else frames = Array.from({ length: Math.round(D * fps) }, (_, i) => [i, i / fps]);
  let shots = 0;
  for (const [i, t] of frames) {
    const file = path.join(out, i == null ? `t${t.toFixed(2)}.jpg` : `f${String(i).padStart(5, '0')}.jpg`);
    const K = MB ? await p.evaluate(t => window.MBK ? window.MBK(t) : 1, t) : 1;
    if (K <= 1) { await p.evaluate(t => window.render(t), t); await p.screenshot({ path: file, type: 'jpeg', quality: 95 }); shots++; continue; }
    let acc = null, info = null;
    for (let j = 0; j < K; j++) {
      await p.evaluate(t => window.render(t), t + (j / K - .5 * (K - 1) / K) * SHUTTER / fps);
      const r = await sharp(await p.screenshot({ type: 'jpeg', quality: 100 })).raw().toBuffer({ resolveWithObject: true }); shots++;
      if (!acc) { acc = new Uint16Array(r.data.length); info = r.info; }
      const d = r.data; for (let k = 0; k < d.length; k++) acc[k] += d[k];
    }
    const o = Buffer.allocUnsafe(acc.length); const h = K >> 1; for (let k = 0; k < acc.length; k++) o[k] = (acc[k] + h) / K;
    await sharp(o, { raw: { width: info.width, height: info.height, channels: info.channels } }).jpeg({ quality: 95, chromaSubsampling: '4:4:4' }).toFile(file);
  }
  console.log('frames', frames.length, 'screenshots', shots, 'errors', JSON.stringify(errs)); await b.close();
})();
