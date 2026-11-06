import sys, os
from rembg import remove, new_session
from PIL import Image
V = sys.argv[1]; sess = new_session("isnet-general-use")
for f in sorted(os.listdir(V + '/src')):
    im = Image.open(f'{V}/src/{f}').convert('RGB')
    out = remove(im, session=sess, alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=15, alpha_matting_erode_size=8)
    bb = out.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    out = out.crop(bb); out.save(f'{V}/cut/{os.path.splitext(f)[0]}.png')
    print(f, im.size, '->', out.size, flush=True)
