# Original score for the Atr cinematic promo: 80 BPM, 22.5 s, Hijaz on D.
import numpy as np, wave, sys
from scipy.signal import fftconvolve, butter, sosfilt
SR = 48000; D = 30.0; N = int(SR * D); t = np.arange(N) / SR
BEAT = 0.75
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def add(sig, at, gl=1.0, gr=1.0):
    i = int(at * SR); n = min(len(sig), N - i)
    if n <= 0: return
    L[i:i + n] += sig[:n] * gl; R[i:i + n] += sig[:n] * gr
def lp(x, f, order=2): return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)
def env(a, b, fi, fo):
    e = np.clip((t - a) / fi, 0, 1) * np.clip((b - t) / fo, 0, 1); return e * e * (3 - 2 * e)

# 1. dark pad: detuned harmonic stacks, low-passed, chords follow the scenes
def pad_voice(f, a, b):
    s = np.zeros(N)
    for det in (-0.12, 0, 0.11):
        ff = f * 2 ** (det / 12)
        for h in range(1, 7): s += np.sin(2 * np.pi * ff * h * t + rng.random() * 6) / h ** 1.3
    return lp(s, 900) * env(a, b, 1.2, 1.4)
chords = [(0.0, 6.4, [38, 50, 57, 62]), (6.0, 9.4, [39, 51, 58, 63]), (9.0, 12.2, [43, 55, 62, 66]),
          (12.0, 15.2, [46, 58, 62, 65]), (15.0, 18.2, [43, 55, 58, 62]),
          (18.0, 21.2, [38, 50, 57, 63, 66]), (21.0, 24.4, [38, 50, 57, 62, 66, 69]), (24.0, 30.0, [38, 50, 57, 62])]
for a, b, ms in chords:
    for j, m in enumerate(ms):
        v = pad_voice(hz(m), a, b) * (0.050 if j == 0 else 0.030)
        pan = 0.5 + 0.3 * np.sin(j * 2.1); L += v * (1 - pan) * 1.4; R += v * pan * 1.4

# 2. sub-bass impacts (pitch drop + body + click), on the big beats
def boom(strength=1.0, f0=62, f1=34, dur=2.2):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-tt * 9); ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-tt * 1.6) + 0.35 * np.sin(2 * ph) * np.exp(-tt * 4)
    click = lp(rng.standard_normal(n), 2500) * np.exp(-tt * 60) * 0.5
    return np.tanh(1.6 * (body + click)) * strength * 0.55
for at, s in [(3.0, 1.0), (6.0, 0.6), (9.0, 0.75), (12.0, 0.85), (15.0, 0.7), (21.0, 1.15), (27.0, 0.8)]: add(boom(s), at)
# soft hits under the two hook words
for at in (1.5, 2.25): add(boom(0.35, 80, 45, 1.2), at)

# 3. heartbeat pulse on the beats, scenes 2-4 (keeps the cuts in time)
def kick(g):
    n = int(0.4 * SR); tt = np.arange(n) / SR
    f = 45 + 70 * np.exp(-tt * 35); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * g
for k in np.arange(3.0, 18.0, BEAT):
    if k not in (3.0, 6.0, 9.0, 12.0, 15.0): add(kick(0.16 if k < 12 else 0.19), k)

# 4. montage: punchy hits with a metallic tick on every beat
for j, at in enumerate([18.0, 18.75, 19.5, 20.25]):
    add(boom(0.55 + 0.1 * j, 90, 40, 0.9), at)
    n = int(0.25 * SR); tt = np.arange(n) / SR
    tick = hp(rng.standard_normal(n), 5000) * np.exp(-tt * 30) * 0.12
    add(tick, at, 0.7 if j % 2 else 1.0, 1.0 if j % 2 else 0.7)

# 5. riser into the group shot (filtered noise swell + rising shimmer), and a reverse swell
n = int(3.0 * SR); tt = np.arange(n) / SR; k = tt / 3.0
noise = rng.standard_normal(n)
riser = (lp(noise, 1200) * (1 - k) + hp(noise, 3000) * k) * k ** 2.2 * 0.22
shimmer = sum(np.sin(2 * np.pi * hz(74 + i * 7) * (1 + 0.5 * k) * tt) for i in range(3)) * k ** 3 * 0.035
add(riser + shimmer, 18.0)
# soft whooshes on the focus pull and into the logo
def whoosh(dur, g):
    n = int(dur * SR); tt = np.arange(n) / SR
    return lp(rng.standard_normal(n), 900) * np.sin(np.pi * tt / dur) ** 2 * g
add(whoosh(1.1, 0.16), 5.6, 1.0, 0.6); add(whoosh(0.55, 0.28), 14.6, 1.0, 0.4); add(whoosh(1.0, 0.13), 23.6, 0.6, 1.0)

# 6. oud-like plucks (Karplus-Strong), a Hijaz motif across scenes 2-4
def pluck(f, dur=2.2, g=0.22, bright=0.5):
    n = int(dur * SR); p = int(SR / f); buf = lp(rng.standard_normal(p), 2500 + 4000 * bright)
    out = np.zeros(n); b = buf.copy()
    for i in range(n):
        out[i] = b[i % p]
        b[i % p] = 0.996 * 0.5 * (b[i % p] + b[(i + 1) % p])
    return lp(out, 3500) * g
motif = [(3.75, 62), (4.5, 63), (5.25, 66), (6.75, 67), (7.5, 66), (8.25, 63), (9.75, 62), (10.5, 66), (11.25, 69),
         (12.75, 70), (13.5, 69), (14.25, 67), (15.75, 67), (16.5, 66), (17.25, 63)]
for at, m in motif: add(pluck(hz(m)), at, 0.8, 1.0)

# 7. chime on the logo + glint
def bell(f, g):
    n = int(4 * SR); tt = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * d) for r, a, d in [(1, 1, 1.2), (2.76, .45, 2.4), (5.4, .25, 3.8), (8.9, .12, 6)])
    return s * g * np.clip(tt / 0.003, 0, 1)
add(bell(hz(74), 0.10), 24.15); add(bell(hz(81), 0.06), 25.2, 0.6, 1.0); add(bell(hz(86), 0.05), 25.35, 1.0, 0.6)

# reverb: synthetic stereo hall
ir_n = int(2.8 * SR); it = np.arange(ir_n) / SR
irL = rng.standard_normal(ir_n) * np.exp(-it * 2.4); irR = rng.standard_normal(ir_n) * np.exp(-it * 2.4)
irL = lp(irL, 6000); irR = lp(irR, 6000); irL /= np.abs(irL).sum() ** .5 * 30; irR /= np.abs(irR).sum() ** .5 * 30
wetL = fftconvolve(L, irL)[:N]; wetR = fftconvolve(R, irR)[:N]
mixL = L + wetL * 0.9; mixR = R + wetR * 0.9
mix = np.stack([mixL, mixR], 1)
mix *= np.clip((D - t) / 1.2, 0, 1)[:, None] ** 1.5      # fade the tail
mix *= np.clip(t / 0.3, 0, 1)[:, None]
mix = np.tanh(mix * 1.4) / np.tanh(1.4)                   # gentle saturation / glue
mix /= np.abs(mix).max() / 0.93
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok')
