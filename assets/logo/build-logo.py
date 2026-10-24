"""Builds the Aquzora logo SVGs with all text converted to outlines."""
import sys, os
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONTS = sys.argv[1]
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)

PLUM, GOLD, GOLD2, CREAM = "#3b1d2a", "#b98a4e", "#d6b07a", "#f6ecdf"

def text_path(font_file, text, size, tracking=0.0, rtl=False):
    """Return (svg path d, width, ascent) for text set at `size` px, baseline y=0."""
    path = os.path.join(FONTS, font_file)
    tt = TTFont(path)
    upem = tt["head"].unitsPerEm
    blob = hb.Blob.from_file_path(path)
    face = hb.Face(blob)
    font = hb.Font(face)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    gs = tt.getGlyphSet()
    order = tt.getGlyphOrder()
    scale = size / upem
    pen = SVGPathPen(gs)
    x = 0
    infos, poss = buf.glyph_infos, buf.glyph_positions
    for i, (info, pos) in enumerate(zip(infos, poss)):
        name = order[info.codepoint]
        tp = TransformPen(pen, (scale, 0, 0, -scale, (x + pos.x_offset) * scale, -pos.y_offset * scale))
        gs[name].draw(tp)
        x += pos.x_advance
        if i < len(infos) - 1:
            x += tracking * upem
    return pen.getCommands(), x * scale

def g(d, fill, dx, dy):
    return f'<path transform="translate({dx:.2f} {dy:.2f})" fill="{fill}" d="{d}"/>'

# --- the mark: a pointed Arabian arch (also reads as an "A") holding a perfume drop.
# Drawn in a 100 x 120 box.
def mark(stroke, drop, base=None, w=7):
    base = base or stroke
    return f'''<path d="M14 116 V60 C14 34 34 18 50 4 C66 18 86 34 86 60 V116" fill="none" stroke="{stroke}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M50 44 C58 57 67 67 67 80 A17 17 0 0 1 33 80 C33 67 42 57 50 44 Z" fill="{drop}"/>
<path d="M4 116 H96" stroke="{base}" stroke-width="{w}" stroke-linecap="round"/>'''

CG = "fontsource-cormorant-garamond-5.3.0/package/files/cormorant-garamond-latin-600-normal.ttf"
INTER = "fontsource-inter-5.3.0/package/files/inter-latin-500-normal.ttf"
AMIRI = "fontsource-amiri-5.3.0/package/files/amiri-arabic-700-normal.ttf"

word, word_w = text_path(CG, "AQUZORA", 78, tracking=0.14)
tag, tag_w = text_path(INTER, "PERFUMES · OUD · BEAUTY", 15.5, tracking=0.32)
ar, ar_w = text_path(AMIRI, "أكوزورا", 40)

def svg(w, h, body, title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n'

def horizontal(word_fill, tag_fill, mark_stroke, drop):
    pad = 8
    mk_h = 120; scale = 1.0
    gap = 34
    tx = pad + 100 + gap
    text_w = max(word_w, tag_w)
    W = tx + text_w + pad
    H = 140
    body = f'<g transform="translate({pad} 8)">{mark(mark_stroke, drop)}</g>'
    body += g(word, word_fill, tx, 80)
    body += g(tag, tag_fill, tx + (word_w - tag_w) / 2 if tag_w < word_w else tx, 124)
    return svg(W, H, body, "Aquzora")

def stacked(word_fill, tag_fill, ar_fill, mark_stroke, drop, bg=None):
    W = max(word_w, tag_w) + 80
    H = 410
    cx = W / 2
    body = f'<rect width="100%" height="100%" rx="36" fill="{bg}"/>' if bg else ""
    body += f'<g transform="translate({cx - 60:.2f} 30) scale(1.2)">{mark(mark_stroke, drop)}</g>'
    body += g(word, word_fill, cx - word_w / 2, 264)
    body += g(tag, tag_fill, cx - tag_w / 2, 308)
    body += g(ar, ar_fill, cx - ar_w / 2, 372)
    return svg(W, H, body, "Aquzora")

def icon(bg, stroke, drop, rounded=True):
    r = 112 if rounded else 256
    body = f'<rect width="512" height="512" rx="{r}" fill="{bg}"/>'
    body += f'<g transform="translate(131 96) scale(2.5)">{mark(stroke, drop, w=7.5)}</g>'
    return svg(512, 512, body, "Aquzora")

files = {
    "aquzora-logo.svg": horizontal(PLUM, GOLD, PLUM, GOLD),
    "aquzora-logo-white.svg": horizontal(CREAM, GOLD2, GOLD2, CREAM),
    "aquzora-logo-stacked.svg": stacked(PLUM, GOLD, PLUM, PLUM, GOLD),
    "aquzora-logo-stacked-dark.svg": stacked(CREAM, GOLD2, GOLD2, GOLD2, CREAM, bg=PLUM),
    "aquzora-icon.svg": icon(PLUM, GOLD2, CREAM),
    "aquzora-icon-gold.svg": icon(GOLD2, PLUM, PLUM),
    "aquzora-mark.svg": svg(100, 124, f'<g transform="translate(0 2)">{mark(PLUM, GOLD)}</g>', "Aquzora"),
}
for name, s in files.items():
    open(os.path.join(OUT, name), "w").write(s)
print("wrote", len(files), "files; word", round(word_w), "tag", round(tag_w), "ar", round(ar_w))
