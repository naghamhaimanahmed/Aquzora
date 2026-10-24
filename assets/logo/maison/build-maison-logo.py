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

# ---------- picture of what the store sells: lipstick, perfume bottle, oud burner (centred on 0,0) ----------
A_SM, A_SMW, A_SMB = text_path(BODONI, "A", 34)
Q_SM, Q_SMW, Q_SMB = text_path(BODONI, "Q", 34)

def label_monogram(gold, bg):
    gap = f'stroke="{bg}" stroke-width="2" paint-order="stroke"'
    ax = -(A_SMB[0] + A_SMB[2]) / 2 - 6; qx = -(Q_SMB[0] + Q_SMB[2]) / 2 + 6
    return P(Q_SM, gold, qx, 12) + P(A_SM, gold, ax, 10, gap)

def scene(gold, bg, uid):
    line = f'fill="none" stroke="{gold}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"'
    s = ""
    # perfume bottle: faceted jewel stopper, neck, square-shouldered body, onyx label with AQ
    s += f'<path d="M0 -84 L20 -66 L12 -48 H-12 L-20 -66 Z" fill="{gold}"/>'
    s += f'<path d="M-20 -66 H20 M-8 -66 L0 -84 L8 -66 L0 -48 Z" fill="none" stroke="{bg}" stroke-width="1.4" opacity=".7"/>'
    s += f'<rect x="-11" y="-48" width="22" height="14" fill="{gold}"/>'
    s += f'<path d="M-30 -34 H30 Q48 -34 48 -16 V74 Q48 92 30 92 H-30 Q-48 92 -48 74 V-16 Q-48 -34 -30 -34 Z" fill="{gold}"/>'
    s += f'<rect x="-31" y="2" width="62" height="56" rx="4" fill="{bg}"/>'
    s += f'<rect x="-27" y="6" width="54" height="48" rx="2" fill="none" stroke="{gold}" stroke-width="1"/>'
    s += f'<g transform="translate(0 30)">{label_monogram(gold, bg)}</g>'
    s += f'<path d="M-38 -22 V-4" stroke="{bg}" stroke-width="3" stroke-linecap="round" opacity=".45"/>'
    # lipstick (makeup), left
    s += f'<g transform="translate(-96 0)">'
    s += f'<path d="M-10 -14 V-44 Q-10 -52 0 -58 L10 -64 V-14 Z" fill="{gold}"/>'
    s += f'<rect x="-14" y="-14" width="28" height="30" rx="2" fill="{gold}"/>'
    s += f'<path d="M-14 -4 H14" stroke="{bg}" stroke-width="2"/>'
    s += f'<rect x="-17" y="16" width="34" height="76" rx="3" fill="{gold}"/>'
    s += f'<path d="M-17 30 H17" stroke="{bg}" stroke-width="2"/></g>'
    # oud incense burner (mabkhara) with smoke, right
    s += f'<g transform="translate(96 0)">'
    s += f'<path d="M-30 30 H30 Q28 52 0 56 Q-28 52 -30 30 Z" fill="{gold}"/>'
    s += f'<path d="M-8 56 V70 H8 V56" fill="{gold}"/><path d="M-22 92 L-14 70 H14 L22 92 Z" fill="{gold}"/>'
    s += f'<path d="M-30 30 H30" stroke="{bg}" stroke-width="2"/>'
    s += f'<path d="M-6 24 C-16 8 6 -2 -4 -18 C-12 -32 4 -40 -2 -56" {line}/>'
    s += f'<path d="M8 22 C2 10 16 2 10 -10 C5 -20 14 -26 12 -36" {line.replace('stroke-width="3.2"', 'stroke-width="2.4"')} opacity=".85"/></g>'
    return f'<g>{s}</g>'

def crest(bg_fill, gold, bg_for_gap, uid="c"):
    """A 400 x 400 crest centred on 200,200."""
    body = '<g transform="translate(200 200)">'
    if bg_fill:
        body += f'<circle r="196" fill="{bg_fill}"/>'
    body += f'<circle r="188" fill="none" stroke="{gold}" stroke-width="3"/>'
    body += f'<circle r="181" fill="none" stroke="{gold}" stroke-width="0.8"/>'
    ring = "AQUZORA · PERFUMES · OUD · MAKEUP · SKINCARE · "
    adv = [text_path(CINZEL, c, 17)[1] for c in ring]
    spare = (2 * math.pi * 159 - sum(adv)) / len(ring)
    first = sum(adv[:7]) + spare * 6                      # width of "AQUZORA" as set on the ring
    body += f'<g transform="rotate({-first / 2 / (2 * math.pi * 159) * 360:.3f})">{ring_text(ring, 17, 159, gold)}</g>'
    body += f'<circle r="148" fill="none" stroke="{gold}" stroke-width="0.8"/>'
    body += f'<circle r="141" fill="none" stroke="{gold}" stroke-width="2.2"/>'
    body += f'<g transform="translate(0 -2) scale(.98)">{scene(gold, bg_for_gap, uid)}</g>'
    body += '</g>'
    return body

WORD_D, WORD_W, _ = text_path(CINZEL, "AQUZORA", 58, 0.42)
SUB_D, SUB_W, _ = text_path(BODONI_I, "Perfumes · Oud · Makeup · Skincare", 23, 0.01)

def stacked(bg, gold_id, ink_bg, deep=False):
    W = max(WORD_W, SUB_W) + 120; cx = W / 2
    defs = foil(gold_id, 0, 0, W, 620, deep)
    g = f"url(#{gold_id})"
    body = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ""
    body += f'<g transform="translate({cx-200:.1f} 26)">{crest(None, g, ink_bg)}</g>'
    body += P(WORD_D, g, cx - WORD_W / 2, 512)
    body += f'<path d="M{cx-150:.1f} 540 H{cx-14:.1f} M{cx+14:.1f} 540 H{cx+150:.1f}" stroke="{g}" stroke-width="1"/>' + diamond(cx, 540, 5, g)
    body += P(SUB_D, g, cx - SUB_W / 2, 578)
    return svg(W, 612, body, defs)

def horizontal(bg, gold_id, ink_bg, deep=False):
    s = 0.46; cw = 400 * s
    tx = 22 + cw + 30
    W = tx + max(WORD_W, SUB_W) + 26; H = 230
    defs = foil(gold_id, 0, 0, W, H * 1.4, deep)
    g = f"url(#{gold_id})"
    body = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ""
    body += f'<g transform="translate(22 {(H-cw)/2:.1f}) scale({s})">{crest(None, g, ink_bg)}</g>'
    body += P(WORD_D, g, tx, 112)
    body += f'<path d="M{tx:.1f} 134 H{tx+WORD_W:.1f}" stroke="{g}" stroke-width="1"/>'
    body += P(SUB_D, g, tx + (WORD_W - SUB_W) / 2, 168)
    return svg(W, H, body, defs)

def icon(bg, gold_id, ink_bg, deep=False):
    defs = foil(gold_id, 0, 0, 512, 512, deep)
    g = f"url(#{gold_id})"
    body = f'<rect width="512" height="512" rx="112" fill="{bg}"/>'
    body += f'<g transform="translate(256 258) scale(1.62)">{scene(g, ink_bg, "i")}</g>'
    body += f'<rect x="30" y="30" width="452" height="452" rx="88" fill="none" stroke="{g}" stroke-width="2.5"/>'
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
