# Builds home-concepts-2.html: D4, the combined Home (D2 boarding-pass layout, D1 rounded header and pill search, D3 category colours as card borders only).
# Reads assets/symbols and docs/design/logo/round5-A3-icon.svg (read-only). App name: Travel Cards.
import os,re,html
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
def L(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in(0,2,4)]
    c=[x/12.92 if x<=.03928 else ((x+.055)/1.055)**2.4 for x in c]; return .2126*c[0]+.7152*c[1]+.0722*c[2]
def cr(a,b):
    la,lb=sorted((L(a),L(b)),reverse=True); return (la+.05)/(lb+.05)
def inner(i): return re.sub(r'^<svg[^>]*>|</svg>\s*$','',open(f'{ROOT}/assets/symbols/{i}.svg',encoding='utf-8').read().strip())
def sym(i,x,y,w): return f'<svg x="{x}" y="{y}" width="{w}" height="{w}" viewBox="0 0 64 64" stroke-linejoin="round" stroke-linecap="round">{inner(i)}</svg>'
def card(base,mods=(),size=100):
    no='MOD-01' in mods; b=[m for m in mods if m!='MOD-01'][:2]
    s=(sym(base,12.8,12.8,38.4)+sym('MOD-01',0,0,64) if no else sym(base,0,0,64))
    for k,m in enumerate(b): s+=sym(m,38.4,38.4 if k==0 else 0,25.6)
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64">{s}</svg>'
LOGO=open(f'{ROOT}/docs/design/logo/round5-A3-icon.svg',encoding='utf-8').read().strip()
def logo(w): return f'<span class=lg style="width:{w}px;height:{w}px">'+LOGO.replace('<svg ',f'<svg width="{w}" height="{w}" ',1)+'</span>'
ICON={'search':'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>','plus':'<path d="M12 5v14M5 12h14"/>',
 'star':'<path d="M12 3.5l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 17l-5.3 3 1.1-6L3.4 9.8l6-.8z" fill="currentColor"/>',
 'more':'<circle cx="12" cy="5" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="19" r="1.8" fill="currentColor"/>'}
def ic(n,s=24): return f'<svg class=ic width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ICON[n]}</svg>'
# category border colours: border only, no fill; each must reach 3:1 on white (non-text)
CAT={'Diet & allergies':'#E65100','Places & directions':'#1565C0','Pets':'#6D4C41','Health & emergency':'#2E7D32','Transport':'#00796B'}
FAV=[("No peanuts, I'm allergic",'DIE-01',('MOD-01','MOD-03'),'Diet & allergies',False),('Take me to my hotel','TRA-03',(),'Transport',True)]
SEC=[('Diet & allergies',[('No gluten, please','DIE-04',('MOD-01',),'Diet & allergies',False)]),('Places & directions',[('Where is the toilet?','BAS-01',('MOD-04',),'Places & directions',False)]),
     ('Pets',[('Can my dog come in?','PET-03',(),'Pets',False)]),('Health & emergency',[('Where is the pharmacy?','HEA-03',('MOD-04',),'Health & emergency',False)])]
BORDER=3
CSS=f'''*{{box-sizing:border-box}}body{{margin:0;background:#E3E8EC;color:#212121;font:16px/24px Roboto,"Segoe UI",system-ui,sans-serif}}.wrap{{max-width:1180px;margin:0 auto;padding:28px 24px 60px}}h1{{font-size:28px;margin:0 0 4px}}h2{{font-size:20px;margin:0 0 8px;border-bottom:3px solid #212121;padding-bottom:4px}}
.note{{background:#fff;border-radius:12px;padding:12px 16px;max-width:980px;font-size:14px;line-height:20px;margin-bottom:22px}}.cols{{display:flex;flex-wrap:wrap;gap:36px;align-items:flex-start}}.col{{width:376px}}.col.w{{width:520px}}.cap{{font-size:13px;line-height:18px;margin:8px 0;color:#34434e}}
.phone{{width:376px;height:776px;background:#212121;border-radius:36px;padding:8px}}.scr{{width:360px;height:760px;border-radius:28px;overflow:hidden;position:relative;background:#F4F6F8}}
.sb{{height:24px;display:flex;justify-content:space-between;align-items:center;padding:0 20px;font-size:12px;font-weight:500}}.bat{{width:18px;height:9px;border:1.5px solid currentColor;border-radius:2px}}.lg{{display:block;border-radius:24%;overflow:hidden;line-height:0;flex:none}}.ic{{flex:none}}
.top{{background:#0B3D7A;color:#fff;border-radius:0 0 28px 28px;padding-bottom:14px}}.ttl{{display:flex;align-items:center;gap:12px;height:60px;padding:0 4px 0 16px}}.ttl h3{{margin:0;font-size:22px;line-height:28px;font-weight:500;flex:1}}.ib{{width:48px;height:48px;display:flex;align-items:center;justify-content:center}}
.search{{margin:0 16px;height:52px;background:#fff;border-radius:26px;display:flex;align-items:center;gap:12px;padding:0 16px;color:#4A5A66;font-size:16px}}
.rem{{margin:10px 16px 0;display:flex;align-items:center;gap:10px;background:#FFF1DC;border-left:6px solid #F57C00;border-radius:12px;padding:8px 8px 8px 12px;font-size:13px;line-height:18px;color:#6B3600}}.rem b{{flex:none;color:#1565C0;font-weight:500;padding:10px 6px}}
.sec{{display:flex;align-items:center;gap:10px;height:44px;padding:0 16px;margin-top:4px;font-size:16px;font-weight:500}}.sec i{{width:16px;height:16px;border-radius:8px;border:3px solid;background:#fff;display:block;margin-left:0}}.sec span{{margin-left:auto;font-size:12px;color:#4A5A66;font-weight:400}}.sec .stf{{color:#1565C0;display:flex;margin-left:-2px}}
.rail{{position:relative;margin-left:23px;border-left:2px dashed #78909C;padding:2px 16px 6px 17px;display:flex;flex-direction:column;gap:10px}}
.tk{{position:relative;display:flex;height:84px;background:#fff;border-radius:14px;border:{BORDER}px solid}}.tk .stub{{width:80px;display:flex;align-items:center;justify-content:center;position:relative;border-right:2px dashed #B0BEC5}}
.tk .stub:before,.tk .stub:after{{content:"";position:absolute;right:-9px;width:16px;height:16px;border-radius:8px;background:#F4F6F8;border:{BORDER}px solid inherit}}.tk .stub:before{{top:-{BORDER+8}px}}.tk .stub:after{{bottom:-{BORDER+8}px}}
.tk .lb{{flex:1;padding:0 10px 0 12px;display:flex;flex-direction:column;justify-content:center;font-size:14px;line-height:20px;font-weight:500}}.tk .lb small{{font-size:12px;line-height:16px;font-weight:400;color:#4A5A66}}.tk .st{{align-self:flex-start;margin:4px 4px 0 0;color:#1565C0}}
.ph{{display:inline-flex;align-items:center;justify-content:center;background:#D9E2E8;border:2px solid #fff;border-radius:6px;position:absolute;left:4px;bottom:4px;width:34px;height:26px}}
.fab{{position:absolute;right:16px;bottom:16px;height:56px;border-radius:16px;background:#1565C0;color:#fff;display:flex;align-items:center;gap:8px;padding:0 20px 0 16px;font-size:16px;font-weight:500;box-shadow:0 3px 8px rgba(0,0,0,.3)}}
.spec{{background:#fff;border-radius:14px;padding:12px 14px;margin-top:10px;font-size:13px;line-height:18px}}.spec ul{{margin:4px 0 0 18px;padding:0}}.sw{{display:inline-flex;align-items:center;gap:6px;margin:3px 10px 3px 0;font-size:12px}}.sw u{{width:28px;height:18px;border-radius:5px;background:#fff;border:{BORDER}px solid;display:block}}
'''
def tk(l,b,m,cat,photo,fav,sub):
    c=CAT[cat]; ph=f'<span class=ph>{card("ACC-01",(),20)}</span>' if photo else ''
    return (f'<div class=tk style="border-color:{c}"><div class=stub style="border-right-color:{c}">{card(b,m,64)}{ph}</div><div class=lb>{html.escape(l)}<small>{html.escape(sub)}</small></div>'
            f'{"<span class=st>"+ic("star",22)+"</span>" if fav else ""}</div>')
def home():
    o=(f'<div class=scr><div class=top><div class=sb><span>9:41</span><span class=bat></span></div><div class=ttl>{logo(44)}<h3>Travel Cards</h3><div class=ib>{ic("more")}</div></div><div class=search>{ic("search")}Search cards and symbols</div></div>'
       '<div class=rem><span>Allergy cards help, but verify with a local or a professional if you can.</span><b>Got it</b></div>'
       f'<div class=sec><span class=stf>{ic("star",22)}</span>Favourites<span>2 cards</span></div><div class=rail>'+''.join(tk(l,b,m,c,p,True,'With photo' if p else 'Symbol card') for l,b,m,c,p in FAV)+'</div>')
    for n,cs in SEC[:2]:
        o+=f'<div class=sec><i style="border-color:{CAT[n]}"></i>{html.escape(n)}<span>{len(cs)} card</span></div><div class=rail>'+''.join(tk(l,b,m,c,p,False,'Symbol card') for l,b,m,c,p in cs)+'</div>'
    return o+f'<div class=fab>{ic("plus")}New card</div></div>'
def detail():
    t=tk('Take me to my hotel','TRA-03',(),'Transport',True,True,'With photo')
    return f'<div class=spec><b>Ticket card detail</b><div style="display:flex;gap:14px;margin-top:8px;align-items:flex-start"><div style="width:300px;transform-origin:left top;transform:scale(1.25);height:105px;margin-bottom:18px">{t.replace("class=tk","class=tk style=\'width:240px;\'",1) if False else t}</div></div><ul><li>84 dp high, {BORDER} dp border in the category colour (teal for Transport), no fill, radius 14.</li><li>Stub 80 dp with the symbol, dashed perforation, two notches that take the border colour. A photo card shows a small photo thumbnail in the stub.</li><li>Favourite: blue star top right, and the card sits in the Favourites section (star and title in the header).</li></ul></div>'
def swatches():
    return '<div class=spec><b>Category border colours (border only)</b><div style="margin-top:6px">'+''.join(f'<span class=sw><u style="border-color:{c}"></u>{html.escape(n)} {c} {cr(c,"#FFFFFF"):.1f}:1</span>' for n,c in CAT.items())+'</div><div style="font-size:12px;color:#4A5A66;margin-top:4px">Each border reaches at least 3:1 against the white ticket (non-text). Label text stays ink (16:1) and the secondary line #4A5A66 (7:1), so no coloured text is used. White on the navy header is 10.7:1.</div></div>'
SS=['New tokens: <code>brand-navy</code> #0B3D7A for the header (white text 10.7:1); the header has a 28 dp rounded bottom edge and a 52 dp pill search field, with the logo (44 dp) and the title <b>Travel Cards</b>.',
    'New tokens <code>category-border</code>: Diet #E65100, Places #1565C0, Pets #6D4C41, Health #2E7D32, Transport #00796B, each at least 3.5:1 on white (note: Diet is darker than the earlier orange #F57C00, which was only 2.7:1). Used only as the ticket border, never as fill or text.',
    'New component <code>ticket</code> replaces the card tile on Home: one per row, 84 dp high, 3 dp border, 80 dp symbol stub with dashed perforation and notches, label and a small source line. Card tile stays for the symbol picker and other screens.',
    'New <code>route rail</code>: 2 dp dashed line #78909C, a stop dot (16 dp ring in the category colour) at each category header; Favourites uses a blue star as its stop. Favourite tickets carry a 22 dp blue star.',
    'Trade-off: one card per row, so about two fewer cards per screen than the grid.']
h=[f'<!doctype html><meta charset=utf-8><title>Travel Cards Home D4</title><style>{CSS}</style><div class=wrap>','<h1>Home screen D4: the combined design</h1><p>Draft for Matthieu, not validated. The app is now <b>Travel Cards</b>. It keeps what Home must keep (search, Favourites first with a favourite only there, categories with at least one non-favourite card, New card, three-dot menu with Reorder and Settings, long-press menu, dismissible orange reminder). The App Style Sheet is not edited until you confirm. Transport has no section here because its only card, the hotel, is a favourite. The list is cut at the phone edge: Pets and Health follow below.</p>',
 '<div class=cols><div class=col>',f'<div class=phone>{home()}</div><div class=cap>D4 Home: navy header with the A3 logo and a rounded bottom edge, pill search, boarding-pass tickets along a route with a stop per category, category colour only as the 3 dp border.</div></div>',
 f'<div class="col w"><h2 style="margin-top:0">Detail and style sheet changes</h2>{detail()}{swatches()}<div class=spec><b>What changes in the App Style Sheet</b><ul>'+''.join(f'<li>{x}</li>' for x in SS)+'</ul></div></div>','</div></div>']
open(os.path.join(HERE,'home-concepts-2.html'),'w',encoding='utf-8').write('\n'.join(h))
print('ok',{n:round(cr(c,'#FFFFFF'),2) for n,c in CAT.items()})
