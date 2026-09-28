#!/usr/bin/env python3
"""在 index.html 的本地 assets 連結後面蓋上內容雜湊版本戳。

改完 CSS/JS/圖片就跑一次：
    python3 tools/stamp.py
沒有版本戳的話，瀏覽器（和 GitHub Pages 的 CDN）會繼續拿舊檔案。
"""
import hashlib, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
HTML = ROOT / 'index.html'

def digest(rel):
    f = ROOT / rel
    return hashlib.sha1(f.read_bytes()).hexdigest()[:8] if f.is_file() else None

def stamp(m):
    attr, path = m.group(1), m.group(2)
    d = digest(path)
    return m.group(0) if d is None else f'{attr}="{path}?v={d}"'

html = HTML.read_text(encoding='utf-8')
new = re.sub(r'\b(href|src|srcset)="(assets/[^"?]+)(?:\?v=[0-9a-f]+)?"', stamp, html)
if new != html:
    HTML.write_text(new, encoding='utf-8')
    print('stamped:', *sorted(set(re.findall(r'assets/[^"?]+\?v=[0-9a-f]+', new))), sep='\n  ')
else:
    print('no change')
