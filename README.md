# Atr · Maison de Parfum

A bilingual (العربية / English) perfume store website, based in Aswan and delivering across Egypt (prices in EGP), built on the Atr brand identity: "Heritage in every drop. · إرثٌ في كل قطرة". The website is the `public/` folder: open `public/index.html` in any browser; no install or build step. Only `public/` is published; the payment server code is in `netlify/functions/`.

## Features
- **Arabic first, always bilingual**: the site opens in Arabic (right to left) and switches to English; the choice is remembered. The tagline is always shown in both languages.
- **Our collection**: studio photos of the 56 perfumes and gift sets in stock (Assaf, Laverne, Reef, Dkhoon AlEmiratia, Osma), filterable by type (perfumes, gift sets) or brand, 12 at a time with "Show more".
- **Photo viewer**: tap a photo to see it full size, move through the photos (buttons or arrow keys), and **ask about it on WhatsApp**. The message includes the product name and photo reference so you know which item the customer means.
- **Shop by house** tiles (Assaf, Laverne, Reef) that open the collection filtered to that brand.
- **Search** (header or bottom bar, press `/`) by product name, brand or type, in English or Arabic.
- **WhatsApp** buttons in the header, banner, footer and mobile bottom bar.
- **Newsletter** saved with Netlify Forms (with a spam trap); after signing up the customer sees the code **WELCOME10** (10% off the first WhatsApp order), which they can enter in the checkout's discount-code box.
- **Reviews** section, shown only once real reviews are added to `TESTIMONIALS` in `public/assets/js/data.js`.
- **Terms of sale** (`public/terms.html`) and **Privacy policy** (`public/privacy.html`), Arabic first with English below, linked from the footer and checkout.
- Brands strip and a footer with contact details.
- Mobile first: bottom navigation bar, bottom-sheet photo viewer, large tap targets, keyboard and screen-reader friendly, respects reduced motion.

- **Cart**: add products from the photo viewer, change quantities, see the free-delivery progress (free over EGP 2,000). The cart is saved in the customer's browser.
- **One-tap WhatsApp order from the cart**: "Order on WhatsApp" opens a chat with the store's number with a short order message: products with brand and code, quantities, prices (or "price on request"), item count, total, free delivery when it applies, and an order number such as `ATR-261106-3784`. It is kept short to match the store's WhatsApp Business quick replies: `/1` asks the customer to confirm, `/2` asks for name, governorate, address and mobile, `/3` confirms with the delivery fees. The customer presses Send in WhatsApp (WhatsApp never lets a website send for them) and the order arrives in the store's WhatsApp as a chat with that customer.
- **Checkout** with name, Egyptian mobile number, governorate (all 27) and address, and two ways to pay:
  - **Card (Visa / Mastercard) through Paymob**: the customer pays on Paymob's secure page; card details never touch this site.
  - **Order on WhatsApp**: the full order (items, references, prices, delivery, customer details and an order number such as `ATR-261104-2180`) is sent to the store's WhatsApp to agree payment and delivery.

## Prices and delivery
Prices and delivery fees live in `public/assets/js/shop.js`, which is read by both the website and the payment server, so a customer cannot change a price in the browser.
- `PRICES`: one line per product, by its photo reference, in Egyptian pounds, e.g. `AS01: 1850,`. A product without a price shows "Price on request"; it can still be ordered on WhatsApp but not paid by card.
- `DELIVERY`: `freeFrom` (2000), `aswan` (EGP 50, local, 1–2 working days) and `other` (EGP 100, 2–4 days) fees. While a fee is `null`, it is agreed on WhatsApp and card payment is not offered below the free-delivery amount.

## WhatsApp order assistant
An automatic assistant on the store's WhatsApp number that handles orders from the cart:

1. The customer taps **Order on WhatsApp** in the cart. The site saves the cart on the server (`order-create`) and opens WhatsApp with a short message holding the order number; the customer presses Send.
2. The assistant (`whatsapp-webhook`) replies with the **order details** and the buttons **✅ Confirm order · ✏️ Edit order · ❌ Cancel** (typing "تأكيد" / "confirm" or "إلغاء" / "cancel" also works).
3. After Confirm it asks, one at a time: **full name** → governorate with the buttons **📍 In Aswan · 🚚 Other governorate** (sets the EGP 50 / 100 delivery fee) → **detailed address** (area, street, building, floor, flat, landmark) → **mobile** with **📱 This WhatsApp number · ☎️ Another number** (Egyptian numbers are checked, Arabic digits accepted).
4. It shows a **summary with the total** and **✅ Confirm · ✏️ Edit details**; after the final confirm the customer gets the delivery time and you get the whole order as an alert (Telegram, see the Paymob section, and Netlify's function log). The order is stored with the status `confirmed`.

People who just chat get a short welcome at most once a day, and every message is forwarded to you. It replies in Arabic or English, matching the language the customer used on the site. Orders and conversations are kept in Netlify Blobs (built into Netlify; the `@netlify/blobs` package in `package.json` is installed automatically).

Until it is switched on, the cart button sends the full order as a ready-written WhatsApp message instead (and it falls back to that if the server cannot be reached).

**Setting it up** (the WhatsApp Business Platform from Meta):
1. **Meta Business account** at business.facebook.com, and verify the business.
2. **App**: developers.facebook.com → Create app → type *Business* → add the **WhatsApp** product.
3. **Phone number**: choose one of these.
   - Keep using 01289555608 in the **WhatsApp Business app** and connect it to the platform ("use your existing WhatsApp Business app number"). Chats then appear both in the app and to the assistant. If the number is on ordinary WhatsApp, move it to the WhatsApp Business app first.
   - If Meta does not offer that for your number, connecting it moves it off the app. Then use a **new number** for the assistant and put it in `STORE.whatsapp` in `public/assets/js/data.js`.
4. **Permanent token**: Business settings → System users → add one → assign the app and the WhatsApp account → Generate token with `whatsapp_business_messaging` and `whatsapp_business_management`.
5. **Netlify environment variables**: `WHATSAPP_TOKEN` (that token), `WHATSAPP_PHONE_NUMBER_ID` (WhatsApp → API setup), `WHATSAPP_APP_SECRET` (App settings → Basic), `WHATSAPP_VERIFY_TOKEN` (any long random text you choose), `SITE_URL`, and `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` for the order alerts. Redeploy.
6. **Webhook**: WhatsApp → Configuration → Callback URL `https://YOUR-SITE/.netlify/functions/whatsapp-webhook`, Verify token = your `WHATSAPP_VERIFY_TOKEN`, then subscribe to **messages**.
7. **Turn it on**: `WHATSAPP_BOT.enabled: true` in `public/assets/js/shop.js`, push, and place a test order from your phone.

Cost: the assistant only replies to customers who wrote first, which WhatsApp does not charge for. Security: every delivery from Meta is checked with the app secret (HMAC-SHA256), repeated deliveries are ignored, and `order-create` accepts only your own site, valid product codes and at most 10 orders per visitor in 10 minutes.

## Card payments with Paymob
Card payment needs a Paymob merchant account and a small server function (already written in `netlify/functions/`), because the Paymob secret key must never be inside the website. Until it is set up, the card option shows "Card payment is coming soon" and WhatsApp ordering works on its own.

1. **Paymob account**: sign up at paymob.com and complete verification (commercial register, tax card, bank account). Start in **test mode**.
2. **Keys** (Paymob dashboard): the **Secret key**, **Public key** and **HMAC secret** (Settings → Account info), and the **Integration ID** of your card payment integration (Developers → Payment integrations).
3. **Hosting on Netlify** (free plan is enough): New site → Import from GitHub → this repository and branch. `netlify.toml` already sets everything; no build command is needed.
4. **Environment variables** (Netlify → Site configuration → Environment variables): `PAYMOB_SECRET_KEY`, `PAYMOB_PUBLIC_KEY`, `PAYMOB_INTEGRATION_ID`, `PAYMOB_HMAC_SECRET`, and `SITE_URL` (your site address, e.g. `https://atr-perfume.netlify.app`). Redeploy after adding them.
   - **Order alerts (recommended)**: create a Telegram bot with @BotFather, start a chat with it, get your chat ID from @userinfobot, and add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Every paid card order is then sent to you on Telegram with the order number, items, total, name, mobile and address.
5. **Turn it on**: in `public/assets/js/shop.js` set `PAYMENT.cardEnabled: true`, fill in `PRICES` and the `DELIVERY` fees, and push.
6. **Test** with Paymob's test cards while in test mode, then replace the keys with the live ones.

How it works: the checkout sends only product references and quantities to `paymob-checkout` (which accepts requests only from your own site, of a normal size, and at most 6 payment attempts per visitor in 10 minutes), which prices the order from `shop.js`, creates the payment with Paymob and sends the customer to Paymob's secure page. Paymob then returns the customer to the site, and `paymob-verify` checks Paymob's signature before the site says "Payment received". Separately, Paymob calls `paymob-webhook` directly from its servers after every payment, even if the customer closes the page; it checks Paymob's signature and sends you the order alert. Every payment, with the order number and the customer's address, is listed in your Paymob dashboard.

Card payment works only on the real hosted site (Netlify). The private claude.ai preview link and a locally opened `public/index.html` cannot reach the payment server, so there the card option stays off.

## Images
### Product photos (the collection)
The product photos are in `public/assets/img/collection/` (1000 px, used in the photo viewer) and `public/assets/img/collection/thumb/` (480 px, used in the grid and category tiles), each as WebP (shown by modern browsers, about half the size) and JPG (fallback for old browsers). Their names, brands and types are listed in `GALLERY` at the bottom of `public/assets/js/data.js`; each line uses the photo's file name as its reference (for example `AS01`). To add a photo, save both sizes as `.jpg` and `.webp` with a new reference name and add a line, for example:

```js
g("E01", "assaf", "perfume", "Arrogate Pink", "أروغيت بينك"),
```

Products with codes like `AS01` (Assaf), `LV01` (Laverne), `RF01` (Reef), `DK01` (Dkhoon AlEmiratia) and `OS01` (Osma) use studio photos taken from the brands' own online stores (3saf.com, assaf.ae, laverne.com / laverne.co, reefperfumes.com, dkhoonemirates.com, osmaperfumes.com), or from a retailer where the brand store no longer lists the product (Noon, BrandVIP, Justmylook, Salam Occasions, Xmart, My Royal Musk, Soghaat, eBay). These photos belong to the brands or those shops: as a seller of the genuine products you can usually ask the brand for its official media kit, and replacing retailer photos with the brand's own or your own is the safest choice.

The type is `perfume`, `musk` or `set` (a "Musk" filter can be added back in `GALLERY_FILTERS` when musks are in stock). Leave the name out if you do not know it, and the brand is shown instead. The photos used on the category tiles are set in `GALLERY_TILES`.

The product in the arch at the top of the page is set by `HERO_PHOTO` in `public/assets/js/data.js` (now `OS01`, Osma Rouge). If a photo is missing, the site shows a drawn bottle instead of a broken image.

## Brand
The design follows the Atr brand identity sheet:
- **Colours** (the `:root` tokens at the top of `public/assets/css/style.css`): Oud Black `#15110E` (primary), Antique Gold `#D4AF6A` (logo, accents on dark), Gift Burgundy `#5E1F24` (gift-set ribbons and the newsletter offer), Bronze `#8A6A2E` (accent text on light), Smoke Ivory `#EDE6DA` (page ground).
- **Type**: Aref Ruqaa for the logo only, Cinzel for titles, Amiri for Arabic text, Tenor Sans for body text (all from Google Fonts).
- **Pattern**: the diamond lattice from souk screens runs along the edges of the dark bands (`.lattice`).
- **Logo rules**: the calligraphy is gold on dark or black on ivory, never other colours. On the site the logo is live text in the brand fonts; ready-made files are in `public/assets/logo/atr/`: `atr-logo-dark.png`, `atr-logo-ivory.png`, `atr-logo-gold-transparent.png`, `atr-icon-512.png`, `atr-icon-ivory-512.png`, `apple-touch-icon.png` and the favicons.

WhatsApp profile pictures (1080 × 1080, everything inside the circle WhatsApp shows) are in `brand/whatsapp-profile/`: `1-gold-on-black` (recommended, clearest at small size), `2-with-atr`, `3-black-on-ivory` and `4-lattice`, each as PNG and JPG.

The older Aquzora logo sets are kept in `brand-archive/aquzora-logos/`; they are not published and can be deleted if no longer needed.

## Editing content
- Product photos, brands, filters and reviews: `public/assets/js/data.js`
- Prices, delivery fees and payment settings: `public/assets/js/shop.js`
- All interface text in both languages: `public/assets/js/i18n.js`
- WhatsApp number: `STORE.whatsapp` in `public/assets/js/data.js`, in international format without `+` or the leading 0 (now `201289555608`, i.e. +20 128 955 5608). The number shown in the footer is in `index.html`.
- Colours and fonts: the `:root` brand tokens at the top of `public/assets/css/style.css`

## Security and speed
- **Security headers** (in `netlify.toml`): a strict Content-Security-Policy (only the site's own scripts, styles, fonts and images; no other site can frame the shop), HSTS (always HTTPS), `nosniff`, a strict referrer policy and a permissions policy that turns off camera, microphone and location. The site's code has no inline scripts, handlers or styles, so the policy needs no exceptions.
- **No outside requests**: fonts are self-hosted in `public/assets/fonts/` (subset to the letters used; the calligraphy font holds only عطر), so visitors' browsers contact only your site, plus WhatsApp or Paymob when the customer chooses them.
- **Images**: WebP with JPG fallback, lazy loading, 480 px thumbnails for the grid and tiles, and the hero photo marked as the first thing to load.
- **Caching**: fonts are cached for a year, photos and logos for a week.
- **Customer input**: the saved cart and language are checked when the page loads (unknown products, negative or huge quantities and other edited values are dropped), typed details are length-limited and cleaned of hidden control characters before they go into a WhatsApp message or to the payment server, and every link that opens a new tab uses `rel="noopener"`.
- **More headers**: Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, X-Permitted-Cross-Domain-Policies and Origin-Agent-Cluster; `/.well-known/security.txt` tells people how to report a security problem.
- **Accounts**: turn on two-step login for GitHub, Netlify and Paymob, and keep Paymob keys only in Netlify's environment variables.

## Publish on Netlify
1. **Merge the work into `main`** on GitHub (pull request from `ccr-61478cd7-y9m2yh`).
2. **Create the site**: sign up at netlify.com (free) with your GitHub account → **Add new site → Import an existing project → GitHub** → choose this repository → branch `main`. Leave the build command empty; `netlify.toml` sets the publish folder (`public`) and the functions folder. Click **Deploy**.
3. **Name the site**: Site configuration → Change site name, e.g. `atr-perfume` → `https://atr-perfume.netlify.app`. Later you can add your own domain (Domain management → Add a domain); Netlify gives free HTTPS.
4. **Newsletter**: Forms → **Enable form detection**, then redeploy (Deploys → Trigger deploy). Sign-ups then appear under Forms → newsletter. For an email per sign-up: Site configuration → Notifications → Emails and webhooks → Form submission notifications → Add notification → Email.
5. **Card payments** (when ready): add the environment variables from "Card payments with Paymob" above, set `cardEnabled: true` in `public/assets/js/shop.js`, and push.
6. **Check**: open the site on your phone, switch languages, add to cart, send a test WhatsApp order to yourself, and sign up to the newsletter once to see it arrive in Forms.

Every push to `main` publishes the site again automatically.
