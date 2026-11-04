"""Aquzora 'Star Flacon' emblem: an eight-point Arabian star holding a cut-crystal perfume bottle."""
import sys, os, math
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONTS, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
PLUM, PLUM2, GOLD, GOLD2, CREAM = "#3b1d2a", "#2a141d", "#b98a4e", "#d6b07a", "#f6ecdf"
F = lambda name: f"fontsource-{name}"
CINZEL = F("cinzel-5.3.0/package/files/cinzel-latin-500-normal.ttf")
MARC = F("marcellus-5.3.0/package/files/marcellus-latin-400-normal.ttf")
RUQAA = F("aref-ruqaa-5.3.0/package/files/aref-ruqaa-arabic-700-normal.ttf")

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

def grad(uid):
    return (f'<linearGradient id="{uid}" x1="0" y1="0" x2="1" y2="1">'
            '<stop offset="0" stop-color="#f0d6a6"/><stop offset=".5" stop-color="#c79a5c"/><stop offset="1" stop-color="#8e6535"/></linearGradient>')

def star_points(cx, cy, a):
    """Outline of two overlapping squares (half-size a): the eight-point khatam star."""
    pts = []
    ro, ri = a * math.sqrt(2), a / math.cos(math.radians(22.5))
    for k in range(16):
        ang = math.radians(-90 + k * 22.5)
        r = ro if k % 2 == 0 else ri
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    return " ".join(f"{x:.2f},{y:.2f}" for x, y in pts)

def emblem(fill, line, glass, facet, g="g1"):
    """200 x 200 emblem centred at 100,100."""
    gold = f"url(#{g})" if glass == "grad" else glass
    return f'''<polygon points="{star_points(100, 100, 66)}" fill="{fill}" stroke="{line}" stroke-width="3" stroke-linejoin="miter"/>
<polygon points="{star_points(100, 100, 57)}" fill="none" stroke="{line}" stroke-width="1" opacity=".7"/>
<path d="M100 44 L112 58 L100 72 L88 58 Z" fill="{gold}"/>
<path d="M100 44 L100 72 M88 58 L112 58" stroke="{facet}" stroke-width="1" opacity=".55"/>
<rect x="93" y="72" width="14" height="10" fill="{gold}"/>
<path d="M80 82 H120 L132 98 V136 L120 152 H80 L68 136 V98 Z" fill="{gold}"/>
<path d="M80 82 L88 98 H112 L120 82 M68 98 H88 V136 H68 M132 98 H112 V136 H132 M88 136 L80 152 M112 136 L120 152" fill="none" stroke="{facet}" stroke-width="1.6" stroke-linejoin="round" opacity=".75"/>
<path d="M100 104 C104 110 107 114 107 118 A7 7 0 0 1 93 118 C93 114 96 110 100 104 Z" fill="{facet}"/>
<circle cx="100" cy="21" r="3" fill="{line}"/><circle cx="100" cy="179" r="3" fill="{line}"/>
<circle cx="21" cy="100" r="3" fill="{line}"/><circle cx="179" cy="100" r="3" fill="{line}"/>'''

word, ww = text_path(CINZEL, "AQUZORA", 46, 0.30)
tag, tw = text_path(MARC, "PERFUMES  ·  OUD  ·  BEAUTY", 14, 0.30)
ar, aw = text_path(RUQAA, "أكوزورا", 44)

def stacked(fg, star_fill, line, facet, ar_fill, bg=None):
    W = max(ww, 300) + 100; cx = W / 2
    body = f'<rect width="100%" height="100%" rx="32" fill="{bg}"/>' if bg else ""
    body += f'<g transform="translate({cx-100:.2f} 20)">{emblem(star_fill, line, "grad", facet)}</g>'
    body += P(word, fg, cx - ww / 2, 280)
    rule = 46
    body += f'<path d="M{cx - tw/2 - 14 - rule:.1f} 303 H{cx - tw/2 - 14:.1f} M{cx + tw/2 + 14:.1f} 303 H{cx + tw/2 + 14 + rule:.1f}" stroke="{line}" stroke-width="1.2"/>'
    body += P(tag, line, cx - tw / 2, 308)
    body += P(ar, ar_fill, cx - aw / 2, 376)
    return svg(W, 404, body, grad("g1"))

def horizontal(fg, star_fill, line, facet):
    s = 0.62
    tx = 20 + 200 * s + 26
    W = tx + max(ww, tw) + 24
    body = f'<g transform="translate(20 8) scale({s})">{emblem(star_fill, line, "grad", facet)}</g>'
    body += P(word, fg, tx, 76) + P(tag, line, tx + (ww - tw) / 2, 106)
    return svg(W, 140, body, grad("g1"))

def icon(bg, star_fill, line, facet):
    body = f'<rect width="512" height="512" rx="112" fill="{bg}"/>'
    body += f'<g transform="translate(36 36) scale(2.2)">{emblem(star_fill, line, "grad", facet)}</g>'
    return svg(512, 512, body, grad("g1"))

files = {
    "star-stacked.svg": stacked(PLUM, PLUM, GOLD, CREAM, GOLD),
    "star-stacked-dark.svg": stacked(CREAM, PLUM2, GOLD2, PLUM, GOLD2, bg=PLUM),
    "star-logo.svg": horizontal(PLUM, PLUM, GOLD, CREAM),
    "star-logo-white.svg": horizontal(CREAM, PLUM2, GOLD2, PLUM),
    "star-icon.svg": icon(PLUM, PLUM2, GOLD2, PLUM),
    "star-icon-cream.svg": icon(CREAM, PLUM, GOLD, CREAM),
    "star-emblem.svg": svg(200, 200, emblem(PLUM, GOLD, "grad", CREAM), grad("g1")),
}
for n, s in files.items():
    open(os.path.join(OUT, n), "w").write(s)
print("wrote", len(files), round(ww), round(tw), round(aw))
