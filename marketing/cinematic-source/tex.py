import numpy as np, sys
from PIL import Image
from scipy.ndimage import gaussian_filter
V = sys.argv[1]; rng = np.random.default_rng(11)
def fbm(h, w, octaves=6, base=4):
    out = np.zeros((h, w))
    for o in range(octaves):
        n = base * 2 ** o
        g = rng.random((n + 1, int(n * w / h) + 1))
        img = np.array(Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), float) / 255
        out += img / (1.7 ** o)
    out -= out.min(); out /= out.max(); return out
# wispy smoke: fbm with ridges, faded at edges, tall
h, w = 1600, 1200
n = fbm(h, w); n2 = fbm(h, w, base=3)
smoke = np.clip((n * 0.65 + n2 * 0.35 - 0.45) * 2.4, 0, 1) ** 1.6
smoke = gaussian_filter(smoke, 3)
yy, xx = np.mgrid[0:h, 0:w]; edge = np.clip(np.minimum.reduce([xx, w - xx, yy, h - yy]) / 220, 0, 1)
a = (smoke * edge * 255).astype(np.uint8)
Image.fromarray(np.dstack([np.full_like(a, 255)] * 3 + [a])).save(f'{V}/tex/smoke.png')
# grain (tileable-ish noise)
g = rng.normal(128, 40, (512, 512)).clip(0, 255).astype(np.uint8)
Image.fromarray(g).save(f'{V}/tex/grain.png')
print('ok')
