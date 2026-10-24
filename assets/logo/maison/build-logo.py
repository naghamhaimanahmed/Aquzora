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

GOLD, GOLD_DEEP = "#c4a062", "#9a7738"
JOST = "fontsource-jost-5.3.0/package/files/jost-latin-500-normal.ttf"

def mark(c, sw=3.2):
    """Monoline symbol, 120 x 200 box: perfume bottle + lipstick stopper + rising oud smoke."""
    def st(k=1.0):
        return f'fill="none" stroke="{c}" stroke-width="{sw*k:.2f}" stroke-linecap="round" stroke-linejoin="round"'
    return (f'<path d="M60 34 C51 25 69 18 60 8 C54 1 59 -6 65 -10" {st()}/>'                       # oud smoke
            f'<path d="M69 30 C65 25 73 21 69 15" {st(0.6)} opacity=".7"/>'
            f'<path d="M48 72 V52 L72 40 V72" {st()}/>'                                             # lipstick bullet stopper
            f'<path d="M42 72 H78 V84 H42 Z" {st()}/>'                                              # collar
            f'<path d="M52 84 V94 M68 84 V94" {st()}/>'                                             # neck
            f'<path d="M34 94 H86 Q108 94 108 116 V164 Q108 186 86 186 H34 Q12 186 12 164 V116 Q12 94 34 94 Z" {st()}/>'  # flacon
            f'<path d="M36 102 H84 Q100 102 100 118 V162 Q100 178 84 178 H36 Q20 178 20 162 V118 Q20 102 36 102 Z" {st(0.4)} opacity=".75"/>'  # inner line
            f'<path d="M24 146 C44 136 76 156 96 146" {st(0.75)}/>'                                 # perfume line
            f'<path d="M28 116 V130" {st(0.6)} opacity=".6"/>')                                     # glass highlight

WORD_D, WORD_W, WB = text_path(BODONI, "AQUZORA", 62, 0.30)
TAG_D, TAG_W, _ = text_path(JOST, "PERFUMES · OUD · MAKEUP · SKINCARE", 12.5, 0.42)

def stacked(bg, c):
    W = max(WORD_W, TAG_W) + 140; cx = W / 2; H = 440
    body = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ""
    body += f'<g transform="translate({cx-60:.1f} 46)">{mark(c)}</g>'
    body += P(WORD_D, c, cx - WORD_W / 2, 330)
    body += f'<path d="M{cx-28:.1f} 354 H{cx+28:.1f}" stroke="{c}" stroke-width="1.2"/>'
    body += P(TAG_D, c, cx - TAG_W / 2, 386)
    return svg(W, H, body)

def horizontal(bg, c):
    s = 0.62; mw = 120 * s
    tx = 34 + mw + 34
    W = tx + max(WORD_W, TAG_W) + 34; H = 170
    body = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ""
    body += f'<g transform="translate(34 {(H - 196*s)/2 + 4:.1f}) scale({s})">{mark(c, 3.6)}</g>'
    body += f'<path d="M{tx-17:.1f} 40 V130" stroke="{c}" stroke-width="1" opacity=".55"/>'
    body += P(WORD_D, c, tx + 8, 96) + P(TAG_D, c, tx + 8 + (WORD_W - TAG_W) / 2, 128)
    return svg(W, H, body)

def icon(bg, c, border=True):
    body = f'<rect width="512" height="512" rx="112" fill="{bg}"/>'
    if border:
        body += f'<rect x="34" y="34" width="444" height="444" rx="84" fill="none" stroke="{c}" stroke-width="2" opacity=".6"/>'
    body += f'<g transform="translate({256-60*1.75:.1f} {256-92*1.75:.1f}) scale(1.75)">{mark(c, 3.4)}</g>'
    return svg(512, 512, body)

def foil_version(bg, maker):
    """Same layout but with metallic foil for print."""
    s = maker(bg, "url(#f)")
    return s.replace("<defs></defs>", "<defs>" + foil("f", 0, 0, 700, 500) + "</defs>")

files = {
    "aquzora-stacked-black.svg": stacked(ONYX, GOLD),
    "aquzora-stacked-ivory.svg": stacked(IVORY, GOLD_DEEP),
    "aquzora-stacked-foil.svg": foil_version(ONYX, stacked),
    "aquzora-logo-black.svg": horizontal(ONYX, GOLD),
    "aquzora-logo-ivory.svg": horizontal(IVORY, GOLD_DEEP),
    "aquzora-logo-gold-transparent.svg": horizontal(None, GOLD_DEEP),
    "aquzora-icon-black.svg": icon(ONYX, GOLD),
    "aquzora-icon-ivory.svg": icon(IVORY, GOLD_DEEP),
    "aquzora-mark.svg": svg(120, 200, f'<g transform="translate(0 8)">{mark(GOLD_DEEP)}</g>'),
}
for n, s in files.items():
    open(os.path.join(OUT, n), "w").write(s)
print("wrote", len(files), round(WORD_W), round(TAG_W))
