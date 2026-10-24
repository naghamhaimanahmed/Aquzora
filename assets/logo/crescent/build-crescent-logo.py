"""Aquzora 'Crescent Drop': emerald, blush and champagne; a crescent moon cradling a perfume drop."""
import sys, os
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONTS, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
EMERALD, EMERALD2, BLUSH, CHAMPAGNE, IVORY = "#0e3b37", "#0a2b28", "#eab7ae", "#d9bd8a", "#fbf6ef"
BODONI = "fontsource-bodoni-moda-5.3.0/package/files/bodoni-moda-latin-500-italic.ttf"
JOST = "fontsource-jost-5.3.0/package/files/jost-latin-500-normal.ttf"
KUFI = "fontsource-reem-kufi-5.3.0/package/files/reem-kufi-arabic-500-normal.ttf"

def text_path(font_file, text, size, tracking=0.0):
    path = os.path.join(FONTS, font_file)
    tt = TTFont(path); upem = tt["head"].unitsPerEm
    font = hb.Font(hb.Face(hb.Blob.from_file_path(path)))
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    gs, order, scale = tt.getGlyphSet(), tt.getGlyphOrder(), size / upem
    pen = SVGPathPen(gs); x = 0; infos = buf.glyph_infos
    for i, (info, pos) in enumerate(zip(infos, buf.glyph_positions)):
        gs[order[info.codepoint]].draw(TransformPen(pen, (scale, 0, 0, -scale, (x + pos.x_offset) * scale, -pos.y_offset * scale)))
        x += pos.x_advance + (tracking * upem if i < len(infos) - 1 else 0)
    return pen.getCommands(), x * scale

def P(d, fill, dx=0, dy=0):
    return f'<path transform="translate({dx:.2f} {dy:.2f})" fill="{fill}" d="{d}"/>'

def svg(w, h, body, defs=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" role="img" aria-label="Aquzora"><title>Aquzora</title><defs>{defs}</defs>{body}</svg>\n'

GRAD = ('<linearGradient id="ch" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1dcb2"/><stop offset=".6" stop-color="#d4b27a"/><stop offset="1" stop-color="#a9844c"/></linearGradient>'
        '<linearGradient id="bl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d3cc"/><stop offset="1" stop-color="#d9958b"/></linearGradient>')

def mark(moon="url(#ch)", drop="url(#bl)", spark="url(#ch)", uid="m"):
    """200 x 200. Crescent opening to the upper right, a drop resting in its curve, a four-point sparkle."""
    return f'''<mask id="{uid}"><rect width="200" height="200" fill="#fff"/><circle cx="128" cy="80" r="62" fill="#000"/></mask>
<circle cx="100" cy="104" r="76" fill="{moon}" mask="url(#{uid})"/>
<path d="M118 70 C130 89 141 102 141 119 A23 23 0 0 1 95 119 C95 102 106 89 118 70 Z" fill="{drop}"/>
<path d="M110 104 C107 110 106 115 107 120" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>
<path d="M164 24 C165.5 36 168 38.5 180 40 C168 41.5 165.5 44 164 56 C162.5 44 160 41.5 148 40 C160 38.5 162.5 36 164 24 Z" fill="{spark}"/>
<circle cx="182" cy="70" r="3.2" fill="{spark}"/>'''

word, ww = text_path(BODONI, "aquzora", 92, 0.02)
tag, tw = text_path(JOST, "PERFUMES · OUD · BEAUTY", 14, 0.42)
ar, aw = text_path(KUFI, "أكوزورا", 42)

def horizontal(fg, tagc, bg=None):
    s = 0.68
    tx = 24 + 200 * s + 18
    W = tx + max(ww, tw) + 28; H = 170
    body = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ""
    body += f'<g transform="translate(24 16) scale({s})">{mark()}</g>'
    body += P(word, fg, tx, 100) + P(tag, tagc, tx + 6, 136)
    return svg(W, H, body, GRAD)

def stacked(fg, tagc, arc, bg=None):
    W = max(ww, tw, 260) + 110; cx = W / 2
    body = f'<rect width="100%" height="100%" rx="34" fill="{bg}"/>' if bg else ""
    body += f'<g transform="translate({cx-90:.1f} 22) scale(.9)">{mark()}</g>'
    body += P(word, fg, cx - ww / 2, 290) + P(tag, tagc, cx - tw / 2, 326) + P(ar, arc, cx - aw / 2, 388)
    return svg(W, 418, body, GRAD)

def icon(bg):
    body = f'<rect width="512" height="512" rx="112" fill="{bg}"/>'
    body += f'<g transform="translate(52 40) scale(2.05)">{mark()}</g>'
    return svg(512, 512, body, GRAD)

files = {
    "crescent-logo.svg": horizontal(EMERALD, "#a9844c"),
    "crescent-logo-dark.svg": horizontal(IVORY, CHAMPAGNE, bg=None),
    "crescent-stacked.svg": stacked(EMERALD, "#a9844c", EMERALD),
    "crescent-stacked-emerald.svg": stacked(IVORY, CHAMPAGNE, BLUSH, bg=EMERALD),
    "crescent-icon.svg": icon(EMERALD),
    "crescent-icon-blush.svg": icon("#f7e1dc"),
    "crescent-mark.svg": svg(200, 200, mark(), GRAD),
}
for n, s in files.items():
    open(os.path.join(OUT, n), "w").write(s)
print("wrote", len(files), round(ww), round(tw), round(aw))
