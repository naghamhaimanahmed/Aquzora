# Calm score for the English edition of the Nexus film: felt piano, soft strings, a warm pad and a few glass notes.
# D major, no percussion and no pulse. 86 s, 48 kHz stereo.
# usage: python3 music_calm_en.py out.wav      (SOLO=piano|strings|pad|glass to measure one instrument alone)
import numpy as np, sys, wave, os
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d
SR = 48000; D = 86.0; N = int(SR * D)
rng = np.random.default_rng(5)
DRY = np.zeros((2, N)); REV = np.zeros((2, N))
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def bq(x, f, kind='low', o=2): return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x)
def put(sig, at, g=1.0, pan=0.0, rev=0.3):
    i = int(round(at * SR))
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    DRY[0, i:i + n] += sig[:n] * g * l * 1.414; DRY[1, i:i + n] += sig[:n] * g * r * 1.414
    REV[0, i:i + n] += sig[:n] * g * rev * l; REV[1, i:i + n] += sig[:n] * g * rev * r
tt = lambda d: np.arange(int(d * SR)) / SR

# ---------- instruments ----------
def piano(m, dur=3.0, vel=.6):
    """Felt piano: slightly stretched partials, each fading at its own rate; softer notes are darker."""
    f = hz(m); d = min(max(dur, 1.2) + 1.5, 7.0); t = tt(d); s = np.zeros(len(t))
    B = 0.00035 * 2 ** ((m - 60) / 14)                                   # inharmonicity grows up the keyboard
    tau0 = float(np.clip(5.5 * 2 ** (-(m - 36) / 20), 0.7, 6.0))          # low strings ring longer
    bright = .55 + .7 * vel
    for k in range(1, 15):
        fk = f * k * np.sqrt(1 + B * k * k)
        if fk > 9000: break
        a = (1 / k ** (2.25 - bright)) * np.exp(-k * (1.15 - bright) * .35)
        tau = tau0 / (1 + .32 * (k - 1))
        env = .72 * np.exp(-t / tau) + .28 * np.exp(-t / (tau * .22))      # quick first drop, long tail
        det = 2 ** (.006 * (1 if k % 2 else -1) / 12)                       # two strings, a hair apart
        s += a * env * (np.sin(2 * np.pi * fk * t + rng.random() * .4) + .8 * np.sin(2 * np.pi * fk * det * t + 1.1))
    s *= np.clip(t / .006, 0, 1)
    hammer = bq(rng.standard_normal(len(t)), 700 + 900 * vel) * np.exp(-t * 70) * .5      # the felt on the string
    s = s / 1.9 + hammer
    rel = np.clip((dur + 1.3 - t) / 1.2, 0, 1) if dur + 1.3 < d else 1.0     # the damper falls
    return bq(s * rel, 5200) * vel * .2
def strings(ms, dur, g=1.0, cutoff=1500, attack=2.0, release=2.5):
    t = tt(dur); s = np.zeros(len(t))
    for m in ms:
        for det in (-.09, .0, .08):
            f = hz(m) * 2 ** (det / 12) * (1 + .0018 * np.sin(2 * np.pi * (4.6 + rng.random()) * t + rng.random() * 6)); p = rng.random() * 6
            ph = 2 * np.pi * np.cumsum(f) / SR
            for h in range(1, 10): s += np.sin(ph * h + p * h) / h ** 1.25
    env = np.clip(t / attack, 0, 1) ** 1.3 * np.clip((dur - t) / release, 0, 1)
    return bq(bq(s, cutoff), 140, 'high') / (len(ms) * 3) * env * g * .5
def pad(ms, dur, g=1.0, cutoff=600):
    t = tt(dur); s = np.zeros(len(t))
    for m in ms:
        for det in (-.07, .06):
            f = hz(m) * 2 ** (det / 12); p = rng.random() * 6
            for h in range(1, 8): s += np.sin(2 * np.pi * f * h * t + p * h) / h ** 1.7
    env = np.clip(t / 3.0, 0, 1) * np.clip((dur - t) / 3.5, 0, 1)
    return bq(s, cutoff) / (len(ms) * 2) * env * g * (1 + .07 * np.sin(2 * np.pi * .09 * t))
def glass(m, dur=2.5, g=1.0):
    t = tt(dur); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 2.5) + .12 * np.sin(2 * np.pi * f * 3.02 * t) * np.exp(-t * 5)
    return s * np.clip(t / .012, 0, 1) * np.exp(-t * 1.9) * g * .12
SOLO = os.environ.get('SOLO')
if SOLO:
    for _n in ('piano', 'strings', 'pad', 'glass'):
        if _n != SOLO: globals()[_n] = (lambda f: (lambda *a, **k: f(*a, **k) * 0))(globals()[_n])

# ---------- harmony: one chord every two seconds from 7 s; the four-chord round returns to D at 79 s ----------
CH = {'D': ([38, 45], [50, 54, 57, 64]), 'A': ([37, 45], [49, 52, 57, 64]), 'Bm': ([35, 47], [50, 54, 59, 62]), 'G': ([31, 43], [50, 55, 59, 62]),
      'Em': ([40, 47], [52, 55, 59, 62]), 'Asus': ([33, 45], [52, 57, 62, 64])}
ROUND = ['D', 'A', 'Bm', 'G']
chord = lambda t: ROUND[int((t - 7) // 2) % 4]
P = lambda t, m, d=3.0, v=.6, pan=0.0: put(piano(m, d, v), t + rng.normal(0, .006), 1.0, pan + (m - 60) / 70, .4)

# ---------- pad and strings ----------
put(pad([38, 45, 50], 86.0, 1.0, 520), 0.0, .14, 0, .5)
for a, b, top in [(11.0, 28.0, 0), (25.5, 43.0, 0), (40.0, 61.0, 0), (66.0, 80.5, 12), (78.0, 86.0, 0)]:
    t = a
    while t < b - .5:                                                           # strings follow the chords, overlapping
        lo, up = CH[chord(max(t, 7))]; d = min(4.6, b - t + 1.5)
        put(strings([up[0], up[1], up[2] + (top if t > 68 else 0)], d, .32 if a < 66 else .5, 1300 if a < 66 else 2100), t - 1.0, 1.0, -.15, .6); t += 2
# ---------- piano ----------
# opening (0-7): a few single notes over the pad
for t, m, v in [(1.0, 74, .42), (2.5, 78, .38), (4.0, 81, .42), (5.5, 76, .36)]: P(t, m, 3.5, v)
P(1.0, 50, 5.0, .38)
def bar(t, name, style='flow', v=.5):
    lo, up = CH[name]
    if style == 'sparse':
        P(t, lo[1], 4.0, v * .95); P(t + 1.0, up[1], 3.0, v * .7)
    elif style == 'flow':                                                       # bass, then the chord opening upward
        P(t, lo[0] + 12 if lo[0] < 36 else lo[0], 4.0, v * .95); P(t, lo[1], 4.0, v * .8)
        for k, m in enumerate([up[0], up[2], up[1] + 12, up[2]]): P(t + .5 * k + (.25 if k else 0) * 0, m, 2.6, v * (.62 + .06 * (k == 2)))
    elif style == 'full':
        P(t, lo[0] if lo[0] >= 33 else lo[0] + 12, 4.5, v); P(t, lo[1], 4.5, v * .85)
        for k, m in enumerate([up[0], up[1], up[2], up[3]]): P(t + .012 * k, m, 4.0, v * .7)
        P(t + 1.0, up[2] + 12, 3.0, v * .6); P(t + 1.5, up[1] + 12, 3.0, v * .55)
for t in np.arange(7, 13, 2): bar(t, chord(t), 'sparse', .5)                    # reveal
for t in np.arange(13, 27, 2): bar(t, chord(t), 'sparse', .52)                  # brand chapter: room for the melody
for t in np.arange(27, 59, 2): bar(t, chord(t), 'flow', .5)                     # the build, bilingual, mobile, automation
for t in np.arange(59, 67, 2): bar(t, chord(t), 'sparse', .46)                  # details: thinner
for k, t in enumerate(np.arange(67, 71, 2)): bar(t, chord(t), 'flow', .5 + .05 * k)
for t in np.arange(71, 79, 2): bar(t, chord(t), 'full', .62)                    # the last round, fuller
# melody: two phrases over the round (each note: offset, midi, length)
PH1 = [(0, 78, 1.5), (1.5, 76, .5), (2, 76, 1.0), (3, 73, 1.0), (4, 74, 1.5), (5.5, 78, .5), (6, 71, 2.0)]
PH2 = [(0, 81, 1.5), (1.5, 78, .5), (2, 76, 2.0), (4, 74, 1.0), (5, 71, 1.0), (6, 74, 2.0)]
def melody(t0, ph, v=.6, octave=0):
    for dt, m, d in ph: P(t0 + dt, m + octave, d + 1.8, v, .1)
melody(15, PH1, .58); melody(23, PH2, .6); melody(31, PH1, .52, -12); melody(39, PH2, .56); melody(47, PH1, .58); melody(55, PH2, .5, -12)
melody(71, PH2, .7);
for dt, m in [(0, 86), (.5, 83), (1, 81), (1.5, 78)]: P(69 + dt, m - 12, 2.5, .45 + .05 * dt)   # a small climb into the last round
# end card (79-86): the home chord, rolled, and three high notes
for k, m in enumerate([38, 45, 50, 57, 62, 66, 69]): P(79.0 + .04 * k, m, 6.0, .62 - .02 * k)
for t, m, v in [(80.5, 78, .5), (81.5, 81, .46), (82.75, 86, .42)]: P(t, m, 4.0, v, .15)
# ---------- glass: one note for each detail card (63-66.5), and the logo ----------
for k, m in enumerate([86, 83, 81, 78, 76, 74, 71, 69]): put(glass(m, 2.5), 63.0 + k * .5, 1.0, -.4 + .1 * k, .7)
for k, m in enumerate([74, 81, 86, 90]): put(glass(m, 3.5, .8), 79.3 + k * .18, 1.0, -.3 + .2 * k, .8)

# ---------- room, loudness, limiter ----------
irn = int(3.4 * SR); x = np.arange(irn) / SR
ir = np.stack([bq(rng.standard_normal(irn), 4800) * np.exp(-x * 1.9) for _ in range(2)]); ir[:, :int(.02 * SR)] = 0
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
wet = np.stack([fftconvolve(bq(REV[i], 200, 'high'), ir[i])[:N] for i in range(2)]) * .6
mix = np.stack([bq(m, 30, 'high') for m in DRY + wet])
fi = np.clip(np.arange(N) / (SR * .4), 0, 1); fo = np.clip((N - np.arange(N)) / (SR * 3.5), 0, 1)
mix *= fi * fo ** 1.3
rms = np.sqrt(np.mean(mix[:, int(13 * SR):int(77 * SR)] ** 2))
if SOLO: print(SOLO, 'raw rms dB %.1f' % (20 * np.log10(rms + 1e-12)), 'peak dB %.1f' % (20 * np.log10(np.abs(mix).max() + 1e-12))); sys.exit()
mix *= 10 ** (-19.0 / 20) / rms
thr = 10 ** (-1.5 / 20); peak = maximum_filter1d(np.abs(mix).max(axis=0), int(.006 * SR))
g = np.minimum(1, thr / np.maximum(peak, 1e-9)); g = -maximum_filter1d(-g, int(.01 * SR)); g = uniform_filter1d(g, int(.01 * SR))
mix *= g; mix = np.clip(mix, -thr, thr)
print('peak', np.abs(mix).max(), 'rms dB', 20 * np.log10(np.sqrt(np.mean(mix ** 2))), 'limiter min gain', g.min())
w = wave.open(sys.argv[1], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix.T * 32767).astype(np.int16).tobytes()); w.close()
