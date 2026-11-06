import numpy as np, wave
SR=48000; D=31.0; N=int(SR*D); t=np.arange(N)/SR
rng=np.random.default_rng(3)
def env(a,b,fi,fo):
    e=np.clip((t-a)/fi,0,1)*np.clip((b-t)/fo,0,1); return e*e*(3-2*e)
def note(f,detune=(-0.15,0.0,0.17)):
    s=0
    for d in detune: s=s+np.sin(2*np.pi*f*(1+d/100*6)*t+rng.random()*6)
    return s/len(detune)
hz=lambda m:440*2**((m-69)/12)
L=np.zeros(N); R=np.zeros(N)
# pad: D drone + hijaz chords (D–Eb–F#–G–A)
chords=[(0,7.6,[50,57,62,66]),(7.4,14.0,[51,58,63,67]),(13.8,20.4,[50,57,62,66,69]),(20.2,27.4,[55,62,67,70]),(27.2,31.0,[50,57,62,66])]
for a,b,ms in chords:
    e=env(a,b,1.8,1.6)
    for i,m in enumerate(ms):
        s=note(hz(m))*e*(0.11 if i==0 else 0.06)
        pan=0.5+0.35*np.sin(i*1.7)
        L+=s*(1-pan); R+=s*pan
drone=(np.sin(2*np.pi*hz(38)*t)+0.3*np.sin(2*np.pi*hz(50)*t))*0.10*env(0,31,2.5,1.2)
L+=drone; R+=drone
# slow heartbeat pulse during products
for k in np.arange(6.0,20.2,0.6):
    i=int(k*SR); n=int(0.35*SR); tt=np.arange(n)/SR
    p=np.sin(2*np.pi*(55+40*np.exp(-tt*30))*tt)*np.exp(-tt*9)*0.22
    L[i:i+n]+=p[:N-i]; R[i:i+n]+=p[:N-i]
# whooshes (filtered noise swells) before transitions
def whoosh(c,dur=0.9,g=0.18):
    n=int(dur*SR); w=rng.standard_normal(n)
    k=np.exp(-np.linspace(0,6,400)); w=np.convolve(w,k/k.sum(),'same')  # lowpass
    sh=np.sin(np.linspace(0,np.pi,n))**2*g
    i=int((c-dur*0.7)*SR); seg=w*sh
    L[i:i+n]+=seg*np.linspace(1.2,.4,n); R[i:i+n]+=seg*np.linspace(.4,1.2,n)
for c in [3.2,6.1]+[6.0+i*14.2/6 for i in range(1,6)]+[20.1,24.2,27.3]: whoosh(c, .7 if 6.5<c<20 else 1.0, .10 if 6.5<c<20 else .2)
# chimes (bell partials) at logo reveal and end card
def bell(c,f,g=0.2):
    n=int(3.5*SR); tt=np.arange(n)/SR; s=0
    for r,a,dec in [(1,1,1.6),(2.76,.45,2.6),(5.4,.25,4),(8.9,.12,6)]: s=s+a*np.sin(2*np.pi*f*r*tt)*np.exp(-tt*dec)
    s*=g*np.clip(tt/0.004,0,1); i=int(c*SR); m=min(n,N-i)
    L[i:i+m]+=s[:m]*.8; R[i:i+m]+=s[:m]
for c,m in [(0.4,74),(1.0,78),(1.6,81),(28.4,74),(28.7,78),(29.0,81),(29.3,86)]: bell(c,hz(m),.12)
# simple stereo reverb (comb delays)
def verb(x):
    y=x.copy()
    for d,g in [(0.037,.35),(0.051,.3),(0.073,.25),(0.11,.2),(0.17,.14)]:
        k=int(d*SR); z=np.zeros_like(x); z[k:]=x[:-k]*g; y+=z
    return y
L,R=verb(L),verb(R[::-1])[::-1]*0+verb(R)
mix=np.stack([L,R],1); mix*=env(0,31,0.05,1.4)[:,None]
mix/=np.abs(mix).max()/0.89
pcm=(mix*32767).astype('<i2')
import sys
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'music.wav','wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok')
