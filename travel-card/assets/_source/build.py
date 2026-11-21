# Builds assets/symbols/<ID>.svg and docs/design/symbol-contact-sheet.html (inline SVG) from the sources in this folder.
# IDs and names come from the Symbol List, except the revision-round-1 changes listed in REMOVED / NEW / RENAMED below
# (the Symbol List itself is not edited by the designer).
import sys, os, html, openpyxl
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
ROOT=os.path.dirname(os.path.dirname(HERE))
import sym_a,sym_b
D={**sym_b.D,**sym_a.D}  # revision definitions live at the end of sym_a and win
REMOVED=['DIE-11','DIE-12','DIE-14','HEA-06','HEA-14','HEA-15']
NEW={'FOO-22':('Food & beverage','Sparkling bottled water'),'MOD-12':('Modifiers','Less'),'MOD-13':('Modifiers','Medium'),'MOD-14':('Modifiers','Big'),
     'MOD-15':('Modifiers','Cold'),'HEA-16':('Health & emergency','Seek medical attention')}
RENAMED={'FOO-06':'Still bottled water','MOD-09':'More','MOD-10':'Small','MOD-11':'Hot'}
wb=openpyxl.load_workbook(os.path.join(ROOT,'docs','support','Travel Cards - Symbol List.xlsx'),read_only=True)
rows=[list(r) for r in list(wb.worksheets[0].iter_rows(values_only=True))[1:] if r[0] and r[0] not in REMOVED]
for r in rows:
    if r[0] in RENAMED: r[2]=RENAMED[r[0]]
for i,(cat,name) in NEW.items():
    last=max(k for k,r in enumerate(rows) if r[1]==cat); rows.insert(last+1,[i,cat,name])
ids=[r[0] for r in rows]
if set(ids)!=set(D): sys.exit(f'missing {sorted(set(ids)-set(D))} extra {sorted(set(D)-set(ids))}')
HEAD='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" stroke-linejoin="round" stroke-linecap="round">'
out=os.path.join(ROOT,'assets','symbols'); os.makedirs(out,exist_ok=True)
for f in os.listdir(out):
    if f.endswith('.svg'): os.remove(os.path.join(out,f))
for i in ids: open(os.path.join(out,i+'.svg'),'w',encoding='utf-8',newline='\n').write(HEAD+D[i]+'</svg>\n')
CHECK={'REL-01','REL-02','REL-03','REL-07','REL-08','REL-09','REL-10','REL-11','REL-12','REL-13'}
def sv(i,w): return HEAD.replace('<svg ',f'<svg width="{w}" height="{w}" ')+D[i]+'</svg>'
def tile(r):
    flag='<b class=f>needs a check by someone from that culture</b>' if r[0] in CHECK else ''
    return f'<figure>{sv(r[0],96)}<figcaption><code>{r[0]}</code> {html.escape(r[2])}{flag}</figcaption></figure>'
NO_SCALE=0.6  # symbol under the red No overlay: 60 % of its size, centred (inner diameter of the ring is 70 %)
def comp(label,base,mods,sz=128):
    no=any(m=='MOD-01' for m,_ in mods)  # rule: a symbol under MOD-01 is shown at NO_SCALE, centred
    s=f'<figure style="width:{max(sz,60)+4}px"><div class=c style="width:{sz}px;height:{sz}px">'+(f'<div style="transform:scale({NO_SCALE});line-height:0">{sv(base,sz)}</div>' if no else sv(base,sz))
    for m,slot in mods:
        if slot=='over': s+=f'<div class=o style="left:0;top:0">{sv(m,sz)}</div>'
        else: s+=f'<div class=o style="right:0;{"bottom" if slot=="A" else "top"}:0">{sv(m,int(sz*.4))}</div>'
    return s+f'</div><figcaption>{html.escape(label)}</figcaption></figure>'
ex=[("No peanuts, I'm allergic",'DIE-01',[('MOD-01','over'),('MOD-03','A')]),('Where is the toilet?','BAS-01',[('MOD-04','A')]),('Without ice, please','FOO-11',[('MOD-02','A')]),
    ('Hot coffee, please','FOO-07',[('MOD-11','A'),('MOD-05','B')]),('Big cold beer','FOO-09',[('MOD-14','A'),('MOD-15','B')]),('Sparkling water, please','FOO-22',[('MOD-05','A')]),
    ('Less sugar','FOO-12',[('MOD-12','A')]),('More rice','FOO-13',[('MOD-09','A')]),('Small coffee','FOO-07',[('MOD-10','A')]),('Medium pizza-size portion? (medium)','FOO-15',[('MOD-13','A')]),
    ('Allergic to egg (symbol only)','DIE-05',[('MOD-03','A')]),('Where is the metro?','TRA-08',[('MOD-04','A')]),('How much is the taxi?','TRA-03',[('MOD-06','A')]),('Urgent, doctor','HEA-01',[('MOD-08','A')])]
ex[9]=('Medium bread','FOO-15',[('MOD-13','A')])
exno=[("No peanuts, I'm allergic",'DIE-01',[('MOD-01','over'),('MOD-03','A')]),('No egg','DIE-05',[('MOD-01','over')]),('No sugar','FOO-12',[('MOD-01','over')]),
      ('No shellfish, I need a doctor','DIE-06',[('MOD-01','over'),('MOD-08','A')]),('No ice, please','FOO-11',[('MOD-01','over'),('MOD-05','B')]),('No pork','FOO-18',[('MOD-01','over')])]
cats={}
for r in rows: cats.setdefault(r[1],[]).append(r)
h=['<!doctype html><meta charset=utf-8><title>Travel Card symbol contact sheet</title><style>body{font:14px system-ui;margin:24px;color:#212121;background:#fff}h2{margin:32px 0 8px;border-bottom:3px solid #212121}',
 'section{display:flex;flex-wrap:wrap;gap:12px}figure{margin:0;width:120px;text-align:center}figure svg{display:block;margin:auto}figcaption{font-size:12px;margin-top:4px}code{font-weight:700}.f{display:block;color:#D32F2F;font-size:10px}',
 '.c{position:relative;border:1px solid #E0E0E0;margin:0 auto}.o{position:absolute}.sm{display:flex;flex-wrap:wrap;gap:6px}</style>',
 f'<h1>Travel Card artwork: contact sheet ({len(ids)} symbols, style 2, revision 1)</h1><p>Generated from assets/_source. Review aid only. Symbols marked in red are religious and have not been checked by someone from that culture.</p>']
for k,v in cats.items(): h.append(f'<h2>{html.escape(k)} ({len(v)})</h2><section>'+''.join(tile(r) for r in v)+'</section>')
h.append('<h2>"No" over a symbol: the symbol is shown at 60 % so the ring does not hide it (large, then 32 px)</h2><section>'+''.join(comp(*e,sz=176) for e in exno)+'</section>')
h.append('<section>'+''.join(comp(e[0],e[1],e[2],sz=32) for e in exno)+'</section>')
h.append('<h2>Modifier examples (badge A bottom-right, badge B top-right, "No" drawn over the symbol)</h2><section>'+''.join(comp(*e) for e in ex)+'</section>')
h.append('<h2>Small-size check: all symbols at 32 px</h2><div class=sm>'+''.join(sv(i,32) for i in ids)+'</div>')
h.append('<h2>Stress test: all symbols at 24 px</h2><div class=sm>'+''.join(sv(i,24) for i in ids)+'</div>')
open(os.path.join(ROOT,'docs','design','symbol-contact-sheet.html'),'w',encoding='utf-8').write('\n'.join(h))
print('built',len(ids))
