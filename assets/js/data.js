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
    // one of our own stock photos (no online copy, so no `remote`)
    musk: { local: "assets/img/collection/d02.jpg" }
  }
};

const CATEGORIES = [
  { id: "perfume", en: "Perfumes", ar: "العطور", tint: "#b98a4e" },
  { id: "oud", en: "Oud & Bakhoor", ar: "العود والبخور", tint: "#6b3f2a" },
  { id: "musk", en: "Musk", ar: "المسك", tint: "#a07c5a" }
];

// Brands shown in the "Brands we love" strip (text only, no logos).
// Swap in the brands you are authorised to sell.
const BRANDS = [
  "Assaf", "Ibrahim Al Qurashi", "Arabian Oud", "Ajmal",
  "Lattafa", "Rasasi", "Swiss Arabian", "Abdul Samad Al Qurashi"
];

// family: used by the scent finder
const PRODUCTS = [
  { id: 1, cat: "perfume", img: photo("35825543", "product-1"), price: 295, old: 350, rating: 4.9, reviews: 212, badge: "best", family: ["oriental", "evening"],
    en: { name: "Royal Amber Eau de Parfum", size: "100 ml", notes: "Amber · Saffron · Vanilla", desc: "A warm, long-lasting amber with a saffron opening and a soft vanilla trail. Made for evenings and special occasions." },
    ar: { name: "عطر رويال أمبر", size: "١٠٠ مل", notes: "عنبر · زعفران · فانيلا", desc: "عنبر دافئ وثابت يبدأ بالزعفران وينتهي بلمسة فانيلا ناعمة. مثالي للمساء والمناسبات." } },
  { id: 2, cat: "perfume", img: photo("1190829", "product-2"), price: 240, rating: 4.7, reviews: 148, badge: "new", family: ["floral", "day"],
    en: { name: "Rose Taifi Eau de Parfum", size: "75 ml", notes: "Taif Rose · Musk · Peony", desc: "Fresh Taif rose layered over clean white musk. Light enough for the office, lovely all day." },
    ar: { name: "عطر ورد طائفي", size: "٧٥ مل", notes: "ورد طائفي · مسك · فاوانيا", desc: "ورد طائفي منعش فوق المسك الأبيض النظيف. خفيف للدوام وجميل طوال اليوم." } },
  { id: 3, cat: "perfume", img: photo("8361486", "product-3"), price: 180, rating: 4.6, reviews: 96, family: ["fresh", "day"],
    en: { name: "Sea Breeze Eau de Toilette", size: "100 ml", notes: "Bergamot · Sea Salt · Cedar", desc: "A bright citrus and marine scent that keeps you fresh in the summer heat." },
    ar: { name: "عطر نسيم البحر", size: "١٠٠ مل", notes: "برغموت · ملح البحر · أرز", desc: "رائحة حمضية بحرية منعشة تبقيك منتعشاً في حر الصيف." } },
  { id: 4, cat: "perfume", img: photo("36779953", "product-4"), price: 320, rating: 4.8, reviews: 174, badge: "best", family: ["oriental", "woody", "evening"],
    en: { name: "Black Musk Intense", size: "100 ml", notes: "Black Musk · Patchouli · Leather", desc: "Deep, bold and unforgettable. A dark musk with patchouli and a smooth leather base." },
    ar: { name: "مسك أسود إنتنس", size: "١٠٠ مل", notes: "مسك أسود · باتشولي · جلد", desc: "عميق وجريء ولا يُنسى. مسك داكن مع الباتشولي وقاعدة جلدية ناعمة." } },
  { id: 5, cat: "perfume", img: photo("8450248", "product-5"), price: 210, rating: 4.5, reviews: 63, family: ["floral", "fresh", "day"],
    en: { name: "Jasmine Bloom", size: "50 ml", notes: "Jasmine · Pear · White Tea", desc: "Soft jasmine petals with juicy pear and a calm white tea finish." },
    ar: { name: "عطر زهرة الياسمين", size: "٥٠ مل", notes: "ياسمين · كمثرى · شاي أبيض", desc: "بتلات ياسمين ناعمة مع الكمثرى ولمسة هادئة من الشاي الأبيض." } },
  { id: 6, cat: "oud", img: photo("12402366", "product-6"), price: 450, old: 520, rating: 4.9, reviews: 301, badge: "best", family: ["woody", "oriental", "evening"],
    en: { name: "Cambodian Oud Oil", size: "12 ml", notes: "Pure Oud · Rose · Sandalwood", desc: "Concentrated oud oil with a rich, smoky heart. A few drops last the whole day." },
    ar: { name: "دهن عود كمبودي", size: "١٢ مل", notes: "عود خالص · ورد · صندل", desc: "دهن عود مركّز بقلب غني ودخاني. قطرات قليلة تدوم طوال اليوم." } },
  { id: 7, cat: "oud", img: photo("7947731", "product-7"), price: 160, rating: 4.7, reviews: 122, family: ["woody", "oriental"],
    en: { name: "Bakhoor Al Majlis", size: "60 g", notes: "Agarwood · Amber · Musk", desc: "Traditional bakhoor for the home and majlis. Fills the room with a warm, welcoming scent." },
    ar: { name: "بخور المجلس", size: "٦٠ غ", notes: "عود · عنبر · مسك", desc: "بخور تقليدي للبيت والمجلس. يملأ المكان برائحة دافئة ومرحّبة." } },
  { id: 8, cat: "oud", img: photo("34036480", "product-8"), price: 275, rating: 4.8, reviews: 88, badge: "new", family: ["woody", "evening"],
    en: { name: "Oud Wood Eau de Parfum", size: "100 ml", notes: "Oud · Cardamom · Vetiver", desc: "A modern oud spray: smooth agarwood, a hint of cardamom and dry vetiver." },
    ar: { name: "عطر خشب العود", size: "١٠٠ مل", notes: "عود · هيل · فيتيفر", desc: "عود عصري بخاخ: خشب عود ناعم مع لمسة هيل وفيتيفر جاف." } },
  { id: 9, cat: "musk", img: photo("34154866", "product-9"), price: 135, rating: 4.6, reviews: 57, family: ["oriental", "floral"],
    en: { name: "Musk Tahara Oil", size: "6 ml", notes: "White Musk · Rose · Powder", desc: "A clean, soft musk oil. Gentle on skin and perfect for everyday wear." },
    ar: { name: "دهن مسك الطهارة", size: "٦ مل", notes: "مسك أبيض · ورد · بودرة", desc: "دهن مسك نظيف وناعم. لطيف على البشرة ومثالي للاستخدام اليومي." } }
];

const TESTIMONIALS = [
  { name: "Mariam A.", city: { en: "Dubai", ar: "دبي" }, en: "Delivery was next day and the oud oil is beautiful. The scent finder helped me pick a gift in two minutes.", ar: "التوصيل كان في اليوم التالي ودهن العود رائع. اختبار العطر ساعدني أختار هدية في دقيقتين." },
  { name: "Khalid R.", city: { en: "Abu Dhabi", ar: "أبوظبي" }, en: "Easy to order, cash on delivery, and everything came well packed. Will order again.", ar: "الطلب سهل والدفع عند الاستلام وكل شي وصل مغلف بشكل ممتاز. أكيد بطلب مرة ثانية." },
  { name: "Noura S.", city: { en: "Sharjah", ar: "الشارقة" }, en: "The Rose Taifi is my new everyday perfume! Switching the site to Arabic made browsing so easy for my mother.", ar: "عطر الورد الطائفي صار عطري اليومي! تحويل الموقع للعربي سهّل التصفح على والدتي كثيراً." }
];

/* ---------- "In store now" photo gallery ----------
   Real photos of the products in stock, stored in assets/img/collection/
   (full size) and assets/img/collection/thumb/ (small, for the grid).
   Each item: code (the photo file name), brand, type, and an optional name.
   Leave `en` empty when the name is not known; the brand is shown instead.
   To add a photo: save it as assets/img/collection/<code>.jpg plus a smaller
   copy in thumb/, then add a line below. */

const GALLERY_BRANDS = {
  ibraq: { en: "Ibraq", ar: "إبراق", group: "iaq" },
  iaq: { en: "Ibrahim Al Qurashi", ar: "إبراهيم القرشي", group: "iaq" },
  assaf: { en: "Assaf", ar: "عساف", group: "assaf" },
  lattafa: { en: "Lattafa", ar: "لطافة", group: "lattafa" },
  rasasi: { en: "Rasasi", ar: "الرصاصي", group: "rasasi" },
  laverne: { en: "Laverne", ar: "لافيرن", group: "more" },
  thnyan: { en: "Thnyan", ar: "ثنيان", group: "more" },
  vivarea: { en: "Vivarea", ar: "فيفاريا", group: "more" },
  other: { en: "", ar: "", group: "more" }
};

// Filter buttons above the gallery: by type (musk, gift sets) or by brand group.
const GALLERY_FILTERS = [
  { id: "all", en: "All", ar: "الكل" },
  { id: "musk", type: "musk", en: "Musk", ar: "المسك" },
  { id: "sets", type: "set", en: "Gift sets", ar: "أطقم الهدايا" },
  { id: "iaq", group: "iaq", en: "Ibrahim Al Qurashi & Ibraq", ar: "إبراهيم القرشي وإبراق" },
  { id: "assaf", group: "assaf", en: "Assaf", ar: "عساف" },
  { id: "lattafa", group: "lattafa", en: "Lattafa", ar: "لطافة" },
  { id: "rasasi", group: "rasasi", en: "Rasasi", ar: "الرصاصي" },
  { id: "more", group: "more", en: "More brands", ar: "ماركات أخرى" }
];

// type: "perfume" | "musk" | "set"
const g = (code, brand, type, en = "", ar = "") => ({ code, brand, type, en, ar });
const GALLERY = [
  g("B02", "ibraq", "perfume", "Black Carbon Diamond", "بلاك كاربون دايموند"),
  g("B03", "ibraq", "perfume", "Purple Heart Diamond", "بيربل هارت دايموند"),
  g("B09", "ibraq", "perfume", "Emerald Soul Diamond", "إميرالد سول دايموند"),
  g("B13", "ibraq", "perfume", "Rose Coral Diamond", "روز كورال دايموند"),
  g("D20", "ibraq", "perfume", "Emer Carsoul Diamond", "إمير كارسول دايموند"),
  g("D24", "ibraq", "perfume", "Blue Diamond Aqua", "بلو دايموند أكوا"),
  g("D04", "ibraq", "perfume", "Pink Diamond Sakura", "بينك دايموند ساكورا"),
  g("D16", "ibraq", "perfume", "Balas Rose", "بالاس روز"),
  g("D21", "ibraq", "perfume", "Amethyst Khozam", "أميثيست خزام"),
  g("B17", "ibraq", "perfume", "Black Diamond Incense", "بلاك دايموند إنسنس"),
  g("B16", "ibraq", "perfume", "Black Carbon Diamond", "بلاك كاربون دايموند"),
  g("WA0116", "ibraq", "perfume"),
  g("WA0109", "ibraq", "perfume"),
  g("C18", "ibraq", "perfume", "French Tobacco", "فرنش توباكو"),
  g("D22", "ibraq", "perfume", "Brazilian Tobacco", "برازيليان توباكو"),
  g("WA0131", "ibraq", "perfume", "Spanish Tobacco", "سبانيش توباكو"),
  g("D19", "ibraq", "perfume", "Vintage Tobacco", "فينتج توباكو"),
  g("WA0115", "iaq", "perfume", "Sapphire Leather", "سفاير ليذر"),
  g("C05", "iaq", "musk", "Musk Al Lail", "مسك الليل"),
  g("C03", "iaq", "musk", "Musk Abaq Al Rumman", "مسك عبق الرمان"),
  g("B11", "iaq", "musk"),
  g("D01", "ibraq", "musk", "Musk Al Lail", "مسك الليل"),
  g("D02", "ibraq", "musk", "Musk Al Shams", "مسك الشمس"),
  g("D05", "ibraq", "musk", "Musk Abaq Al Rumman", "مسك عبق الرمان"),
  g("D03", "ibraq", "musk"),
  g("D08", "ibraq", "musk"),
  g("WA0111", "ibraq", "musk", "Musk Abaq Al Rumman", "مسك عبق الرمان"),
  g("WA0112", "ibraq", "musk", "Musk Al Shams", "مسك الشمس"),
  g("C06", "ibraq", "musk"),
  g("WA0130", "ibraq", "musk"),
  g("D06", "ibraq", "musk"),
  g("C19", "ibraq", "set", "Diamond Collection", "مجموعة دايموند"),
  g("D10", "ibraq", "set", "LTHR Discovery Set", "مجموعة LTHR للاكتشاف"),
  g("D12", "ibraq", "set"),
  g("WA0127", "ibraq", "set"),
  g("D11", "ibraq", "set"),
  g("C09", "ibraq", "set"),
  g("B14", "ibraq", "set"),
  g("C01", "ibraq", "set"),
  g("B15", "ibraq", "set"),
  g("C16", "ibraq", "set"),
  g("C04", "ibraq", "set"),

  g("B04", "assaf", "perfume", "Arrogate Pink", "أروغيت بينك"),
  g("B07", "assaf", "perfume", "Arrogate Pink", "أروغيت بينك"),
  g("B10", "assaf", "perfume", "Arrogate Diva", "أروغيت ديفا"),
  g("C17", "assaf", "perfume", "Arrogate Diva & Arrogate Pink", "أروغيت ديفا وأروغيت بينك"),
  g("WA0119", "assaf", "perfume", "Arrogate Girl", "أروغيت جيرل"),
  g("WA0117", "assaf", "perfume", "Arrogate Lip Stick", "أروغيت ليب ستيك"),
  g("C13", "assaf", "perfume", "Arrogate Lip Stick", "أروغيت ليب ستيك"),
  g("WA0133", "assaf", "perfume", "Arrogate Hook Blue", "أروغيت هوك بلو"),
  g("B06", "assaf", "perfume", "Arrogate Hook Blue", "أروغيت هوك بلو"),
  g("WA0121", "assaf", "perfume", "Hook Blue & Boom Blue", "هوك بلو وبوم بلو"),
  g("WA0113", "assaf", "perfume", "Arrogate Blue De Pro Men", "أروغيت بلو دي برو مين"),
  g("C14", "assaf", "perfume", "Pink Queen", "بينك كوين"),
  g("B08", "assaf", "perfume", "Pink Queen", "بينك كوين"),
  g("D18", "assaf", "perfume"),
  g("WA0125", "assaf", "set", "Lady Collection", "مجموعة ليدي"),
  g("B12", "assaf", "set", "Lady Collection", "مجموعة ليدي"),
  g("C15", "assaf", "set", "Lady Collection", "مجموعة ليدي"),
  g("WA0114", "assaf", "set", "Frankel Collection", "مجموعة فرانكل"),
  g("D14", "assaf", "set", "Arrogate Collection", "مجموعة أروغيت"),
  g("WA0123", "assaf", "set"),
  g("WA0129", "assaf", "set"),
  g("C10", "assaf", "set"),
  g("B01", "assaf", "set"),
  g("D15", "assaf", "set"),

  g("B20", "lattafa", "perfume", "Ana Abiyedh", "أنا الأبيض"),
  g("D23", "lattafa", "perfume", "Maahir Black Edition", "ماهر بلاك إديشن"),
  g("C20", "lattafa", "perfume", "Mohra Silky Rose", "مهرة سيلكي روز"),

  g("B19", "rasasi", "perfume", "Shuhrah Pour Homme", "شهرة للرجال"),
  g("D09", "rasasi", "perfume", "Shuhrah", "شهرة"),
  g("B18", "rasasi", "perfume", "Entebaa", "انطباع"),

  g("C07", "laverne", "perfume", "Amber Royal", "أمبر رويال"),
  g("C08", "laverne", "perfume", "Dare 7:00 AM", "دير 7:00 صباحاً"),
  g("C11", "laverne", "perfume", "Miss Laverne", "مس لافيرن"),
  g("D13", "thnyan", "perfume", "Roshn", "روشن"),
  g("D07", "thnyan", "perfume", "Roshn", "روشن"),
  g("B05", "vivarea", "perfume", "Step Pour Homme", "ستيب للرجال"),
  g("C12", "other", "perfume", "Zayed", "زايد"),
  g("C02", "other", "perfume", "Angham", "أنغام"),
  g("D17", "other", "perfume", "Dikhoon Rose", "دخون روز"),
  g("WA0122", "other", "perfume", "Al Wisam", "الوسام"),
  g("WA0124", "other", "perfume", "Signature Gold", "سيغنتشر غولد")
];
