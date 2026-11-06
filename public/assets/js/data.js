/* Atr — Maison de Parfum: the photo catalogue, brands and reviews. */

const STORE = {
  name: "Atr",
  // WhatsApp number in international format without "+" or the leading 0
  // (Egypt +20, mobile 01289555608).
  whatsapp: "201289555608"
};

// The product shown in the arch at the top of the page (a code from GALLERY below).
const HERO_PHOTO = "OS01";

// Brands shown in the "Brands we love" strip (text only, no logos).
const BRANDS = [
  "Assaf", "Laverne", "Reef", "Dkhoon AlEmiratia", "Osma"
];

// Real customer reviews only. The reviews section stays hidden while this list is empty.
// Example: { name: "Mariam A.", city: { en: "Aswan", ar: "أسوان" }, en: "…", ar: "…" },
const TESTIMONIALS = [];

/* ---------- The collection ----------
   Studio photos of the products in stock, stored in assets/img/collection/
   (full size) and assets/img/collection/thumb/ (small, for the grid).
   Each item: code (the photo file name), brand, type, and an optional name.
   Leave `en` empty when the name is not known; the brand is shown instead.
   To add a photo: save it as assets/img/collection/<code>.jpg plus a smaller
   copy in thumb/, then add a line below. */

const GALLERY_BRANDS = {
  assaf: { en: "Assaf", ar: "عساف", group: "assaf" },
  laverne: { en: "Laverne", ar: "لافيرن", group: "laverne" },
  reef: { en: "Reef", ar: "ريف", group: "reef" },
  dkhoon: { en: "Dkhoon AlEmiratia", ar: "دخون الإماراتية", group: "dkhoon" },
  osma: { en: "Osma", ar: "أوسما", group: "osma" }
};

// Filter buttons above the collection: by type or by brand.
const GALLERY_FILTERS = [
  { id: "all", en: "All", ar: "الكل" },
  { id: "perfume", type: "perfume", en: "Perfumes", ar: "العطور" },
  { id: "sets", type: "set", en: "Gift sets", ar: "أطقم الهدايا" },
  { id: "assaf", group: "assaf", en: "Assaf", ar: "عساف" },
  { id: "laverne", group: "laverne", en: "Laverne", ar: "لافيرن" },
  { id: "reef", group: "reef", en: "Reef", ar: "ريف" },
  { id: "dkhoon", group: "dkhoon", en: "Dkhoon AlEmiratia", ar: "دخون الإماراتية" },
  { id: "osma", group: "osma", en: "Osma", ar: "أوسما" }
];

// "Shop by house" tiles: each opens the collection filtered to that brand.
const GALLERY_TILES = [
  { filter: "assaf", photo: "AS11" },
  { filter: "laverne", photo: "LV14" },
  { filter: "reef", photo: "RF02" }
];

// type: "perfume" | "musk" | "set"
const g = (code, brand, type, en = "", ar = "") => ({ code, brand, type, en, ar });
const GALLERY = [
  g("AS01", "assaf", "set", "Pegasus Collection", "مجموعة بيغاسوس"),
  g("AS02", "assaf", "perfume", "Aura Black", "أورا بلاك"),
  g("AS03", "assaf", "perfume", "Frankel Black Out", "فرانكل بلاك أوت"),
  g("AS04", "assaf", "perfume", "Frankel Blue Elixir", "فرانكل بلو إليكسير"),
  g("AS05", "assaf", "perfume", "Frankel Battle", "فرانكل باتل"),
  g("AS06", "assaf", "perfume", "Addict Blue", "أديكت بلو"),
  g("AS07", "assaf", "perfume", "Wild Pegasus", "وايلد بيغاسوس"),
  g("AS08", "assaf", "perfume", "No Comment", "نو كومنت"),
  g("AS09", "assaf", "perfume", "Gris Erik", "غريس إريك"),
  g("AS10", "assaf", "perfume", "Dangerous Arrogate", "دينجرس أروغيت"),
  g("AS11", "assaf", "perfume", "Arrogate Comete", "أروغيت كوميت"),
  g("AS12", "assaf", "perfume", "Arrogate Pink Diva", "أروغيت بينك ديفا"),
  g("AS13", "assaf", "perfume", "Boom Blue", "بوم بلو"),
  g("AS14", "assaf", "perfume", "Baby Girl", "بيبي جيرل"),
  g("AS15", "assaf", "perfume", "Feeling", "فيلينغ"),
  g("AS16", "assaf", "perfume", "Rose", "روز"),
  g("B08", "assaf", "perfume", "Pink Queen", "بينك كوين"),
  g("WA0119", "assaf", "perfume", "Arrogate Girl", "أروغيت جيرل"),
  g("WA0133", "assaf", "perfume", "Arrogate Hook Blue", "أروغيت هوك بلو"),
  g("C07", "laverne", "perfume", "Amber Royal", "أمبر رويال"),
  g("LV01", "laverne", "perfume", "Champion", "تشامبيون"),
  g("LV02", "laverne", "perfume", "Tyrant", "تايرنت"),
  g("LV03", "laverne", "perfume", "Last Chance", "لاست تشانس"),
  g("LV04", "laverne", "perfume", "Into the Sea", "إنتو ذا سي"),
  g("LV05", "laverne", "perfume", "Fearless", "فيرليس"),
  g("LV06", "laverne", "perfume", "La'Dor Bakhur", "لادور بخور"),
  g("LV07", "laverne", "perfume", "La'Dor Bakhur Valley", "لادور بخور فالي"),
  g("LV08", "laverne", "perfume", "La'Dor Santorini", "لادور سانتوريني"),
  g("LV09", "laverne", "perfume", "Atlantis Homme", "أتلانتس أوم"),
  g("LV10", "laverne", "perfume", "Bella", "بيلا"),
  g("LV11", "laverne", "perfume", "Lady Rose Bloom 200 ml", "ليدي روز بلوم ٢٠٠ مل"),
  g("LV12", "laverne", "perfume", "Lady Rose Bloom 100 ml", "ليدي روز بلوم ١٠٠ مل"),
  g("LV13", "laverne", "perfume", "Orchid Valley", "أوركيد فالي"),
  g("LV14", "laverne", "perfume", "Queen Rose", "كوين روز"),
  g("RF01", "reef", "set", "Princess Reef", "برنسيس ريف"),
  g("RF02", "reef", "perfume", "Pesca", "بيسكا"),
  g("RF03", "reef", "perfume", "Reef 11", "ريف 11"),
  g("RF04", "reef", "perfume", "Reef 42", "ريف 42"),
  g("RF05", "reef", "perfume", "Diriyah", "الدرعية"),
  g("RF06", "reef", "perfume", "Summer Yellow", "سمر الأصفر"),
  g("RF07", "reef", "perfume", "Bluest", "بلوست"),
  g("RF08", "reef", "perfume", "Reef 10", "ريف 10"),
  g("RF09", "reef", "perfume", "Reef 19", "ريف 19"),
  g("RF10", "reef", "perfume", "Reef 31", "ريف 31"),
  g("DK01", "dkhoon", "set", "Special Edition Collection", "مجموعة الإصدار الخاص"),
  g("DK02", "dkhoon", "perfume", "Musk Toffee", "مسك توفي"),
  g("DK03", "dkhoon", "perfume", "Crown Black", "كراون بلاك"),
  g("DK04", "dkhoon", "perfume", "No One", "نو ون"),
  g("DK05", "dkhoon", "perfume", "Gold Tears", "قولد تيرز"),
  g("DK06", "dkhoon", "perfume", "Kahilan", "كحيلان"),
  g("DK07", "dkhoon", "perfume", "Dkhoon Desert", "دخون ديزرت"),
  g("OS01", "osma", "perfume", "Rouge", "روج"),
  g("OS02", "osma", "perfume", "Noir", "نوار"),
  g("OS03", "osma", "perfume", "Bonsoir", "بونسوار"),
  g("OS04", "osma", "perfume", "Positano", "بوزيتانو"),
  g("OS05", "osma", "perfume", "Bonjour", "بونجور")
];

// The WhatsApp assistant (netlify/functions) reads the same catalogue on the server.
if (typeof module !== "undefined") module.exports = { STORE, GALLERY, GALLERY_BRANDS };
