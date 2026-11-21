# Checks assets/symbols: expected ID set, valid SVG, forbidden elements, viewBox, and byte-identity of unlisted symbols
# against docs/design/style-2-round-1 (the preserved previous version).
import os,re,sys,openpyxl
from lxml import etree
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REMOVED={'DIE-11','DIE-12','DIE-14','HEA-06','HEA-14','HEA-15'}
ADDED={'FOO-22','MOD-12','MOD-13','MOD-14','MOD-15','HEA-16'}
CHANGED=set('MOD-03 MOD-05 MOD-09 MOD-10 MOD-11 BAS-05 BAS-02 FOO-14 DIE-06 DIE-13 TRA-03 TRA-08 TRA-21 ACC-07 ACC-08 HEA-08 HEA-09 HEA-10 MON-01 MON-04 MON-08 PLA-06 PLA-07 PLA-10 REL-01 REL-04 REL-05 REL-06 COM-03 COM-04 COM-05 TIM-01'.split())
wb=openpyxl.load_workbook(ROOT+'/docs/support/Travel Cards - Symbol List.xlsx',read_only=True)
old=[r[0] for r in list(wb.worksheets[0].iter_rows(values_only=True))[1:] if r[0]]
ids=(set(old)-REMOVED)|ADDED
d=ROOT+'/assets/symbols'; prev=ROOT+'/docs/design/style-2-round-1'; files=sorted(os.listdir(d)); bad=[]
exp=sorted(i+'.svg' for i in ids)
if files!=exp: bad.append(f'file mismatch missing={set(exp)-set(files)} extra={set(files)-set(exp)}')
vb=set(); same=0
for f in files:
    b=open(f'{d}/{f}','rb').read(); s=b.decode('utf-8')
    try: t=etree.fromstring(b)
    except Exception as x: bad.append(f'{f} invalid XML {x}'); continue
    tags={etree.QName(e).localname.lower() for e in t.iter() if isinstance(e.tag,str)}
    for k in ('text','tspan','lineargradient','radialgradient','filter','image','script','use','style','foreignobject','clippath','mask','pattern'):
        if k in tags: bad.append(f'{f} has <{k}>')
    if re.search(r'url\(|href|http(?!://www.w3.org/2000/svg)|<!ENTITY|opacity',s): bad.append(f'{f} external ref / opacity')
    vb.add(t.get('viewBox')); i=f[:-4]
    if i not in CHANGED|ADDED:
        if open(f'{prev}/{f}','rb').read()==b: same+=1
        else: bad.append(f'{f} changed but not listed')
for i in REMOVED:
    if os.path.exists(f'{d}/{i}.svg') or not os.path.exists(f'{ROOT}/docs/design/removed-symbols/{i}.svg'): bad.append(f'{i} removal not clean')
if vb!={'0 0 64 64'}: bad.append(f'viewBox set {vb}')
for i in CHANGED:
    if open(f'{d}/{i}.svg','rb').read()==open(f'{prev}/{i}.svg','rb').read(): bad.append(f'{i} listed as redrawn but identical')
print(f'{len(ids)} expected IDs, {len(files)} files, viewBoxes {vb}, {same} unlisted symbols byte-identical, {len(CHANGED)} redrawn, {len(ADDED)} added, {len(REMOVED)} removed')
print('PASS' if not bad else 'FAIL'); [print(' ',b) for b in bad]
sys.exit(1 if bad else 0)
