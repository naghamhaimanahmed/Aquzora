# Crops used by scene.html (run in the film folder after the capture scripts)
from PIL import Image
im = Image.open('cap/m-en-home.png')
im.crop((0, 783 * 3, 1170, 844 * 3)).save('cap/m-en-bottombar.png')
im.crop((0, 60 * 3, 1170, 127 * 3)).save('cap/m-en-header.png')
Image.open('cap/d-en-hero.png').crop((0, 40 * 2, 2880, 121 * 2)).save('cap/d-en-header.png')
Image.open('cap/d-en-el-collection.png').crop((0, 0, 2880, 1900)).save('cap/d-en-el-collection-crop.png')
