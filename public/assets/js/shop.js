/* Atr shop settings: prices, delivery and payment.
   This one file is read by the website AND by the payment function
   (netlify/functions/paymob-checkout.js), so the amount a customer pays by card
   is always worked out from these prices on the server, never from the browser. */

const SHOP = {
  currency: "EGP",

  // Price in Egyptian pounds for each product, by its photo reference (see GALLERY in data.js).
  // A product with no price here shows "Price on request": it can still go in the cart and be
  // ordered on WhatsApp, but it cannot be paid by card until it has a price.
  // Example:  B03: 1850,
  // Prices: the price each brand's website sells at today (6 Nov 2026), converted to EGP and rounded to 10.
  // Full list with sources: prices/price-list.csv. Change any number here to set your own price.
  PRICES: {
    // osma
    OS01: 3320,   // Rouge, 100 ml: 231 SAR (regular 239)
    OS02: 3320,   // Noir, 100 ml: 231 SAR (regular 239) (estimate)
    OS03: 3720,   // Bonsoir, 150 ml: 259 SAR (estimate)
    OS04: 3720,   // Positano, 150 ml: 259 SAR (estimate)
    OS05: 3720,   // Bonjour, 150 ml: 259 SAR (estimate)
    // dkhoon
    DK01: 3800,   // Special Edition Collection, 6 x 50 ml: 50 JOD
    DK02: 1370,   // Musk Toffee, 100 ml: 95 SAR (estimate)
    DK03: 1370,   // Crown Black, 100 ml: 95 SAR
    DK04: 1370,   // No One, 100 ml: 95 SAR
    DK05: 1370,   // Gold Tears, 100 ml: 95 SAR
    DK06: 1850,   // Kahilan, 100 ml: 129 SAR
    DK07: 1370,   // Dkhoon Desert, 100 ml: 95 SAR (estimate)
    // reef
    RF01: 2860,   // Princess Reef, box: 199 SAR (regular 419)
    RF02: 3720,   // Pesca, 200 ml: 259 SAR (regular 325)
    RF03: 2900,   // Reef 11, 100 ml: 39.95 GBP (regular 55)
    RF04: 2900,   // Reef 42, 100 ml: 39.95 GBP (regular 55)
    RF05: 3290,   // Diriyah, 100 ml: 229 SAR (regular 325) (estimate)
    RF06: 3720,   // Summer Yellow, 100 ml: 259 SAR (regular 325)
    RF07: 3720,   // Bluest, 200 ml: 259 SAR (regular 325) (estimate)
    RF08: 4100,   // Reef 10, 100 ml: 76 USD
    RF09: 4300,   // Reef 19, 100 ml: 299 SAR (regular 325)
    RF10: 3720,   // Reef 31, 100 ml: 259 SAR (regular 325) (estimate)
    // laverne
    LV01: 1650,   // Champion, 200 ml: 115 SAR (regular 275)
    LV02: 1800,   // Tyrant, 200 ml: 125 SAR (regular 275) (estimate)
    LV03: 1800,   // Last Chance, 200 ml: 125 SAR (regular 275) (estimate)
    LV04: 1800,   // Into the Sea, 200 ml: 125 SAR (regular 275)
    LV05: 1800,   // Fearless, 200 ml: 125 SAR (regular 275)
    C07: 2190,    // Amber Royal, 200 ml: 149 AED (regular 275)
    LV06: 1800,   // La'Dor Bakhur, 200 ml: 125 SAR (regular 275)
    LV07: 3120,   // La'Dor Bakhur Valley, 200 ml: 41 JOD (regular 54)
    LV08: 1800,   // La'Dor Santorini, 200 ml: 125 SAR (regular 275)
    LV09: 2140,   // Atlantis Homme, 200 ml: 149 SAR (regular 275)
    LV10: 1830,   // Bella, 200 ml: 125 AED (regular 275)
    LV11: 2040,   // Lady Rose Bloom 200 ml, 200 ml: 139 AED (regular 275)
    LV12: 2760,   // Lady Rose Bloom 100 ml, 100 ml: 37.99 GBP
    LV13: 1800,   // Orchid Valley, 200 ml: 125 SAR (regular 275) (estimate)
    LV14: 1800,   // Queen Rose, 200 ml: 125 SAR (regular 275) (estimate)
    // assaf
    AS01: 5870,   // Pegasus Collection, 3 x 100 ml: 399.99 AED (regular 520.87)
    AS02: 1420,   // Aura Black, 150 ml: 99 SAR (regular 250)
    AS03: 1420,   // Frankel Black Out, 200 ml: 99 SAR (regular 295)
    AS04: 1420,   // Frankel Blue Elixir, 200 ml: 99 SAR (regular 299)
    AS05: 1420,   // Frankel Battle, 100 ml: 99 SAR (regular 289)
    AS06: 1800,   // Addict Blue, 125 ml: 125 SAR (regular 275)
    AS07: 1850,   // Wild Pegasus, 150 ml: 129 SAR (regular 275)
    AS08: 2000,   // No Comment: 139 SAR (regular 249)
    AS09: 1420,   // Gris Erik, 100 ml: 99 SAR (regular 199)
    AS10: 1650,   // Dangerous Arrogate, 200 ml: 115 SAR (regular 295)
    AS11: 1850,   // Arrogate Comete, 200 ml: 129 SAR (regular 295)
    AS12: 1650,   // Arrogate Pink Diva, 200 ml: 115 SAR (regular 245)
    AS13: 1420,   // Boom Blue, 200 ml: 99 SAR (regular 199)
    AS14: 1450,   // Baby Girl, 120 ml: 99 AED (regular 199)
    AS15: 1830,   // Feeling, 200 ml: 125 AED (regular 275)
    AS16: 1800,   // Rose, 200 ml: 125 SAR (regular 225) (estimate)
    B08: 1710,    // Pink Queen: 119 SAR (regular 299)
    WA0119: 2860, // Arrogate Girl: 199 SAR (regular 299)
    WA0133: 1420, // Arrogate Hook Blue, 200 ml: 99 SAR (regular 199)
  },

  // Delivery fee in EGP. Free when the order total reaches freeFrom.
  // Leave a fee as null until you decide it: below freeFrom the fee is then agreed on WhatsApp
  // and card payment is not offered.
  DELIVERY: {
    freeFrom: 2000,
    aswan: 50,     // delivery inside Aswan, where the store is (1–2 working days)
    other: 100     // all other governorates (2–4 days)
  },

  // Card payments through Paymob (see README → "Card payments with Paymob").
  // Turn on only after the Paymob keys are set on the server.
  // InstaPay: how customers pay. An order is confirmed once the customer sends the transfer
  // screenshot in WhatsApp. Put your InstaPay address (e.g. "atr@instapay") or the mobile
  // number linked to InstaPay, and optionally the account holder's name as InstaPay shows it.
  // While address is empty, customers are told the details will be sent in the WhatsApp chat.
  INSTAPAY: {
    address: "",
    accountName: ""
  },

  // The automatic WhatsApp assistant (see README → "WhatsApp order assistant").
  // Turn on only after it is connected to the WhatsApp Business Platform.
  WHATSAPP_BOT: {
    enabled: false,
    orderEndpoint: "/.netlify/functions/order-create"
  },

  PAYMENT: {
    cardEnabled: false,
    checkoutEndpoint: "/.netlify/functions/paymob-checkout",
    verifyEndpoint: "/.netlify/functions/paymob-verify"
  },

  // The 27 governorates of Egypt, Aswan (home, "local" delivery fee) first.
  GOVERNORATES: [
    { id: "aswan", en: "Aswan", ar: "أسوان", local: true },
    { id: "cairo", en: "Cairo", ar: "القاهرة" },
    { id: "giza", en: "Giza", ar: "الجيزة" },
    { id: "alexandria", en: "Alexandria", ar: "الإسكندرية" },
    { id: "qalyubia", en: "Qalyubia", ar: "القليوبية" },
    { id: "port-said", en: "Port Said", ar: "بورسعيد" },
    { id: "suez", en: "Suez", ar: "السويس" },
    { id: "damietta", en: "Damietta", ar: "دمياط" },
    { id: "dakahlia", en: "Dakahlia", ar: "الدقهلية" },
    { id: "sharqia", en: "Sharqia", ar: "الشرقية" },
    { id: "gharbia", en: "Gharbia", ar: "الغربية" },
    { id: "monufia", en: "Monufia", ar: "المنوفية" },
    { id: "beheira", en: "Beheira", ar: "البحيرة" },
    { id: "kafr-el-sheikh", en: "Kafr El Sheikh", ar: "كفر الشيخ" },
    { id: "ismailia", en: "Ismailia", ar: "الإسماعيلية" },
    { id: "faiyum", en: "Faiyum", ar: "الفيوم" },
    { id: "beni-suef", en: "Beni Suef", ar: "بني سويف" },
    { id: "minya", en: "Minya", ar: "المنيا" },
    { id: "asyut", en: "Asyut", ar: "أسيوط" },
    { id: "sohag", en: "Sohag", ar: "سوهاج" },
    { id: "qena", en: "Qena", ar: "قنا" },
    { id: "luxor", en: "Luxor", ar: "الأقصر" },
    { id: "red-sea", en: "Red Sea", ar: "البحر الأحمر" },
    { id: "new-valley", en: "New Valley", ar: "الوادي الجديد" },
    { id: "matrouh", en: "Matrouh", ar: "مطروح" },
    { id: "north-sinai", en: "North Sinai", ar: "شمال سيناء" },
    { id: "south-sinai", en: "South Sinai", ar: "جنوب سيناء" }
  ]
};

// Shared money rules, used by the website and the server alike.
SHOP.priceOf = code => (Number.isFinite(SHOP.PRICES[code]) && SHOP.PRICES[code] > 0 ? SHOP.PRICES[code] : null);
// lines: [{ code, qty }]. Returns subtotal of priced lines, whether any line has no price,
// the delivery fee (null if unknown) and the total.
SHOP.quote = (lines, governorateId) => {
  let subtotal = 0, unpriced = false;
  lines.forEach(l => { const p = SHOP.priceOf(l.code); if (p === null) unpriced = true; else subtotal += p * l.qty; });
  const gov = SHOP.GOVERNORATES.find(g => g.id === governorateId);
  let delivery = null;
  if (subtotal >= SHOP.DELIVERY.freeFrom && !unpriced) delivery = 0;
  else if (gov) delivery = gov.local ? SHOP.DELIVERY.aswan : SHOP.DELIVERY.other;
  else if (governorateId === "other") delivery = SHOP.DELIVERY.other; // "another governorate" (not Aswan)
  // no total while any item has no price: it is agreed on WhatsApp
  return { subtotal, unpriced, delivery, total: unpriced || delivery === null ? null : subtotal + delivery };
};

if (typeof module !== "undefined") module.exports = SHOP;
