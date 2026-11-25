/* Arabic edition of the Nexus film: strings, right-to-left styling and Arabic site captures.
   Active when the scene is opened with #ar (landscape) or #v-ar (vertical). */
window.ARS = {
  t1: 'لكل علامة تجارية حكاية.',
  steps: [['تصفّح', 'المجموعة كاملة، دارًا دارًا'], ['اكتشف', 'المكوّنات والأحجام والأسعار'], ['ابحث', 'بالعربية أو الإنجليزية'], ['السلة', 'شريط التوصيل المجاني'], ['أتمّ الطلب', 'يُرسَل بضغطة واحدة']],
  sv: [['phone', 'تطبيقات الموبايل', 'iOS وأندرويد، من الفكرة إلى المتجر'], ['web', 'المواقع والمنصات', 'سريعة، تظهر في البحث، سهلة التعديل'], ['cart', 'المتاجر الإلكترونية', 'متاجر يُكمل فيها العميل طلبه'],
    ['sys', 'أنظمة الشركات', 'ERP و CRM ولوحات تحكم'], ['ai', 'حلول الذكاء الاصطناعي', 'مزايا تجيب وتتوقّع'], ['bot', 'الأتمتة والشات بوت', 'بوتات واتساب تعمل 24/7'],
    ['pen', 'تصميم UI و UX', 'واجهات واضحة، مجرَّبة مع المستخدمين'], ['cloud', 'السحابة و DevOps', 'استضافة وتحديثات لا تتوقف'], ['shield', 'الاختبار والصيانة', 'جودة قبل الإطلاق وبعده']],
  sw: [['أسود العود', '#15110E', 'النصوص الأساسية', '#EDE6DA'], ['ذهبي عتيق', '#D4AF6A', 'الشعار واللمسات', '#15110E'], ['عنّابي الهدايا', '#5E1F24', 'الشرائط والعروض', '#EDE6DA'], ['برونزي', '#8A6A2E', 'نصوص مميّزة', '#F5F1E9'], ['عاجي دخاني', '#EDE6DA', 'خلفية الصفحات', '#15110E']],
  ty: [['Cinzel', 'Aa', 'font-family:Cinzel;font-weight:500;direction:ltr', 'عناوين · لاتيني', 'Heritage in every drop.', 'font-family:Cinzel;direction:ltr;text-align:left'],
    ['Tenor Sans', 'Aa', 'font-family:Tenor;direction:ltr', 'نصوص · لاتيني', 'Genuine perfumes from the great Arabian houses.', 'font-family:Tenor;direction:ltr;text-align:left'],
    ['Amiri', 'أب', 'font-family:Amiri;font-weight:700;direction:rtl', 'عناوين ونصوص · عربي', 'إرثٌ في كل قطرة.', 'font-family:Amiri;direction:rtl;font-size:28px'],
    ['Aref Ruqaa', 'عطر', 'font-family:Ruqaa;font-weight:700;direction:rtl', 'الشعار', 'للشعار فقط.', '']],
  tp: [['img/atr-whatsapp-1-gold-on-black.png', 'واتساب', 'ذهبي على أسود'], ['img/atr-whatsapp-2-with-atr.png', 'واتساب', 'مع الاسم اللاتيني'], ['img/atr-whatsapp-3-black-on-ivory.png', 'واتساب', 'أسود على عاجي'], ['img/atr-whatsapp-4-lattice.png', 'واتساب', 'بالنقشة'], ['img/atr-icon-512.png', 'أيقونة التطبيق', 'الشاشة الرئيسية والمتصفح']],
  dc: [['x-notes', 'مكوّنات العطر', 'المقدمة والقلب والقاعدة لكل زجاجة', ''], ['x-ship', 'شريط التوصيل المجاني', 'يوضّح كم بقي ليصبح التوصيل مجانيًا', ''],
    ['x-search', 'بحث فوري', 'بالاسم أو الدار، بالعربية أو الإنجليزية', ''], ['x-chips', 'تصفية حسب الدار', 'عسّاف، لافيرن، ريف، دخون، أوسما', ''],
    ['x-digits', 'قبول الأرقام العربية', '٠١٠ أو 010: النموذج يقرأ الاثنين', ''], ['x-news', 'خصم ترحيبي', 'اشترك واحصل على 10% على أول طلب', ''],
    ['x-terms', 'الشروط والخصوصية', 'صفحات قانونية باللغتين', ''], ['x-film', 'فيلم العلامة', 'فيلم قصير في الصفحة الرئيسية', '']],
  s9fV: 'تطبيقات الموبايل · المواقع · المتاجر الإلكترونية · أنظمة الشركات · الذكاء الاصطناعي<br>مرخّصة في الإمارات · المنطقة الحرة بعجمان',
  brand: { sBc: '<b>02</b> — الهوية البصرية', sDc: '<b>07</b> — كل التفاصيل', sDh: 'كل تفصيلة محسوبة.',
    bt1: 'الشعار.', bt2: 'ألوان بأسماء من عالم العطر.', bt3: 'خطوط بروح التراث.', bt4: 'النقشة والقوس.', bt5: 'جاهزة لكل منصة.',
    bc1: 'الشعار: كلمة <span class="am">عطر</span> بخط الرقعة، بجانب الاسم اللاتيني بخط Cinzel.', bc2: 'خمسة ألوان، لكل لون اسم من عالم المتجر.', bc3: 'خطّان لاتينيان وخطّان عربيان، بصوت واحد.',
    bc4: 'النقشة والإطار المقوّس يتكرران في كل صفحة.', bc5: 'صورة واتساب وأيقونة التطبيق، من نظام واحد.' }
};
window.arApply = function () {
  const $ = id => document.getElementById(id), H = (id, h) => { $(id).innerHTML = h; };
  document.documentElement.classList.add('arx');
  const st = document.createElement('style'); st.textContent = `
  .arx #stage{font-family:Cairo,Poppins,sans-serif}
  .arx .h1{letter-spacing:0;line-height:1.3;font-weight:700}
  .arx .sub{line-height:1.65;font-weight:500}
  .arx .chap,.arx .bchap{font-family:Cairo,Poppins,sans-serif;letter-spacing:0;font-size:24px;font-weight:700;direction:rtl}
  .arx #s2txt,.arx #s3txt,.arx #s5txt,.arx #s6txt,.arx #sDtxt{direction:rtl;text-align:right}
  .arx #s4txt,.arx #s7txt,.arx #s8t,.arx #s8c,.arx #s8d,.arx #t1,.arx #t2,.arx #s9h,.arx #tagl,.arx #s9f,.arx #s9cta{direction:rtl}
  .arx #t1,.arx #t2{letter-spacing:0;font-weight:700}
  .arx #s4a,.arx #s9a{font-family:Poppins,sans-serif;direction:ltr;font-weight:600}
  .arx .pill{direction:rtl;padding:12px 18px 12px 26px}
  .arx .lab > div:last-child{direction:rtl;text-align:left;font-weight:700}
  .arx .lab small{font-family:Cairo,sans-serif;letter-spacing:0;font-size:17px;font-weight:500}
  .arx .step{direction:rtl}.arx #steps > .abs{left:446px!important}.arx.v #steps > .abs{display:none}.arx .step .num{direction:ltr}.arx .step h4{font-weight:700}
  .arx .chat{direction:rtl}
  .arx .msg.in{margin-right:0;margin-left:auto;border-top-left-radius:12px;border-top-right-radius:3px}
  .arx .msg.out{margin-left:0;margin-right:auto;border-top-right-radius:12px;border-top-left-radius:3px}
  .arx .msg .tm{right:auto;left:10px;direction:ltr}.arx .btns,.arx .typing{margin-left:auto}
  .arx .node,.arx .notif,.arx .svc,.arx .tile,.arx .cta{direction:rtl}
  .arx .node .st{right:auto;left:16px}.arx .node small{direction:ltr;text-align:right;font-family:Mono,Cairo,monospace}
  .arx .node b,.arx .svc b,.arx .notif b{font-weight:700}.arx .notif small{direction:ltr;text-align:right;display:block}
  .arx .tile .big{direction:ltr;text-align:right}.arx .tile p{font-weight:500}
  .arx #tagl{font-family:Cairo,sans-serif;letter-spacing:0!important;font-size:30px;font-weight:700}
  .arx .btitle{font-family:Amiri,serif;font-weight:700;letter-spacing:0;direction:rtl;text-align:right;line-height:1.3}
  .arx .bcap{direction:rtl;text-align:right;font-weight:500}
  .arx .sw .lbl{direction:rtl}.arx .sw .nm{font-family:Amiri,serif;font-weight:700;font-size:30px}.arx .sw .hx{direction:ltr;text-align:right}.arx .sw .rl{font-size:16px}
  .arx .tc{direction:rtl}.arx .tc .rl{font-family:Cairo,sans-serif;letter-spacing:0;font-size:17px;text-transform:none}
  .arx .tp .k{font-family:Cairo,sans-serif;letter-spacing:0;font-size:17px}
  .arx .dc .tx{direction:rtl;text-align:right}.arx .dc .no{right:auto;left:16px}.arx .dc b{font-weight:700}
  .arx.v .sw .nm{font-size:22px}
  .arx .chap,.arx .bchap{visibility:hidden!important}   /* no chapter labels in the Arabic edition */
  .arx.v #s9h{font-size:72px!important}
  .arx:not(.v) #s2h{font-size:84px!important}.arx:not(.v) #s3txt{width:440px!important}.arx:not(.v) #s3h{font-size:62px!important}.arx:not(.v) #s3s{font-size:24px!important}`;
  document.head.appendChild(st);
  // site captures: the Arabic side of the site (the bilingual scene keeps both)
  document.querySelectorAll('img').forEach(im => { if (im.closest('#s4')) return; const s = im.getAttribute('src'); if (/cap\/[dm]-en-/.test(s)) im.setAttribute('src', s.replace('-en-', '-ar-')); });
  [229, 660, 382, 528, 57].forEach((h, i) => { $('L' + i).style.height = h + 'px'; });
  // texts
  H('t2', 'ونحن نحوّلها إلى <span class="cy">كود.</span>');
  H('s2c', '<b>01</b> — المشروع'); H('s2h', 'هذه «عطر».'); H('s2s', 'علامة عطور عربية، تبيع الآن أونلاين في كل مصر.');
  $('s2p').lastChild.textContent = 'تصميم وتطوير Nexus';
  ['العربية + English', '56 منتجًا', 'الطلب عبر واتساب', 'الدفع بإنستاباي'].forEach((t, i) => { $('b' + (i + 1)).lastChild.textContent = t; });
  H('s3c', '<b>03</b> — التصميم والتنفيذ'); H('s3h', 'كل طبقة مصمَّمة بعناية.'); H('s3s', 'هوية وتصميم وكود لعلامة واحدة. بلا قوالب جاهزة.');
  [['تواصل وصفحات قانونية', 'الشروط · الخصوصية · واتساب'], ['كتالوج من 56 منتجًا', 'فلاتر · أسعار بالجنيه'], ['تسوّق حسب الدار', 'عسّاف · لافيرن · ريف'], ['واجهة بروح العلامة', 'الهوية · الخطوط · الحركة'], ['تنقّل بلغتين', 'العربية ⇄ EN · بحث · سلة']]
    .forEach(([a, b], i) => { $('lb' + i).lastElementChild.innerHTML = `${a}<small>${b}</small>`; });
  H('s4c', '<b>04</b> — لغتان'); H('s4h', 'يتكلم لغة عميلك.'); H('s4a', 'Speaks your customer’s language.'); $('s4a').style.direction = 'ltr';
  H('s5c', '<b>05</b> — الموبايل أولًا'); H('s5h', 'متجر في راحة اليد.'); H('s5s', 'أغلب العملاء يتسوقون من الموبايل، فمنه نبدأ.');
  H('s6c', '<b>06</b> — الأتمتة'); H('s6h', 'طلبات تُنجَز تلقائيًا.'); H('s6s', 'مساعد على واتساب يؤكد الطلب، يستلم الدفع وينبّه صاحب المتجر. ليلًا ونهارًا.');
  const ch = document.querySelector('#s6 .chead > div:last-child'); ch.innerHTML = '<b>عطر · Maison de Parfum</b><small>مساعد الطلبات · متصل الآن</small>';
  H('m1', 'مرحبًا! أريد تأكيد طلبي ATR-261114-2841 🛍️<span class="tm">9:41 ✓✓</span>');
  H('m2', '<b>طلب ATR-261114-2841</b>\n• روج × 1 — 3,320 ج.م\n• كراون بلاك × 2 — 2,740 ج.م\nالتوصيل: مجاني<span class="tm">9:41</span>');
  H('bt2', '<div>✅ تأكيد الطلب</div><div>✏️ تعديل الطلب</div><div>❌ إلغاء</div>');
  H('m3', '✅ تأكيد الطلب<span class="tm">9:42 ✓✓</span>');
  H('m4', 'الإجمالي: <b>6,060 ج.م</b>\nحوّل المبلغ بإنستاباي ثم أرسل صورة التحويل هنا 📸<span class="tm">9:42</span>');
  $('m5').querySelector('div').innerHTML = '<span style="font-size:13px;opacity:.8">تم التحويل بنجاح</span><b style="font-size:24px">6,060 ج.م ✓</b>';
  H('m6', 'تم استلام الدفع ✅\nطلبك مؤكد ويصلك خلال 2–4 أيام. شكرًا لك! 🌹<span class="tm">9:44</span>');
  document.querySelector('#s6 .cfoot div').textContent = 'اكتب رسالة';
  [['إتمام الطلب من الموقع', 'POST /order-create'], ['مساعد واتساب', 'webhook · HMAC verified'], ['إنستاباي · Paymob', 'awaiting_payment → paid'], ['تنبيه صاحب المتجر', 'Telegram · instant']]
    .forEach(([a, b], i) => { const d = $('n' + (i + 1)).querySelector('.ic').nextElementSibling; d.innerHTML = `<b>${a}</b><small>${b}</small>`; });
  $('nt').lastElementChild.innerHTML = '<b>طلب مدفوع جديد · 6,060 ج.م</b><small>ATR-261114-2841</small>';
  H('s7c', '<b>08</b> — النتيجة'); H('s7h', 'جاهز للانطلاق من اليوم الأول.');
  ['منتجًا أونلاين بصور استوديو', 'لغتان: العربية والإنجليزية', 'محافظة يصلها التوصيل', 'مساعد الطلبات على واتساب'].forEach((t, i) => { $('tl' + i).querySelector('p').textContent = t; });
  H('s8a', 'هذا مشروع واحد فقط.'); H('s8b', 'وهذا ما نبنيه أيضًا.'); H('s8c', 'حتى هذا الفيديو؟');
  H('s8d', '<span class="mono cy" style="font-weight:600;letter-spacing:-.05em;direction:ltr;margin-left:.2em">&lt;/&gt;</span> كتبناه بالكود.');
  H('tagl', 'شركة تطوير البرمجيات'); H('s9h', 'لنبنِ مشروعك القادم معًا.'); H('s9a', 'Let’s build yours.');
  document.querySelector('#s9cta .cta').innerHTML = 'اطلب عرض سعر <span style="opacity:.6">·</span> nexuscodes.tech';
  H('s9f', 'تطبيقات الموبايل · المواقع · المتاجر الإلكترونية · أنظمة الشركات · الذكاء الاصطناعي والأتمتة&nbsp;&nbsp;|&nbsp;&nbsp;مرخّصة في الإمارات · المنطقة الحرة بعجمان');
};
// called by v2.js after the brand and detail chapters are built and laid out
window.arBrand = function (V) {
  const $ = id => document.getElementById(id), B = window.ARS.brand, m = V ? '80px' : '120px';
  Object.entries(B).forEach(([id, h]) => { $(id).innerHTML = h; });
  ['sBc', 'bt1', 'bt2', 'bt3', 'bt4', 'bt5', 'bc1', 'bc2', 'bc3', 'bc4', 'bc5'].forEach(id => Object.assign($(id).style, { left: 'auto', right: m }));
  ['bt1', 'bt2', 'bt3', 'bt4', 'bt5'].forEach(id => { $(id).style.fontSize = V ? '76px' : '70px'; $(id).style.top = V ? '290px' : '128px'; });
  if (V) Object.assign($('bMini').style, { top: '128px' }); else Object.assign($('bMini').style, { right: 'auto', left: m });   // vertical: stay right, clear of the Nexus mark top left
};
