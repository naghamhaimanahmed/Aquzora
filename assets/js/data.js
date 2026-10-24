/* Aquzora store data.
   To use your own photos: put them in assets/img/ and change the `img` value,
   e.g. img: "assets/img/royal-oud.jpg". Any image that fails to load falls back
   to a drawn bottle illustration, so the page never shows a broken image. */

const STORE = {
  name: "Aquzora",
  currency: { en: "AED", ar: "د.إ" },
  freeShippingFrom: 200,
  shippingFee: 20,
  // Your WhatsApp number in international format without "+" (e.g. "9715XXXXXXXX").
  // Left empty, the WhatsApp button opens the share sheet so the customer picks a chat.
  whatsapp: ""
};

const unsplash = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Each photo is stored in assets/img/ (run download-images.sh to fetch them).
// If the local file is missing, the site loads it from Unsplash instead.
const photo = (id, file, w = 900) => ({ local: `assets/img/${file}.jpg`, remote: unsplash(id, w) });

const IMAGES = {
  hero: photo("1541643600914-78b084683601", "hero", 1600),
  heroSide: photo("1522335789203-aabd1fc54bc9", "hero-side", 900),
  story: photo("1594035910387-fea47794261f", "story", 1200),
  cat: {
    perfume: photo("1592945403244-b3fbafd7f539", "cat-perfume", 800),
    oud: photo("1587017539504-67cfbddac569", "cat-oud", 800),
    makeup: photo("1512496015851-a90fb38ba796", "cat-makeup", 800),
    skincare: photo("1556228578-8c89e6adf883", "cat-skincare", 800)
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
const PRODUCTS = [
  { id: 1, cat: "perfume", img: photo("1541643600914-78b084683601", "product-1"), price: 295, old: 350, rating: 4.9, reviews: 212, badge: "best", family: ["oriental", "evening"],
    en: { name: "Royal Amber Eau de Parfum", size: "100 ml", notes: "Amber · Saffron · Vanilla", desc: "A warm, long-lasting amber with a saffron opening and a soft vanilla trail. Made for evenings and special occasions." },
    ar: { name: "عطر رويال أمبر", size: "١٠٠ مل", notes: "عنبر · زعفران · فانيلا", desc: "عنبر دافئ وثابت يبدأ بالزعفران وينتهي بلمسة فانيلا ناعمة. مثالي للمساء والمناسبات." } },
  { id: 2, cat: "perfume", img: photo("1594035910387-fea47794261f", "product-2"), price: 240, rating: 4.7, reviews: 148, badge: "new", family: ["floral", "day"],
    en: { name: "Rose Taifi Eau de Parfum", size: "75 ml", notes: "Taif Rose · Musk · Peony", desc: "Fresh Taif rose layered over clean white musk. Light enough for the office, lovely all day." },
    ar: { name: "عطر ورد طائفي", size: "٧٥ مل", notes: "ورد طائفي · مسك · فاوانيا", desc: "ورد طائفي منعش فوق المسك الأبيض النظيف. خفيف للدوام وجميل طوال اليوم." } },
  { id: 3, cat: "perfume", img: photo("1523293182086-7651a899d37f", "product-3"), price: 180, rating: 4.6, reviews: 96, family: ["fresh", "day"],
    en: { name: "Sea Breeze Eau de Toilette", size: "100 ml", notes: "Bergamot · Sea Salt · Cedar", desc: "A bright citrus and marine scent that keeps you fresh in the summer heat." },
    ar: { name: "عطر نسيم البحر", size: "١٠٠ مل", notes: "برغموت · ملح البحر · أرز", desc: "رائحة حمضية بحرية منعشة تبقيك منتعشاً في حر الصيف." } },
  { id: 4, cat: "perfume", img: photo("1592945403244-b3fbafd7f539", "product-4"), price: 320, rating: 4.8, reviews: 174, badge: "best", family: ["oriental", "woody", "evening"],
    en: { name: "Black Musk Intense", size: "100 ml", notes: "Black Musk · Patchouli · Leather", desc: "Deep, bold and unforgettable. A dark musk with patchouli and a smooth leather base." },
    ar: { name: "مسك أسود إنتنس", size: "١٠٠ مل", notes: "مسك أسود · باتشولي · جلد", desc: "عميق وجريء ولا يُنسى. مسك داكن مع الباتشولي وقاعدة جلدية ناعمة." } },
  { id: 5, cat: "perfume", img: photo("1563170351-be82bc888aa4", "product-5"), price: 210, rating: 4.5, reviews: 63, family: ["floral", "fresh", "day"],
    en: { name: "Jasmine Bloom", size: "50 ml", notes: "Jasmine · Pear · White Tea", desc: "Soft jasmine petals with juicy pear and a calm white tea finish." },
    ar: { name: "عطر زهرة الياسمين", size: "٥٠ مل", notes: "ياسمين · كمثرى · شاي أبيض", desc: "بتلات ياسمين ناعمة مع الكمثرى ولمسة هادئة من الشاي الأبيض." } },
  { id: 6, cat: "oud", img: photo("1587017539504-67cfbddac569", "product-6"), price: 450, old: 520, rating: 4.9, reviews: 301, badge: "best", family: ["woody", "oriental", "evening"],
    en: { name: "Cambodian Oud Oil", size: "12 ml", notes: "Pure Oud · Rose · Sandalwood", desc: "Concentrated oud oil with a rich, smoky heart. A few drops last the whole day." },
    ar: { name: "دهن عود كمبودي", size: "١٢ مل", notes: "عود خالص · ورد · صندل", desc: "دهن عود مركّز بقلب غني ودخاني. قطرات قليلة تدوم طوال اليوم." } },
  { id: 7, cat: "oud", img: photo("1595425970377-c9703cf48b6d", "product-7"), price: 160, rating: 4.7, reviews: 122, family: ["woody", "oriental"],
    en: { name: "Bakhoor Al Majlis", size: "60 g", notes: "Agarwood · Amber · Musk", desc: "Traditional bakhoor for the home and majlis. Fills the room with a warm, welcoming scent." },
    ar: { name: "بخور المجلس", size: "٦٠ غ", notes: "عود · عنبر · مسك", desc: "بخور تقليدي للبيت والمجلس. يملأ المكان برائحة دافئة ومرحّبة." } },
  { id: 8, cat: "oud", img: photo("1585386959984-a4155224a1ad", "product-8"), price: 275, rating: 4.8, reviews: 88, badge: "new", family: ["woody", "evening"],
    en: { name: "Oud Wood Eau de Parfum", size: "100 ml", notes: "Oud · Cardamom · Vetiver", desc: "A modern oud spray: smooth agarwood, a hint of cardamom and dry vetiver." },
    ar: { name: "عطر خشب العود", size: "١٠٠ مل", notes: "عود · هيل · فيتيفر", desc: "عود عصري بخاخ: خشب عود ناعم مع لمسة هيل وفيتيفر جاف." } },
  { id: 9, cat: "oud", img: photo("1590736969955-71cc94901144", "product-9"), price: 135, rating: 4.6, reviews: 57, family: ["oriental", "floral"],
    en: { name: "Musk Tahara Oil", size: "6 ml", notes: "White Musk · Rose · Powder", desc: "A clean, soft musk oil. Gentle on skin and perfect for everyday wear." },
    ar: { name: "دهن مسك الطهارة", size: "٦ مل", notes: "مسك أبيض · ورد · بودرة", desc: "دهن مسك نظيف وناعم. لطيف على البشرة ومثالي للاستخدام اليومي." } },
  { id: 10, cat: "makeup", img: photo("1586495777744-4413f21062fa", "product-10"), price: 89, rating: 4.7, reviews: 240, badge: "best",
    en: { name: "Velvet Matte Lipstick", size: "3.5 g", notes: "6 shades · 12h wear", desc: "Rich colour in one swipe with a comfortable, non-drying matte finish." },
    ar: { name: "أحمر شفاه مخملي مطفي", size: "٣٫٥ غ", notes: "٦ درجات · ثبات ١٢ ساعة", desc: "لون غني من أول مرة بلمسة مطفية مريحة لا تسبب الجفاف." } },
  { id: 11, cat: "makeup", img: photo("1512496015851-a90fb38ba796", "product-11"), price: 145, old: 175, rating: 4.6, reviews: 131,
    en: { name: "Desert Glow Eyeshadow Palette", size: "12 shades", notes: "Matte & shimmer", desc: "Warm golds, bronzes and nudes inspired by the desert at sunset." },
    ar: { name: "باليت ظلال توهج الصحراء", size: "١٢ لون", notes: "مطفي ولامع", desc: "ألوان ذهبية وبرونزية ونيود دافئة مستوحاة من غروب الصحراء." } },
  { id: 12, cat: "makeup", img: photo("1596462502278-27bfdc403348", "product-12"), price: 119, rating: 4.5, reviews: 77, badge: "new",
    en: { name: "Silk Finish Foundation", size: "30 ml", notes: "20 shades · SPF 20", desc: "Lightweight, buildable coverage that looks like skin and lasts through the day." },
    ar: { name: "كريم أساس بلمسة حريرية", size: "٣٠ مل", notes: "٢٠ درجة · SPF 20", desc: "تغطية خفيفة قابلة للبناء تبدو كالبشرة الطبيعية وتدوم طوال اليوم." } },
  { id: 13, cat: "makeup", img: photo("1522335789203-aabd1fc54bc9", "product-13"), price: 99, rating: 4.4, reviews: 52,
    en: { name: "Pro Brush Set", size: "8 brushes", notes: "Soft vegan bristles", desc: "Everything you need for face and eyes, in a travel case." },
    ar: { name: "طقم فرش احترافي", size: "٨ فرش", notes: "شعيرات نباتية ناعمة", desc: "كل ما تحتاجينه للوجه والعيون في حقيبة سفر." } },
  { id: 14, cat: "skincare", img: photo("1620916566398-39f1143ab7be", "product-14"), price: 155, rating: 4.8, reviews: 189, badge: "best",
    en: { name: "Vitamin C Glow Serum", size: "30 ml", notes: "Brightening · All skin types", desc: "Evens skin tone and adds a healthy glow. Use every morning before sunscreen." },
    ar: { name: "سيروم فيتامين سي للنضارة", size: "٣٠ مل", notes: "تفتيح · لجميع أنواع البشرة", desc: "يوحّد لون البشرة ويمنحها نضارة صحية. يُستخدم كل صباح قبل واقي الشمس." } },
  { id: 15, cat: "skincare", img: photo("1570194065650-d99fb4b38b15", "product-15"), price: 125, rating: 4.6, reviews: 98,
    en: { name: "Rose & Oud Face Cream", size: "50 ml", notes: "Hydrating · Night & day", desc: "Deep hydration with rose water and a light oud scent for soft, calm skin." },
    ar: { name: "كريم الوجه بالورد والعود", size: "٥٠ مل", notes: "ترطيب · ليل ونهار", desc: "ترطيب عميق بماء الورد مع رائحة عود خفيفة لبشرة ناعمة وهادئة." } },
  { id: 16, cat: "skincare", img: photo("1608248597279-f99d160bfcbc", "product-16"), price: 85, rating: 4.5, reviews: 64, badge: "new",
    en: { name: "Argan Hair & Body Oil", size: "100 ml", notes: "Nourishing · Non-greasy", desc: "Pure argan oil that softens hair and skin without leaving it oily." },
    ar: { name: "زيت الأرغان للشعر والجسم", size: "١٠٠ مل", notes: "مغذٍّ · غير دهني", desc: "زيت أرغان نقي ينعّم الشعر والبشرة دون ملمس دهني." } }
];

const TESTIMONIALS = [
  { name: "Mariam A.", city: { en: "Dubai", ar: "دبي" }, en: "Delivery was next day and the oud oil is beautiful. The scent finder helped me pick a gift in two minutes.", ar: "التوصيل كان في اليوم التالي ودهن العود رائع. اختبار العطر ساعدني أختار هدية في دقيقتين." },
  { name: "Khalid R.", city: { en: "Abu Dhabi", ar: "أبوظبي" }, en: "Easy to order, cash on delivery, and everything came well packed. Will order again.", ar: "الطلب سهل والدفع عند الاستلام وكل شي وصل مغلف بشكل ممتاز. أكيد بطلب مرة ثانية." },
  { name: "Noura S.", city: { en: "Sharjah", ar: "الشارقة" }, en: "Love the Desert Glow palette! Switching the site to Arabic made browsing so easy for my mother.", ar: "أحببت باليت توهج الصحراء! تحويل الموقع للعربي سهّل التصفح على والدتي كثيراً." }
];
