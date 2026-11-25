# Builds app-mockups.html (self-contained, inline SVG) from assets/symbols (read-only) and the tokens below.
# Run: python docs/design/mockups/build_mockups.py
import os,re,html
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
SYM=os.path.join(ROOT,'assets','symbols')
def L(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in(0,2,4)]
    c=[x/12.92 if x<=.03928 else ((x+.055)/1.055)**2.4 for x in c]; return .2126*c[0]+.7152*c[1]+.0722*c[2]
def cr(a,b):
    la,lb=sorted((L(a),L(b)),reverse=True); return (la+.05)/(lb+.05)
# name: (hex, partner token, use)
TOK={'background':('#F4F6F8',None,'Screen background'),'surface':('#FFFFFF',None,'Cards, tiles, fields, sheets'),'surface-variant':('#E9EEF2',None,'Card preview area, disabled fills'),
 'outline':('#78909C','surface','Borders of fields, chips, controls (needs 3:1)'),'outline-subtle':('#D5DDE3',None,'Decorative dividers and tile edges only'),
 'on-surface':('#212121','surface','Main text'),'on-surface-muted':('#4A5A66','surface','Secondary text, hints'),
 'primary':('#1565C0','surface','Buttons, selected states, links'),'on-primary':('#FFFFFF','primary','Text on primary'),
 'primary-container':('#DCEBFA',None,'Selected fills'),'on-primary-container':('#0B3D7A','primary-container','Text on selected fills'),
 'danger':('#C62828','surface','Delete, errors (text and icons)'),'danger-container':('#FDECEA',None,'Error fill'),
 'warning':('#F57C00',None,'Decorative accent only (bar, icon); never alone as text'),'warning-container':('#FFF1DC',None,'Safety notice fill'),
 'on-warning-container':('#6B3600','warning-container','Safety notice text'),'success':('#2E7D32','surface','Confirmation'),
 'disabled-text':('#6B7B86','surface-variant','Disabled text (exempt from AA, kept at 3.7:1)'),'display-background':('#FFFFFF',None,'Display mode, always white')}
def inner(i): return re.sub(r'^<svg[^>]*>|</svg>\s*$','',open(f'{SYM}/{i}.svg',encoding='utf-8').read().strip())
def sym(i,x,y,w): return f'<svg x="{x}" y="{y}" width="{w}" height="{w}" viewBox="0 0 64 64" stroke-linejoin="round" stroke-linecap="round">{inner(i)}</svg>'
def card(base,mods=(),size=100):  # one main symbol, up to 2 badges; MOD-01 shrinks the symbol to 60 %
    no=any(m=='MOD-01' for m in mods); b=[m for m in mods if m!='MOD-01'][:2]
    s=(sym(base,12.8,12.8,38.4) if no else sym(base,0,0,64))+(sym('MOD-01',0,0,64) if no else '')
    for k,m in enumerate(b): s+=sym(m,38.4,38.4 if k==0 else 0,25.6)
    return f'<svg width="{size}" height="{size}" viewBox="0 0 64 64">{s}</svg>'
ICON={'search':'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>','plus':'<path d="M12 5v14M5 12h14"/>','back':'<path d="M19 12H5M11 6l-6 6 6 6"/>',
 'camera':'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>','check':'<path d="M5 12l5 5 9-10"/>',
 'star':'<path d="M12 3.5l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 17l-5.3 3 1.1-6L3.4 9.8l6-.8z" fill="currentColor"/>',
 'more':'<circle cx="12" cy="5" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="19" r="1.8" fill="currentColor"/>'}
def ic(n,s=24): return f'<svg class=ic width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ICON[n]}</svg>'
CSS='''
:root{'''+';'.join(f'--{k}:{v[0]}' for k,v in TOK.items())+'''}
*{box-sizing:border-box}body{margin:0;background:#E3E8EC;color:var(--on-surface);font:16px/24px Roboto,"Segoe UI",system-ui,sans-serif}
.wrap{max-width:1640px;margin:0 auto;padding:28px 24px 60px}h1{font-size:28px;line-height:36px;margin:0 0 4px}h2{font-size:20px;margin:36px 0 12px;border-bottom:3px solid var(--on-surface);padding-bottom:4px}
.note{background:#fff;border-radius:12px;padding:12px 16px;max-width:900px}.row{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start}
.sw{width:150px;background:#fff;border-radius:12px;overflow:hidden;font-size:12px;line-height:16px}.sw i{display:block;height:44px;border-bottom:1px solid #D5DDE3}.sw div{padding:6px 8px}.pass{color:#2E7D32;font-weight:700}
.phones{display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start}.cap{width:376px;font-size:13px;line-height:18px;margin-top:8px;color:#4A5A66}
.phone{width:376px;height:776px;background:#212121;border-radius:36px;padding:8px}.scr{width:360px;height:760px;border-radius:28px;overflow:hidden;position:relative;background:var(--background);font-size:16px}
.sb{height:24px;display:flex;justify-content:space-between;align-items:center;padding:0 20px;font-size:12px;font-weight:500}.bat{width:18px;height:9px;border:1.5px solid currentColor;border-radius:2px}
.bar{height:56px;display:flex;align-items:center;padding:0 4px 0 16px;gap:4px}.bar h3{margin:0;font-size:22px;line-height:28px;font-weight:500;flex:1}.ib{width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:24px}
.search{margin:4px 16px 8px;height:52px;border:1.5px solid var(--outline);background:var(--surface);border-radius:26px;display:flex;align-items:center;gap:12px;padding:0 16px;color:var(--on-surface-muted)}
.cat{display:flex;align-items:center;justify-content:space-between;height:40px;padding:0 16px;margin-top:6px}.cat b{font-size:16px;font-weight:500}.cat span{font-size:12px;color:var(--on-surface-muted)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px}.favs{display:flex;gap:12px;padding:0 16px;overflow:hidden}
.tile{width:158px;background:var(--surface);border:1px solid var(--outline-subtle);border-radius:16px;overflow:hidden;position:relative;flex:none}
.tile .th{height:104px;display:flex;align-items:center;justify-content:center}.tile .lb{padding:2px 12px 12px;font-size:14px;line-height:20px;font-weight:500;height:46px;overflow:hidden}
.star{position:absolute;top:6px;right:6px;width:28px;height:28px;color:var(--primary);display:flex;align-items:center;justify-content:center}.ph{position:absolute;left:8px;top:64px;width:44px;height:34px;border-radius:6px;background:#D9E2E8;border:2px solid #fff;display:flex;align-items:center;justify-content:center}
.fab{position:absolute;right:16px;bottom:16px;height:56px;border-radius:16px;background:var(--primary);color:var(--on-primary);display:flex;align-items:center;gap:8px;padding:0 20px 0 16px;font-size:16px;font-weight:500;box-shadow:0 3px 8px rgba(0,0,0,.28)}
.btn{height:48px;border-radius:24px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 24px;font-size:14px;font-weight:500;line-height:20px}.b1{background:var(--primary);color:var(--on-primary)}.b2{background:var(--primary-container);color:var(--on-primary-container)}.b3{border:1.5px solid var(--outline);color:var(--primary);background:var(--surface)}.b4{color:var(--danger)}
.h2s{display:flex;justify-content:space-between;align-items:baseline;padding:10px 16px 6px}.h2s b{font-size:16px;font-weight:500}.h2s span{font-size:12px;color:var(--on-surface-muted)}
.sf{margin:0 16px 8px;height:44px;border:1.5px solid var(--outline);background:var(--surface);border-radius:22px;display:flex;align-items:center;gap:10px;padding:0 14px;color:var(--on-surface-muted);font-size:14px}
.chips{display:flex;gap:8px;padding:0 16px;overflow:hidden;margin-bottom:8px}.chip{flex:none;height:40px;border-radius:20px;border:1.5px solid var(--outline);background:var(--surface);display:flex;align-items:center;padding:0 14px;font-size:14px;line-height:20px;font-weight:500;gap:8px}
.chip.on{background:var(--primary-container);border-color:var(--primary);color:var(--on-primary-container)}.chip.off{border-color:var(--outline-subtle);color:var(--disabled-text);background:var(--surface-variant)}.chip.m{height:48px;padding:0 14px 0 8px}.chip.m.off svg{opacity:.45}
.pick{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 16px}.cell{height:92px;border-radius:12px;background:var(--surface);border:1px solid var(--outline-subtle);display:flex;flex-direction:column;align-items:center;padding-top:6px;font-size:12px;line-height:16px;text-align:center}
.cell span{padding:0 2px;margin-top:2px}.cell.on{background:var(--primary-container);border:2px solid var(--primary);color:var(--on-primary-container);font-weight:500}
.prev{margin:0 16px 4px;height:140px;border-radius:16px;background:var(--surface-variant);display:flex;align-items:center;justify-content:center}
.sticky{position:absolute;left:0;right:0;bottom:0;background:var(--surface);padding:12px 16px;display:flex;gap:12px;border-top:1px solid var(--outline-subtle)}.sticky .b1{flex:1;height:56px;border-radius:28px;font-size:16px}.sticky .b3{height:56px;border-radius:28px}
.num{width:18px;height:18px;border-radius:9px;background:var(--primary);color:#fff;font-size:11px;line-height:18px;text-align:center}
.disp{background:#fff}.disp .box{position:absolute;left:8px;right:8px;display:flex;align-items:center;justify-content:center}
.notice{background:var(--warning-container);border-left:6px solid var(--warning);border-radius:12px;padding:14px 16px;color:var(--on-warning-container);font-size:14px;line-height:20px;width:340px}.notice b{font-size:16px;display:block;margin-bottom:4px}
.spec{background:#fff;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:12px;align-items:flex-start}.spec small{font-size:12px;color:#4A5A66}
table{border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;font-size:13px}td,th{padding:5px 10px;border-bottom:1px solid #E3E8EC;text-align:left}
'''
def sb(dark=True): return '<div class=sb><span>9:41</span><span style="display:flex;gap:6px;align-items:center"><span class=bat></span></span></div>'
def tile(label,base,mods,fav=False,photo=False):
    ph='<div class=ph>'+card('ACC-01',(),24)+'</div>' if photo else ''
    st=f'<div class=star>{ic("star",22)}</div>' if fav else ''
    return f'<div class=tile>{st}<div class=th>{card(base,mods,84)}</div>{ph}<div class=lb>{html.escape(label)}</div></div>'
EX=[("No peanuts, I'm allergic",'DIE-01',('MOD-01','MOD-03')),('Where is the toilet?','BAS-01',('MOD-04',)),('Can my dog come in?','PET-03',()),('Take me to my hotel','TRA-03',())]
def home():
    t=lambda i,**k:tile(EX[i][0],EX[i][1],EX[i][2],**k)
    # a favourite appears only in Favourites; a category with no remaining card is not shown (so Diet & allergies is hidden)
    return (f'<div class=scr>{sb()}<div class=bar><h3>Travel Card</h3><div class=ib>{ic("more")}</div></div>'
     f'<div class=search>{ic("search")}<span>Search cards and symbols</span></div>'
     f'<div class=cat><b>Favourites</b><span>1 card</span></div><div class=favs>{t(0,fav=True)}</div>'
     f'<div class=cat><b>Places &amp; directions</b><span>1 card</span></div><div class=grid>{t(1)}</div>'
     f'<div class=cat><b>Pets</b><span>1 card</span></div><div class=grid>{t(2)}</div>'
     f'<div class=fab>{ic("plus")}New card</div></div>')
def cell(i,n,on=False): return f'<div class="cell{" on" if on else ""}">{card(i,(),52)}<span>{n}</span></div>'
def mchip(i,n,state,num=''):
    return f'<div class="chip m {state}">{card(i,(),32)}{n}{("<span class=num>"+num+"</span>") if num else ""}</div>'
def editor():
    cats=['Diet &amp; allergies','Basics','Food &amp; beverage','Transport']
    chips=''.join(f'<div class="chip{" on" if k==0 else ""}">{c}</div>' for k,c in enumerate(cats))
    cells=[('DIE-01','Peanut',True),('DIE-02','Tree nuts'),('DIE-03','Milk / dairy'),('DIE-04','Gluten / wheat'),('DIE-05','Egg'),('DIE-06','Shellfish'),('DIE-07','Soy'),('DIE-08','Sesame')]
    mods=[('MOD-01','No','on'),('MOD-03','Allergy','on','1'),('MOD-02','Without','off'),('MOD-04','Question','off'),('MOD-05','Please','off')]
    return (f'<div class=scr>{sb()}<div class=bar><div class=ib>{ic("back")}</div><h3>New card</h3></div>'
     f'<div class=prev>{card("DIE-01",("MOD-01","MOD-03"),124)}</div>'
     f'<div class=h2s><b>1  Main symbol</b><span>Peanut</span></div><div class=sf>{ic("search",20)}Search symbols</div><div class=chips>{chips}</div>'
     f'<div class=pick>{"".join(cell(*c) for c in cells)}</div>'
     f'<div class=h2s><b>2  Modifiers</b><span>2 of 2 chosen</span></div><div class=chips>{"".join(mchip(*m) for m in mods)}</div>'
     f'<div class=sticky><div class="btn b3">{ic("camera",20)}Photo</div><div class="btn b1">Save card</div></div></div>')
def disp_nopeanut():
    return f'<div class="scr disp"><div class=box style="top:208px;height:344px">{card("DIE-01",("MOD-01","MOD-03"),344)}</div></div>'
def disp_hotel():
    photo=('<svg width="328" height="388" viewBox="0 0 328 388"><rect width="328" height="388" fill="#D9E2E8"/>'
      '<g transform="rotate(-3 164 194)"><rect x="34" y="62" width="260" height="264" rx="14" fill="#fff"/>'
      '<svg x="112" y="82" width="104" height="104" viewBox="0 0 64 64" stroke-linejoin="round" stroke-linecap="round">'+inner('ACC-01')+'</svg>'
      '<rect x="62" y="208" width="204" height="12" rx="6" fill="#B0BEC5"/><rect x="62" y="236" width="150" height="12" rx="6" fill="#CFD8DC"/><rect x="62" y="264" width="180" height="12" rx="6" fill="#CFD8DC"/><rect x="62" y="292" width="110" height="12" rx="6" fill="#CFD8DC"/></g></svg>')
    return (f'<div class="scr disp"><div style="position:absolute;left:16px;top:16px">{card("TRA-03",(),328)}</div>'
            f'<div style="position:absolute;left:16px;top:356px;width:328px;height:388px;border-radius:16px;overflow:hidden">{photo}</div></div>')
def phone(s,cap): return f'<div><div class=phone>{s}</div><div class=cap>{cap}</div></div>'
def tokens():
    out=''
    for k,(h,p,u) in TOK.items():
        c=f'<span class=pass>{cr(h,TOK[p][0]):.2f}:1 on {p}</span>' if p else 'fill / decorative'
        out+=f'<div class=sw><i style="background:{h}"></i><div><b>{k}</b><br>{h}<br>{c}<br>{u}</div></div>'
    return out
def specimens():
    spec=lambda title,body:f'<div class=spec><small>{title}</small>{body}</div>'
    return ''.join([
     spec('Typography (Roboto, system font)',''.join(f'<div style="font-size:{a}px;line-height:{b}px;font-weight:{w}">{n}</div>' for n,a,b,w in(('Title large 22/28 medium',22,28,500),('Title medium 16/24 medium',16,24,500),('Body 16/24 regular',16,24,400),('Label 14/20 medium',14,20,500),('Caption 12/16 regular',12,16,400)))),
     spec('Buttons (48 dp, 56 dp for the main action)',f'<div class="btn b1">Save card</div><div class="btn b2">Add photo</div><div class="btn b3">{ic("camera",20)}Photo</div><div class="btn b4">Delete card</div>'),
     spec('Modifier chips: No (selected, no number), Allergy (selected, slot 1), available, blocked',f'{mchip("MOD-01","No","on")}{mchip("MOD-03","Allergy","on","1")}{mchip("MOD-04","Question","")}{mchip("MOD-02","Without","off")}'),
     spec('Symbol picker cell: normal and selected',f'<div style="display:flex;gap:8px;width:170px">{cell("FOO-06","Still bottled water").replace("class=\"cell\"","class=cell style=\"width:80px\"")}{cell("FOO-22","Sparkling water",True).replace("class=\"cell on\"","class=\"cell on\" style=\"width:80px\"")}</div>'),
     spec('Search field and add button',f'<div class=search style="width:300px;margin:0">{ic("search")}<span>Search cards and symbols</span></div><div class=fab style="position:static">{ic("plus")}New card</div>'),
     spec('Card tile',f'<div style="display:flex;gap:12px">{tile(EX[1][0],EX[1][1],EX[1][2])}{tile(EX[3][0],EX[3][1],EX[3][2],True,True)}</div>'),
     spec('Category header',f'<div class=cat style="width:320px;padding:0"><b>Places &amp; directions</b><span>1 card</span></div>'),
     spec('Safety notice (first launch and Settings)','<div class=notice><b>A communication aid, not a medical tool</b>Travel Card is a communication aid, not a medical tool. For allergies and health, verify with a local or a professional if possible.</div><div class="btn b1">I understand</div>')])
html_=f'''<!doctype html><meta charset=utf-8><title>Travel Card app mock-ups</title><style>{CSS}</style><div class=wrap>
<h1>Travel Card: app style sheet highlights and 4 mock-ups</h1><p>Working name. Approved by Matthieu on 23/11/2026. Android phone, one light look, display mode always white. Real SVG artwork from assets/symbols. Full style sheet: docs/design/App Style Sheet.md.</p>
<div class=note>Feel: calm and quiet, so the signage-style artwork is the only strong colour. Neutral cool-grey screens, one blue for actions, 16 dp corners, no shadows except the add button, 48 dp minimum targets, the main action at the bottom for one-hand use.</div>
<h2>Colour tokens (contrast measured, WCAG AA needs 4.5:1 for text and 3:1 for controls)</h2><div class=row>{tokens()}</div>
<h2>Components</h2><div class=row>{specimens()}</div>
<h2>Mock-ups (phone, 360 x 760 dp)</h2><div class=phones>
{phone(home(),"<b>1. Home.</b> The three default example cards: the favourite appears only in Favourites, so Diet &amp; allergies is not shown; then Places &amp; directions and Pets, search, add button (it does not hide a card). FA 5.1, 5.4, 5.9, 6. Tap a tile: display mode. Tap New card: editor.")}
{phone(editor(),"<b>2. Card editor.</b> Live preview, symbol picker by category with search, up to 2 modifiers (the others are blocked once 2 are chosen), Photo and Save card at the bottom (the only Save). Label, category and show-label choices sit below, reached by scrolling. FA 5.2, 5.5, 6.")}
{phone(disp_nopeanut(),"<b>3. Display mode, No peanuts, I'm allergic.</b> White, no interface, peanut at 60 % under No, Allergy badge in slot A. Tap anywhere to close. FA 5.5, 5.6, 5.9.")}
{phone(disp_hotel(),"<b>4. Display mode, Take me to my hotel.</b> Symbol card on top (square), placeholder hotel card photo below, not cropped. The photo is an invented placeholder with no real business. FA 5.5.")}
</div></div>'''
open(os.path.join(HERE,'app-mockups.html'),'w',encoding='utf-8').write(html_)
print('ok',len(html_))
