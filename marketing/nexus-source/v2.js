/* Nexus film v2: GSAP master timeline, brand identity chapter, "Every detail" chapter,
   inserted into the v1 scenes by a time remap. Everything is seeked per frame (deterministic). */
(function () {
  const D2 = 86;
  const CUTS2 = [7, 13, 27, 35, 41, 51, 60, 68, 73, 79];
  // [scene id, v1 function, visible from, to, offset into the v1 timeline]
  const SCN2 = [['s1', s1, 0, 7.15, 0], ['s2', s2, 6.95, 13.2, 0], ['sB', null, 12.85, 27.2, 0], ['s3', s3, 26.85, 35.2, 14], ['s4', s4, 34.85, 41.2, 14],
    ['s5', s5, 40.85, 51.2, 14], ['s6', s6, 50.85, 60.2, 14], ['sD', null, 59.85, 68.2, 0], ['s7', s7, 67.85, 73.2, 22], ['s8', s8, 72.85, 79.2, 22], ['s9', s9, 78.85, 86.01, 22]];
  const remapV1 = t => t < 13 ? t : t < 46 ? t + 14 : t + 22;
  const H_ = V ? 1920 : 1080, W_ = V ? 1080 : 1920;
  const C = []; const cue2 = (t, type, v = 1) => C.push({ t: +t.toFixed(3), type, v });

  /* ---------- markup for the new chapters ---------- */
  const MARK = window.MARK;
  const css = `
  @font-face{font-family:Cinzel;src:url(fonts/cinzel-latin-500.woff2);font-weight:500}
  @font-face{font-family:Tenor;src:url(fonts/tenor-sans-latin-400.woff2);font-weight:400}
  @font-face{font-family:Amiri;src:url(fonts/amiri-arabic-400.woff2);font-weight:400}
  @font-face{font-family:Amiri;src:url(fonts/amiri-arabic-700.woff2);font-weight:700}
  @font-face{font-family:Ruqaa;src:url(fonts/aref-ruqaa-atr-subset-700.woff2);font-weight:700}
  #sBbg{position:absolute;inset:0;background:radial-gradient(90% 80% at 50% 45%,#2A2119 0%,#17120E 55%,#0B0907 100%)}
  #glowC{background:radial-gradient(closest-side,rgba(212,175,106,.26),rgba(212,175,106,0))}
  .bchap{position:absolute;font-family:Mono;font-size:20px;letter-spacing:.18em;color:#D4AF6A;text-transform:uppercase}
  .bchap b{color:#F43F5E;font-weight:600}
  .btitle{position:absolute;font-family:Cinzel;font-weight:500;color:#EDE6DA;letter-spacing:.02em;line-height:1.08}
  .bcap{position:absolute;font-size:24px;color:#B5AA98;line-height:1.45}
  .bcap .am{font-family:Amiri;font-weight:700;color:#D4AF6A;font-size:1.25em}
  #markSvg{position:absolute;overflow:visible}
  #bWord{position:absolute;color:#EDE6DA}
  #bWord .n{font-family:Cinzel;font-weight:500;letter-spacing:.24em;line-height:1;display:block}
  #bWord .s{font-family:Cinzel;font-weight:500;letter-spacing:.42em;color:#D4AF6A;display:block;margin-top:.9em;white-space:nowrap}
  #bMini{position:absolute;display:flex;align-items:center;gap:12px;color:#EDE6DA;opacity:0}
  #bMini .m{font:700 46px/1 Ruqaa;color:#D4AF6A}
  #bMini .n{font:500 20px/1 Cinzel;letter-spacing:.24em}
  .sw{position:absolute;border-radius:999px 999px 8px 8px;overflow:hidden;box-shadow:0 40px 80px -20px rgba(0,0,0,.7)}
  .sw .lbl{position:absolute;left:0;right:0;bottom:0;padding:24px 22px}
  .sw .nm{font-family:Cinzel;font-weight:500;font-size:24px;line-height:1.15}
  .sw .hx{font-family:Mono;font-size:16px;margin-top:8px;opacity:.85;letter-spacing:.06em}
  .sw .rl{font-size:14px;margin-top:4px;opacity:.7}
  .tc{position:absolute;border-radius:18px;padding:30px 30px;background:linear-gradient(160deg,rgba(237,230,218,.08),rgba(237,230,218,.02));border:1px solid rgba(212,175,106,.28);overflow:hidden}
  .tc .g{color:#D4AF6A;line-height:1.05;white-space:nowrap}
  .tc .nm{font-size:24px;font-weight:600;color:#EDE6DA;margin-top:18px}
  .tc .rl{font-family:Mono;font-size:14px;color:#B5AA98;letter-spacing:.08em;text-transform:uppercase;margin-top:6px}
  .tc .sm{color:#CFC5B4;margin-top:16px;font-size:22px}
  #latt{position:absolute;left:0;top:0;-webkit-mask-image:radial-gradient(62% 58% at 50% 54%,#000 45%,transparent 100%)}
  #bArch{position:absolute;border-radius:999px 999px 6px 6px;background:#fff;overflow:hidden;box-shadow:0 0 0 2px #D4AF6A,0 0 0 14px rgba(21,17,14,.9),0 0 0 15px rgba(212,175,106,.6),0 60px 120px -20px rgba(0,0,0,.8)}
  #bArch img{position:absolute;left:50%;top:52%;width:82%;transform:translate(-50%,-50%)}
  .tp{position:absolute;text-align:center}
  .tp .im{border-radius:50%;overflow:hidden;box-shadow:0 0 0 2px rgba(212,175,106,.55),0 30px 60px -10px rgba(0,0,0,.7)}
  .tp .im img{width:100%;height:100%;display:block}
  .tp .k{font-family:Mono;font-size:14px;color:#D4AF6A;letter-spacing:.12em;margin-top:22px;text-transform:uppercase}
  .tp .t{font-size:19px;color:#EDE6DA;margin-top:4px}
  .dc{position:absolute;border-radius:20px;overflow:hidden;background:#121A2E;border:1px solid rgba(255,255,255,.12);box-shadow:0 40px 80px -24px rgba(0,0,0,.75);transform-style:preserve-3d}
  .dc .im{position:absolute;left:0;right:0;top:0;overflow:hidden;background:#EDE6DA}
  .dc .im img{width:100%;height:100%;object-fit:contain;display:block}
  .dc .tx{position:absolute;left:0;right:0;bottom:0;padding:16px 22px 18px;background:linear-gradient(180deg,rgba(18,26,46,.92),#121A2E)}
  .dc b{display:block;font-size:22px;font-weight:600}
  .dc small{display:block;font-size:15px;color:#9FB0CC;margin-top:3px}
  .dc .no{position:absolute;right:16px;top:14px;font-family:Mono;font-size:14px;padding:4px 10px;border-radius:999px;background:rgba(11,16,32,.75);color:#22D3EE;z-index:2}
  #flare{position:absolute;left:50%;top:50%;width:0;height:0;opacity:0;mix-blend-mode:screen;pointer-events:none}
  #flare .ln{position:absolute;left:-2000px;top:-4px;width:4000px;height:8px;background:linear-gradient(90deg,transparent 8%,rgba(34,211,238,.25) 30%,rgba(170,240,255,.95) 49%,#fff 50%,rgba(170,240,255,.95) 51%,rgba(34,211,238,.25) 70%,transparent 92%);filter:blur(2px)}
  #flare .ln2{position:absolute;left:-1300px;top:-1px;width:2600px;height:2px;background:linear-gradient(90deg,transparent,rgba(244,63,94,.6) 40%,rgba(255,220,230,.9) 50%,rgba(244,63,94,.6) 60%,transparent)}
  #flare .co{position:absolute;left:-300px;top:-300px;width:600px;height:600px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.85),rgba(120,225,255,.35) 30%,rgba(34,211,238,.08) 60%,transparent 72%)}
  canvas.fx{position:absolute;left:0;top:0;pointer-events:none}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const stage = $('stage');
  const glowC = document.createElement('div'); glowC.className = 'glow'; glowC.id = 'glowC'; $('grid').after(glowC);
  const fxb = document.createElement('canvas'); fxb.className = 'fx'; fxb.id = 'fxb'; glowC.after(fxb);
  const fxf = document.createElement('canvas'); fxf.className = 'fx'; fxf.id = 'fxf'; $('vig').before(fxf);
  const flare = document.createElement('div'); flare.id = 'flare'; flare.innerHTML = '<i class="co"></i><i class="ln"></i><i class="ln2"></i>'; $('flash').before(flare);
  $('sweep').style.display = 'none';

  /* ---------- brand chapter (sB) ---------- */
  const sB = document.createElement('div'); sB.className = 'sc'; sB.id = 'sB';
  const [bx0, by0, bx1, by1] = [-70, -840, 1230, 150]; const vbw = bx1 - bx0, vbh = by1 - by0;
  const boxes = MARK.boxes;
  const circ = boxes.map(([a, b, c, d]) => [(a + c) / 2, (b + d) / 2, Math.max(c - a, d - b) / 2 * .92]);
  sB.innerHTML = `<div id="sBbg"></div>
    <div class="bchap" id="sBc"><b>02</b> — Brand identity</div>
    <div class="btitle" id="bt1">The mark.</div><div class="btitle" id="bt2">Colour, named for perfume.</div><div class="btitle" id="bt3">Type with heritage.</div>
    <div class="btitle" id="bt4">Pattern &amp; arch.</div><div class="btitle" id="bt5">Ready for every touchpoint.</div>
    <div class="bcap" id="bc1">The mark: <span class="am">عطر</span> in Ruqaa script, beside a Cinzel wordmark.</div>
    <div class="bcap" id="bc2">Five colours, each named for something in the shop.</div>
    <div class="bcap" id="bc3">Two Latin and two Arabic typefaces, one voice.</div>
    <div class="bcap" id="bc4">The lattice and the arch frame repeat across every page.</div>
    <div class="bcap" id="bc5">WhatsApp profile, app icon and favicon, all from one system.</div>
    <svg id="markSvg" viewBox="${bx0} ${by0} ${vbw} ${vbh}">
      <defs><linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3DDA6"/><stop offset=".5" stop-color="#D4AF6A"/><stop offset="1" stop-color="#9C7637"/></linearGradient></defs>
      <g id="cons" fill="none" stroke="rgba(212,175,106,.55)" stroke-width="2.4">
        <path class="cl" d="M${bx0 + 10} 0 H${bx1 - 10}"/><path class="cl" d="M${bx0 + 10} -395 H${bx1 - 10}" stroke-dasharray="10 12"/><path class="cl" d="M${bx0 + 10} -775 H${bx1 - 10}"/>
        <path class="cl" d="M-5 ${by0 + 10} V${by1 - 10}" stroke-dasharray="10 12"/><path class="cl" d="M419 ${by0 + 10} V${by1 - 10}" stroke-dasharray="10 12"/><path class="cl" d="M1158 ${by0 + 10} V${by1 - 10}" stroke-dasharray="10 12"/>
        ${circ.map(([x, y, r]) => `<circle class="cc" cx="${x}" cy="${y}" r="${r}"/>`).join('')}
        <g fill="rgba(212,175,106,.85)" stroke="none" font-family="Mono" font-size="22" letter-spacing="3" class="ctx"><text x="${bx0 + 14}" y="-12">BASELINE</text><text x="${bx0 + 14}" y="-407">MIDLINE</text><text x="${bx0 + 14}" y="-787">ASCENDER</text><text x="${bx1 - 300}" y="${by1 - 18}">AREF RUQAA · 700</text></g>
      </g>
      <g id="glyphs">${MARK.paths.map((d, i) => `<path class="gl" d="${d}" fill="url(#goldG)" fill-opacity="0" stroke="#E7C887" stroke-width="5"/>`).join('')}</g>
    </svg>
    <div id="bWord"><span class="n" id="bwn">ATR</span><span class="s" id="bws">Maison de Parfum</span></div>
    <div id="bMini"><span class="m">عطر</span><span class="n">ATR</span></div>
    <svg id="latt"></svg><div id="bArch"><img src="img/os01.jpg"></div>`;
  $('s3').before(sB);
  const SW = ARB ? ARS.sw : [['Oud Black', '#15110E', 'Primary · text', '#EDE6DA'], ['Antique Gold', '#D4AF6A', 'Logo · accents', '#15110E'], ['Gift Burgundy', '#5E1F24', 'Ribbons · offers', '#EDE6DA'], ['Bronze', '#8A6A2E', 'Accent text', '#F5F1E9'], ['Smoke Ivory', '#EDE6DA', 'Page ground', '#15110E']];
  SW.forEach(([n, c, r, ink], i) => { const d = document.createElement('div'); d.className = 'sw'; d.id = 'sw' + i; d.style.background = c; d.style.color = ink; if (i === 0) d.style.boxShadow = 'inset 0 0 0 1px rgba(212,175,106,.45),0 40px 80px -20px rgba(0,0,0,.7)'; d.innerHTML = `<div class="lbl"><div class="nm">${n}</div><div class="hx">${c}</div><div class="rl">${r}</div></div>`; sB.appendChild(d); });
  const TY = ARB ? ARS.ty : [['Cinzel', 'Aa', 'font-family:Cinzel;font-weight:500', 'Titles · Latin', 'Heritage in every drop.', 'font-family:Cinzel'],
    ['Tenor Sans', 'Aa', 'font-family:Tenor', 'Body · Latin', 'Genuine perfumes from the great Arabian houses.', 'font-family:Tenor'],
    ['Amiri', 'أب', 'font-family:Amiri;font-weight:700;direction:rtl', 'Titles & body · Arabic', 'إرثٌ في كل قطرة.', 'font-family:Amiri;direction:rtl;font-size:28px'],
    ['Aref Ruqaa', 'عطر', 'font-family:Ruqaa;font-weight:700;direction:rtl', 'Logo mark', 'Used for the mark only.', '']];
  TY.forEach(([n, g, gs, r, smp, ss], i) => { const d = document.createElement('div'); d.className = 'tc'; d.id = 'tc' + i; d.innerHTML = `<div class="g" style="${gs}">${g}</div><div class="nm">${n}</div><div class="rl">${r}</div><div class="sm" style="${ss}">${smp}</div>`; sB.appendChild(d); });
  const TP = ARB ? ARS.tp : [['img/atr-whatsapp-1-gold-on-black.png', 'WhatsApp', 'Gold on black'], ['img/atr-whatsapp-2-with-atr.png', 'WhatsApp', 'With wordmark'], ['img/atr-whatsapp-3-black-on-ivory.png', 'WhatsApp', 'Black on ivory'], ['img/atr-whatsapp-4-lattice.png', 'WhatsApp', 'Lattice'], ['img/atr-icon-512.png', 'App icon', 'Home screen & favicon']];
  TP.forEach(([src, k, t], i) => { const d = document.createElement('div'); d.className = 'tp'; d.id = 'tp' + i; d.innerHTML = `<div class="im" style="${i === 4 ? 'border-radius:22%' : ''}"><img src="${src}"></div><div class="k">${k}</div><div class="t">${t}</div>`; sB.appendChild(d); });

  /* ---------- details chapter (sD) ---------- */
  const sD = document.createElement('div'); sD.className = 'sc'; sD.id = 'sD';
  sD.innerHTML = `<div class="abs" id="sDtxt"><div class="chap" id="sDc"><b>07</b> — Every detail</div><div class="h1" id="sDh" style="margin-top:18px">Every detail, considered.</div></div><div class="abs" id="dwall" style="inset:0;perspective:2200px"><div id="dwin" style="position:absolute;inset:0;transform-style:preserve-3d"></div></div>`;
  $('s7').before(sD);
  const DC = ARB ? ARS.dc : [['x-notes', 'Fragrance notes', 'Top, heart and base for every bottle', 'center'], ['x-ship', 'Free-delivery bar', 'Shows how close the cart is to free delivery', 'center 75%'],
    ['x-search', 'Instant search', 'By name, house or type, in Arabic or English', 'center top'], ['x-chips', 'Filter by house', 'Assaf, Laverne, Reef, Dkhoon, Osma', '18% center'],
    ['x-digits', 'Arabic digits accepted', '٠١٠ or 010: the checkout reads both', 'center'], ['x-news', 'Welcome offer', 'Sign up, get 10% off the first order', '12% center'],
    ['x-terms', 'Terms & privacy', 'Bilingual legal pages, linked at checkout', '78% 22%'], ['x-film', 'Brand film', 'A looping film on the home page', 'center 40%']];
  const YC = {"notes": "#ede6da", "ship": "#ede6da", "search": "#ede6da", "chips": "#f5f1e9", "digits": "#ede6da", "news": "#5e1f24", "terms": "#ede6da", "film": "#14100d"};
  DC.forEach(([f, b, sm, op], i) => { const d = document.createElement('div'); d.className = 'dc'; d.id = 'dc' + i; const n = f.slice(2); d.innerHTML = `<div class="no">0${i + 1}</div><div class="im" style="background:${YC[n]}"><img src="cap/${ARB ? 'ya' : 'y'}-${n}.png" style="object-fit:${n === 'film' ? 'cover' : 'contain'}"></div><div class="tx"><b>${b}</b><small>${sm}</small></div>`; $('dwin').appendChild(d); });

  /* ---------- layout (landscape / vertical) ---------- */
  const S = (id, o) => Object.assign($(id).style, o);
  if (!V) {
    S('sBc', { left: '120px', top: '96px' });
    ['bt1', 'bt2', 'bt3', 'bt4', 'bt5'].forEach(id => S(id, { left: '120px', top: '136px', fontSize: '60px', width: '1300px' }));
    ['bc1', 'bc2', 'bc3', 'bc4', 'bc5'].forEach(id => S(id, { left: '120px', top: '952px', width: '1300px' }));
    S('markSvg', { left: '500px', top: '250px', width: '920px', height: (920 * vbh / vbw) + 'px' });
    S('bWord', { left: '1040px', top: '470px' }); S('bwn', { fontSize: '124px' }); S('bws', { fontSize: '27px' });
    S('bMini', { right: '120px', top: '84px' });
    SW.forEach((_, i) => S('sw' + i, { left: (267 + i * 284) + 'px', top: '300px', width: '250px', height: '500px' }));
    TY.forEach((_, i) => S('tc' + i, { left: (120 + i * 428) + 'px', top: '300px', width: '400px', height: '520px' }));
    TY.forEach((_, i) => $('tc' + i).querySelector('.g').style.fontSize = '150px');
    S('bArch', { left: '770px', top: '300px', width: '380px', height: '540px' });
    TP.forEach((_, i) => { S('tp' + i, { left: (175 + i * 322) + 'px', top: '320px', width: '280px' }); S2('#tp' + i + ' .im', { width: '260px', height: '260px', margin: '0 auto' }); });
    S('sDtxt', { left: '104px', top: '84px', width: '1700px' }); S('sDh', { fontSize: '68px' });
    DC.forEach((_, i) => { S('dc' + i, { left: (104 + (i % 4) * 434) + 'px', top: (290 + Math.floor(i / 4) * 344) + 'px', width: '410px', height: '320px' }); S2('#dc' + i + ' .im', { height: '232px' }); });
  } else {
    S('sBc', { left: '80px', top: '250px' });
    ['bt1', 'bt2', 'bt3', 'bt4', 'bt5'].forEach(id => S(id, { left: '80px', top: '296px', fontSize: '68px', width: '920px' }));
    ['bc1', 'bc2', 'bc3', 'bc4', 'bc5'].forEach(id => S(id, { left: '80px', top: '1450px', width: '920px', fontSize: '28px' }));
    S('markSvg', { left: '110px', top: '560px', width: '860px', height: (860 * vbh / vbw) + 'px' });
    S('bWord', { left: '0', right: '0', top: '1110px', textAlign: 'center' }); S('bwn', { fontSize: '110px', marginLeft: '.24em' }); S('bws', { fontSize: '25px', marginLeft: '.42em' });
    S('bMini', { right: '80px', top: '120px' });
    SW.forEach((_, i) => S('sw' + i, { left: (54 + i * 198) + 'px', top: '560px', width: '180px', height: '660px' }));
    $('sB').querySelectorAll('.sw .nm').forEach(e => e.style.fontSize = '19px'); $('sB').querySelectorAll('.sw .lbl').forEach(e => e.style.padding = '18px 14px');
    TY.forEach((_, i) => S('tc' + i, { left: (60 + (i % 2) * 500) + 'px', top: (560 + Math.floor(i / 2) * 430) + 'px', width: '460px', height: '400px', padding: '26px' }));
    TY.forEach((_, i) => { $('tc' + i).querySelector('.g').style.fontSize = '110px'; $('tc' + i).querySelector('.sm').style.fontSize = '20px'; });
    S('bArch', { left: '310px', top: '600px', width: '460px', height: '640px' });
    TP.forEach((_, i) => { const r = i < 3 ? 0 : 1, c = i < 3 ? i : i - 3; S('tp' + i, { left: (r === 0 ? 60 + c * 340 : 230 + c * 340) + 'px', top: (560 + r * 430) + 'px', width: '280px' }); S2('#tp' + i + ' .im', { width: '260px', height: '260px', margin: '0 auto' }); });
    S('sDtxt', { left: '80px', top: '240px', width: '920px' }); S('sDh', { fontSize: '84px' });
    DC.forEach((_, i) => { S('dc' + i, { left: (60 + (i % 2) * 500) + 'px', top: (520 + Math.floor(i / 2) * 250) + 'px', width: '460px', height: '230px' }); S2('#dc' + i + ' .im', { height: '150px' }); });
    $('sD').querySelectorAll('.dc b').forEach(e => e.style.fontSize = '20px'); $('sD').querySelectorAll('.dc small').forEach(e => e.style.fontSize = '14px'); $('sD').querySelectorAll('.dc .tx').forEach(e => e.style.padding = '12px 18px 14px');
  }
  function S2(sel, o) { Object.assign(document.querySelector(sel).style, o); }
  if (ARB) window.arBrand(V);
  // lattice: diamonds like the site's --lattice tile, scaled up
  (function () {
    const cell = V ? 84 : 76, cols = Math.ceil(W_ / cell) + 1, rows = Math.ceil(H_ / cell) + 1; let h = '';
    const L = $('latt'); L.setAttribute('width', W_); L.setAttribute('height', H_); L.setAttribute('viewBox', `0 0 ${W_} ${H_}`);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = c * cell, y = r * cell, k = cell / 38, cx = x + 19 * k, cy = y + 19 * k;
      const d = Math.hypot(cx - W_ / 2, cy - H_ / 2);
      h += `<path class="ld" data-d="${d.toFixed(0)}" d="M${cx} ${y + 4 * k} L${x + 34 * k} ${cy} L${cx} ${y + 34 * k} L${x + 4 * k} ${cy}Z" fill="none" stroke="#D4AF6A" stroke-width="1.6" stroke-opacity=".7"/>`
        + `<path class="li" data-d="${d.toFixed(0)}" d="M${cx} ${cy - 4.5 * k} L${cx + 4.5 * k} ${cy} L${cx} ${cy + 4.5 * k} L${cx - 4.5 * k} ${cy}Z" fill="#8A6A2E"/>`;
    }
    L.innerHTML = h;
  })();

  /* ---------- particles ---------- */
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const PB = Array.from({ length: V ? 120 : 130 }, () => ({ x: rnd() * W_, y: rnd() * H_, r: 1.2 + Math.pow(rnd(), 3) * 22, vx: (rnd() - .5) * 16, vy: -5 - rnd() * 16, ph: rnd() * 6.28, c: rnd() < .55 ? '34,211,238' : rnd() < .5 ? '244,63,94' : '225,236,255', a: .1 + rnd() * .3 }));
  const PF = Array.from({ length: 7 }, () => ({ x: rnd() * W_, y: rnd() * H_, r: 120 + rnd() * 160, vx: (rnd() - .5) * 18, vy: (rnd() - .5) * 10, ph: rnd() * 6.28, c: rnd() < .6 ? '34,211,238' : '244,63,94' }));
  let ctxB, ctxF, dpr;
  function sizeFx() { dpr = window.devicePixelRatio || 1; [fxb, fxf].forEach(c => { c.width = W_ * dpr; c.height = H_ * dpr; c.style.width = W_ + 'px'; c.style.height = H_ + 'px'; }); ctxB = fxb.getContext('2d'); ctxF = fxf.getContext('2d'); }
  const beat = t => t >= 7 && t < 77.25 && !(t >= 72.5 && t < 73) ? Math.exp(-((t - 7) % .5) * 7) : 0;
  const wrap = (v, m) => ((v % m) + m) % m;
  function drawFx(t) {
    const b = beat(t), gold = cl(P(t, 12.9, 13.4)) * (1 - P(t, 26.6, 27.1));
    ctxB.setTransform(dpr, 0, 0, dpr, 0, 0); ctxB.clearRect(0, 0, W_, H_);
    PB.forEach(p => {
      const x = wrap(p.x + p.vx * t + Math.sin(t * .5 + p.ph) * 24, W_ + 80) - 40, y = wrap(p.y + p.vy * t, H_ + 80) - 40;
      const a = p.a * (.65 + .35 * Math.sin(t * 1.4 + p.ph)) * (1 + (p.r < 6 ? 1.1 : .35) * b) * P(t, .2, 2.5);
      const col = gold > 0 && p.c !== '244,63,94' ? `${Math.round(L(+p.c.split(',')[0], 212, gold))},${Math.round(L(+p.c.split(',')[1], 175, gold))},${Math.round(L(+p.c.split(',')[2], 106, gold))}` : p.c;
      const g = ctxB.createRadialGradient(x, y, 0, x, y, p.r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(p.r < 6 ? .5 : .75, `rgba(${col},${a * .35})`); g.addColorStop(1, `rgba(${col},0)`);
      ctxB.fillStyle = g; ctxB.beginPath(); ctxB.arc(x, y, p.r, 0, 6.283); ctxB.fill();
    });
    ctxF.setTransform(dpr, 0, 0, dpr, 0, 0); ctxF.clearRect(0, 0, W_, H_);
    PF.forEach(p => {
      const x = wrap(p.x + p.vx * t, W_ + 600) - 300, y = wrap(p.y + p.vy * t, H_ + 600) - 300, a = .045 * (.7 + .3 * Math.sin(t * .7 + p.ph)) * (1 + .5 * b) * P(t, 1, 4);
      const g = ctxF.createRadialGradient(x, y, 0, x, y, p.r); g.addColorStop(0, `rgba(${p.c},${a})`); g.addColorStop(1, `rgba(${p.c},0)`);
      ctxF.fillStyle = g; ctxF.beginPath(); ctxF.arc(x, y, p.r, 0, 6.283); ctxF.fill();
    });
  }

  /* ---------- GSAP master timeline ---------- */
  let TL;
  window.v2init = async function () {
    await Promise.all(['500 40px Cinzel', '400 40px Tenor', '700 40px Amiri', '700 40px Ruqaa'].map(f => document.fonts.load(f, f.includes('Ruqaa') || f.includes('Amiri') ? 'عطر أب' : 'Aa')));
    await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    sizeFx();
    gsap.registerPlugin(SplitText, MorphSVGPlugin, DrawSVGPlugin, ScrambleTextPlugin);
    TL = gsap.timeline({ paused: true });
    const ids = SCN2.map(s => '#' + s[0]);
    TL.set(ids, { scale: 1, filter: 'blur(0px)', transformOrigin: '50% 50%' }, 0);
    const AR = new Set(['s4a', 's9a']), SUB = new Set(['s2s', 's3s', 's5s', 's6s']);
    const textIn = (el, t0, t1, od, kind) => {
      if (ARB && kind === 'h') kind = 'ar';
      if (kind === 'chap') {
        const b = el.querySelector('b'); const num = b.textContent; const label = el.textContent.replace(num, '').trim();
        el.innerHTML = `<b>${num}</b> <span class="sx"></span>`;
        if (ARB) { // Arabic: no letter scramble (random letters join into nonsense words); the label wipes in from the right
          const sx = el.querySelector('.sx'); sx.textContent = label; sx.style.display = 'inline-block';
          TL.fromTo(el, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: .5, ease: 'power3.out' }, t0);
          TL.fromTo(sx, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .7, ease: 'power2.out' }, t0 + .1);
          cue2(t0, 'scramble');
          if (t1 != null) TL.to(el, { opacity: 0, x: -24, duration: .35, ease: 'power2.in' }, t1);
          return;
        }
        TL.fromTo(el, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: .5, ease: 'power3.out' }, t0);
        TL.fromTo(el.querySelector('.sx'), { text: '' }, { duration: .85, scrambleText: { text: label, chars: '01<>/{}#=+_', revealDelay: .2, speed: .7 }, ease: 'none' }, t0);
        cue2(t0, 'scramble');
        if (t1 != null) TL.to(el, { opacity: 0, x: 24, duration: .35, ease: 'power2.in' }, t1);
        return;
      }
      const words = kind === 'sub' || kind === 'ar';
      let parts;
      if (words) {
        parts = []; const nodes = [...el.childNodes]; el.textContent = '';
        nodes.forEach(n => {
          if (n.nodeType === 3) n.textContent.trim().split(/\s+/).forEach(w => { if (!w) return; const o = document.createElement('span'); o.style.display = 'inline-block'; o.style.whiteSpace = 'pre'; o.textContent = w + ' '; el.appendChild(o); parts.push(o); });
          else { n.style.display = 'inline-block'; n.style.whiteSpace = 'pre'; n.appendChild(document.createTextNode(' ')); el.appendChild(n); parts.push(n); }
        });
      } else parts = SplitText.create(el, { type: 'words,chars' }).chars;
      gsap.set(el, { perspective: 900 });
      if (kind === 'sub') TL.fromTo(parts, { opacity: 0, y: 26, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .9, ease: 'power3.out', stagger: .03 }, t0);
      else if (kind === 'ar') TL.fromTo(parts, { opacity: 0, yPercent: 60, rotationX: -70, filter: 'blur(10px)' }, { opacity: 1, yPercent: 0, rotationX: 0, filter: 'blur(0px)', duration: 1, ease: 'expo.out', stagger: .09 }, t0);
      else TL.fromTo(parts, { opacity: 0, yPercent: 85, rotationX: -95, z: -40, filter: 'blur(12px)', transformOrigin: '50% 100%' }, { opacity: 1, yPercent: 0, rotationX: 0, z: 0, filter: 'blur(0px)', duration: 1.05, ease: 'expo.out', stagger: Math.min(.03, .9 / parts.length) }, t0);
      if (t1 != null) TL.to(parts, { opacity: 0, yPercent: -45, filter: 'blur(8px)', duration: od, ease: 'power3.in', stagger: words ? .012 : Math.min(.008, .25 / parts.length) }, t1);
    };
    window.TXT.forEach(([id, t0, t1, od]) => { const el = $(id); textIn(el, t0, t1, od, el.classList.contains('chap') ? 'chap' : AR.has(id) ? 'ar' : SUB.has(id) ? 'sub' : 'h'); });

    // scene camera: zoom-through entry/exit + slow push-in
    SCN2.forEach(([id, , a, b], i) => {
      const el = $(id), push = id !== 's3';
      const a0 = i ? CUTS2[i - 1] : 0, b0 = i < SCN2.length - 1 ? CUTS2[i] : D2;
      if (i > 0) TL.fromTo(el, { scale: push ? .9 : 1, filter: 'blur(14px)' }, { scale: 1, filter: 'blur(0px)', duration: .55, ease: 'expo.out', immediateRender: false }, a0 - .1);
      if (push) TL.to(el, { scale: 1.035, duration: Math.max(.5, (b0 - a0) - .9), ease: 'none' }, a0 + .45);
      if (i < SCN2.length - 1) TL.to(el, push ? { scale: '+=0.13', filter: 'blur(16px)', duration: .3, ease: 'power2.in' } : { filter: 'blur(16px)', duration: .3, ease: 'power2.in' }, b0 - .3);
    });
    // anamorphic flare on every cut
    CUTS2.forEach((c, i) => {
      TL.set('#flare', { top: (V ? [44, 56, 40, 60, 48] : [46, 55, 42, 58, 50])[i % 5] + '%' }, c - .26);
      TL.fromTo('#flare', { opacity: 0, scaleX: .25 }, { opacity: 1, scaleX: 1, duration: .24, ease: 'power2.out', immediateRender: false }, c - .24);
      TL.to('#flare', { opacity: 0, scaleX: 1.5, duration: .55, ease: 'power2.in' }, c + .02);
    });

    /* brand chapter timeline */
    const T = TL;
    T.fromTo('#sBbg', { opacity: 0 }, { opacity: 1, duration: .5, immediateRender: false }, 12.9);
    textIn($('sBc'), 13.2, 26.55, .4, 'chap');
    [['bt1', 13.35, 17.05], ['bt2', 17.45, 19.75], ['bt3', 20.05, 22.15], ['bt4', 22.45, 24.35], ['bt5', 24.65, 26.6]].forEach(([id, a, b]) => textIn($(id), a, b, .35, 'h'));
    [['bc1', 15.5, 17.0], ['bc2', 17.9, 19.7], ['bc3', 20.5, 22.1], ['bc4', 22.9, 24.3], ['bc5', 25.1, 26.55]].forEach(([id, a, b]) => textIn($(id), a, b, .3, 'sub'));
    // P1 the mark
    T.fromTo('#cons .cl', { drawSVG: '50% 50%', opacity: 1 }, { drawSVG: '0% 100%', duration: .9, ease: 'expo.out', stagger: .07, immediateRender: false }, 13.15);
    T.fromTo('#cons .cc', { drawSVG: '0%', rotation: -90, transformOrigin: '50% 50%' }, { drawSVG: '100%', rotation: 0, duration: 1.1, ease: 'power3.inOut', stagger: .12, immediateRender: false }, 13.5);
    T.fromTo('#cons .ctx text', { opacity: 0 }, { opacity: 1, duration: .4, stagger: .08, immediateRender: false }, 13.8);
    T.fromTo('#glyphs .gl', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.25, ease: 'power2.inOut', stagger: .16, immediateRender: false }, 13.6);
    T.to('#glyphs .gl', { attr: { 'fill-opacity': 1 }, duration: .7, ease: 'power2.out', stagger: .08 }, 14.65);
    T.to('#glyphs .gl', { attr: { 'stroke-width': 0 }, duration: .5 }, 15.1);
    T.to('#cons', { opacity: .18, duration: .6 }, 15.3);
    T.to('#markSvg', V ? { scale: .74, y: -60, duration: .9, ease: 'expo.inOut' } : { scale: .66, x: -330, duration: .9, ease: 'expo.inOut' }, 15.2);
    T.fromTo('#bwn', { opacity: 0, letterSpacing: '.9em', filter: 'blur(10px)' }, { opacity: 1, letterSpacing: '.24em', filter: 'blur(0px)', duration: 1, ease: 'expo.out', immediateRender: false }, 15.6);
    T.fromTo('#bws', { text: '' }, { duration: .6, scrambleText: { text: 'MAISON DE PARFUM', chars: 'ATRMAISONDEPRFU', speed: .6 }, ease: 'none', immediateRender: false }, 15.75);
    T.to(['#markSvg', '#bWord'], { opacity: 0, scale: '-=0.08', filter: 'blur(10px)', duration: .4, ease: 'power2.in' }, 17.0);
    T.fromTo('#bMini', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: .5, immediateRender: false }, 17.45);
    T.to('#bMini', { opacity: 0, duration: .3 }, 26.5);
    cue2(13.15, 'draw'); cue2(13.6, 'draw'); cue2(14.65, 'shine'); cue2(15.6, 'pop2');
    // P2 colour
    SW.forEach((_, i) => {
      T.fromTo('#sw' + i, { y: H_ * .6, opacity: 0, rotation: (i - 2) * 4 }, { y: 0, opacity: 1, rotation: 0, duration: 1, ease: 'expo.out', immediateRender: false }, 17.55 + i * .13);
      T.fromTo('#sw' + i + ' .lbl > *', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, stagger: .07, immediateRender: false }, 18.0 + i * .13);
      T.to('#sw' + i, { y: -H_ * .5, opacity: 0, duration: .45, ease: 'power3.in' }, 19.6 + i * .04);
      cue2(17.55 + i * .13, 'pop', .7);
    });
    // P3 type
    TY.forEach((_, i) => {
      T.fromTo('#tc' + i, { rotationY: -80, opacity: 0, x: -60, transformPerspective: 1400, transformOrigin: '0% 50%' }, { rotationY: 0, opacity: 1, x: 0, duration: .9, ease: 'expo.out', immediateRender: false }, 20.15 + i * .14);
      T.fromTo('#tc' + i + ' .g', { scale: 1.4, opacity: 0, transformOrigin: V || i >= 2 ? '50% 50%' : '0% 50%' }, { scale: 1, opacity: 1, duration: 1.1, ease: 'expo.out', immediateRender: false }, 20.3 + i * .14);
      T.to('#tc' + i, { opacity: 0, y: 40, filter: 'blur(8px)', duration: .35, ease: 'power2.in' }, 22.05 + i * .03);
      cue2(20.15 + i * .14, 'tick');
    });
    // P4 lattice + arch
    const lds = [...document.querySelectorAll('#latt .ld')], lis = [...document.querySelectorAll('#latt .li')];
    const maxd = Math.hypot(W_, H_) / 2;
    T.set('#latt', { opacity: 1 }, 22.3);
    T.fromTo(lds, { drawSVG: '0%' }, { drawSVG: '100%', duration: .7, ease: 'power2.out', stagger: (i, el) => +el.dataset.d / maxd * .9, immediateRender: false }, 22.4);
    T.fromTo(lis, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: .5, ease: 'back.out(3)', stagger: (i, el) => +el.dataset.d / maxd * .9, immediateRender: false }, 22.7);
    T.to('#latt', { opacity: .35, duration: .6 }, 23.3);
    T.fromTo('#bArch', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 6px 6px)', y: 40, opacity: 1, scale: 1 }, { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 6px 6px)', y: 0, opacity: 1, duration: 1, ease: 'expo.inOut', immediateRender: false }, 22.9);
    T.fromTo('#bArch img', { scale: 1.25, rotation: -6 }, { scale: 1, rotation: 0, duration: 1.4, ease: 'expo.out', immediateRender: false }, 23.1);
    T.to(['#latt', '#bArch'], { opacity: 0, scale: 1.08, duration: .35, ease: 'power2.in' }, 24.3);
    T.set('#latt', { opacity: 0 }, 0); T.set('#latt', { opacity: 0 }, 24.66);
    cue2(22.4, 'swell'); cue2(22.9, 'swish');
    // P5 touchpoints
    TP.forEach((_, i) => {
      const a = 24.8 + i * .22;
      T.fromTo('#tp' + i, { opacity: 0, y: 50, scale: .6 }, { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'back.out(1.8)', immediateRender: false }, a);
      T.to('#tp' + i, { y: '-=14', duration: 1.2, ease: 'sine.inOut' }, a + .8);
      T.to('#tp' + i, { opacity: 0, scale: 1.2, filter: 'blur(10px)', duration: .3, ease: 'power2.in' }, 26.62);
      cue2(a, 'pop');
    });
    T.set(['#sw0', '#sw1', '#sw2', '#sw3', '#sw4', '#tc0', '#tc1', '#tc2', '#tc3', '#bArch', '#tp0', '#tp1', '#tp2', '#tp3', '#tp4', '#bWord'], { opacity: 0 }, 0);
    T.set('#bWord', { opacity: 1 }, 15.59);

    /* details chapter */
    textIn($('sDc'), 60.2, 67.6, .4, 'chap'); textIn($('sDh'), 60.35, 67.6, .4, 'h');
    DC.forEach((_, i) => {
      const a = 60.75 + i * .25;
      T.fromTo('#dc' + i, { opacity: 0, z: -700, rotationX: -50, y: 120 }, { opacity: 1, z: 0, rotationX: 0, y: 0, duration: 1, ease: 'expo.out', immediateRender: false }, a);
      T.fromTo('#dc' + i + ' .im img', { scale: 1.16 }, { scale: 1, duration: 5, ease: 'power1.out', immediateRender: false }, a);
      T.to('#dc' + i, { z: 500, opacity: 0, duration: .4, ease: 'power3.in' }, 67.55 + (i % 4) * .03 + Math.floor(i / 4) * .05);
      cue2(a, 'pop', .8);
    });
    T.set(DC.map((_, i) => '#dc' + i), { opacity: 0 }, 0);
    T.fromTo('#dwin', { rotationY: V ? -6 : -9, rotationX: 6 }, { rotationY: V ? 6 : 9, rotationX: -2, duration: 7.5, ease: 'sine.inOut', immediateRender: false }, 60.2);
    // spotlight: one card at a time lifts
    for (let k = 0; k < 8; k++) { const a = 63.0 + k * .5; T.to('#dc' + k, { scale: 1.06, boxShadow: '0 0 0 2px rgba(34,211,238,.9),0 50px 90px -20px rgba(34,211,238,.35)', duration: .25, ease: 'power2.out' }, a); T.to('#dc' + k, { scale: 1, boxShadow: '0 40px 80px -24px rgba(0,0,0,.75)', duration: .3, ease: 'power2.inOut' }, a + .45); cue2(a, 'blip'); }

    /* end card: </> morphs into the Nexus logo */
    T.set(['#lg1', '#lg2'], { opacity: 0 }, 0); T.set(['#mp1', '#mp2', '#mp3'], { opacity: 0 }, 0);
    T.fromTo(['#mp1', '#mp2', '#mp3'], { opacity: 0, scale: .5, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: .4, ease: 'back.out(2.2)', immediateRender: false }, 79.0);
    T.to('#mp1', { morphSVG: '#lg1', stroke: '#0891B2', duration: .8, ease: 'expo.inOut' }, 79.25);
    T.to('#mp2', { morphSVG: '#lg2', stroke: '#0891B2', duration: .8, ease: 'expo.inOut' }, 79.25);
    T.to('#mp3', { morphSVG: 'M20 18 L20 8', stroke: '#0891B2', duration: .8, ease: 'expo.inOut' }, 79.25);
    T.set(['#lg1', '#lg2'], { opacity: 1 }, 80.04); T.set(['#mp1', '#mp2', '#mp3'], { opacity: 0 }, 80.04);
    cue2(79.25, 'morph');
    TL.seek(0);
  };

  /* ---------- per-frame ---------- */
  const GL2 = [[0, 300, 300, 1600, 900], [7, 1400, 400, 400, 900], [13, 1500, 800, 300, 200], [27, 1300, 700, 300, 200], [35, 960, 900, 300, 100], [41, 960, 500, 1600, 900], [51, 500, 500, 1500, 300], [60, 1500, 300, 300, 900], [68, 960, 600, 300, 900], [73, 400, 300, 1500, 800], [79, 760, 380, 1160, 420], [86, 760, 380, 1160, 420]];
  window.render = function (T) {
    SCN2.forEach(([id, fn, a, b, off]) => { const vis = T >= a && T < b; $(id).style.display = vis ? 'block' : 'none'; if (vis && fn) fn(T - off); });
    let i = 0; while (i < GL2.length - 2 && T >= GL2[i + 1][0]) i++;
    const A = GL2[i], B = GL2[i + 1], k = eio(P(T, B[0] - 1.2, B[0] + .3)), w = Math.sin(T * .5) * 40, fx = W_ / 1920, fy = H_ / 1080, bt = beat(T);
    $('glowA').style.transform = `translate(${(L(A[1], B[1], k) + w) * fx}px,${L(A[2], B[2], k) * fy}px) scale(${1 + .06 * bt})`;
    $('glowB').style.transform = `translate(${(L(A[3], B[3], k) - w) * fx}px,${(L(A[4], B[4], k) + w * .5) * fy}px) scale(${1 + .04 * bt})`;
    const gold = cl(P(T, 12.9, 13.5)) * (1 - P(T, 26.5, 27.1));
    $('glowA').style.opacity = (P(T, 0, 1.5) * .9 + .1) * (1 - .7 * gold) * (1 + .15 * bt); $('glowB').style.opacity = P(T, .5, 3) * (1 - .6 * gold);
    glowC.style.opacity = gold; glowC.style.transform = `translate(${W_ * .62 + w}px,${H_ * .42}px) scale(${1.2 + .05 * bt})`;
    $('grid').style.transform = `translate(${(T * 6) % 44}px,${(T * 3) % 44}px)`; $('grid').style.opacity = (.5 + .5 * P(T, 0, 2)) * (1 - .8 * gold);
    let fl = 0; CUTS2.forEach(c => { const f = P(T, c - .06, c + .3); if (f > 0 && f < 1) fl = Math.max(fl, (1 - f) * (f < .2 ? f / .2 : 1)); });
    $('flash').style.opacity = fl * (T < 7.5 ? .4 : .1);
    $('bug').style.opacity = P(T, 8, 9) * (1 - P(T, 78.4, 78.8)) * (1 - .6 * gold) * .7;
    drawFx(T);
    TL.seek(T, false);
  };
  window.DURATION = D2;
  // cue list: v1 cues remapped (cut sounds rebuilt), plus the new chapters
  const old = window.CUES.filter(c => c.type !== 'whoosh' && c.type !== 'hit').map(c => ({ ...c, t: +remapV1(c.t).toFixed(3) }));
  CUTS2.forEach(c => { C.push({ t: c - .45, type: 'whoosh', v: 1 }); C.push({ t: c, type: 'hit', v: 1 }); });
  Object.defineProperty(window, 'CUES', { get: () => old.concat(C).sort((a, b) => a.t - b.t), configurable: true });
  // motion blur: sub-frames per frame (cuts, fast moves)
  const MBW = [[5.6, 7, 3], [7, 8.4, 3], [15.2, 16.1, 3], [17.5, 18.5, 3], [19.6, 20.1, 3], [20.1, 21.1, 3], [22.9, 23.9, 3], [24.8, 25.9, 2], [27, 29.6, 3],
    [35, 36.2, 3], [36.3, 37.8, 3], [38.4, 39.4, 3], [41, 43.3, 3], [43.5, 43.95, 3], [45.1, 45.55, 3], [46.6, 47.05, 3], [48.3, 48.75, 3], [51, 52, 3], [60.7, 63, 3],
    [68.5, 69.6, 3], [74.5, 76.8, 2], [77.2, 78.9, 3], [79.2, 80.1, 3]];
  window.MBK = t => { let k = 1; CUTS2.forEach(c => { if (t > c - .35 && t < c + .45) k = 4; }); MBW.forEach(([a, b, n]) => { if (t >= a && t < b) k = Math.max(k, n); }); return k; };
})();
