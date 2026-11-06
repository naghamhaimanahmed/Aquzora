// Renders scene.html frame by frame (deterministic time) to JPEG frames.
// usage: node render.js <outDir> <fps> [onlyTimesCommaSeparated]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const dir = __dirname, out = process.argv[2], fps = +process.argv[3] || 30, only = process.argv[4];
const ROOT = path.resolve(__dirname, '../..'), F = path.join(ROOT, 'public/assets/fonts');
const d = f => 'data:font/woff2;base64,' + fs.readFileSync(path.join(F, f)).toString('base64');
const fontCss = `
@font-face{font-family:Ruqaa;src:url(${d('aref-ruqaa-atr-subset-700.woff2')});font-weight:700}
@font-face{font-family:Cinzel;src:url(${d('cinzel-latin-500.woff2')});font-weight:400 700}
@font-face{font-family:Amiri;src:url(${d('amiri-arabic-400.woff2')});font-weight:400;unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F,U+0660-0669,U+066B-066C}
@font-face{font-family:Amiri;src:url(${d('amiri-arabic-700.woff2')});font-weight:700;unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F,U+0660-0669,U+066B-066C}
@font-face{font-family:Amiri;src:url(${d('amiri-latin-400.woff2')});font-weight:400;unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:Amiri;src:url(${d('amiri-latin-700.woff2')});font-weight:700;unicode-range:U+0000-00FF,U+2000-206F}`;
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const html = fs.readFileSync(path.join(dir, 'scene.html'), 'utf8').replace('/*FONT_CSS*/', fontCss).replace('/*IMG_DIR*/', 'file://' + path.join(ROOT, 'public/assets/img/collection') + '/');
  const tmp = path.join(require('os').tmpdir(), 'atr_scene_built.html'); fs.writeFileSync(tmp, html);
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + tmp);
  await p.evaluate(async () => {
    await document.fonts.load('700 100px Ruqaa', 'عطر'); await document.fonts.load('700 100px Amiri', 'عطر'); await document.fonts.load('400 100px Amiri', 'a');
    await document.fonts.load('500 100px Cinzel', 'ATR'); await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
  });
  const missing = await p.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.src));
  if (missing.length) console.error('missing images', missing);
  const duration = await p.evaluate(() => window.DURATION);
  const times = only ? only.split(',').map(Number) : Array.from({ length: Math.round(duration * fps) }, (_, i) => i / fps);
  for (let i = 0; i < times.length; i++) {
    await p.evaluate(t => window.render(t), times[i]);
    await p.screenshot({ path: path.join(out, only ? `t${times[i].toFixed(2)}.jpg` : `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 94 });
  }
  console.log('frames', times.length, 'errors', JSON.stringify(errs));
  await b.close();
})();
