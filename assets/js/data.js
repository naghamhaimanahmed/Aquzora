/* Aquzora store data: the photo catalogue, brands and reviews. */

const STORE = {
  name: "Aquzora",
  // WhatsApp number in international format without "+" or the leading 0
  // (Egypt +20, mobile 01289555608).
  whatsapp: "201289555608"
};

// Banner and "Why Aquzora" background photos: free Pexels photos
// (pexels.com/license: free for commercial use, no credit needed), stored in
// assets/img/ (run download-images.sh to fetch them again). If the local file is
// missing, the site loads it from Pexels instead.
const pexels = (id, w = 900) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const photo = (id, file, w = 900) => ({ local: `assets/img/${file}.jpg`, remote: pexels(id, w) });

const IMAGES = {
  hero: photo("8361545", "hero", 1600),
  story: photo("8166613", "story", 1200)
};

// Brands shown in the "Brands we love" strip (text only, no logos).
const BRANDS = [
  "Assaf", "Ibrahim Al Qurashi", "Arabian Oud", "Ajmal",
  "Lattafa", "Rasasi", "Swiss Arabian", "Abdul Samad Al Qurashi"
];

const TESTIMONIALS = [
  { name: "Mariam A.", city: { en: "Cairo", ar: "القاهرة" }, en: "Delivery was next day and the musk is beautiful. I sent a photo on WhatsApp and they helped me pick a gift in two minutes.", ar: "التوصيل كان في اليوم التالي والمسك رائع. أرسلت صورة على واتساب وساعدوني أختار هدية في دقيقتين." },
  { name: "Khalid R.", city: { en: "Alexandria", ar: "الإسكندرية" }, en: "Easy to order, cash on delivery, and everything came well packed. Will order again.", ar: "الطلب سهل والدفع عند الاستلام وكل شي وصل مغلف بشكل ممتاز. أكيد بطلب مرة ثانية." },
  { name: "Noura S.", city: { en: "Giza", ar: "الجيزة" }, en: "The Lady Collection gift set was perfect! Switching the site to Arabic made browsing so easy for my mother.", ar: "طقم هدايا ليدي كان مثالياً! تحويل الموقع للعربي سهّل التصفح على والدتي كثيراً." }
];

/* ---------- The collection: your product photos ----------
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

// Filter buttons above the collection: by type or by brand group.
const GALLERY_FILTERS = [
  { id: "all", en: "All", ar: "الكل" },
  { id: "perfume", type: "perfume", en: "Perfumes", ar: "العطور" },
  { id: "musk", type: "musk", en: "Musk", ar: "المسك" },
  { id: "sets", type: "set", en: "Gift sets", ar: "أطقم الهدايا" },
  { id: "iaq", group: "iaq", en: "Ibrahim Al Qurashi & Ibraq", ar: "إبراهيم القرشي وإبراق" },
  { id: "assaf", group: "assaf", en: "Assaf", ar: "عساف" },
  { id: "lattafa", group: "lattafa", en: "Lattafa", ar: "لطافة" },
  { id: "rasasi", group: "rasasi", en: "Rasasi", ar: "الرصاصي" },
  { id: "more", group: "more", en: "More brands", ar: "ماركات أخرى" }
];

// "Shop by category" tiles: each opens the collection with that filter on.
const GALLERY_TILES = [
  { filter: "perfume", photo: "D24" },
  { filter: "musk", photo: "D02" },
  { filter: "sets", photo: "C09" }
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
