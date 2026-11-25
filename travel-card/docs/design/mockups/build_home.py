# Builds home-concepts.html: three Home screen directions (360 x 760 dp). Reads assets/symbols and docs/design/logo/round5-A3-icon.svg (read-only).
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
def logo(w,r=28): return f'<span class=lg style="width:{w}px;height:{w}px;border-radius:{r}%">'+LOGO.replace('<svg ',f'<svg width="{w}" height="{w}" ',1)+'</span>'
ICON={'search':'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>','plus':'<path d="M12 5v14M5 12h14"/>',
 'star':'<path d="M12 3.5l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 17l-5.3 3 1.1-6L3.4 9.8l6-.8z" fill="currentColor"/>',
 'more':'<circle cx="12" cy="5" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="19" r="1.8" fill="currentColor"/>','pin':'<path d="M12 21l-5-8a6 6 0 1 1 10 0z" fill="currentColor"/>'}
def ic(n,s=24): return f'<svg class=ic width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ICON[n]}</svg>'
# content: three example cards, two user cards (hotel with photo, pharmacy) and a gluten card
FAV=[("No peanuts, I'm allergic",'DIE-01',('MOD-01','MOD-03'),False),('Take me to my hotel','TRA-03',(),True)]
CATS=[('Diet & allergies','#F57C00','#212121',[('No gluten, please','DIE-04',('MOD-01',),False)]),
      ('Places & directions','#1565C0','#FFFFFF',[('Where is the toilet?','BAS-01',('MOD-04',),False)]),
      ('Pets','#6D4C41','#FFFFFF',[('Can my dog come in?','PET-03',(),False)]),
      ('Health & emergency','#2E7D32','#FFFFFF',[('Where is the pharmacy?','HEA-03',('MOD-04',),False)])]
def ph(size=34): return f'<span class=ph style="width:{size*1.3:.0f}px;height:{size}px">'+card('ACC-01',(),size-8)+'</span>'
REMINDER='<div class=rem><span>Allergy cards help, but verify with a local or a professional if you can.</span><b>Got it</b></div>'
CSS='''
*{box-sizing:border-box}body{margin:0;background:#E3E8EC;color:#212121;font:16px/24px Roboto,"Segoe UI",system-ui,sans-serif}.wrap{max-width:1520px;margin:0 auto;padding:28px 24px 60px}h1{font-size:28px;margin:0 0 4px}h2{font-size:20px;margin:36px 0 8px;border-bottom:3px solid #212121;padding-bottom:4px}
.note{background:#fff;border-radius:12px;padding:12px 16px;max-width:980px;font-size:14px;line-height:20px}.cols{display:flex;flex-wrap:wrap;gap:36px;align-items:flex-start}.col{width:376px}.cap{font-size:13px;line-height:18px;margin-top:8px;color:#34434e}
.phone{width:376px;height:776px;background:#212121;border-radius:36px;padding:8px}.scr{width:360px;height:760px;border-radius:28px;overflow:hidden;position:relative;background:#F4F6F8}
.sb{height:24px;display:flex;justify-content:space-between;align-items:center;padding:0 20px;font-size:12px;font-weight:500}.bat{width:18px;height:9px;border:1.5px solid currentColor;border-radius:2px}.ic{flex:none}
.lg{display:inline-block;overflow:hidden;flex:none;line-height:0}.ph{display:inline-flex;align-items:center;justify-content:center;background:#D9E2E8;border:2px solid #fff;border-radius:6px}
.ib{width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:24px}
.rem{display:flex;align-items:center;gap:10px;background:#FFF1DC;border-left:6px solid #F57C00;border-radius:12px;padding:8px 8px 8px 12px;font-size:13px;line-height:18px;color:#6B3600}.rem b{flex:none;color:#1565C0;font-weight:500;padding:10px 6px}
.fab{position:absolute;right:16px;bottom:16px;height:56px;border-radius:16px;background:#1565C0;color:#fff;display:flex;align-items:center;gap:8px;padding:0 20px 0 16px;font-size:16px;font-weight:500;box-shadow:0 3px 8px rgba(0,0,0,.3)}
.sw{display:inline-block;padding:2px 8px;border-radius:6px;font-size:12px;margin:2px 4px 2px 0}
/* direction 1: sunny header */
.d1 .top{background:#FFC107;border-radius:0 0 28px 28px;padding-bottom:14px}.d1 .ttl{display:flex;align-items:center;gap:12px;height:60px;padding:0 4px 0 16px}.d1 .ttl h3{margin:0;font-size:22px;line-height:28px;font-weight:500;flex:1}
.d1 .search{margin:0 16px;height:52px;background:#fff;border-radius:26px;display:flex;align-items:center;gap:12px;padding:0 16px;color:#4A5A66;font-size:16px}
.d1 .rem{margin:10px 16px 0}.d1 .sec{display:flex;align-items:center;gap:8px;height:44px;padding:0 16px;margin-top:4px}.d1 .sec b{font-size:16px;font-weight:500}.d1 .sec span{font-size:12px;color:#4A5A66;margin-left:auto}.d1 .sec i{width:10px;height:10px;border-radius:5px;display:block}
.d1 .row{display:flex;gap:12px;padding:0 16px}.d1 .t{width:158px;flex:none;background:#fff;border:1px solid #D5DDE3;border-radius:16px;overflow:hidden;position:relative}.d1 .t .th{height:104px;display:flex;align-items:center;justify-content:center;position:relative}.d1 .t .lb{padding:0 12px 10px;font-size:14px;line-height:20px;font-weight:500;height:50px}
.d1 .t.f{border:2px solid #FFC107}.d1 .st{position:absolute;top:6px;right:6px;color:#1565C0}.d1 .t .ph{position:absolute;left:8px;top:64px}
/* direction 2: boarding passes */
.d2 .top{background:#0B3D7A;color:#fff;padding-bottom:14px}.d2 .ttl{display:flex;align-items:center;gap:12px;height:60px;padding:0 4px 0 16px}.d2 .ttl h3{margin:0;font-size:22px;line-height:28px;font-weight:500;flex:1}
.d2 .search{margin:0 16px;height:48px;background:#fff;border-radius:12px;display:flex;align-items:center;gap:12px;padding:0 16px;color:#4A5A66;font-size:16px}.d2 .rem{margin:10px 16px 0}
.d2 .sec{display:flex;align-items:center;gap:10px;height:44px;padding:0 16px;margin-top:6px;font-size:16px;font-weight:500}.d2 .sec i{width:14px;height:14px;border-radius:7px;border:3px solid #0B3D7A;background:#fff;display:block;margin-left:1px}.d2 .sec span{margin-left:auto;font-size:12px;color:#4A5A66;font-weight:400}
.d2 .rail{position:relative;margin-left:23px;border-left:2px dashed #78909C;padding:2px 16px 4px 17px;display:flex;flex-direction:column;gap:10px}
.d2 .tk{position:relative;display:flex;height:84px;background:#fff;border-radius:14px;border:1px solid #D5DDE3}.d2 .tk .stub{width:84px;display:flex;align-items:center;justify-content:center;border-right:2px dashed #CFD8DC;position:relative}
.d2 .tk .stub:before,.d2 .tk .stub:after{content:"";position:absolute;right:-9px;width:16px;height:16px;border-radius:8px;background:#F4F6F8;border:1px solid #D5DDE3}.d2 .tk .stub:before{top:-9px}.d2 .tk .stub:after{bottom:-9px}
.d2 .tk .lb{flex:1;padding:0 10px 0 12px;display:flex;flex-direction:column;justify-content:center;font-size:14px;line-height:20px;font-weight:500}.d2 .tk .lb small{font-size:12px;line-height:16px;font-weight:400;color:#4A5A66}.d2 .tk.f{border:2px solid #FFC107}.d2 .tk .st{align-self:flex-start;margin:6px 6px 0 0;color:#1565C0}
/* direction 3: bold colour blocks */
.d3 .scr{background:#fff}.d3 .ttl{display:flex;align-items:center;gap:12px;height:64px;padding:0 4px 0 16px}.d3 .ttl h3{margin:0;font-size:28px;line-height:34px;font-weight:700;flex:1;letter-spacing:-.3px}
.d3 .search{margin:0 16px;height:52px;background:#E9EEF2;border-radius:16px;display:flex;align-items:center;gap:12px;padding:0 16px;color:#4A5A66;font-size:16px}.d3 .rem{margin:10px 16px 0}
.d3 .sec{display:flex;align-items:center;gap:8px;padding:0 16px;margin:12px 0 8px}.d3 .sec b{display:inline-block;padding:3px 12px;border-radius:12px;font-size:14px;line-height:20px;font-weight:500}.d3 .sec span{font-size:12px;color:#4A5A66;margin-left:auto}
.d3 .row{display:flex;gap:12px;padding:0 16px}.d3 .b{width:158px;height:164px;flex:none;border-radius:20px;position:relative;padding:8px;display:flex;flex-direction:column;align-items:center}.d3 .b .w{width:104px;height:104px;background:#fff;border-radius:18px;display:flex;align-items:center;justify-content:center;position:relative}
.d3 .b .lb{margin-top:6px;font-size:14px;line-height:18px;font-weight:500;text-align:center;padding:0 4px}.d3 .b .st{position:absolute;top:8px;right:8px}.d3 .b .ph{position:absolute;left:-4px;bottom:-4px;background:#D9E2E8}
.spec{background:#fff;border-radius:14px;padding:12px 14px;margin-top:10px;font-size:13px;line-height:18px;width:376px}.spec b{font-weight:500}.spec ul{margin:4px 0 0 18px;padding:0}
'''
def sb(c=''): return f'<div class=sb {c}><span>9:41</span><span class=bat></span></div>'
def d1():
    t=lambda l,b,m,ph_,fav=False:f'<div class="t{" f" if fav else ""}">{"<span class=st>"+ic("star",22)+"</span>" if fav else ""}<div class=th>{card(b,m,86)}{ph(34) if ph_ else ""}</div><div class=lb>{html.escape(l)}</div></div>'
    out=f'<div class="scr d1"><div class=top>{sb()}<div class=ttl>{logo(40,24)}<h3>Travel Card</h3><div class=ib>{ic("more")}</div></div><div class=search>{ic("search")}Search cards and symbols</div></div>{REMINDER}'
    out+=f'<div class=sec><span style="color:#1565C0;display:flex">{ic("star",20)}</span><b>Favourites</b><span>2 cards</span></div><div class=row>'+''.join(t(*f,fav=True) for f in FAV)+'</div>'
    for n,c,_,cs in CATS[:2]:
        out+=f'<div class=sec><i style="background:{c}"></i><b>{html.escape(n)}</b><span>{len(cs)} card</span></div><div class=row>'+''.join(t(*x) for x in cs)+'</div>'
    return out+f'<div class=fab>{ic("plus")}New card</div></div>'
def d2():
    tk=lambda l,b,m,ph_,sub,fav=False:f'<div class="tk{" f" if fav else ""}"><div class=stub>{card(b,m,66)}</div><div class=lb>{html.escape(l)}<small>{html.escape(sub)}</small></div>{"<span class=st>"+ic("star",22)+"</span>" if fav else ""}</div>'
    out=f'<div class="scr d2"><div class=top>{sb()}<div class=ttl>{logo(40,24)}<h3>Travel Card</h3><div class=ib style="color:#fff">{ic("more")}</div></div><div class=search>{ic("search")}Search cards and symbols</div></div>{REMINDER}'
    out+=f'<div class=sec><i style="border-color:#1565C0"></i>Favourites<span>2 cards</span></div><div class=rail>'+''.join(tk(l,b,m,p,'With photo' if p else 'Symbol card',True) for l,b,m,p in FAV)+'</div>'
    for n,c,_,cs in CATS[:1]:
        out+=f'<div class=sec><i></i>{html.escape(n)}<span>{len(cs)} card</span></div><div class=rail>'+''.join(tk(l,b,m,p,'Symbol card') for l,b,m,p in cs)+'</div>'
    return out+f'<div class=fab>{ic("plus")}New card</div></div>'
def d3():
    blk=lambda l,b,m,ph_,bg,fg,fav=False:f'<div class=b style="background:{bg};color:{fg}">{"<span class=st>"+ic("star",22)+"</span>" if fav else ""}<div class=w>{card(b,m,88)}{ph(34) if ph_ else ""}</div><div class=lb>{html.escape(l)}</div></div>'
    out=f'<div class="scr d3">{sb()}<div class=ttl>{logo(44,24)}<h3>Travel Card</h3><div class=ib>{ic("more")}</div></div><div class=search>{ic("search")}Search cards and symbols</div>{REMINDER}'
    out+=f'<div class=sec><b style="background:#FFC107;color:#212121">Favourites</b><span>2 cards</span></div><div class=row>'+''.join(blk(*f,'#FFC107','#212121',True) for f in FAV)+'</div>'
    for n,c,fg,cs in CATS[:2]:
        out+=f'<div class=sec><b style="background:{c};color:{fg}">{html.escape(n)}</b><span>{len(cs)} card</span></div><div class=row>'+''.join(blk(*x,c,fg) for x in cs)+'</div>'
    return out+f'<div class=fab>{ic("plus")}New card</div></div>'
def spec(title,lines): return f'<div class=spec><b>{title}</b><ul>'+''.join(f'<li>{l}</li>' for l in lines)+'</ul></div>'
c1=cr('#212121','#FFC107'); c2=cr('#FFFFFF','#0B3D7A'); c3=[(n,fg,c,cr(fg,c)) for n,c,fg,_ in CATS]
def det1(): return f'<div class=spec><b>Detail: favourite tile and category header</b><div class=d1 style="display:flex;gap:14px;align-items:flex-start;margin-top:8px"><div class="t f" style="width:158px;background:#fff;border:2px solid #FFC107;border-radius:16px;position:relative"><span class=st style="position:absolute;top:6px;right:6px;color:#1565C0">{ic("star",22)}</span><div class=th style="height:104px;display:flex;align-items:center;justify-content:center;position:relative">{card("TRA-03",(),86)}</div><div class=lb style="padding:0 12px 10px;font-size:14px;line-height:20px;font-weight:500;height:50px">Take me to my hotel</div></div><div style="font-size:12px;line-height:16px;color:#4A5A66">Favourites keep a 2 dp yellow edge and a blue star. Header: ink on yellow {c1:.1f}:1.</div></div></div>'
def det2(): return f'<div class=spec><b>Detail: boarding-pass ticket</b><div class=d2 style="margin-top:8px"><div class=rail style="margin-left:0;border:0;padding:0"><div class=tk style="width:330px"><div class=stub>{card("PET-03",(),66)}</div><div class=lb>Can my dog come in?<small>Symbol card</small></div></div></div><div style="font-size:12px;line-height:16px;color:#4A5A66;margin-top:6px">Stub with the symbol, dashed perforation and two notches, label on the right. White on navy header {c2:.1f}:1.</div></div></div>'
def det3(): return '<div class=spec><b>Detail: category colour pairs (text on colour, contrast)</b><div style="margin-top:6px">'+''.join(f'<span class=sw style="background:{c};color:{fg}">{html.escape(n)} {r:.1f}:1</span>' for n,fg,c,r in c3)+f'<span class=sw style="background:#FFC107;color:#212121">Favourites {c1:.1f}:1</span></div></div>'
SS={1:['New tokens: <code>brand-yellow</code> #FFC107 (header, favourite edge); on-brand-yellow is <code>on-surface</code> (9.9:1).','Home gets a 148 dp header band with bottom radius 28, the A3 logo (40 dp) and the title; the search field sits inside it (white pill).','Tiles unchanged (158 dp, 16 radius); favourites add a 2 dp yellow edge; category headers get a small colour dot. FAB, reminder, menus unchanged.'],
    2:['New tokens: <code>brand-navy</code> #0B3D7A (header), <code>ticket-notch</code> (page background).','New component <code>ticket</code> replaces the card tile on Home: one per row, 84 dp high, 84 dp symbol stub, dashed perforation with notches, label and a small source line.','New <code>route rail</code> (2 dp dashed line, 14 dp stop dot) in front of each section. Fewer cards visible per screen than a grid.'],
    3:['New token set <code>category-accent</code> (orange #F57C00 with ink text, blue #1565C0, brown #6D4C41 and green #2E7D32 with white text) plus yellow for Favourites, all AA (5.1 to 9.9:1).','New <code>colour block tile</code> 158 x 164 dp, radius 20: symbol on a white 104 dp square, label under it in the accent text colour; category header becomes a coloured pill.','Conflict to decide: category colours would be decoration, while the artwork uses colour for meaning (orange warning, green health).']}
def col(n,title,two,scr,det,why):
    return f'<div class=col><h2 style="margin-top:0">{n}. {title}</h2><div class=phone>{scr}</div><div class=cap>{two}</div>{det}{spec("What changes in the App Style Sheet",SS[n])}</div>'
h=[f'<!doctype html><meta charset=utf-8><title>Travel Card Home concepts</title><style>{CSS}</style><div class=wrap>','<h1>Home screen: three directions</h1><p>Draft for Matthieu to choose from, not validated. Same content in all three: search, Favourites on top (a favourite appears only there), then only categories that still hold a non-favourite card, New card button, three-dot menu (Reorder, Settings), long-press menu, and the dismissible orange allergy reminder. Real artwork. "Travel Card" is the working name; the logo is the approved A3 icon. Here Transport is not shown because its only card, the hotel, is a favourite. The App Style Sheet is not edited until you choose.</p>',
 '<div class=cols>',
 col(1,'Sunny header','A yellow header band with the A3 logo and the search field inside it, then a calm white tile grid. Closest to the logo and to today\'s app; smallest change.',d1(),det1(),''),
 col(2,'Boarding passes','A navy header, then each card as a boarding-pass ticket on a dashed route with a stop per category. Strongest travel feel; one card per row, so fewer cards on screen.',d2(),det2(),''),
 col(3,'Bold colour blocks','A big title and every category as a bold colour block with the symbol on a white tile, like wayfinding signs. Most character and easiest to scan, but category colours are decoration.',d3(),det3(),''),
 '</div></div>']
open(os.path.join(HERE,'home-concepts.html'),'w',encoding='utf-8').write('\n'.join(h))
print('ok',f'{c1:.2f}',f'{c2:.2f}',[f'{x[3]:.2f}' for x in c3])
