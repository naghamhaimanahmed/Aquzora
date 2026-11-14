# Outline of the Atr mark "عطر" (Aref Ruqaa 700, the site's logo font) as one SVG path, shaped with HarfBuzz.
import uharfbuzz as hb, json, io
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
src = '/home/user/Aquzora/public/assets/fonts/aref-ruqaa-atr-subset-700.woff2'
f = TTFont(src); f.flavor = None; buf = io.BytesIO(); f.save(buf); data = buf.getvalue()
face = hb.Face(data); font = hb.Font(face); upem = face.upem
b = hb.Buffer(); b.add_str('عطر'); b.guess_segment_properties(); hb.shape(font, b)
gs = f.getGlyphSet(); order = f.getGlyphOrder()
x = 0; paths = []
for info, pos in zip(b.glyph_infos, b.glyph_positions):
    name = order[info.codepoint]; pen = SVGPathPen(gs)
    tp = TransformPen(pen, (1, 0, 0, -1, x + pos.x_offset, -pos.y_offset)); gs[name].draw(tp)
    paths.append(pen.getCommands()); x += pos.x_advance
# bounds
from fontTools.pens.boundsPen import BoundsPen
xs=[];ys=[]; x=0
for info, pos in zip(b.glyph_infos, b.glyph_positions):
    bp = BoundsPen(gs); gs[order[info.codepoint]].draw(bp)
    if bp.bounds: xmin,ymin,xmax,ymax = bp.bounds; xs += [x+xmin, x+xmax]; ys += [-ymax, -ymin]
    x += pos.x_advance
print(len(paths), [len(p) for p in paths], 'upem', upem, 'bbox', min(xs), min(ys), max(xs), max(ys))
json.dump({'paths': paths, 'bbox': [min(xs), min(ys), max(xs), max(ys)]}, open('atr-mark.json', 'w'))
