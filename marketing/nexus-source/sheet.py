import sys,glob,os
from PIL import Image, ImageDraw
d=sys.argv[1]; out=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 3
fs=sorted(glob.glob(d+'/t*.jpg'),key=lambda f:float(os.path.basename(f)[1:-4]))
W,H=640,360; rows=(len(fs)+cols-1)//cols
s=Image.new('RGB',(W*cols,H*rows))
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGB').resize((W,H)); ImageDraw.Draw(im).text((8,8),os.path.basename(f),fill='yellow'); s.paste(im,((i%cols)*W,(i//cols)*H))
s.save(out,quality=90)
