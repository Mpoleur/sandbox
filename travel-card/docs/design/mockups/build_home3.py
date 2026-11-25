# Builds home-backgrounds.html: D4 Home with five different background proposals. Reads assets/symbols and docs/design/logo/round5-A3-icon.svg (read-only).
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
CAT={'Diet & allergies':'#E65100','Places & directions':'#1565C0','Pets':'#6D4C41','Transport':'#00796B'}
FAV=[("No peanuts, I'm allergic",'DIE-01',('MOD-01','MOD-03'),'Diet & allergies',False),('Take me to my hotel','TRA-03',(),'Transport',True)]
SEC=[('Diet & allergies',[('No gluten, please','DIE-04',('MOD-01',),'Diet & allergies',False)])]
# ---- the five backgrounds: pattern svg (no gradients, no filters, no bitmaps), ground, text and route colours ----
def wave(y,ph,c,w=1.6): return f'<path d="M0 {y}Q30 {y-18+ph} 60 {y}T120 {y}" fill="none" stroke="{c}" stroke-width="{w}"/>'
def ring(cx,cy,rs,c): return ''.join(f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r*.62:.0f}" fill="none" stroke="{c}" stroke-width="1.6" transform="rotate(-14 {cx} {cy})"/>' for r in rs)
BG=[
 dict(n='1. Contour map',idea='Warm paper with faint topographic contour lines and two hill rings, like a trail map with no real place.',g='#F8F2E2',ttl='#212121',sec='#4A5A66',route='#66798A',pat='#E1D6B9',
  svg=lambda c:f'<defs><pattern id=pA width=240 height=200 patternUnits=userSpaceOnUse>{wave(26,0,c)}{wave(48,6,c)}{wave(70,-4,c)}{wave(92,4,c)}<g transform="translate(120 0)">{wave(26,0,c)}{wave(48,6,c)}{wave(70,-4,c)}{wave(92,4,c)}</g>{ring(70,150,(14,26,38),c)}{ring(190,140,(10,20,30),c)}</pattern></defs><rect width=360 height=760 fill=url(#pA) />',
  spec='Ground #F8F2E2; lines 1.6 dp #E1D6B9 on a 240 x 200 dp repeating tile (5 wavy paths + 5 ellipses).'),
 dict(n='2. Kraft paper',idea='Kraft-paper brown with scattered fibres and specks, like a luggage label or a parcel.',g='#D9BE93',ttl='#212121',sec='#2F2A24',route='#5D4037',pat='#C4A474',
  svg=lambda c:f'<defs><pattern id=pB width=90 height=90 patternUnits=userSpaceOnUse>'+''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>' for x,y,r in((10,12,1.6),(44,30,1.2),(72,16,1.8),(24,58,1.4),(60,70,1.6),(84,52,1.1),(36,84,1.3)))+''.join(f'<path d="M{x} {y}q6 -3 12 0" fill="none" stroke="#E8D3AA" stroke-width="1.4" stroke-linecap="round"/>' for x,y in((16,36),(54,8),(62,48),(8,72),(70,82)))+'</pattern></defs><rect width=360 height=760 fill=url(#pB) />',
  spec='Ground #D9BE93; specks #C4A474 (r 1 to 2 dp) and short fibres #E8D3AA (1.4 dp) on a 90 x 90 dp tile. Section text #212121, secondary #2F2A24.'),
 dict(n='3. Colour wash',idea='Big flat soft shapes in pale navy and pale A3 yellow, like a washed map of land and sea, with no pattern at all.',g='#EDF2FA',ttl='#212121',sec='#4A5A66',route='#5C7A99',pat='#D3E3F6',
  svg=lambda c:f'<rect width=360 height=760 fill="#EDF2FA"/><circle cx="330" cy="150" r="150" fill="#FFF0B8"/><circle cx="20" cy="470" r="190" fill="#D3E3F6"/><circle cx="300" cy="660" r="130" fill="#FFF0B8"/><circle cx="170" cy="300" r="80" fill="#DCE8F7"/>',
  spec='Ground #EDF2FA with four flat circles: #FFF0B8 (2), #D3E3F6, #DCE8F7. Four shapes, no pattern; route #5C7A99.'),
 dict(n='4. Passport stamps',idea='Cream passport page with pale circular, dashed and wave stamps scattered at an angle, with no words, flags or real places.',g='#FFF8E6',ttl='#212121',sec='#4A5A66',route='#66798A',pat='#E6D8AE',
  svg=lambda c:f'<defs><pattern id=pD width=180 height=180 patternUnits=userSpaceOnUse><g transform="rotate(-12 50 50)"><circle cx="50" cy="50" r="30" fill="none" stroke="{c}" stroke-width="2"/><circle cx="50" cy="50" r="23" fill="none" stroke="{c}" stroke-width="1.2"/><path d="M50 36l4 9 10 1-8 6 3 10-9-5-9 5 3-10-8-6 10-1z" fill="{c}"/></g><g transform="rotate(8 130 120)"><rect x="96" y="96" width="68" height="46" rx="6" fill="none" stroke="#CFE0F3" stroke-width="2" stroke-dasharray="6 4"/><path d="M106 126q8-8 16 0t16 0t16 0" fill="none" stroke="#CFE0F3" stroke-width="2"/></g><g transform="rotate(20 140 30)"><circle cx="140" cy="30" r="20" fill="none" stroke="#CDE6DF" stroke-width="2"/><path d="M126 30h28M140 16v28" stroke="#CDE6DF" stroke-width="2"/></g></pattern></defs><rect width=360 height=760 fill=url(#pD) />',
  spec='Ground #FFF8E6; stamps 2 dp in #E6D8AE, #CFE0F3, #CDE6DF on a 180 x 180 dp tile (2 rings + star, dashed rectangle + waves, circle + cross lines).'),
 dict(n='5. Bold yellow field',idea='The A3 yellow as a full flat field, so the white tickets and the navy header pop; the route turns navy.',g='#FFC107',ttl='#212121',sec='#2B2B2B',route='#0B3D7A',pat='#FFC107',
  svg=lambda c:'<rect width=360 height=760 fill="#FFC107"/>',
  spec='Solid #FFC107 (the A3 background). No pattern; section text #212121, secondary #2B2B2B, route #0B3D7A.'),
]
BORDER=3
CSS=f'''*{{box-sizing:border-box}}body{{margin:0;background:#E3E8EC;color:#212121;font:16px/24px Roboto,"Segoe UI",system-ui,sans-serif}}.wrap{{max-width:2120px;margin:0 auto;padding:28px 24px 60px}}h1{{font-size:28px;margin:0 0 4px}}.note{{background:#fff;border-radius:12px;padding:12px 16px;max-width:1000px;font-size:14px;line-height:20px;margin-bottom:22px}}
.cols{{display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start}}.col{{width:376px}}.col h2{{font-size:18px;margin:0 0 2px}}.idea{{font-size:13px;line-height:18px;margin-bottom:8px;color:#34434e}}.cap{{font-size:12px;line-height:17px;margin-top:8px;background:#fff;border-radius:10px;padding:8px 10px}}.cap b{{font-weight:500}}
.phone{{width:376px;height:776px;background:#212121;border-radius:36px;padding:8px}}.scr{{width:360px;height:760px;border-radius:28px;overflow:hidden;position:relative;background:var(--g)}}.bgsvg{{position:absolute;left:0;top:0}}.lay{{position:absolute;left:0;top:0;right:0}}
.sb{{height:24px;display:flex;justify-content:space-between;align-items:center;padding:0 20px;font-size:12px;font-weight:500}}.bat{{width:18px;height:9px;border:1.5px solid currentColor;border-radius:2px}}.lg{{display:block;border-radius:24%;overflow:hidden;line-height:0;flex:none}}.ic{{flex:none}}
.top{{background:#0B3D7A;color:#fff;border-radius:0 0 28px 28px;padding-bottom:14px}}.ttl{{display:flex;align-items:center;gap:12px;height:60px;padding:0 4px 0 16px}}.ttl h3{{margin:0;font-size:22px;line-height:28px;font-weight:500;flex:1}}.ib{{width:48px;height:48px;display:flex;align-items:center;justify-content:center}}
.search{{margin:0 16px;height:52px;background:#fff;border-radius:26px;display:flex;align-items:center;gap:12px;padding:0 16px;color:#4A5A66;font-size:16px}}
.rem{{margin:10px 16px 0;display:flex;align-items:center;gap:10px;background:#FFF1DC;border-left:6px solid #F57C00;border-radius:12px;padding:8px 8px 8px 12px;font-size:13px;line-height:18px;color:#6B3600}}.rem b{{flex:none;color:#1565C0;font-weight:500;padding:10px 6px}}
.sec{{display:flex;align-items:center;gap:10px;height:44px;padding:0 16px;margin-top:4px;font-size:16px;font-weight:500;color:var(--ttl)}}.sec i{{width:16px;height:16px;border-radius:8px;border:3px solid;background:#fff;display:block}}.sec span{{margin-left:auto;font-size:12px;color:var(--sec);font-weight:400}}.sec .stf{{color:#1565C0;display:flex;margin-left:-2px;background:#fff;border-radius:12px;padding:1px}}
.rail{{position:relative;margin-left:23px;border-left:2px dashed var(--route);padding:2px 16px 6px 17px;display:flex;flex-direction:column;gap:10px}}
.tk{{position:relative;display:flex;height:84px;background:#fff;border-radius:14px;border:{BORDER}px solid}}.tk .stub{{width:80px;display:flex;align-items:center;justify-content:center;position:relative;border-right:2px dashed #B0BEC5}}
.tk .stub:before,.tk .stub:after{{content:"";position:absolute;right:-9px;width:16px;height:16px;border-radius:8px;background:var(--g);border:{BORDER}px solid inherit}}.tk .stub:before{{top:-{BORDER+8}px}}.tk .stub:after{{bottom:-{BORDER+8}px}}
.tk .lb{{flex:1;padding:0 10px 0 12px;display:flex;flex-direction:column;justify-content:center;font-size:14px;line-height:20px;font-weight:500;color:#212121}}.tk .lb small{{font-size:12px;line-height:16px;font-weight:400;color:#4A5A66}}.tk .st{{align-self:flex-start;margin:4px 4px 0 0;color:#1565C0}}
.ph{{display:inline-flex;align-items:center;justify-content:center;background:#D9E2EA;border:2px solid #fff;border-radius:6px;position:absolute;left:4px;bottom:4px;width:34px;height:26px}}
.fab{{position:absolute;right:16px;bottom:16px;height:56px;border-radius:16px;background:#1565C0;color:#fff;display:flex;align-items:center;gap:8px;padding:0 20px 0 16px;font-size:16px;font-weight:500;box-shadow:0 3px 8px rgba(0,0,0,.3)}}
.pad{{height:88px}}
'''
def tk(l,b,m,cat,photo,fav,sub):
    c=CAT[cat]; ph=f'<span class=ph>{card("ACC-01",(),20)}</span>' if photo else ''
    return (f'<div class=tk style="border-color:{c}"><div class=stub style="border-right-color:{c}">{card(b,m,64)}{ph}</div><div class=lb>{html.escape(l)}<small>{html.escape(sub)}</small></div>{"<span class=st>"+ic("star",22)+"</span>" if fav else ""}</div>')
def home(b):
    o=(f'<div class=scr style="--g:{b["g"]};--ttl:{b["ttl"]};--sec:{b["sec"]};--route:{b["route"]}"><svg class=bgsvg width=360 height=760 viewBox="0 0 360 760">{b["svg"](b["pat"])}</svg><div class=lay>'
       f'<div class=top><div class=sb><span>9:41</span><span class=bat></span></div><div class=ttl>{logo(44)}<h3>Travel Cards</h3><div class=ib>{ic("more")}</div></div><div class=search>{ic("search")}Search cards and symbols</div></div>'
       '<div class=rem><span>Allergy cards help, but verify with a local or a professional if you can.</span><b>Got it</b></div>'
       f'<div class=sec><span class=stf>{ic("star",22)}</span>Favourites<span>2 cards</span></div><div class=rail>'+''.join(tk(l,x,m,c,p,True,'With photo' if p else 'Symbol card') for l,x,m,c,p in FAV)+'</div>')
    for n,cs in SEC:
        o+=f'<div class=sec><i style="border-color:{CAT[n]}"></i>{html.escape(n)}<span>{len(cs)} card</span></div><div class=rail>'+''.join(tk(l,x,m,c,p,False,'Symbol card') for l,x,m,c,p in cs)+'</div>'
    return o+f'<div class=pad></div></div><div class=fab>{ic("plus")}New card</div></div>'
def col(b):
    ci=cr(b['ttl'],b['g']); cs=cr(b['sec'],b['g']); cp=cr(b['ttl'],b['pat']) if b['pat']!=b['g'] else ci; cro=cr(b['route'],b['g'])
    return (f'<div class=col><h2>{b["n"]}</h2><div class=idea>{b["idea"]}</div><div class=phone>{home(b)}</div><div class=cap><b>Spec:</b> {b["spec"]}<br><b>Contrast:</b> section titles {b["ttl"]} on ground {ci:.1f}:1'
            f'{" (worst case over the pattern colour "+format(cp,".1f")+":1)" if b["pat"]!=b["g"] else ""}; counts {b["sec"]} {cs:.1f}:1; route line {b["route"]} {cro:.1f}:1 (needs 3:1).</div></div>')
h=[f'<!doctype html><meta charset=utf-8><title>Travel Cards Home backgrounds</title><style>{CSS}</style><div class=wrap>',
 '<h1>Home D4: five background proposals</h1><div class=note>Draft for Matthieu, not validated. Everything else in D4 is unchanged: navy rounded header with the A3 logo and "Travel Cards", pill search, orange reminder, boarding-pass tickets with category borders, route line, favourites and the New card button. Only the screen background changes. It is drawn behind the content; ticket interiors stay white (label 16:1, secondary 7:1) and the header is untouched. All five are flat vector (repeating tiles or simple shapes, no gradients, filters or bitmaps); an app can draw them with a few SVG paths or Canvas shapes. <b>Bottom space fix:</b> the list ends with an 88 dp spacer, so the last ticket scrolls clear of the New card button (shown here: the button sits below the last ticket, over background only). The section title for Favourites and the stops sit on a white chip so they stay readable on any pattern.</div><div class=cols>',
 ''.join(col(b) for b in BG),'</div></div>']
open(os.path.join(HERE,'home-backgrounds.html'),'w',encoding='utf-8').write('\n'.join(h))
print('ok',[(b['n'][:2],round(cr(b['ttl'],b['g']),1),round(cr(b['sec'],b['g']),1),round(cr(b['route'],b['g']),1)) for b in BG])
