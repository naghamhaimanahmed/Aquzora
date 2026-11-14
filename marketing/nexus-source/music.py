# Original score + sound design for the Nexus film: 120 BPM, D minor, 64 s, 48 kHz stereo.
# usage: python3 music.py cues.json out.wav
import numpy as np, json, sys, wave
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d
SR = 48000; D = 64.0; N = int(SR * D)
rng = np.random.default_rng(11)
cues = json.load(open(sys.argv[1]))
MUS = np.zeros((2, N)); FX = np.zeros((2, N)); REV = np.zeros((2, N))
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def bq(x, f, kind='low', o=2):
    return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x)
def put(bus, sig, at, g=1.0, pan=0.0, rev=0.0):
    i = int(round(at * SR));
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    n = min(len(sig), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    bus[0, i:i + n] += sig[:n] * g * l * 1.414; bus[1, i:i + n] += sig[:n] * g * r * 1.414
    if rev: REV[0, i:i + n] += sig[:n] * g * rev * l; REV[1, i:i + n] += sig[:n] * g * rev * r
tt = lambda d: np.arange(int(d * SR)) / SR
BEAT = 0.5; T0 = 7.0  # groove grid starts at the first cut

# ---------- instruments ----------
def kick(g=1.0):
    t = tt(.55); f = 46 + 110 * np.exp(-t * 32); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 6.5) + .5 * np.sin(ph) * np.exp(-t * 20)
    s += bq(rng.standard_normal(len(t)), 3000) * np.exp(-t * 180) * .25
    return np.tanh(s * 1.5) * g
def clap(g=1.0):
    t = tt(.4); n = rng.standard_normal(len(t)); n = bq(bq(n, 900, 'high'), 4200)
    e = np.zeros(len(t))
    for k, d in enumerate([0, .011, .022]): e += (t >= d) * np.exp(-(t - d).clip(0) * (90 if k < 2 else 16))
    return n * e * .55 * g
def hat(g=1.0, open_=False):
    t = tt(.35 if open_ else .08); n = bq(rng.standard_normal(len(t)), 7500, 'high')
    return n * np.exp(-t * (14 if open_ else 70)) * .22 * g
def pluck(f, d=.5, g=1.0, bright=1.0):
    t = tt(d); s = np.zeros(len(t))
    for h in range(1, 14):
        if f * h > 15000: break
        s += np.sin(2 * np.pi * f * h * t) / h ** 1.15 * np.exp(-t * (4 + h * 3.2 / bright))
    a = np.clip(t / .003, 0, 1)
    return s * a * g * .35
def saw_pad(freqs, d, cutoff=1400, g=1.0):
    t = tt(d); s = np.zeros(len(t))
    for f in freqs:
        for det in (-.11, 0, .1):
            ff = f * 2 ** (det / 12); ph = rng.random() * 6
            for h in range(1, 10):
                if ff * h > 9000: break
                s += np.sin(2 * np.pi * ff * h * t + ph * h) / h
    s = bq(s, cutoff) / (len(freqs) * 3)
    env = np.clip(t / .35, 0, 1) * np.clip((d - t) / .5, 0, 1)
    return s * env * g
def bass(f, d, g=1.0):
    t = tt(d); s = np.zeros(len(t))
    for h in range(1, 8): s += np.sin(2 * np.pi * f * h * t) / h * (.9 ** h)
    s = np.tanh(s * 1.4) * np.clip(t / .006, 0, 1) * np.exp(-t * 2.2) * np.clip((d - t) / .02, 0, 1)
    return bq(s, 900) * g
def bell(f, d=1.6, g=1.0):
    t = tt(d); mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 3)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.6) * np.clip(t / .002, 0, 1) * g * .3
def boom(g=1.0, d=2.4):
    t = tt(d); f = 34 + 70 * np.exp(-t * 7); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 1.8); s += bq(rng.standard_normal(len(t)), 1800) * np.exp(-t * 14) * .5
    s += bq(rng.standard_normal(len(t)), 5000, 'high') * np.exp(-t * 3.2) * .12  # crash air
    return np.tanh(s * 1.4) * g
def whoosh(d=.6, g=1.0, up=True):
    t = tt(d); n = rng.standard_normal(len(t)); k = t / d
    lo = bq(n, 700); hi = bq(n, 3500, 'high')
    s = (lo * (1 - k) + hi * k) if up else (hi * (1 - k) + lo * k)
    env = np.sin(np.pi * k) ** 1.5
    return s * env * .45 * g
def riser(d=1.6, g=1.0):
    t = tt(d); k = t / d; n = rng.standard_normal(len(t))
    s = bq(n, 2500, 'high') * k ** 2.5 * .35
    f = 200 + 1600 * k ** 2; s += np.sin(2 * np.pi * np.cumsum(f) / SR) * k ** 3 * .12
    return s * g
def click(g=1.0, f=2400):
    t = tt(.05); s = bq(rng.standard_normal(len(t)), f, 'high') * np.exp(-t * 400) + np.sin(2 * np.pi * f * .6 * t) * np.exp(-t * 300) * .5
    return s * g * .5
def blip(f0, f1, d=.12, g=1.0):
    t = tt(d); f = f0 + (f1 - f0) * (t / d); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (6 / d)) * np.clip(t / .002, 0, 1)
    return s * g * .35

# ---------- harmony ----------
PROG = [[50, 53, 57, 60, 64], [46, 50, 53, 57, 62], [41, 45, 48, 52, 57], [48, 52, 55, 62, 64]]  # Dm9, Bbmaj9, Fmaj7, Cadd9
ROOT = [38, 34, 41, 36]
def chord_at(t): return int(((t - T0) // 2) % 4) if t >= T0 else 0

# intro pad (0-7): Dm9, filter opening
put(MUS, saw_pad([hz(m) for m in [38, 50, 57, 60, 64]], 7.6, 900, 1.0), 0.0, .55, 0, .5)
put(MUS, bq(saw_pad([hz(m) for m in [62, 69, 72, 76]], 4.5, 3000, 1.0), 400, 'high'), 2.8, .25, 0, .7)

drums_on = lambda t: (T0 <= t < 55.25)
full = lambda t: (13 <= t < 55.25)
kicks = []
for b in range(int((64 - T0) / BEAT)):
    t = T0 + b * BEAT; beat = b % 4
    if not drums_on(t): continue
    if 49.0 <= t < 51.0 and t >= 50.5: continue  # gap before the drop
    kg = .8 if full(t) else .55
    put(MUS, kick(), t, kg); kicks.append(t)
    if full(t) and beat in (1, 3): put(MUS, clap(), t, .8, .05, .25)
    # hats
    put(MUS, hat(1, True), t + .25, .55 if full(t) else .35, .25)
    if full(t):
        for s16 in (.125, .375): put(MUS, hat(.6 + .3 * rng.random()), t + s16, .6, -.2)
# snare build 49-51
for i, t in enumerate(np.concatenate([np.arange(49.0, 50.0, .25), np.arange(50.0, 50.5, .125), np.arange(50.5, 51.0, .0625)])):
    put(MUS, clap(), t, .25 + .5 * (t - 49) / 2, 0, .2)
put(MUS, riser(2.0), 49.0, .9)
# drop accents
for t in (51.0, 57.0): put(MUS, boom(1.0, 3.0), t, .7, 0, .35)

# bass: 8ths with sidechain feel
for b in range(int((57 - T0) / (BEAT / 2))):
    t = T0 + b * BEAT / 2
    if t >= 55.25 or (50.5 <= t < 51): continue
    c = chord_at(t); f = hz(ROOT[c] + (12 if b % 4 == 3 else 0))
    put(MUS, bass(f, .24), t + (0.0), (.33 if t >= 13 else .22) * (.6 if b % 2 == 0 else 1.0), 0)

# pads per bar (sidechained later)
PADBUS = np.zeros((2, N))
for bar in range(int((57 - T0) / 2)):
    t = T0 + bar * 2; c = bar % 4
    if t >= 55.25: break
    d = min(2.3, 55.4 - t)
    put(PADBUS, saw_pad([hz(m) for m in PROG[c]], d, 1500 if t < 46 else 2400, 1.0), t, .5, 0, .35)
# 55.25-57 breakdown pad + end chord
put(PADBUS, saw_pad([hz(m) for m in [50, 53, 57, 62, 64]], 1.9, 2000), 55.25, .55, 0, .6)
put(MUS, saw_pad([hz(m) for m in [38, 50, 57, 62, 64, 69]], 7.0, 2200), 57.0, .6, 0, .6)
put(MUS, bq(saw_pad([hz(m) for m in [74, 76, 81]], 6.5, 6000), 1500, 'high'), 57.3, .22, 0, .8)

# arpeggio (16ths) from 13 s, plus a softer 8th arp in 7-13
ARP = [0, 2, 1, 3, 2, 4, 3, 1]
for s in range(int((55.25 - T0) / .125)):
    t = T0 + s * .125
    if t < 13 and s % 2: continue
    if 50.5 <= t < 51: continue
    c = chord_at(t); notes = PROG[c]; m = notes[ARP[s % 8] % len(notes)] + 12
    if t >= 51: m += 12 if s % 4 == 0 else 0
    g = (.5 if t < 13 else .62) * (1.0 if s % 4 == 0 else .7)
    pan = .35 * np.sin(s * .7)
    put(MUS, pluck(hz(m), .45, g, 1.6 if t >= 51 else 1.0), t, .55, pan, .3)
    put(MUS, pluck(hz(m), .45, g * .35, 1.0), t + .375, .55, -pan, .2)  # dotted-8th echo

# bell motif in the automation and services sections
MOT = [(0, 74), (.75, 72), (1.5, 69), (2.0, 76), (3.0, 74), (3.5, 72), (4.0, 69), (5.5, 67)]
for base in (37.0, 43.0):
    for dt, m in MOT:
        if base + dt < 46: put(MUS, bell(hz(m), 1.4), base + dt, .55, .2, .5)
for i, m in enumerate([69, 72, 74, 76, 79, 81, 84, 86, 88]): put(MUS, bell(hz(m), 1.0), 52.55 + i * .25, .32, -.3 + .075 * i, .5)
# end card: logo shimmer + final motif
for i, m in enumerate([62, 69, 74, 76, 81, 86]): put(MUS, bell(hz(m), 2.4), 57.25 + i * .12, .4, -.4 + .16 * i, .8)
for dt, m in [(2.0, 74), (2.75, 76), (3.5, 81), (4.25, 79), (5.0, 74)]: put(MUS, bell(hz(m), 2.2), 57.0 + dt, .45, 0, .7)

# sidechain on pads + bass bus
sc = np.ones(N)
for k in kicks:
    i = int(k * SR); n = min(int(.42 * SR), N - i); x = np.arange(n) / SR
    sc[i:i + n] = np.minimum(sc[i:i + n], 1 - .7 * np.exp(-x * 9))
MUS += PADBUS * sc

# ---------- sound design from the picture's cue list ----------
for c in cues:
    t, ty = c['t'], c['type']
    if ty == 'key': put(FX, click(.9 + .3 * rng.random(), 2000 + 1500 * rng.random()), t, .55, .3 * (rng.random() - .5), .1)
    elif ty == 'hit': put(FX, boom(1.0), t, .55 if t > 8 else .9, 0, .4)
    elif ty == 'whoosh': put(FX, whoosh(.55), t - .1, .55, -.3, .3)
    elif ty == 'riser': put(FX, riser(1.55), t, 1.0)
    elif ty == 'swell': put(FX, bq(whoosh(1.4, 1, False), 2000), t - .2, .5, 0, .6)
    elif ty == 'ding2': put(FX, bell(hz(81), 1.5), t, .6, 0, .6)
    elif ty == 'pop': put(FX, blip(500, 1100, .09), t, .55 * c['v'], .4 * (rng.random() - .5), .25)
    elif ty == 'pop2': put(FX, blip(700, 1500, .14), t, .6, 0, .3)
    elif ty == 'tick': put(FX, click(1, 3500), t, .5, .3, .3); put(FX, blip(1200, 1300, .05), t, .3)
    elif ty == 'tick2': put(FX, click(.6, 4200), t, .22, .2)
    elif ty == 'blip': put(FX, blip(900, 900, .06), t, .25, .4)
    elif ty == 'tap': put(FX, click(1.2, 1500), t, .55, 0, .15)
    elif ty == 'swish': put(FX, whoosh(.9, 1.0), t, .55, .5 if c['v'] > .8 else -.5, .4)
    elif ty == 'send': put(FX, blip(600, 1100, .08), t, .5, .3, .2)
    elif ty == 'recv': put(FX, blip(1100, 700, .07), t, .45, -.3, .2); put(FX, blip(1300, 900, .07), t + .08, .35, -.3, .2)
    elif ty == 'ding': put(FX, bell(hz(88), 1.5), t, .5, .4, .5); put(FX, bell(hz(93), 1.5), t + .1, .4, .4, .5)
    elif ty == 'hit2': put(FX, boom(.8, 1.8), t, .6, 0, .5)
    elif ty == 'logo': put(FX, riser(1.2, .6), t - .1, .5)
    elif ty == 'hit3': put(FX, boom(1.0, 3.2), t, .5, 0, .5); put(FX, bell(hz(62), 3.0), t, .5, 0, .6)

# ---------- reverb ----------
irn = int(2.4 * SR); x = np.arange(irn) / SR
ir = np.stack([bq(rng.standard_normal(irn), 6000) * np.exp(-x * 2.6), bq(rng.standard_normal(irn), 6000) * np.exp(-x * 2.6)])
ir[:, :int(.012 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
wet = np.stack([fftconvolve(bq(REV[i], 250, 'high'), ir[i])[:N] for i in range(2)]) * .55

mix = MUS * .9 + FX * 1.0 + wet
mix = np.stack([bq(m, 28, 'high') for m in mix])
# fade in / out
fi = np.clip(np.arange(N) / (SR * .05), 0, 1); fo = np.clip((N - np.arange(N)) / (SR * 1.6), 0, 1)
mix *= fi * fo ** 1.5
# loudness then lookahead limiter
rms = np.sqrt(np.mean(mix[:, int(7 * SR):int(55 * SR)] ** 2)); mix *= 10 ** (-14 / 20) / rms
thr = 10 ** (-1.2 / 20); peak = maximum_filter1d(np.abs(mix).max(axis=0), int(.006 * SR))
g = np.minimum(1, thr / np.maximum(peak, 1e-9)); g = uniform_filter1d(np.minimum.accumulate(g[::-1])[::-1] if False else g, int(.004 * SR))
g = np.minimum(g, 1); g = -maximum_filter1d(-g, int(.008 * SR)); g = uniform_filter1d(g, int(.008 * SR))
mix *= g; mix = np.clip(mix, -thr, thr)
print('peak', np.abs(mix).max(), 'rms dB', 20 * np.log10(np.sqrt(np.mean(mix ** 2))))
out = (mix.T * 32767).astype(np.int16)
w = wave.open(sys.argv[2], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes()); w.close()
