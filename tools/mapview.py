#!/usr/bin/env python3
"""Render the whole ROCKSIDE II world map (every room, tile by tile) to a PNG.

  python3 tools/mapview.py                  -> docs/world_map.png
  python3 tools/mapview.py --out X.png      -> somewhere else
  python3 tools/mapview.py --scale 3        -> pixels per tile (default 4)
  python3 tools/mapview.py --no-reach       -> skip the reachability overlay

Reads src/03b_rooms.js through node, and runs tools/reach.js for the overlay:
  dark = solid, area colour = air, red tint = standable but unreachable, letters = markers.
"""
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
out = os.path.join(ROOT, 'docs', 'world_map.png')
if '--out' in args: out = os.path.abspath(args[args.index('--out') + 1])
S = int(args[args.index('--scale') + 1]) if '--scale' in args else 4
dump = subprocess.run(['node', '-e', "const w=require(process.argv[1]).MANSION_WORLD;console.log(JSON.stringify({rooms:Object.fromEntries(Object.entries(w.MR).map(([k,r])=>[k,{name:r.name,area:r.area,cell:r.cell,grid:r.grid,doors:r.doors}])),portals:w.portals}))",
                      os.path.join(ROOT, 'src', '03b_rooms.js')], capture_output=True, text=True, check=True)
W = json.loads(dump.stdout)
reach = None
if '--no-reach' not in args:
    tmp = tempfile.mktemp(suffix='.json')
    r = subprocess.run(['node', os.path.join(ROOT, 'tools', 'reach.js'), '--quiet', '--json', tmp], capture_output=True, text=True)
    if os.path.exists(tmp): reach = json.load(open(tmp)); os.remove(tmp)
AIR = {'keiko': (52, 74, 92), 'observatory': (70, 52, 120), 'hub': (74, 62, 86), 'mansion': (52, 70, 104), 'library': (78, 58, 88), 'tower': (66, 66, 88), 'water': (40, 82, 100),
       'star': (44, 58, 104), 'garden': (46, 70, 70), 'play': (88, 46, 74)}
MARK = {'S': (120, 240, 255), 'W': (200, 150, 255), 'D': (255, 220, 120), 's': (255, 230, 140), 'L': (255, 200, 120), 'B': (255, 90, 90),
        'G': (255, 255, 255), 'X': (220, 180, 120), 'N': (255, 160, 210), 'w': (255, 120, 80), 'f': (255, 120, 80), 'u': (120, 255, 255),
        'c': (230, 200, 120), 'v': (230, 200, 120), 'x': (230, 200, 120)}
cells = [r['cell'] for r in W['rooms'].values()]
x0 = min(c[0] for c in cells); y0 = min(c[1] for c in cells)
x1 = max(c[0] + c[2] for c in cells); y1 = max(c[1] + c[3] for c in cells)
CW, CH = 16 * S, 15 * S; PAD = 40
img = Image.new('RGB', ((x1 - x0) * CW + PAD * 2, (y1 - y0) * CH + PAD * 2 + 50), (10, 14, 26))
d = ImageDraw.Draw(img)
font = None
for f in ['/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', '/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc']:
    if os.path.exists(f): font = ImageFont.truetype(f, 14); break
font = font or ImageFont.load_default()
for gx in range(x1 - x0 + 1): d.line([(PAD + gx * CW, PAD), (PAD + gx * CW, PAD + (y1 - y0) * CH)], fill=(22, 28, 44))
for gy in range(y1 - y0 + 1): d.line([(PAD, PAD + gy * CH), (PAD + (x1 - x0) * CW, PAD + gy * CH)], fill=(22, 28, 44))
for rid, r in W['rooms'].items():
    ox = PAD + (r['cell'][0] - x0) * CW; oy = PAD + (r['cell'][1] - y0) * CH
    air = AIR.get(r['area'], (60, 60, 80))
    unreached = set(map(tuple, [(int(c), int(rr)) for room, c, rr in (reach or {}).get('unreached', []) if room == rid]))
    for row, line in enumerate(r['grid']):
        for col, ch in enumerate(line):
            px, py = ox + col * S, oy + row * S
            if ch == '#': colr = (18, 20, 30)
            elif ch == '=': colr = (150, 160, 180)
            elif ch == 'g': colr = (90, 220, 230)
            elif ch == 'k': colr = (220, 170, 90)
            else: colr = air
            if (col, row) in unreached: colr = (150, 50, 60)
            d.rectangle([px, py, px + S - 1, py + S - 1], fill=colr)
            if ch in MARK: d.rectangle([px - 1, py - 1, px + S, py + S], fill=MARK[ch])
    d.rectangle([ox, oy, ox + r['cell'][2] * CW - 1, oy + r['cell'][3] * CH - 1], outline=(140, 190, 210))
    for i in range(1, r['cell'][2]): d.line([(ox + i * CW, oy), (ox + i * CW, oy + 3)], fill=(140, 190, 210))
    d.text((ox + 4, oy + 3), r['name'] + '  [' + rid + ']', fill=(235, 240, 250), font=font)
# linked (non-adjacent) doors as dashed lines
for rid, r in W['rooms'].items():
    for door in r['doors']:
        t = W['rooms'][door['to']]
        ax = PAD + (r['cell'][0] - x0) * CW + door['x'] / 16 * S; ay = PAD + (r['cell'][1] - y0) * CH + (door['y'] - 20) / 16 * S
        bx = PAD + (t['cell'][0] - x0) * CW + door['at'][0] / 16 * S; by = PAD + (t['cell'][1] - y0) * CH + (door['at'][1] - 20) / 16 * S
        if abs(ax - bx) + abs(ay - by) < 3 * S * 2: continue
        n = int(max(abs(ax - bx), abs(ay - by)) / 6) + 1
        for i in range(0, n, 2):
            d.line([(ax + (bx - ax) * i / n, ay + (by - ay) * i / n), (ax + (bx - ax) * (i + 1) / n, ay + (by - ay) * (i + 1) / n)], fill=(255, 220, 120) if not door.get('need') else (200, 120, 200), width=1)
legend = 'S save  W warp  D/1-9 door (dashed = linked door, purple = locked)  s seal  L lever  B boss  G goal  w/f enemy  u vent  cyan bar = seal gate  orange bar = latch gate'
if reach: legend += '\nred = unreachable standing tile   unlock order: ' + ' -> '.join(reach['order'])
d.multiline_text((PAD, img.height - 54), legend, fill=(200, 210, 225), font=ImageFont.truetype(font.path, 12) if hasattr(font, 'path') else font)
os.makedirs(os.path.dirname(out), exist_ok=True); img.save(out)
print('wrote %s (%dx%d)%s' % (os.path.relpath(out, ROOT), img.width, img.height, '' if reach is None else '; reach problems: %d' % len(reach['problems'])))
