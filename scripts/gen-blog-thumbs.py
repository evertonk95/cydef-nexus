from PIL import Image
import os

src = r'C:\Users\User\.openclaw\workspace\tmp\cydef-blog\thumbs-downloads'
dst = 'public/assets/blog'
slugs = ['mitre-attack', 'threat-hunting', 'hardening-linux', 'carreira', 'cloud-aws', 'analise-logs', 'threat-intel']

for i, s in enumerate(slugs, start=1):
    im = Image.open(os.path.join(src, f'thumb-{i}.png')).convert('RGB')
    im2 = im.resize((1200, 675), Image.LANCZOS)
    out = os.path.join(dst, f'{s}-thumb.webp')
    im2.save(out, 'WEBP', quality=82, method=6)
    print(f'{s}-thumb.webp: {os.path.getsize(out)//1024} KB')
