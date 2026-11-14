# Marketing video

- `atr-promo.mp4`: 31 s vertical promo (1080×1920, 30 fps) with an original soundtrack
- `atr-promo-silent.mp4`: the same video without sound, for adding music in Instagram, TikTok or CapCut
- `atr-promo-cover.jpg`: the end card, for use as the cover image

## Rebuilding it

The video is built from the site's own product photos and fonts (`source/`):

```sh
node marketing/source/render.js /tmp/frames 30          # writes /tmp/frames/f00000.jpg … (Playwright + Chromium)
python3 marketing/source/music.py /tmp/music.wav        # numpy
ffmpeg -framerate 30 -i /tmp/frames/f%05d.jpg -i /tmp/music.wav -c:v libx264 -crf 17 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart marketing/atr-promo.mp4
```

Products, texts and timings are at the top of the `<script>` in `source/scene.html`.

# Cinematic brand film (22.5 s)

- `atr-cinematic.mp4`: 1080×1920, 30 fps, original score at 80 BPM (every cut lands on a beat)
- `atr-cinematic-silent.mp4`: the same picture without sound, for adding a licensed track in Instagram or TikTok (pick one around 80 or 160 BPM)
- `atr-cinematic-cover.jpg`: end-card cover

30-second version: `atr-cinematic-30s.mp4`, `atr-cinematic-30s-silent.mp4` and `atr-cinematic-30s-cover.jpg`. It adds
Laverne Queen Rose (12–15 s) and Osma Noir (15–18 s, entering on a whip pan) and a longer end card (24–30 s); the cuts
fall at 3, 6, 9, 12, 15, 18, 18.75, 19.5, 20.25, 21 and 24 s. Built from `scene30.html` (`SCENE=scene30.html node render.js …`)
and `music30.py`.

Source in `cinematic-source/`: `cutout.py` cuts the bottles out of the site photos (rembg), `tex.py` makes the smoke and grain
textures, `scene.html` is the animated scene (served over http so masks load), `render.js` renders it frame by frame with
Playwright, and `music.py` composes the score (numpy/scipy).

# Website film (silent loop)

`public/assets/video/atr-film-desktop-hd.(webm|mp4)` (2560×1440), `atr-film-desktop.(webm|mp4)` (1920×1080) and
`atr-film-mobile.(webm|mp4)` (1280×1600), 14-second seamless loops with posters, shown in the "عطرك… توقيعك" band on the
home page. Built from `cinematic-source/web.html` with `render_web.js`, supersampled: `DSF=1.5 node render_web.js out 2560 1440`
(and `1280 1600` for phones), then scaled down with Lanczos while encoding: H.264 `-crf 18`, VP9 `-crf 27/28`, no audio,
`+faststart`. The bottles are drawn from pre-filtered sizes in `b/mip/` (the ribbed Laverne bottles slightly softened at small
sizes) so fine ribs do not shimmer, and there is no grain.

# Nexus agency film (64 s, 4K)

A promo film for **Nexus Software Development Company** (nexuscodes.tech) that uses this website as the case study.

- `nexus-film-4k.mp4`: 3840×2160, 30 fps, H.264, original score (−14 LUFS, −1 dBTP), for YouTube, LinkedIn, the website and presentations
- `nexus-film-1080p.mp4`: 1920×1080, smaller file for WhatsApp, email and quick sharing
- `nexus-film-silent.mp4`: 1080p picture without sound, for adding a licensed track or a voice-over
- `nexus-film-cover.jpg`: 4K end card, for thumbnails and covers
- `nexus-film-vertical.mp4`: 1080×1920 (9:16) cut for Instagram Reels, TikTok, YouTube Shorts and WhatsApp Status, rendered at 1.5× and
  scaled down for extra sharpness; titles stay clear of the top 220 px and bottom 380 px where the apps draw their buttons and captions
- `nexus-film-vertical-silent.mp4` and `nexus-film-vertical-cover.jpg`: the same without sound, and its cover

Story (120 BPM, every cut lands on a beat): a typed hook and the site's real code compiling (0–7 s) → the Atr site revealed in a
3D browser (7–13) → the page exploded into its layers (13–21) → Arabic ⇄ English wipe (21–27) → the phone journey: browse,
product, search, cart, checkout (27–37) → the WhatsApp order assistant and payment flow (37–46) → launch numbers (46–51) →
the nine Nexus services, then "Even this film? Written in code." (51–57) → Nexus logo end card and call to action (57–64).

Source in `nexus-source/`. All screens are real captures of `public/`; the chat is a mock-up of the assistant's flow.

```sh
npm i @fontsource/poppins @fontsource/jetbrains-mono @fontsource/cairo     # in a work folder with the source files
(cd public && python3 -m http.server 8090) &                               # the site, for the capture scripts
node capture.js && node capture2.js && node capture3.js && python3 crops.py   # writes cap/*.png
python3 -m http.server 8092 &                                              # the work folder, for the scene
node render.js frames 30                                                   # 1920 frames at 3840×2160 (DSF=1 for 1080p previews)
VW=1080 VH=1920 SCENE='scene.html#v' DSF=1.5 node render.js framesv 30         # the vertical cut (same timing, same score)
python3 music.py cues.json music.wav                                       # cues.json is written by render.js
ffmpeg -framerate 30 -i frames/f%05d.jpg -i music.wav -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -c:a aac -b:a 256k -shortest -movflags +faststart nexus-film-4k.mp4
```

Texts and timings are in `scene.html` (one `sN(t)` function per scene); the score follows the cue list the scene exports.
