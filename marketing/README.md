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

`public/assets/video/atr-film-desktop.(webm|mp4)` (1920×1080) and `atr-film-mobile.(webm|mp4)` (1080×1350), 14-second
seamless loops with posters, shown in the "عطرك… توقيعك" band on the home page. Built from
`cinematic-source/web.html` (`?w=1920&h=1080` or `?w=1080&h=1350`) with `render_web.js`, then encoded:
H.264 `-crf 22 -maxrate 6M`, VP9 `-crf 34`, no audio, `+faststart`.
