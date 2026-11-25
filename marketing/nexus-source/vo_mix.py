# Places the ElevenLabs voice-over phrase by phrase on the Arabic film and ducks the calm score under it.
# usage: python3 mix.py <vo file> <music.wav> <out mix.wav> [<out vo-only.wav>]
import numpy as np, subprocess, sys, wave
from scipy.signal import butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d
SR = 48000; D = 86.0; N = int(SR * D)
vo_file, music_file, out_file = sys.argv[1:4]
def load(path, tempo=1.0, ch=1):
    af = f'rubberband=tempo={tempo}:pitchq=quality,' if tempo != 1.0 else ''
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-af', af + 'aresample=48000', '-ac', str(ch), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    return a if ch == 1 else a.reshape(-1, 2).T

# Phrases in the recording (seconds, cut in the silences), where each goes in the film, and its tempo.
# Lines 1-3 run 12% faster so the brand chapter's phrases land on their panels (logo, colours, typefaces).
A, B = 1.12, 1.03
PH = [  # (src start, src end, film time, tempo, text)
  (0.00, 2.844, 0.40, A, 'كل علامة كبيرة تبدا بحكاية'), (3.336, 5.871, 3.15, A, 'ونحن في نكسس نكتبها بالكود'),
  (6.217, 7.055, 6.60, A, 'هذي عطر'), (7.328, 9.398, 7.50, A, 'علامة عطور عربية أصيلة'), (9.756, 12.143, 9.50, A, 'واليوم توصل لكل بيت في مصر'),
  (12.542, 13.683, 11.80, A, 'ما بدينا بالموقع'), (14.152, 15.248, 12.95, A, 'بدينا بالروح'), (15.587, 17.217, 14.05, A, 'روح عربية خالصة'),
  (17.557, 21.141, 15.60, A, 'شعار مرسوم بخط الرقعة مثل توقيع عطار قديم'), (21.514, 23.246, 18.85, A, 'ألوان من العود والذهب'),
  (23.560, 26.991, 20.50, A, 'وخطوط تجمع أصالة العربي مع أناقة اللاتيني'), (27.414, 29.564, 24.40, A, 'هوية تعرفها من أول نظرة'),
  (29.959, 31.428, 27.50, B, 'وبعدها بنينا الموقع'), (31.764, 33.092, 29.20, B, 'طبقة فوق طبقة'), (33.374, 35.933, 30.80, B, 'كل زاوية فيه مصممة لعطر بس'),
  (36.193, 37.587, 35.30, B, 'يكلم عميلك بلغته'), (37.921, 40.508, 36.95, B, 'العربي أول والإنجليزي بضغطة وحدة'),
  (40.875, 42.996, 41.40, B, 'ولأن عميلك شايل محلك في جيبه'), (43.281, 46.47, 43.70, B, 'يتصفح، يكتشف، يدور، يحط في السلة'), (46.66, 48.305, 47.95, B, 'ويخلص طلبه في ثواني'),
  (48.650, 54.858, 51.30, B, 'والطلب؟ يوصل جاهز على الواتساب. الدفع بإنستاباي. ومساعد آلي يأكد وينبه'), (55.171, 57.180, 57.60, B, 'محل يبيع حتى وإنت نايم'),
  (57.530, 59.205, 60.30, B, 'والفرق دايما في التفاصيل'), (59.485, 62.332, 62.25, B, 'مكونات كل عطر، شريط التوصيل المجاني'), (62.587, 64.815, 65.30, B, 'وخصم يرحب بكل عميل جديد'),
  (65.106, 68.973, 68.60, B, 'ستة وخمسين منتج، لغتين، سبع وعشرين محافظة'), (69.320, 71.226, 73.20, B, 'وهذي حكاية وحدة بس'),
  (71.534, 73.700, 80.30, B, 'نكسس لتطوير البرمجيات'), (73.988, 75.009, 82.75, B, 'حكايتك الجاية'), (75.351, 76.20, 83.95, B, 'تبدا من هنا')]
src = {r: load(vo_file, r) for r in (A, B)}
vo = np.zeros(N); pad = .04; prev_end = 0
for s0, s1, at, r, text in PH:
    x = src[r]; i0 = max(0, int((s0 - pad) / r * SR)); i1 = min(len(x), int((s1 + pad) / r * SR)); seg = x[i0:i1].copy()
    f = int(.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    i = int((at - pad / r) * SR); n = min(len(seg), N - i); vo[i:i + n] += seg[:n]
    end = at + (s1 - s0) / r
    print(f'{at:6.2f} -> {end:6.2f}  x{r}  {"OVERLAP " if at < prev_end else ""}{text}'); prev_end = end

# voice: clean lows, even out, set level
vo = sosfilt(butter(2, 75, 'high', fs=SR, output='sos'), vo)
env = np.sqrt(np.maximum(uniform_filter1d(vo ** 2, int(.03 * SR)), 0)); thr = .5 * np.percentile(env[env > 1e-4], 95)   # compress what is within 6 dB of the loud passages
gain = np.where(env > thr, (thr / np.maximum(env, 1e-9)) ** (1 - 1 / 2.2), 1.0); gain = uniform_filter1d(gain, int(.02 * SR)); vo *= gain   # gentle 2.2:1
act = env > 10 ** (-45 / 20) * env.max()
vo *= 10 ** (-19.5 / 20) / np.sqrt(np.mean(vo[act] ** 2))            # speech level while speaking

# music: duck under the voice (about -9 dB), easing in before each phrase and out after it
mus = load(music_file, 1.0, 2)[:, :N]
if mus.shape[1] < N: mus = np.pad(mus, ((0, 0), (0, N - mus.shape[1])))
speak = maximum_filter1d(act.astype(float), int(.5 * SR)); speak = uniform_filter1d(speak, int(.45 * SR)); speak = uniform_filter1d(speak, int(.25 * SR))
duck = 10 ** (-9.0 * speak / 20)
mix = mus * duck * 10 ** (-1.5 / 20) + vo[None, :] * 1.0
peak = maximum_filter1d(np.abs(mix).max(axis=0), int(.006 * SR)); lim = 10 ** (-1.5 / 20)
g = np.minimum(1, lim / np.maximum(peak, 1e-9)); g = -maximum_filter1d(-g, int(.01 * SR)); g = uniform_filter1d(g, int(.01 * SR)); mix = np.clip(mix * g, -lim, lim)
def save(path, x):
    w = wave.open(path, 'wb'); w.setnchannels(x.shape[0]); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x.T * 32767).astype(np.int16).tobytes()); w.close()
save(out_file, mix)
if len(sys.argv) > 4: save(sys.argv[4], vo[None, :])
print('limiter min gain %.2f' % g.min(), ' music under voice: %.1f dB' % (20 * np.log10(duck.min())))
