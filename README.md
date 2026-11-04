# Atr · Maison de Parfum

A bilingual (العربية / English) perfume store website for customers in Egypt (prices in EGP), built on the Atr brand identity: "Heritage in every drop. · إرثٌ في كل قطرة". Open `index.html` in any browser; no install or build step.

## Features
- **Arabic first, always bilingual**: the site opens in Arabic (right to left) and switches to English; the choice is remembered. The tagline is always shown in both languages.
- **Our collection**: real photos of the perfumes, musks and gift sets in stock, filterable by type (perfumes, musk, gift sets) or brand, 12 at a time with "Show more".
- **Photo viewer**: tap a photo to see it full size, move through the photos (buttons or arrow keys), and **ask about it on WhatsApp**. The message includes the product name and photo reference so you know which item the customer means.
- **Shop by category** tiles (Perfumes, Musk, Gift sets) that open the collection with that filter on.
- **Search** (header or bottom bar, press `/`) by product name, brand or type, in English or Arabic.
- **WhatsApp** buttons in the header, banner, footer and mobile bottom bar.
- Brands strip, reviews, newsletter sign-up, footer with contact details.
- Mobile first: bottom navigation bar, bottom-sheet photo viewer, large tap targets, keyboard and screen-reader friendly, respects reduced motion.

There is no bag or online checkout: customers order on WhatsApp.

## Images
### Product photos (the collection)
The product photos are in `assets/img/collection/` (1000 px, used in the photo viewer) and `assets/img/collection/thumb/` (480 px, used in the grid). Their names, brands and types are listed in `GALLERY` at the bottom of `assets/js/data.js`; each line uses the photo's file name as its reference (for example `B04`). To add a photo, save both sizes with a new reference name and add a line, for example:

```js
g("E01", "assaf", "perfume", "Arrogate Pink", "أروغيت بينك"),
```

The type is `perfume`, `musk` or `set`. Leave the name out if you do not know it, and the brand is shown instead. The photos used on the category tiles are set in `GALLERY_TILES`.

The product in the arch at the top of the page is set by `HERO_PHOTO` in `assets/js/data.js` (now `B03`, Purple Heart Diamond). If a photo is missing, the site shows a drawn bottle instead of a broken image.

## Brand
The design follows the Atr brand identity sheet:
- **Colours** (the `:root` tokens at the top of `assets/css/style.css`): Oud Black `#15110E` (primary), Antique Gold `#D4AF6A` (logo, accents on dark), Gift Burgundy `#5E1F24` (gift-set ribbons and the newsletter offer), Bronze `#8A6A2E` (accent text on light), Smoke Ivory `#EDE6DA` (page ground).
- **Type**: Aref Ruqaa for the logo only, Cinzel for titles, Amiri for Arabic text, Tenor Sans for body text (all from Google Fonts).
- **Pattern**: the diamond lattice from souk screens runs along the edges of the dark bands (`.lattice`).
- **Logo rules**: the calligraphy is gold on dark or black on ivory, never other colours. On the site the logo is live text in the brand fonts; ready-made files are in `assets/logo/atr/`: `atr-logo-dark.png`, `atr-logo-ivory.png`, `atr-logo-gold-transparent.png`, `atr-icon-512.png`, `atr-icon-ivory-512.png`, `apple-touch-icon.png` and the favicons.

The older Aquzora logo files are still in `assets/logo/` (outside `atr/`) but no longer used; delete them if you no longer need them.

## Editing content
- Product photos, brands, filters and reviews: `assets/js/data.js`
- All interface text in both languages: `assets/js/i18n.js`
- WhatsApp number: `STORE.whatsapp` in `assets/js/data.js`, in international format without `+` or the leading 0 (now `201289555608`, i.e. +20 128 955 5608). The number shown in the footer is in `index.html`.
- Colours and fonts: the `:root` brand tokens at the top of `assets/css/style.css`
