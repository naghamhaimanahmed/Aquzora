# Crops used by scene.html (run in the film folder after the capture scripts)
from PIL import Image
im = Image.open('cap/m-en-home.png')
im.crop((0, 783 * 3, 1170, 844 * 3)).save('cap/m-en-bottombar.png')
im.crop((0, 60 * 3, 1170, 127 * 3)).save('cap/m-en-header.png')
Image.open('cap/d-en-hero.png').crop((0, 40 * 2, 2880, 121 * 2)).save('cap/d-en-header.png')
Image.open('cap/d-en-el-collection.png').crop((0, 0, 2880, 1900)).save('cap/d-en-el-collection-crop.png')

# "Every detail" cards (after capture4.js): crops of the close-ups, shown on their own ground colour
o = lambda n: Image.open(f'cap/x-{n}.png').convert('RGB')
o('notes').save('cap/y-notes.png')
o('ship').crop((0, 56, 1170, 288)).save('cap/y-ship.png')
o('search').crop((0, 0, 1170, 662)).save('cap/y-search.png')
o('chips').crop((430, 14, 1152, 146)).save('cap/y-chips.png')
o('digits').save('cap/y-digits.png')
o('news').crop((200, 0, 1440, 606)).save('cap/y-news.png')
o('terms').crop((700, 100, 2240, 970)).save('cap/y-terms.png')
o('film').save('cap/y-film.png')
