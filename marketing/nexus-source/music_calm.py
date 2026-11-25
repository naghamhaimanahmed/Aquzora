# Calm Arabic score for the Nexus film: oud, qanun, ney and a soft drone in maqam Hijaz on D.
# No percussion and no pulse; phrases start on the scene changes. 86 s, 48 kHz stereo.
# usage: python3 music_calm.py out.wav
import numpy as np, sys, wave
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d
SR = 48000; D = 86.0; N = int(SR * D)
rng = np.random.default_rng(21)
DRY = np.zeros((2, N)); REV = np.zeros((2, N))
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def bq(x, f, kind='low', o=2): return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
def put(sig, at, g=1.0, pan=0.0, rev=0.3):
    i = int(round(at * SR))
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    DRY[0, i:i + n] += sig[:n] * g * l * 1.414; DRY[1, i:i + n] += sig[:n] * g * r * 1.414
    REV[0, i:i + n] += sig[:n] * g * rev * l; REV[1, i:i + n] += sig[:n] * g * rev * r
tt = lambda d: np.arange(int(d * SR)) / SR

# ---------- plucked string (Karplus-Strong, computed one period at a time) ----------
def ks(f, dur, a1=.3, dark=1.4, pick=.18):
    """a1: level left after one second; dark: how fast the harmonics fall away (higher = mellower)."""
    n0 = max(2, int(round(SR / f))); periods = int(dur * SR / n0) + 2
    # the plucked shape, built from its harmonics: level falls as 1/k^dark, with the dips a pick position leaves
    i = np.arange(n0); buf = np.zeros(n0)
    for k in range(1, min(48, n0 // 2)):
        buf += (abs(np.sin(k * np.pi * pick)) + .12) / k ** dark * np.sin(2 * np.pi * k * i / n0 + rng.uniform(-.5, .5))
    buf /= np.abs(buf).max() + 1e-9
    b = float(np.clip(.5 * 300 / f, .1, .5)); decay = a1 ** (1 / f)             # gentler loop filter on high strings
    out = np.empty(periods * n0)
    for j in range(periods):
        out[j * n0:(j + 1) * n0] = buf
        buf = decay * ((1 - b) * buf + b * np.roll(buf, 1))
    # fine tuning: the integer period is slightly off pitch, so resample to the exact frequency
    ratio = (SR / n0) / f; m = int(len(out) * ratio)
    out = np.interp(np.arange(m) / ratio, np.arange(len(out)), out)[:int(dur * SR)]
    out *= np.clip(np.arange(len(out)) / (SR * .0015), 0, 1) * np.clip((dur - np.arange(len(out)) / SR) / .06, 0, 1)
    return out
def oud(m, dur=1.6, g=1.0):
    f = hz(m); d = min(dur + .5, 3.2); a1 = float(np.clip(.5 - (m - 38) * .009, .16, .5))
    a = ks(f * 2 ** (-.011 / 12), d, a1, 1.35, .2); b = ks(f * 2 ** (.012 / 12), d, a1, 1.35, .23)   # double course
    k = min(len(a), len(b)); a = a[:k]; s = a + np.concatenate([np.zeros(int(.007 * SR)), b])[:k] * .85
    s = s + bp(s, 95, 230) * .5 + bp(s, 340, 480) * .12                      # wooden bowl resonances
    thump = np.sin(2 * np.pi * 95 * tt(.05)) * np.exp(-tt(.05) * 90) * .2   # the plectrum on the face
    s *= .2 / (np.sqrt(np.mean(s[:int(.3 * SR)] ** 2)) + 1e-9)             # even loudness from note to note
    s[:len(thump)] += thump
    return s * g * .5
def qanun(m, dur=1.4, g=1.0):
    f = hz(m); d = min(dur + .8, 3.2); s = np.zeros(int(d * SR))
    for det, dl in ((-.012, 0), (0, .004), (.014, .009)):                      # triple course
        x = ks(f * 2 ** (det / 12), d, .42, 1.05, .1); i = int(dl * SR); k = min(len(x), len(s) - i); s[i:i + k] += x[:k]
    s = bq(s, 200, 'high'); s *= .13 / (np.sqrt(np.mean(s[:int(.3 * SR)] ** 2)) + 1e-9)
    return s * g * .42
def trem(inst, m, dur, g=1.0, rate=11.5):
    """Tremolo (risha): fast repeated strokes that swell and relax."""
    n = int(dur * rate); out = np.zeros(int((dur + 1.2) * SR))
    for k in range(n):
        x = k / max(1, n - 1); amp = (.55 + .45 * np.sin(np.pi * x) ** .8) * (1 if k % 2 == 0 else .82) * (.9 + .2 * rng.random())
        t0 = k / rate + rng.normal(0, .004); s = inst(m, .5, g * amp * .62); i = max(0, int(t0 * SR)); e = min(len(s), len(out) - i); out[i:i + e] += s[:e]
    return out
def ney(m, dur, g=1.0, prev=None):
    n = int((dur + .35) * SR); t = np.arange(n) / SR; f = hz(m)
    scoop = (-.45 if prev is None else (prev - m) * .9) * np.exp(-t / .055)   # slides into the note
    vib = .22 * np.sin(2 * np.pi * 4.9 * t + rng.random() * 6) * np.clip((t - .35) / .5, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * 2 ** ((scoop + vib) / 12)) / SR
    env = np.clip(t / .13, 0, 1) ** 1.5 * np.clip((dur + .3 - t) / .3, 0, 1) * (1 + .06 * np.sin(2 * np.pi * 4.9 * t + 1))
    tone = np.sin(ph) + .34 * np.sin(2 * ph + .4) + .1 * np.sin(3 * ph) + .04 * np.sin(4 * ph)
    breath = bp(rng.standard_normal(n), 1800, 6500) * .07 + bp(rng.standard_normal(n), f * .98, f * 2.1) * .3   # air in the reed
    return (tone + breath * (.7 + .5 * np.exp(-t / .12))) * env * g * .13
def pad(ms, dur, g=1.0, cutoff=700):
    t = tt(dur); s = np.zeros(len(t))
    for m in ms:
        for det in (-.07, .06):
            f = hz(m) * 2 ** (det / 12); p = rng.random() * 6
            for h in range(1, 9): s += np.sin(2 * np.pi * f * h * t + p * h) / h ** 1.6
    env = np.clip(t / 2.5, 0, 1) * np.clip((dur - t) / 3.0, 0, 1)
    return bq(s, cutoff) / (len(ms) * 2) * env * g * (1 + .08 * np.sin(2 * np.pi * .11 * t))
def air(dur=1.4, g=1.0):
    t = tt(dur); k = t / dur
    return bp(rng.standard_normal(len(t)), 500, 5000) * np.sin(np.pi * k) ** 2 * g * .05

import os
SOLO = os.environ.get('SOLO')                                               # SOLO=oud|qanun|ney|pad|air: measure one instrument alone
if SOLO:
    for _n in ('oud', 'qanun', 'ney', 'pad', 'air'):
        if _n != SOLO: globals()[_n] = (lambda f: (lambda *a, **k: f(*a, **k) * 0))(globals()[_n])

# ---------- drone ----------
put(pad([38, 45, 50], 86.0, 1.0, 480), 0.0, .13, 0, .5)
put(bq(pad([62, 69], 30.0, 1.0, 1500), 300, 'high'), 55.0, .045, 0, .7)       # a little light for the last third

# ---------- ney: lead voice ----------
NEY = [  # (time, midi, duration)
  (0.8, 62, 1.8), (2.8, 63, .5), (3.3, 66, 1.6), (5.0, 67, .4), (5.4, 69, 1.5),
  (13.2, 69, 2.2), (15.5, 70, .6), (16.1, 69, .5), (16.6, 67, .5), (17.1, 66, 1.8), (19.2, 67, .5), (19.7, 69, .5), (20.2, 72, 1.4),
  (21.7, 70, .5), (22.2, 69, 1.6), (24.0, 67, .5), (24.5, 66, .5), (25.0, 63, .7), (25.7, 62, 1.2),
  (35.2, 69, 1.5), (36.8, 70, .4), (37.2, 72, .4), (37.6, 74, 1.6), (39.3, 72, .4), (39.7, 70, .4), (40.1, 67, .8),
  (51.2, 74, 1.6), (53.0, 72, .5), (53.5, 70, .5), (54.0, 67, .9), (55.0, 67, .5), (55.5, 72, .5), (56.0, 75, .9), (57.0, 74, .5), (57.5, 72, .4), (57.9, 70, .4), (58.3, 69, 1.4),
  (70.5, 69, 1.2), (71.75, 74, 1.3),
  (73.2, 74, 1.0), (74.3, 72, .4), (74.7, 70, .4), (75.1, 69, 1.2), (76.4, 67, .4), (76.8, 66, .5),
  (79.6, 69, .8), (80.5, 66, .6), (81.2, 63, .6), (81.9, 62, 3.2)]
for i, (t, m, d) in enumerate(NEY):
    prev = NEY[i - 1][1] if i and abs(NEY[i - 1][0] + NEY[i - 1][2] - t) < .25 else None
    put(ney(m, d, 1.0, prev), t, 1.0, -.12, .55)

# ---------- oud ----------
def O(t, m, d=1.4, g=1.0, pan=.12): put(oud(m, d, g), t, 1.0, pan, .32)
def OT(t, m, d, g=1.0, pan=.12): put(trem(oud, m, d, g), t, 1.0, pan, .34)
# opening taqsim (7-13)
O(7.0, 38, 2.4, .9); OT(7.0, 50, 1.15)
for t, m, d in [(8.3, 54, .5), (8.65, 55, .5), (10.0, 58, .45), (10.3, 57, .45), (10.6, 55, .45), (10.9, 54, .7), (11.4, 51, .7)]: O(t, m, d)
OT(9.0, 57, .9); O(11.9, 38, 2.4, .8); OT(11.9, 50, .95, .9)
# chords: root, fifth, octave, third (midi)
CH = {'D': [38, 45, 50, 54], 'Gm': [43, 50, 55, 58], 'Cm': [36, 43, 48, 51], 'Eb': [39, 46, 51, 55]}
def arp(t, name, g=1.0, step=.5):
    r, f, o, th = CH[name]
    for k, m in enumerate([r, f, o, th]): O(t + k * step + rng.normal(0, .008), m, 1.8, g * (.95 if k == 0 else .72))
def flow(t, name, g=1.0):
    r, f, o, th = CH[name]
    for k, m in enumerate([r, f, o, th, o, f]): O(t + k / 3 + rng.normal(0, .007), m, 1.4, g * (.9 if k == 0 else .6 + .08 * (k == 3)))
# brand chapter (13-27): slow arpeggios under the ney
for t, c in [(13, 'D'), (15, 'Gm'), (17, 'D'), (19, 'Gm'), (21, 'Gm'), (23, 'D'), (25, 'Eb')]: arp(t, c, .85)
O(26.0, 38, 2.0, .8); O(26.5, 50, 1.6, .7)
# flowing section (27-59): six soft notes to each two-second bar
CYC = ['D', 'Gm', 'D', 'D', 'D', 'Gm', 'Cm', 'D']
for j in range(16): flow(27 + 2 * j, CYC[j % 8], .8 if j else .9)
for j, c in enumerate(['D', 'Gm', 'D', 'Gm']): arp(59 + .0 + 2 * j + 1, c, .6)            # details chapter (60-68): sparser
# oud answers in the mobile chapter (41-51)
OT(43.0, 69, 1.4, .8, .3)
for t, m, d in [(41.2, 62, .5), (41.6, 63, .5), (42.0, 66, .5), (42.4, 67, .5), (45.0, 70, .6), (45.5, 69, .6), (46.0, 67, 1.0), (47.0, 66, .6), (47.5, 67, .6), (48.0, 69, 1.0),
                (49.0, 67, .5), (49.4, 66, .5), (49.8, 63, .6), (50.3, 62, 1.0)]: O(t, m, d, .85, .3)
# rise without drums (68-73): four tremolo notes climbing the maqam
for t, m in [(68.0, 50), (69.25, 54), (70.5, 57), (71.75, 62)]: OT(t, m, 1.15, .75 + .08 * ((m - 50) // 4)); O(t, m - 12, 1.6, .7)
# release (73-77.25) and the pause before the last line
for t, c in [(73, 'D'), (75, 'Gm')]: flow(t, c, .85)
O(77.0, 38, 2.2, .8); O(77.02, 50, 2.0, .7); O(78.1, 57, 1.5, .6)
# end card (79-86): a rolled chord, then one last tremolo
for k, m in enumerate([38, 45, 50, 54, 57, 62]): O(79.0 + k * .045, m, 3.0, .8)
OT(82.6, 50, 1.3, .55)

# ---------- qanun ----------
def Q(t, m, d=1.2, g=1.0, pan=-.3): put(qanun(m, d, g), t, 1.0, pan, .45)
def gliss(t, lo, hi, dur, g=.6):
    sc = [m for m in range(lo, hi + 1) if (m - 62) % 12 in (0, 1, 4, 5, 7, 8, 10)]
    for k, m in enumerate(sc): Q(t + dur * (k / len(sc)) ** 1.15, m, 1.6, g * (.6 + .4 * k / len(sc)), -.5 + k / len(sc))
# answers in the brand chapter
for t, m in [(14.6, 74), (14.85, 72), (15.1, 70), (18.4, 78), (18.65, 75), (18.9, 74), (23.4, 74), (23.65, 78), (23.9, 81)]: Q(t, m, 1.4, .55)
# melody over the layers scene (27-35)
for t, m, d in [(27.0, 74, .6), (27.5, 72, .6), (28.0, 70, .6), (28.5, 69, 1.1), (29.5, 67, .6), (30.0, 69, .6), (30.5, 70, 1.1), (31.5, 69, .6), (32.0, 67, .6), (32.5, 66, 1.1),
                (33.5, 63, .6), (34.0, 66, .6), (34.5, 62, 1.0)]: Q(t, m, d, .75)
# one soft note for each detail card (63-66.5), walking down the maqam
for k, m in enumerate([86, 84, 82, 81, 79, 78, 75, 74]): Q(63.0 + k * .5, m, 1.4, .5, -.4 + .1 * k)
gliss(72.55, 62, 86, .5, .5); gliss(78.85, 50, 86, .55, .6)

# ---------- soft transitions (no hits) ----------
for c in [7, 13, 27, 35, 41, 51, 60, 68, 73, 79]: put(air(1.3), c - .8, 1.0, 0, .5)

# ---------- room, loudness, limiter ----------
irn = int(3.2 * SR); x = np.arange(irn) / SR
ir = np.stack([bq(rng.standard_normal(irn), 5200) * np.exp(-x * 2.0) for _ in range(2)]); ir[:, :int(.018 * SR)] = 0
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
wet = np.stack([fftconvolve(bq(REV[i], 180, 'high'), ir[i])[:N] for i in range(2)]) * .6
mix = np.stack([bq(m, 30, 'high') for m in DRY + wet])
fi = np.clip(np.arange(N) / (SR * .4), 0, 1); fo = np.clip((N - np.arange(N)) / (SR * 3.0), 0, 1)
mix *= fi * fo ** 1.3
rms = np.sqrt(np.mean(mix[:, int(13 * SR):int(77 * SR)] ** 2))
if SOLO: print(SOLO, 'raw rms dB %.1f' % (20 * np.log10(rms + 1e-12)), 'peak dB %.1f' % (20 * np.log10(np.abs(mix).max() + 1e-12))); sys.exit()
mix *= 10 ** (-19.0 / 20) / rms
thr = 10 ** (-1.5 / 20); peak = maximum_filter1d(np.abs(mix).max(axis=0), int(.006 * SR))
g = np.minimum(1, thr / np.maximum(peak, 1e-9)); g = -maximum_filter1d(-g, int(.01 * SR)); g = uniform_filter1d(g, int(.01 * SR))
mix *= g; mix = np.clip(mix, -thr, thr)
print('peak', np.abs(mix).max(), 'rms dB', 20 * np.log10(np.sqrt(np.mean(mix ** 2))), 'limiter min gain', g.min())
w = wave.open(sys.argv[1], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix.T * 32767).astype(np.int16).tobytes()); w.close()
