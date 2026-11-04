"""Creative Aquzora logo concepts. Text is converted to outlines."""
import sys, os
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONTS, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
PLUM, GOLD, GOLD2, CREAM, ROSE = "#3b1d2a", "#b98a4e", "#d6b07a", "#f6ecdf", "#b4566b"
CG = "fontsource-cormorant-garamond-5.3.0/package/files/cormorant-garamond-latin-600-normal.ttf"
INTER = "fontsource-inter-5.3.0/package/files/inter-latin-500-normal.ttf"
AMIRI = "fontsource-amiri-5.3.0/package/files/amiri-arabic-700-normal.ttf"

def text_path(font_file, text, size, tracking=0.0):
    path = os.path.join(FONTS, font_file)
    tt = TTFont(path); upem = tt["head"].unitsPerEm
    font = hb.Font(hb.Face(hb.Blob.from_file_path(path)))
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    gs, order, scale = tt.getGlyphSet(), tt.getGlyphOrder(), size / upem
    pen = SVGPathPen(gs); x = 0
    infos = buf.glyph_infos
    for i, (info, pos) in enumerate(zip(infos, buf.glyph_positions)):
        gs[order[info.codepoint]].draw(TransformPen(pen, (scale, 0, 0, -scale, (x + pos.x_offset) * scale, -pos.y_offset * scale)))
        x += pos.x_advance + (tracking * upem if i < len(infos) - 1 else 0)
    return pen.getCommands(), x * scale

def P(d, fill, dx=0, dy=0):
    return f'<path transform="translate({dx:.2f} {dy:.2f})" fill="{fill}" d="{d}"/>'

def svg(w, h, body, defs=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" role="img" aria-label="Aquzora"><title>Aquzora</title>{defs}{body}</svg>\n'

GOLD_GRAD = '<linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6c48f"/><stop offset=".55" stop-color="#b98a4e"/><stop offset="1" stop-color="#8a6233"/></linearGradient>'

# ---------- Concept 1: the Q is a round perfume flacon, its tail a ribbon of scent ----------
def flacon(r, fg, accent, liquid, sw=3.6, uid="qc", short=False):
    """Round perfume bottle centred on 0,0 with radius r, plus its scent-ribbon tail."""
    if short:  # compact tail that curls upward, for square icons
        return flacon(r, fg, accent, liquid, sw, uid).split("<path d=")[0] + f'''<path d="M{r*0.55:.2f} {r*0.75:.2f} C{r*0.95:.2f} {r*1.25:.2f} {r*1.4:.2f} {r*1.2:.2f} {r*1.6:.2f} {r*0.95:.2f}" fill="none" stroke="{accent}" stroke-width="{sw*0.89:.2f}" stroke-linecap="round"/>
<circle cx="{r*1.74:.2f}" cy="{r*0.74:.2f}" r="{r*0.075:.2f}" fill="{accent}"/><circle cx="{r*1.84:.2f}" cy="{r*0.56:.2f}" r="{r*0.055:.2f}" fill="{accent}"/><circle cx="{r*1.9:.2f}" cy="{r*0.41:.2f}" r="{r*0.038:.2f}" fill="{accent}"/>'''
    return f'''<clipPath id="{uid}"><circle r="{r-sw*0.9:.2f}"/></clipPath>
<path clip-path="url(#{uid})" d="M{-r} {r*0.18:.2f} C{-r*0.4:.2f} {r*0.02:.2f} {r*0.4:.2f} {r*0.34:.2f} {r} {r*0.14:.2f} V{r} H{-r} Z" fill="{liquid}"/>
<circle r="{r-sw/2:.2f}" fill="none" stroke="{fg}" stroke-width="{sw}"/>
<rect x="{-r*0.17:.2f}" y="{-r-r*0.31:.2f}" width="{r*0.34:.2f}" height="{r*0.28:.2f}" rx="{r*0.05:.2f}" fill="{fg}"/>
<rect x="{-r*0.29:.2f}" y="{-r-r*0.52:.2f}" width="{r*0.58:.2f}" height="{r*0.22:.2f}" rx="{r*0.07:.2f}" fill="{accent}"/>
<path d="M{r*0.55:.2f} {r*0.75:.2f} C{r*1.1:.2f} {r*1.5:.2f} {r*2.1:.2f} {r*1.55:.2f} {r*2.6:.2f} {r*1.3:.2f}" fill="none" stroke="{accent}" stroke-width="{sw*0.89:.2f}" stroke-linecap="round"/>
<circle cx="{r*2.92:.2f}" cy="{r*1.2:.2f}" r="{r*0.087:.2f}" fill="{accent}"/><circle cx="{r*3.18:.2f}" cy="{r*1.16:.2f}" r="{r*0.062:.2f}" fill="{accent}"/><circle cx="{r*3.4:.2f}" cy="{r*1.13:.2f}" r="{r*0.042:.2f}" fill="{accent}"/>'''

SIZE, TR = 84, 0.12
A_D, A_W = text_path(CG, "A", SIZE)
REST_D, REST_W = text_path(CG, "UZORA", SIZE, TR)
CAP = SIZE * 0.64
R = CAP / 2 + 2
QX = A_W + SIZE * TR + R + 2
RX = QX + R + 2 + SIZE * TR
WORD_W = RX + REST_W

def wordmark(fg, accent, liquid, x, base):
    """AQUZORA with the flacon Q; baseline at y=base, left edge at x."""
    return (P(A_D, fg, x, base) + P(REST_D, fg, x + RX, base) +
            f'<g transform="translate({x+QX:.2f} {base-CAP/2:.2f})">{flacon(R, fg, accent, liquid)}</g>')

def concept_q(fg, accent, liquid, tagline=True):
    pad = 12
    top = CAP / 2 + R * 1.52 + pad          # space above baseline for the cap of the bottle
    base = top
    body = wordmark(fg, accent, liquid, pad, base)
    H = base - CAP / 2 + R * 1.6 + pad
    W = WORD_W + 2 * pad
    if tagline:
        tag, tw = text_path(INTER, "PERFUMES · OUD · BEAUTY", 13.5, 0.36)
        body += P(tag, accent, (W - tw) / 2, H + 14)
        H += 26
    return svg(W, H, body)

def stacked_q(fg, accent, liquid, ar_fill, bg=None):
    tag, tw = text_path(INTER, "PERFUMES · OUD · BEAUTY", 13.5, 0.36)
    ar, aw = text_path(AMIRI, "أكوزورا", 34)
    W = WORD_W + 90; base = 110
    body = f'<rect width="100%" height="100%" rx="30" fill="{bg}"/>' if bg else ""
    body += wordmark(fg, accent, liquid, (W - WORD_W) / 2, base)
    body += P(tag, accent, (W - tw) / 2, base + 62) + P(ar, ar_fill, (W - aw) / 2, base + 118)
    return svg(W, base + 150, body)

def icon_q(bg, fg, accent, liquid, rx=112):
    body = f'<rect width="512" height="512" rx="{rx}" fill="{bg}"/>'
    r = 128  # short tail: spans -r..1.95r wide and -1.52r..1.25r tall
    body += f'<g transform="translate({256 - 0.47*r:.1f} {256 + 0.13*r:.1f})">{flacon(r, fg, accent, liquid, sw=17, uid="qi", short=True)}</g>'
    return svg(512, 512, body)

# ---------- Concept 2: the Arabic alef (first letter of أكوزورا) as a calligraphic stroke, hamza as a perfume drop ----------
def alef_mark(fill, drop, ring):
    return f'''<circle cx="100" cy="100" r="88" fill="none" stroke="{ring}" stroke-width="2.2"/>
<circle cx="100" cy="100" r="81" fill="none" stroke="{ring}" stroke-width="0.9" stroke-dasharray="1.5 5"/>
<path d="M112 46 C118 44 122 48 121 56 C119 92 114 128 106 156 C103 166 98 172 90 176 C93 168 95 160 96 150 C99 118 101 86 103 58 C104 51 107 47 112 46 Z" fill="{fill}"/>
<path d="M78 26 C85 37 90 43 90 51 A12 12 0 0 1 66 51 C66 43 71 37 78 26 Z" fill="{drop}"/>
<circle cx="60" cy="33" r="2.4" fill="{drop}"/><circle cx="54" cy="45" r="1.7" fill="{drop}"/><circle cx="56" cy="23" r="1.4" fill="{drop}"/>'''

def concept_alef(fg, fill, drop, ring, defs=""):
    word, ww = text_path(CG, "AQUZORA", 64, 0.16)
    ar, aw = text_path(AMIRI, "أكوزورا", 30)
    W = max(ww, 200) + 80
    body = f'<g transform="translate({(W-200)/2:.2f} 10)">{alef_mark(fill, drop, ring)}</g>'
    body += P(word, fg, (W - ww) / 2, 286) + P(ar, drop if drop != "url(#gg)" else GOLD, (W - aw) / 2, 336)
    return svg(W, 356, body, defs)

# ---------- Concept 3: a perfume drop with lips in it: fragrance + makeup in one shape ----------
def lips_mark(drop_fill, lips_fill, line):
    return f'''<clipPath id="dc"><path d="M100 14 C128 56 152 86 152 124 A52 52 0 0 1 48 124 C48 86 72 56 100 14 Z"/></clipPath>
<path d="M100 14 C128 56 152 86 152 124 A52 52 0 0 1 48 124 C48 86 72 56 100 14 Z" fill="{drop_fill}"/>
<g clip-path="url(#dc)">
<path d="M64 128 C76 112 90 110 100 120 C110 110 124 112 136 128 C120 134 80 134 64 128 Z" fill="{lips_fill}"/>
<path d="M64 128 C80 135 120 135 136 128 C126 154 74 154 64 128 Z" fill="{lips_fill}" opacity=".82"/>
<path d="M64 128 C80 133 120 133 136 128" fill="none" stroke="{line}" stroke-width="2.2" stroke-linecap="round"/>
</g>
<path d="M88 46 C92 40 96 36 98 34" stroke="{line}" stroke-width="3" stroke-linecap="round" opacity=".55"/>'''

def concept_lips(fg, drop_fill, lips_fill, line, accent, defs=""):
    word, ww = text_path(CG, "AQUZORA", 76, 0.12)
    tag, tw = text_path(INTER, "PERFUMES · OUD · MAKEUP", 13, 0.36)
    W = 30 + 132 + 26 + max(ww, tw) + 30
    body = f'<g transform="translate(30 14) scale(.8)">{lips_mark(drop_fill, lips_fill, line)}</g>'
    body += P(word, fg, 30 + 132 + 26, 104) + P(tag, accent, 30 + 132 + 26 + (ww - tw) / 2, 140)
    return svg(W, 170, body, defs)

# ---------- Concept 4: two ribbons of oud smoke rising from a mabkhara meet to draw an A ----------
def smoke_mark(stroke, accent, bowl):
    return f'''<path d="M68 150 C72 124 58 108 72 86 C84 66 92 50 100 30" fill="none" stroke="{stroke}" stroke-width="6" stroke-linecap="round"/>
<path d="M132 150 C128 124 142 108 128 86 C116 66 108 50 100 30" fill="none" stroke="{stroke}" stroke-width="6" stroke-linecap="round"/>
<path d="M100 30 C96 18 104 8 113 11 C121 14 120 25 112 26" fill="none" stroke="{accent}" stroke-width="4" stroke-linecap="round"/>
<path d="M100 98 C105 105 108 109 108 114 A8 8 0 0 1 92 114 C92 109 95 105 100 98 Z" fill="{accent}"/>
<path d="M50 152 H150 C146 170 128 180 100 180 C72 180 54 170 50 152 Z" fill="{bowl}"/>
<path d="M84 180 L80 192 H120 L116 180" fill="{bowl}"/>'''

def concept_smoke(fg, stroke, accent, bowl, defs=""):
    word, ww = text_path(CG, "AQUZORA", 64, 0.16)
    tag, tw = text_path(INTER, "ARABIAN PERFUMERY", 12.5, 0.42)
    W = max(ww, 200) + 80
    body = f'<g transform="translate({(W-200)/2:.2f} 8)">{smoke_mark(stroke, accent, bowl)}</g>'
    body += P(word, fg, (W - ww) / 2, 274) + P(tag, accent, (W - tw) / 2, 304)
    return svg(W, 322, body, defs)

files = {
    "aquzora-logo.svg": concept_q(PLUM, GOLD, GOLD2),
    "aquzora-logo-white.svg": concept_q(CREAM, GOLD2, GOLD),
    "aquzora-wordmark.svg": concept_q(PLUM, GOLD, GOLD2, tagline=False),
    "aquzora-wordmark-white.svg": concept_q(CREAM, GOLD2, GOLD, tagline=False),
    "aquzora-logo-stacked.svg": stacked_q(PLUM, GOLD, GOLD2, PLUM),
    "aquzora-logo-stacked-dark.svg": stacked_q(CREAM, GOLD2, GOLD, GOLD2, bg=PLUM),
    "aquzora-icon.svg": icon_q(PLUM, CREAM, GOLD2, GOLD),
    "aquzora-icon-gold.svg": icon_q(GOLD2, PLUM, PLUM, CREAM),
    "aquzora-mark.svg": svg(4.4*38 + 16, 3.12*38 + 16, f'<g transform="translate({38+8} {1.52*38+8:.1f})">{flacon(38, PLUM, GOLD, GOLD2, sw=4.4)}</g>'),
}
for n, s in files.items():
    open(os.path.join(OUT, n), "w").write(s)
print("wrote", len(files))
