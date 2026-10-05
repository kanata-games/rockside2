#!/usr/bin/env python3
"""Builds index.html (repo root, served by GitHub Pages) from src/ parts.

  python3 tools/build.py            # default: sprite sheets load from assets/ (Pages)
  python3 tools/build.py --embed    # single self-contained file: legacy sheets embedded as base64
  python3 tools/build.py --out X    # write somewhere else (e.g. a standalone copy)

Small frame metadata (assets/*.json) is always inlined as EMBEDDED_META.
EDIT src/*, NEVER index.html directly - it is overwritten by this script.
"""
import base64, json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARTS = ['01_head.html', '02_setup.js', '02b_chars.js', '02c_sequel.js', '03_world.js', '04_game.js', '04b_disaster.js', '04c_shiranui.js', '04d_diceroll.js', '04e_final.js', '04f_ending.js', '04g_darkumine.js', '05_render.js']
EMBED = '--embed' in sys.argv
OUT = os.path.join(ROOT, 'index.html')
if '--out' in sys.argv: OUT = os.path.abspath(sys.argv[sys.argv.index('--out') + 1])

# Sheets embedded by --embed (Lily/Umimi and later sheets always load from assets/).
SHEETS = {'kanon': 'kanon.png', 'tobiume': 'tobiume_dark.png', 'tobiumeNormal': 'tobiume.png',
          'neenia': 'neenia.png', 'seiten': 'seiten.png', 'astarte': 'astarte.png',
          'neeniaDark': 'neenia_dark.png', 'seitenDark': 'seiten_dark.png', 'astarteDark': 'astarte_dark.png'}
for _f in ['kanon', 'tobiume', 'tobiume_dark', 'neenia', 'neenia_dark', 'seiten', 'seiten_dark', 'astarte', 'astarte_dark']:
    SHEETS['face_' + _f] = _f + '_face.png'
emb = {}
if EMBED:
    for k, f in SHEETS.items():
        p = os.path.join(ROOT, 'assets', f)
        if os.path.exists(p):
            emb[k] = 'data:image/png;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
META = {'tobiumeNormal': 'tobiume.json', 'neeniaDark': 'neenia_dark.json', 'seitenDark': 'seiten_dark.json', 'astarteDark': 'astarte_dark.json',
        'disasterDark': 'disaster_dark.json', 'starNormal': 'star.json', 'shiranui': 'shiranui.json', 'shiranuiDark': 'shiranui_dark.json',
        'diceroll': 'diceroll.json', 'dicerollDark': 'diceroll_dark.json'}
meta = {}
for k, f in META.items():
    p = os.path.join(ROOT, 'assets', f)
    if os.path.exists(p):
        j = json.load(open(p, encoding='utf-8'))
        meta[k] = {'frameWidth': j.get('frameWidth'), 'frameHeight': j.get('frameHeight'),
                   'animations': {n: {'frames': a['frames']} for n, a in j.get('animations', {}).items()}}
embedded_js = ('\n// ---- sprite sheets embedded at build time (tools/build.py) ----\n'
               'const EMBEDDED_SHEETS = ' + json.dumps(emb, separators=(',', ':')).replace('","', '",\n  "') + ';\n'
               'const EMBEDDED_META = ' + json.dumps(meta, separators=(',', ':'), ensure_ascii=False) + ';\n')
out = []
for part in PARTS:
    src = open(os.path.join(ROOT, 'src', part), encoding='utf-8').read()
    if part == '02b_chars.js':
        out.append(embedded_js)
    out.append(src)
html = ''.join(out)
open(OUT, 'w', encoding='utf-8').write(html)
print('built %s (%d bytes, %s)' % (os.path.relpath(OUT, ROOT), len(html.encode('utf-8')),
      'embedded sheets: ' + (', '.join(emb) or 'none') if EMBED else 'sheets load from assets/'))
