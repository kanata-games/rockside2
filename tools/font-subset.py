#!/usr/bin/env python3
"""Rebuild assets/fonts/DelaGothicOne-cutin.woff2: a subset of Dela Gothic One (SIL OFL 1.1) holding only the
glyphs of super-move / boss names passed to juiceCut(...) in src/, plus ASCII digits/letters and all katakana.
Usage: tools/font-subset.py /path/to/DelaGothicOne-Regular.ttf  (needs fonttools + brotli)"""
import re,sys,glob,subprocess,os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
text=set()
for f in glob.glob(os.path.join(root,'src','*.js')):
    for m in re.finditer(r"juiceCut\('([^']*)',[^,]*,'([^']*)'",open(f,encoding='utf8').read()):text.update(m.group(1)+m.group(2))
for m in re.finditer(r"juiceCut\(\"([^\"]*)\",[^,]*,\"([^\"]*)\"",open(os.path.join(root,'tools','test-bosses.cjs'),encoding='utf8').read()):text.update(m.group(1)+m.group(2))
text.update(chr(c) for c in range(0x30A0,0x3100));text.update(chr(c) for c in range(0x20,0x7F));text.update('！？・ー〜「」')
out=os.path.join(root,'assets','fonts','DelaGothicOne-cutin.woff2')
subprocess.check_call([sys.executable,'-m','fontTools.subset',sys.argv[1],'--text='+''.join(sorted(text)),'--flavor=woff2','--layout-features=*','--output-file='+out])
print(out,os.path.getsize(out),'bytes,',len(text),'chars')
