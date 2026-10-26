/* Aquzora store data.
   To use your own photos: put them in assets/img/ and change the `img` value,
   e.g. img: "assets/img/royal-oud.jpg". Any image that fails to load falls back
   to a drawn bottle illustration, so the page never shows a broken image. */

const STORE = {
  name: "Aquzora",
  currency: { en: "EGP", ar: "ج.م" },
  freeShippingFrom: 1500,
  giftWrapFee: 50,
  // Your WhatsApp number in international format without "+" (e.g. "2010XXXXXXXX").
  // Left empty, the WhatsApp button opens the share sheet so the customer picks a chat.
  whatsapp: ""
};

// Delivery fee (EGP) and delivery time (working days) for every governorate in Egypt.
const GOVERNORATES = [
  { id: "cairo", en: "Cairo", ar: "القاهرة", fee: 50, days: "1–2" },
  { id: "giza", en: "Giza", ar: "الجيزة", fee: 50, days: "1–2" },
  { id: "alex", en: "Alexandria", ar: "الإسكندرية", fee: 60, days: "2–3" },
  { id: "qalyubia", en: "Qalyubia", ar: "القليوبية", fee: 60, days: "2–3" },
  { id: "dakahlia", en: "Dakahlia", ar: "الدقهلية", fee: 70, days: "2–3" },
  { id: "sharqia", en: "Sharqia", ar: "الشرقية", fee: 70, days: "2–3" },
  { id: "gharbia", en: "Gharbia", ar: "الغربية", fee: 70, days: "2–3" },
  { id: "monufia", en: "Monufia", ar: "المنوفية", fee: 70, days: "2–3" },
  { id: "beheira", en: "Beheira", ar: "البحيرة", fee: 70, days: "2–3" },
  { id: "kafr", en: "Kafr El Sheikh", ar: "كفر الشيخ", fee: 70, days: "2–3" },
  { id: "damietta", en: "Damietta", ar: "دمياط", fee: 70, days: "2–3" },
  { id: "portsaid", en: "Port Said", ar: "بورسعيد", fee: 70, days: "2–3" },
  { id: "ismailia", en: "Ismailia", ar: "الإسماعيلية", fee: 70, days: "2–3" },
  { id: "suez", en: "Suez", ar: "السويس", fee: 70, days: "2–3" },
  { id: "faiyum", en: "Faiyum", ar: "الفيوم", fee: 75, days: "2–4" },
  { id: "benisuef", en: "Beni Suef", ar: "بني سويف", fee: 75, days: "2–4" },
  { id: "minya", en: "Minya", ar: "المنيا", fee: 85, days: "3–4" },
  { id: "asyut", en: "Asyut", ar: "أسيوط", fee: 85, days: "3–4" },
  { id: "sohag", en: "Sohag", ar: "سوهاج", fee: 85, days: "3–5" },
  { id: "qena", en: "Qena", ar: "قنا", fee: 85, days: "3–5" },
  { id: "luxor", en: "Luxor", ar: "الأقصر", fee: 90, days: "3–5" },
  { id: "aswan", en: "Aswan", ar: "أسوان", fee: 90, days: "3–5" },
  { id: "redsea", en: "Red Sea", ar: "البحر الأحمر", fee: 100, days: "3–5" },
  { id: "ssinai", en: "South Sinai", ar: "جنوب سيناء", fee: 100, days: "3–5" },
  { id: "nsinai", en: "North Sinai", ar: "شمال سيناء", fee: 100, days: "4–6" },
  { id: "matrouh", en: "Matrouh", ar: "مطروح", fee: 100, days: "3–5" },
  { id: "newvalley", en: "New Valley", ar: "الوادي الجديد", fee: 110, days: "4–6" }
];

// Promo codes. type: "pct" = percent off, "off" = fixed EGP off, "ship" = free delivery.
const PROMOS = {
  WELCOME10: { type: "pct", value: 10 },
  AQZ200: { type: "off", value: 200, min: 2000 },
  FREESHIP: { type: "ship", min: 800 }
};

// Payment methods offered at checkout.
const PAYMENTS = ["cod", "card", "wallet", "instapay", "fawry", "valu"];

// Photos are free Pexels photos (pexels.com/license: free for commercial use, no credit needed).
const pexels = (id, w = 900) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

// Each photo is stored in assets/img/ (run download-images.sh to fetch them again).
// If the local file is missing, the site loads it from Pexels instead.
const photo = (id, file, w = 900) => ({ local: `assets/img/${file}.jpg`, remote: pexels(id, w) });

const IMAGES = {
  hero: photo("8361545", "hero", 1600),
  story: photo("8166613", "story", 1200),
  cat: {
    perfume: photo("8361493", "cat-perfume", 800),
    oud: photo("6954562", "cat-oud", 800),
    makeup: photo("7290089", "cat-makeup", 800),
    skincare: photo("5798000", "cat-skincare", 800)
  }
};

const CATEGORIES = [
  { id: "perfume", en: "Perfumes", ar: "العطور", tint: "#b98a4e" },
  { id: "oud", en: "Oud & Bakhoor", ar: "العود والبخور", tint: "#6b3f2a" },
  { id: "makeup", en: "Makeup", ar: "المكياج", tint: "#b4566b" },
  { id: "skincare", en: "Skincare", ar: "العناية بالبشرة", tint: "#7f9a8a" }
];

// Brands shown in the "Brands we love" strip (text only, no logos).
// Swap in the brands you are authorised to sell.
const BRANDS = [
  "Assaf", "Ibrahim Al Qurashi", "Arabian Oud", "Ajmal",
  "Lattafa", "Rasasi", "Swiss Arabian", "Abdul Samad Al Qurashi"
];

// family: used by the scent finder (perfume and oud only)
// options: sizes (each with its own price) or shades (each with a swatch colour); the first one is the default
// stock: shows "only N left" and caps the quantity; leave it out for items that are always in stock
const PRODUCTS = [
  { id: 1, cat: "perfume", img: photo("35825543", "product-1"), price: 2450, old: 2900, rating: 4.9, reviews: 212, badge: "best", family: ["oriental", "evening"],
    options: { type: "size", list: [{ en: "100 ml", ar: "١٠٠ مل", price: 2450 }, { en: "50 ml", ar: "٥٠ مل", price: 1450 }] },
    en: { name: "Royal Amber Eau de Parfum", size: "100 ml", notes: "Amber · Saffron · Vanilla", desc: "A warm, long-lasting amber with a saffron opening and a soft vanilla trail. Made for evenings and special occasions." },
    ar: { name: "عطر رويال أمبر", size: "١٠٠ مل", notes: "عنبر · زعفران · فانيلا", desc: "عنبر دافئ وثابت يبدأ بالزعفران وينتهي بلمسة فانيلا ناعمة. مثالي للمساء والمناسبات." } },
  { id: 2, cat: "perfume", img: photo("1190829", "product-2"), price: 1950, rating: 4.7, reviews: 148, badge: "new", family: ["floral", "day"],
    stock: 5, options: { type: "size", list: [{ en: "75 ml", ar: "٧٥ مل", price: 1950 }, { en: "30 ml", ar: "٣٠ مل", price: 950 }] },
    en: { name: "Rose Taifi Eau de Parfum", size: "75 ml", notes: "Taif Rose · Musk · Peony", desc: "Fresh Taif rose layered over clean white musk. Light enough for the office, lovely all day." },
    ar: { name: "عطر ورد طائفي", size: "٧٥ مل", notes: "ورد طائفي · مسك · فاوانيا", desc: "ورد طائفي منعش فوق المسك الأبيض النظيف. خفيف للدوام وجميل طوال اليوم." } },
  { id: 3, cat: "perfume", img: photo("8361486", "product-3"), price: 1450, rating: 4.6, reviews: 96, family: ["fresh", "day"],
    en: { name: "Sea Breeze Eau de Toilette", size: "100 ml", notes: "Bergamot · Sea Salt · Cedar", desc: "A bright citrus and marine scent that keeps you fresh in the summer heat." },
    ar: { name: "عطر نسيم البحر", size: "١٠٠ مل", notes: "برغموت · ملح البحر · أرز", desc: "رائحة حمضية بحرية منعشة تبقيك منتعشاً في حر الصيف." } },
  { id: 4, cat: "perfume", img: photo("36779953", "product-4"), price: 2650, rating: 4.8, reviews: 174, badge: "best", family: ["oriental", "woody", "evening"],
    options: { type: "size", list: [{ en: "100 ml", ar: "١٠٠ مل", price: 2650 }, { en: "50 ml", ar: "٥٠ مل", price: 1550 }] },
    en: { name: "Black Musk Intense", size: "100 ml", notes: "Black Musk · Patchouli · Leather", desc: "Deep, bold and unforgettable. A dark musk with patchouli and a smooth leather base." },
    ar: { name: "مسك أسود إنتنس", size: "١٠٠ مل", notes: "مسك أسود · باتشولي · جلد", desc: "عميق وجريء ولا يُنسى. مسك داكن مع الباتشولي وقاعدة جلدية ناعمة." } },
  { id: 5, cat: "perfume", img: photo("8450248", "product-5"), price: 1350, rating: 4.5, reviews: 63, family: ["floral", "fresh", "day"],
    en: { name: "Jasmine Bloom", size: "50 ml", notes: "Jasmine · Pear · White Tea", desc: "Soft jasmine petals with juicy pear and a calm white tea finish." },
    ar: { name: "عطر زهرة الياسمين", size: "٥٠ مل", notes: "ياسمين · كمثرى · شاي أبيض", desc: "بتلات ياسمين ناعمة مع الكمثرى ولمسة هادئة من الشاي الأبيض." } },
  { id: 6, cat: "oud", img: photo("12402366", "product-6"), price: 3800, old: 4400, rating: 4.9, reviews: 301, badge: "best", family: ["woody", "oriental", "evening"],
    stock: 4, options: { type: "size", list: [{ en: "12 ml", ar: "١٢ مل", price: 3800 }, { en: "6 ml", ar: "٦ مل", price: 2000 }] },
    en: { name: "Cambodian Oud Oil", size: "12 ml", notes: "Pure Oud · Rose · Sandalwood", desc: "Concentrated oud oil with a rich, smoky heart. A few drops last the whole day." },
    ar: { name: "دهن عود كمبودي", size: "١٢ مل", notes: "عود خالص · ورد · صندل", desc: "دهن عود مركّز بقلب غني ودخاني. قطرات قليلة تدوم طوال اليوم." } },
  { id: 7, cat: "oud", img: photo("7947731", "product-7"), price: 650, rating: 4.7, reviews: 122, family: ["woody", "oriental"],
    en: { name: "Bakhoor Al Majlis", size: "60 g", notes: "Agarwood · Amber · Musk", desc: "Traditional bakhoor for the home and majlis. Fills the room with a warm, welcoming scent." },
    ar: { name: "بخور المجلس", size: "٦٠ غ", notes: "عود · عنبر · مسك", desc: "بخور تقليدي للبيت والمجلس. يملأ المكان برائحة دافئة ومرحّبة." } },
  { id: 8, cat: "oud", img: photo("34036480", "product-8"), price: 2250, rating: 4.8, reviews: 88, badge: "new", family: ["woody", "evening"],
    options: { type: "size", list: [{ en: "100 ml", ar: "١٠٠ مل", price: 2250 }, { en: "50 ml", ar: "٥٠ مل", price: 1350 }] },
    en: { name: "Oud Wood Eau de Parfum", size: "100 ml", notes: "Oud · Cardamom · Vetiver", desc: "A modern oud spray: smooth agarwood, a hint of cardamom and dry vetiver." },
    ar: { name: "عطر خشب العود", size: "١٠٠ مل", notes: "عود · هيل · فيتيفر", desc: "عود عصري بخاخ: خشب عود ناعم مع لمسة هيل وفيتيفر جاف." } },
  { id: 9, cat: "oud", img: photo("34154866", "product-9"), price: 450, rating: 4.6, reviews: 57, family: ["oriental", "floral"],
    en: { name: "Musk Tahara Oil", size: "6 ml", notes: "White Musk · Rose · Powder", desc: "A clean, soft musk oil. Gentle on skin and perfect for everyday wear." },
    ar: { name: "دهن مسك الطهارة", size: "٦ مل", notes: "مسك أبيض · ورد · بودرة", desc: "دهن مسك نظيف وناعم. لطيف على البشرة ومثالي للاستخدام اليومي." } },
  { id: 10, cat: "makeup", img: photo("1213558", "product-10"), price: 450, rating: 4.7, reviews: 240, badge: "best",
    options: { type: "shade", list: [
      { en: "Ruby", ar: "روبي", color: "#9b1b30" }, { en: "Rose Nude", ar: "نود وردي", color: "#c27b6e" },
      { en: "Berry", ar: "توتي", color: "#7a2148" }, { en: "Coral", ar: "مرجاني", color: "#e0614f" },
      { en: "Mocha", ar: "موكا", color: "#6b3e2e" }, { en: "Classic Red", ar: "أحمر كلاسيكي", color: "#b3001b" }] },
    en: { name: "Velvet Matte Lipstick", size: "3.5 g", notes: "6 shades · 12h wear", desc: "Rich colour in one swipe with a comfortable, non-drying matte finish." },
    ar: { name: "أحمر شفاه مخملي مطفي", size: "٣٫٥ غ", notes: "٦ درجات · ثبات ١٢ ساعة", desc: "لون غني من أول مرة بلمسة مطفية مريحة لا تسبب الجفاف." } },
  { id: 11, cat: "makeup", img: photo("1327689", "product-11"), price: 850, old: 1050, rating: 4.6, reviews: 131,
    stock: 3,
    en: { name: "Desert Glow Eyeshadow Palette", size: "12 shades", notes: "Matte & shimmer", desc: "Warm golds, bronzes and nudes inspired by the desert at sunset." },
    ar: { name: "باليت ظلال توهج الصحراء", size: "١٢ لون", notes: "مطفي ولامع", desc: "ألوان ذهبية وبرونزية ونيود دافئة مستوحاة من غروب الصحراء." } },
  { id: 12, cat: "makeup", img: photo("7290611", "product-12"), price: 750, rating: 4.5, reviews: 77, badge: "new",
    options: { type: "shade", list: [
      { en: "Porcelain", ar: "بورسلين", color: "#f3d9c4" }, { en: "Ivory", ar: "عاجي", color: "#ecc9a8" },
      { en: "Sand", ar: "رملي", color: "#d9a982" }, { en: "Honey", ar: "عسلي", color: "#c08b5c" },
      { en: "Caramel", ar: "كراميل", color: "#a16c43" }, { en: "Espresso", ar: "إسبريسو", color: "#6b4229" }] },
    en: { name: "Silk Finish Foundation", size: "30 ml", notes: "20 shades · SPF 20", desc: "Lightweight, buildable coverage that looks like skin and lasts through the day." },
    ar: { name: "كريم أساس بلمسة حريرية", size: "٣٠ مل", notes: "٢٠ درجة · SPF 20", desc: "تغطية خفيفة قابلة للبناء تبدو كالبشرة الطبيعية وتدوم طوال اليوم." } },
  { id: 13, cat: "makeup", img: photo("7675855", "product-13"), price: 690, rating: 4.4, reviews: 52,
    en: { name: "Pro Brush Set", size: "8 brushes", notes: "Soft vegan bristles", desc: "Everything you need for face and eyes, in a travel case." },
    ar: { name: "طقم فرش احترافي", size: "٨ فرش", notes: "شعيرات نباتية ناعمة", desc: "كل ما تحتاجينه للوجه والعيون في حقيبة سفر." } },
  { id: 14, cat: "skincare", img: photo("30229017", "product-14"), price: 950, rating: 4.8, reviews: 189, badge: "best",
    en: { name: "Vitamin C Glow Serum", size: "30 ml", notes: "Brightening · All skin types", desc: "Evens skin tone and adds a healthy glow. Use every morning before sunscreen." },
    ar: { name: "سيروم فيتامين سي للنضارة", size: "٣٠ مل", notes: "تفتيح · لجميع أنواع البشرة", desc: "يوحّد لون البشرة ويمنحها نضارة صحية. يُستخدم كل صباح قبل واقي الشمس." } },
  { id: 15, cat: "skincare", img: photo("8100816", "product-15"), price: 780, rating: 4.6, reviews: 98,
    en: { name: "Rose & Oud Face Cream", size: "50 ml", notes: "Hydrating · Night & day", desc: "Deep hydration with rose water and a light oud scent for soft, calm skin." },
    ar: { name: "كريم الوجه بالورد والعود", size: "٥٠ مل", notes: "ترطيب · ليل ونهار", desc: "ترطيب عميق بماء الورد مع رائحة عود خفيفة لبشرة ناعمة وهادئة." } },
  { id: 16, cat: "skincare", img: photo("8101533", "product-16"), price: 520, rating: 4.5, reviews: 64, badge: "new",
    en: { name: "Argan Hair & Body Oil", size: "100 ml", notes: "Nourishing · Non-greasy", desc: "Pure argan oil that softens hair and skin without leaving it oily." },
    ar: { name: "زيت الأرغان للشعر والجسم", size: "١٠٠ مل", notes: "مغذٍّ · غير دهني", desc: "زيت أرغان نقي ينعّم الشعر والبشرة دون ملمس دهني." } }
];

const TESTIMONIALS = [
  { name: "Mariam A.", city: { en: "Cairo", ar: "القاهرة" }, en: "Delivery to New Cairo was next day and the oud oil is beautiful. The scent finder helped me pick a gift in two minutes.", ar: "التوصيل للتجمع كان تاني يوم ودهن العود رائع. اختبار العطر ساعدني أختار هدية في دقيقتين." },
  { name: "Ahmed R.", city: { en: "Alexandria", ar: "الإسكندرية" }, en: "Easy to order, cash on delivery, and everything came well packed. Will order again.", ar: "الطلب سهل والدفع عند الاستلام وكل شي وصل مغلف بشكل ممتاز. أكيد بطلب مرة ثانية." },
  { name: "Nour S.", city: { en: "Mansoura", ar: "المنصورة" }, en: "Love the Desert Glow palette! Switching the site to Arabic made browsing so easy for my mother.", ar: "أحببت باليت توهج الصحراء! تحويل الموقع للعربي سهّل التصفح على والدتي كثيراً." }
];
