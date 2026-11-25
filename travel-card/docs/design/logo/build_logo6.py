# Round 6: L6 = A3's card (smaller) in front of a round Earth with two small planes and dotted trails. Builds round6-L6-{icon,foreground,background,monochrome}.svg
# and logo-concepts-6.html. A3 files (round5-A3-*.svg) are only read. Name shown: "Travel Cards".
import os,html
HERE=os.path.dirname(os.path.abspath(__file__))
INK='#212121';WHT='#FFFFFF';YEL='#FFC107';ORG='#F57C00';OCEAN='#1E88E5';LAND='#2E7D32'
NS='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" stroke-linejoin="round" stroke-linecap="round"'
def ln(d,col,w): return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}"/>'
PLANE='M32 2c3 0 4 3 4 6v14l24 15v6L36 36v12l7 5v5l-11-3-11 3v-5l7-5V36L4 43v-6l24-15V8c0-3 1-6 4-6z'   # generic top-view plane, nose up
def plane(x,y,ang,s,c): return f'<path transform="translate({x} {y}) rotate({ang}) scale({s}) translate(-32 -32)" d="{PLANE}" fill="{c}"/>'
def trail(pts,c): return ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>' for x,y,r in pts)
# Earth behind the card: centre (46,60), radius 23 (stays within the 33 dp safe radius); simplified continents, no borders
GX,GY,GR=46,60,23
LA='M29 50C31 44 40 43 41 48C42 52 38 55 35 56C31 57 27 54 29 50z'
LB='M38 73C44 69 52 70 56 74C58 78 52 82 46 81C40 80 35 76 38 72z'
P1=(30,62,10); T1=[(31,69.5,1.6),(33,74.5,1.3),(36.5,78.5,1.0)]      # plane over the left of the Earth, heading up
P2=(50,78,82); T2=[(43.5,78.5,1.6),(38.3,77.6,1.3),(33.8,75.4,1.0)]      # plane along the bottom, heading right
X,Y,W,H,RX=34,23,40,62,11   # A3 card geometry, shown at 80 %, shifted up and right
BAND=f'M{X+RX} {Y}H{X+W-RX}a{RX} {RX} 0 0 1 {RX} {RX}V{Y+15}H{X}V{Y+RX}a{RX} {RX} 0 0 1 {RX}-{RX}z'
QD='M46 54C46 46 62 46 62 54C62 60 54 60.5 54 64'
CARDT='translate(57 49) scale(.8) translate(-54 -54) rotate(-6 54 54)'
def card_fg(): return (f'<g transform="{CARDT}"><rect x="{X}" y="{Y}" width="{W}" height="{H}" rx="{RX}" fill="#FFFFFF"/><path d="{BAND}" fill="{ORG}"/>'
    +''.join(f'<circle cx="{x}" cy="{Y+7.5}" r="2.3" fill="{WHT}"/>' for x in(45,54,63))+ln(QD,INK,7)+f'<circle cx="54" cy="75.5" r="3.8" fill="{INK}"/></g>')
FG=(f'<circle cx="{GX}" cy="{GY}" r="{GR}" fill="{OCEAN}"/><path d="{LA}" fill="{LAND}"/><path d="{LB}" fill="{LAND}"/>'+trail(T1+T2,WHT)+plane(*P1[:2],P1[2],.2,WHT)+plane(P2[0],P2[1],P2[2],.2,WHT)+card_fg())
def mono(c):   # alpha-only, simplified: visible arc of the Earth, one continent, one plane, then the card outline
    holes=''.join(f'M{x-2.3} {Y+7.5}a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0-4.6 0z ' for x in(45,54,63))
    arc=f'M44 37.1A{GR} {GR} 0 1 0 66.2 71'
    return (ln(arc,c,3.6)+f'<path d="{LA}" fill="{c}"/>'+plane(30,63,10,.24,c)
        +f'<g transform="{CARDT}"><rect x="{X}" y="{Y}" width="{W}" height="{H}" rx="{RX}" fill="none" stroke="{c}" stroke-width="5.5"/><path fill-rule="evenodd" fill="{c}" d="{BAND} {holes}"/>'+ln(QD,c,7)+f'<circle cx="54" cy="75.5" r="3.8" fill="{c}"/></g>')
def svg(x): return f'<svg {NS}>{x}</svg>'
LAY={'icon':svg(f'<rect width="108" height="108" fill="{YEL}"/>'+FG),'foreground':svg(FG),'background':svg(f'<rect width="108" height="108" fill="{YEL}"/>'),'monochrome':svg(mono(INK))}
for suf,s in LAY.items(): open(f'{HERE}/round6-L6-{suf}.svg','w',encoding='utf-8').write(s+'\n')
ICON={'A3':open(f'{HERE}/round5-A3-icon.svg',encoding='utf-8').read().strip(),'L6':LAY['icon']}
def sz(s,w): return s.replace('<svg ',f'<svg width="{w}" height="{w}" ',1)
GUIDE='<svg width="{w}" height="{w}" viewBox="0 0 108 108" style="position:absolute;left:0;top:0" fill="none" stroke="#000" stroke-width=".7" stroke-dasharray="2 2"><circle cx="54" cy="54" r="33"/><rect x="18" y="18" width="72" height="72"/></svg>'
def masked(s,w,shape='sq',guide=False):
    r={'sq':'28%','ci':'50%'}[shape]; return f'<div class=ic style="width:{w}px;height:{w}px;border-radius:{r}">{sz(s,w)}{GUIDE.format(w=w) if guide else ""}</div>'
def themed(dark,w):
    b,f=('#2B3A4A','#CFE3F8') if dark else ('#DCEBFA','#0B3D7A')
    return f'<div class=ic style="width:{w}px;height:{w}px;border-radius:28%">'+sz(svg(f'<rect width="108" height="108" fill="{b}"/>'+mono(f)),w)+'</div>'
def launcher(name,dark,th=False,icon='L6'):
    wall='#1B2630' if dark else '#DDE7F0'; txt='#EEF3F7' if dark else '#1B2630'; ph='#4A5A66' if dark else '#B7C4CF'
    me=themed(dark,64) if th else masked(ICON[icon],64)
    items=''.join(f'<div class=app><div class=ic style="width:64px;height:64px;border-radius:28%;background:{ph}"></div><span>&nbsp;</span></div>' for _ in range(3))
    return f'<div class=wall style="background:{wall};color:{txt}"><div class=apps>{items}<div class=app>{me}<span>{html.escape(name)}</span></div></div></div>'
def header(icon):   # D4 header: navy, rounded bottom edge, pill search
    return (f'<div style="width:360px;background:#0B3D7A;color:#fff;border-radius:0 0 28px 28px;padding:12px 0 14px"><div style="display:flex;align-items:center;gap:12px;height:56px;padding:0 4px 0 16px">'
      f'<span class=ic style="width:44px;height:44px;border-radius:24%;display:block">{sz(ICON[icon],44)}</span><span style="font-size:22px;line-height:28px;font-weight:500;flex:1">Travel Cards</span><span style="width:48px;text-align:center;font-size:22px">&#8942;</span></div>'
      f'<div style="margin:0 16px;height:52px;background:#fff;border-radius:26px;display:flex;align-items:center;padding:0 20px;color:#4A5A66;font-size:16px">Search cards and symbols</div></div>')
CSS='''*{box-sizing:border-box}body{margin:0;background:#EEF2F5;color:#212121;font:16px/24px Roboto,"Segoe UI",system-ui,sans-serif}.wrap{max-width:1280px;margin:0 auto;padding:28px 24px 60px}h1{font-size:28px;margin:0 0 4px}h2{font-size:22px;margin:40px 0 6px;border-bottom:3px solid #212121;padding-bottom:4px}
.note{background:#fff;border-radius:12px;padding:12px 16px;max-width:1000px;font-size:14px;line-height:20px}.row{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;margin-top:14px}.ic{position:relative;overflow:hidden;flex:none}.cap{font-size:12px;line-height:16px;color:#4A5A66;margin-top:6px;max-width:260px}
.wall{border-radius:16px;padding:16px;width:380px}.apps{display:flex;gap:14px}.app{width:64px;text-align:center;font-size:12px;line-height:16px}.app span{display:block;margin-top:4px;white-space:nowrap;margin-left:-14px;margin-right:-14px}
.sm{display:flex;gap:18px;align-items:center;background:#fff;padding:12px 16px;border-radius:12px}.ov{display:flex;gap:18px;align-items:center;flex-wrap:wrap}.ov small{font-size:12px;color:#4A5A66;display:block}'''
h=[f'<!doctype html><meta charset=utf-8><title>Travel Cards logo L6</title><style>{CSS}</style><div class=wrap>',
 '<h1>App logo, round 6: L6 with an Earth and planes</h1><p>Draft, not validated. A3 stays the approved fallback. The app is now called <b>Travel Cards</b> (name still needs trademark, store and domain checks; no check done here).</p>',
 '<div class=note><b>What L6 is.</b> A3\'s white card, orange header, three dots and question mark, and the yellow background, with the blue card replaced by a round Earth: blue oceans, two simplified green continents (not a map, no borders or lines), and two small white planes with a trail of three white dots each. <b>Trade-offs.</b> To keep everything inside the 66 dp safe circle and still leave the Earth visible, the card is shown at 80 % of A3\'s size (32 x 50 dp instead of 40 x 62) and shifted up and right; its question mark gets a slightly heavier stroke and the gap between curve and dot is 4 dp (A3: 5), about 1.2 px at 32 dp. The Earth is mostly behind the card, so about half of it shows (left and bottom). The planes are about 13 dp and the trail dots 2 to 3 dp, so at 32 dp the planes are small marks and the dots almost vanish; at 48 dp they read. The monochrome layer is simplified: an arc of the Earth, one continent, one plane and the card outline (no trail dots, one continent and one plane dropped, so it stays readable at 32 dp). The plane is a generic top-view silhouette, drawn here, not an airline mark. Files: round6-L6-{icon,foreground,background,monochrome}.svg.</div>']
h.append('<h2>A3 and L6 side by side at 96, 48 and 32 dp</h2><div class=ov>'+''.join(f'<div>{masked(ICON[k],96)}<small>{k}</small></div>' for k in ICON)+'<div style="width:24px"></div>'+''.join(masked(ICON[k],48) for k in ICON)+''.join(masked(ICON[k],32) for k in ICON)+'<div style="width:24px"></div>'+''.join(f'<div>{masked(ICON[k],220)}<small>{k} large</small></div>' for k in ICON)+'</div>')
h.append('<h2>L6 with the D4 Home header</h2><div class=row><div>'+header('L6')+'<div class=cap>D4 header (navy, rounded bottom, pill search) with L6</div></div><div>'+header('A3')+'<div class=cap>Same header with A3, for comparison</div></div></div>')
h.append('<h2>L6 in detail</h2>')
h.append(f'<div class=row><div>{masked(ICON["L6"],220,"ci",True)}<div class=cap>Circle mask with guides (dashed circle = 66 dp safe zone, dashed square = 72 dp visible area)</div></div><div>{masked(ICON["L6"],220,"sq",True)}<div class=cap>Squircle mask with guides</div></div><div>{masked(LAY["monochrome"],220,"sq")}<div class=cap>Monochrome layer (alpha only)</div></div></div>')
h.append(f'<div class=row><div>{launcher("Travel Cards",False)}<div class=cap>Light wallpaper, 64 dp</div></div><div>{launcher("Travel Cards",True)}<div class=cap>Dark wallpaper</div></div><div>{launcher("Travel Cards",False,True)}<div class=cap>Themed icon, light</div></div><div>{launcher("Travel Cards",True,True)}<div class=cap>Themed icon, dark</div></div></div>')
h.append(f'<div class=row><div class=sm>{masked(ICON["L6"],48,"sq")}{masked(ICON["L6"],32,"sq")}{masked(ICON["L6"],48,"ci")}{masked(ICON["L6"],32,"ci")}{masked(LAY["monochrome"],48,"sq")}{masked(LAY["monochrome"],32,"sq")}<span style="font-size:12px;color:#4A5A66">48 and 32 dp: squircle, circle, monochrome</span></div></div></div>')
open(f'{HERE}/logo-concepts-6.html','w',encoding='utf-8').write('\n'.join(h))
print('ok')
