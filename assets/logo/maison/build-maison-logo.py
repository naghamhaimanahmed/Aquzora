"""Aquzora 'Maison' crest: onyx and gold foil, an interlocking AQ monogram inside a lettered seal."""
import sys, os, math
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FONTS, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
ONYX, ONYX2, IVORY = "#0c0b0a", "#171512", "#f8f3ea"
BODONI = "fontsource-bodoni-moda-5.3.0/package/files/bodoni-moda-latin-500-normal.ttf"
BODONI_I = "fontsource-bodoni-moda-5.3.0/package/files/bodoni-moda-latin-400-italic.ttf"
CINZEL = "fontsource-cinzel-5.3.0/package/files/cinzel-latin-400-normal.ttf"
AMIRI = "fontsource-amiri-5.3.0/package/files/amiri-arabic-700-normal.ttf"

def text_path(font_file, text, size, tracking=0.0):
    """Return (path d, advance width, (xmin, ymin, xmax, ymax)) with baseline at y=0."""
    path = os.path.join(FONTS, font_file)
    tt = TTFont(path); upem = tt["head"].unitsPerEm
    font = hb.Font(hb.Face(hb.Blob.from_file_path(path)))
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    gs, order, scale = tt.getGlyphSet(), tt.getGlyphOrder(), size / upem
    pen, bp = SVGPathPen(gs), BoundsPen(gs)
    x = 0; infos = buf.glyph_infos
    for i, (info, pos) in enumerate(zip(infos, buf.glyph_positions)):
        t = (scale, 0, 0, -scale, (x + pos.x_offset) * scale, -pos.y_offset * scale)
        gs[order[info.codepoint]].draw(TransformPen(pen, t))
        gs[order[info.codepoint]].draw(TransformPen(bp, t))
        x += pos.x_advance + (tracking * upem if i < len(infos) - 1 else 0)
    return pen.getCommands(), x * scale, bp.bounds

def P(d, fill, dx=0, dy=0, extra=""):
    return f'<path transform="translate({dx:.2f} {dy:.2f})" fill="{fill}" d="{d}" {extra}/>'

def svg(w, h, body, defs=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" role="img" aria-label="Aquzora"><title>Aquzora</title><defs>{defs}</defs>{body}</svg>\n'

def foil(uid, x1, y1, x2, y2, deep=False):
    """Metallic gold foil: alternating light and dark bands so it reads as polished metal."""
    if deep:  # richer, darker foil that keeps its contrast on ivory
        return (f'<linearGradient id="{uid}" gradientUnits="userSpaceOnUse" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">'
                '<stop offset="0" stop-color="#5e4216"/><stop offset=".22" stop-color="#a77c35"/><stop offset=".4" stop-color="#d9b56a"/>'
                '<stop offset=".55" stop-color="#8f6a28"/><stop offset=".72" stop-color="#c79c50"/><stop offset="1" stop-color="#5a3f14"/></linearGradient>')
    return (f'<linearGradient id="{uid}" gradientUnits="userSpaceOnUse" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">'
            '<stop offset="0" stop-color="#7d5b24"/><stop offset=".2" stop-color="#d9b56a"/><stop offset=".38" stop-color="#fbedc0"/>'
            '<stop offset=".52" stop-color="#c39443"/><stop offset=".7" stop-color="#efd795"/><stop offset=".86" stop-color="#a77c35"/>'
            '<stop offset="1" stop-color="#6e5020"/></linearGradient>')

# ---- monogram: an interlocking A and Q, centred on 0,0 ----
Q_D, Q_W, Q_B = text_path(BODONI, "Q", 190)
A_D, A_W, A_B = text_path(BODONI, "A", 190)

def monogram(gold, bg, uid):
    ax = -(A_B[0] + A_B[2]) / 2 - 26         # A on the left rising above, Q on the right: reads "AQ"
    ay = 44
    qx = -(Q_B[0] + Q_B[2]) / 2 + 22
    qy = 60
    gap = f'stroke="{bg}" stroke-width="7" paint-order="stroke" stroke-linejoin="round"'
    return (f'<g transform="scale(.84) translate(0 -6)"><clipPath id="{uid}"><rect x="-200" y="10" width="400" height="200"/></clipPath>'
            + P(Q_D, gold, qx, qy)
            + P(A_D, gold, ax, ay, gap)                                    # A passes over the Q at the top
            + f'<g clip-path="url(#{uid})">{P(Q_D, gold, qx, qy, gap)}</g></g>')  # Q passes over the A at the bottom

def ring_text(text, size, radius, gold, font=CINZEL):
    """Set text around a full circle, centred on 0,0, reading clockwise from the top."""
    chars = list(text)
    adv = [text_path(font, c, size)[1] for c in chars]
    circ = 2 * math.pi * radius
    spare = (circ - sum(adv)) / len(chars)
    out, s = [], 0
    for c, a in zip(chars, adv):
        if c.strip():
            d = text_path(font, c, size)[0]
            ang = (s + a / 2) / circ * 360
            out.append(f'<path transform="rotate({ang:.3f}) translate({-a/2:.2f} {-radius:.2f})" fill="{gold}" d="{d}"/>')
        s += a + spare
    return "".join(out)

def diamond(x, y, r, fill):
    return f'<path d="M{x} {y-r} L{x+r*0.7:.2f} {y} L{x} {y+r} L{x-r*0.7:.2f} {y} Z" fill="{fill}"/>'

def crest(bg_fill, gold, bg_for_gap, uid="c"):
    """A 400 x 400 crest centred on 200,200."""
    body = f'<g transform="translate(200 200)">'
    if bg_fill:
        body += f'<circle r="196" fill="{bg_fill}"/>'
    body += f'<circle r="188" fill="none" stroke="{gold}" stroke-width="3"/>'
    body += f'<circle r="181" fill="none" stroke="{gold}" stroke-width="0.8"/>'
    body += ring_text("AQUZORA · MAISON DE PARFUM · PERFUMES · OUD · BEAUTY · ", 16.5, 159, gold)
    body += f'<circle r="148" fill="none" stroke="{gold}" stroke-width="0.8"/>'
    body += f'<circle r="141" fill="none" stroke="{gold}" stroke-width="2.2"/>'
    for k in range(4):
        a = math.radians(45 + k * 90)
        body += diamond(141 * math.cos(a), 141 * math.sin(a), 6, gold)
    body += monogram(gold, bg_for_gap, uid + "m")
    body += '</g>'
    return body

WORD_D, WORD_W, _ = text_path(CINZEL, "AQUZORA", 58, 0.42)
SUB_D, SUB_W, _ = text_path(BODONI_I, "Maison de Parfum", 25, 0.02)
AR_D, AR_W, _ = text_path(AMIRI, "أكوزورا", 38)

def stacked(bg, gold_id, ink_bg, deep=False):
    W = max(WORD_W + 120, 470); cx = W / 2
    defs = foil(gold_id, 0, 0, W, 640, deep)
    g = f"url(#{gold_id})"
    body = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ""
    body += f'<g transform="translate({cx-200:.1f} 26)">{crest(None, g, ink_bg)}</g>'
    body += P(WORD_D, g, cx - WORD_W / 2, 512)
    body += f'<path d="M{cx-150:.1f} 540 H{cx-14:.1f} M{cx+14:.1f} 540 H{cx+150:.1f}" stroke="{g}" stroke-width="1"/>' + diamond(cx, 540, 5, g)
    body += P(SUB_D, g, cx - SUB_W / 2, 578)
    body += P(AR_D, g, cx - AR_W / 2, 630)
    return svg(W, 660, body, defs)

def horizontal(bg, gold_id, ink_bg, deep=False):
    s = 0.42; cw = 400 * s
    tx = 22 + cw + 30
    W = tx + WORD_W + 26; H = 210
    defs = foil(gold_id, 0, 0, W, H * 1.4, deep)
    g = f"url(#{gold_id})"
    body = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ""
    body += f'<g transform="translate(22 {(H-cw)/2:.1f}) scale({s})">{crest(None, g, ink_bg)}</g>'
    body += P(WORD_D, g, tx, 112)
    rule_y = 150
    body += f'<path d="M{tx:.1f} {rule_y} H{tx + (WORD_W-SUB_W)/2 - 16:.1f} M{tx + (WORD_W+SUB_W)/2 + 16:.1f} {rule_y} H{tx+WORD_W:.1f}" stroke="{g}" stroke-width="1"/>'
    body += P(SUB_D, g, tx + (WORD_W - SUB_W) / 2, 158)
    return svg(W, H, body, defs)

def icon(bg, gold_id, ink_bg, deep=False):
    defs = foil(gold_id, 0, 0, 512, 512, deep)
    g = f"url(#{gold_id})"
    body = f'<rect width="512" height="512" rx="112" fill="{bg}"/>'
    body += f'<g transform="translate(256 262) scale(1.3)">{monogram(g, ink_bg, "im")}</g>'
    body += f'<rect x="34" y="34" width="444" height="444" rx="86" fill="none" stroke="{g}" stroke-width="2.5"/>'
    return svg(512, 512, body, defs)

files = {
    "maison-crest.svg": svg(400, 400, crest(ONYX, "url(#f)", ONYX), foil("f", 0, 0, 400, 400)),
    "maison-crest-ivory.svg": svg(400, 400, crest(IVORY, "url(#f)", IVORY), foil("f", 0, 0, 400, 400, True)),
    "maison-stacked-black.svg": stacked(ONYX, "f", ONYX),
    "maison-stacked-ivory.svg": stacked(IVORY, "f", IVORY, True),
    "maison-logo-black.svg": horizontal(ONYX, "f", ONYX),
    "maison-logo-ivory.svg": horizontal(IVORY, "f", IVORY, True),
    "maison-icon.svg": icon(ONYX, "f", ONYX),
    "maison-icon-ivory.svg": icon(IVORY, "f", IVORY, True),
}
for n, s in files.items():
    open(os.path.join(OUT, n), "w").write(s)
print("wrote", len(files), round(WORD_W), round(SUB_W))
