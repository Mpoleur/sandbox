# Round 4: version A2 = round 3 version A with a taller, slightly narrower card. Builds round4-A2-{icon,foreground,background,monochrome}.svg
# and logo-concepts-4.html (A vs A2, then A2 detail). Earlier rounds are not touched (round3-A-icon.svg is only read).
import os,html
HERE=os.path.dirname(os.path.abspath(__file__))
INK='#212121';WHT='#FFFFFF';BL='#1565C0';YEL='#FFC107';ORG='#F57C00'
NS='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" stroke-linejoin="round" stroke-linecap="round"'
def ln(d,col,w): return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}"/>'
# A2 geometry: front card 40 x 62 (A was 44 x 56), corner radius 11, tilt -6 deg. Corner distance from the centre
# sqrt(20^2+31^2)=36.9 minus the rounding gain 11*(sqrt2-1)=4.6 -> about 32.3, inside the 33 dp safe radius.
X,Y,W,H,RX=34,23,40,62,11
BAND=f'M{X+RX} {Y}H{X+W-RX}a{RX} {RX} 0 0 1 {RX} {RX}V{Y+15}H{X}V{Y+RX}a{RX} {RX} 0 0 1 {RX}-{RX}z'
QD='M44 56C44 44 64 44 64 56C64 64 54 65 54 70'
DOTY=Y+7.5
def dots(c): return ''.join(f'<circle cx="{x}" cy="{DOTY}" r="2.3" fill="{c}"/>' for x in(45,54,63))
FG=(f'<rect x="34" y="24" width="40" height="60" rx="11" fill="{BL}" transform="rotate(19 54 54)"/><g transform="rotate(-6 54 54)">'
    f'<rect x="{X}" y="{Y}" width="{W}" height="{H}" rx="{RX}" fill="#FFFFFF"/><path d="{BAND}" fill="{ORG}"/>{dots(WHT)}'+ln(QD,INK,7.5)+f'<circle cx="54" cy="77" r="4.3" fill="{INK}"/></g>')
def mono(c):
    holes=''.join(f'M{x-2.3} {DOTY}a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0-4.6 0z ' for x in(45,54,63))
    return (f'<g transform="rotate(-6 54 54)"><rect x="{X}" y="{Y}" width="{W}" height="{H}" rx="{RX}" fill="none" stroke="{c}" stroke-width="5"/>'
            f'<path fill-rule="evenodd" fill="{c}" d="{BAND} {holes}"/>'+ln(QD,c,7.5)+f'<circle cx="54" cy="77" r="4.3" fill="{c}"/></g>')
def svg(x): return f'<svg {NS}>{x}</svg>'
LAYERS={'icon':svg(f'<rect width="108" height="108" fill="{YEL}"/>'+FG),'foreground':svg(FG),'background':svg(f'<rect width="108" height="108" fill="{YEL}"/>'),'monochrome':svg(mono(INK))}
for suf,s in LAYERS.items(): open(f'{HERE}/round4-A2-{suf}.svg','w',encoding='utf-8').write(s+'\n')
ICON={'A':open(f'{HERE}/round3-A-icon.svg',encoding='utf-8').read().strip(),'A2':LAYERS['icon']}
MONO={'A':open(f'{HERE}/round3-A-monochrome.svg',encoding='utf-8').read().strip(),'A2':LAYERS['monochrome']}
def sz(s,w): return s.replace('<svg ',f'<svg width="{w}" height="{w}" ',1)
GUIDE='<svg width="{w}" height="{w}" viewBox="0 0 108 108" style="position:absolute;left:0;top:0" fill="none" stroke="#000" stroke-width=".7" stroke-dasharray="2 2"><circle cx="54" cy="54" r="33"/><rect x="18" y="18" width="72" height="72"/></svg>'
def masked(s,w,shape='sq',guide=False):
    r={'sq':'28%','ci':'50%'}[shape]
    return f'<div class=ic style="width:{w}px;height:{w}px;border-radius:{r}">{sz(s,w)}{GUIDE.format(w=w) if guide else ""}</div>'
def themed(dark,w):
    b,f=('#2B3A4A','#CFE3F8') if dark else ('#DCEBFA','#0B3D7A')
    return f'<div class=ic style="width:{w}px;height:{w}px;border-radius:28%">'+sz(svg(f'<rect width="108" height="108" fill="{b}"/>'+mono(f)),w)+'</div>'
def launcher(name,dark,th=False):
    wall='#1B2630' if dark else '#DDE7F0'; txt='#EEF3F7' if dark else '#1B2630'; ph='#4A5A66' if dark else '#B7C4CF'
    me=themed(dark,64) if th else masked(ICON['A2'],64)
    items=''.join(f'<div class=app><div class=ic style="width:64px;height:64px;border-radius:28%;background:{ph}"></div><span>&nbsp;</span></div>' for _ in range(3))
    return f'<div class=wall style="background:{wall};color:{txt}"><div class=apps>{items}<div class=app>{me}<span>{html.escape(name)}</span></div></div></div>'
CSS='''*{box-sizing:border-box}body{margin:0;background:#EEF2F5;color:#212121;font:16px/24px Roboto,"Segoe UI",system-ui,sans-serif}.wrap{max-width:1280px;margin:0 auto;padding:28px 24px 60px}h1{font-size:28px;margin:0 0 4px}h2{font-size:22px;margin:44px 0 6px;border-bottom:3px solid #212121;padding-bottom:4px}
.note{background:#fff;border-radius:12px;padding:12px 16px;max-width:1000px;font-size:14px;line-height:20px}.row{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;margin-top:14px}.ic{position:relative;overflow:hidden;flex:none}.cap{font-size:12px;line-height:16px;color:#4A5A66;margin-top:6px;max-width:260px}
.wall{border-radius:16px;padding:16px;width:380px}.apps{display:flex;gap:14px}.app{width:64px;text-align:center;font-size:12px;line-height:16px}.app span{display:block;margin-top:4px;white-space:nowrap;margin-left:-10px;margin-right:-10px}
.sm{display:flex;gap:18px;align-items:center;background:#fff;padding:12px 16px;border-radius:12px}.ov{display:flex;gap:18px;align-items:center;flex-wrap:wrap}.ov small{font-size:12px;color:#4A5A66;display:block}'''
h=[f'<!doctype html><meta charset=utf-8><title>Travel Card logo, round 4</title><style>{CSS}</style><div class=wrap>',
 '<h1>App logo, round 4: A2, a taller card</h1><p>Matthieu chose round 3 version A and asked for a taller card. Draft, not validated. "Travel Card" is the working name; <b>Askcard</b> and <b>Showmark</b> remain unchecked placeholder names (no trademark, store or domain check done).</p>',
 '<div class=note><b>A2 sizes.</b> White card <b>40 x 62 dp</b> (A: 44 x 56), corner radius 11 (A: 9), so the proportion goes from 1 : 1.27 to 1 : 1.55; 9 % narrower, 11 % taller, area about 1 % larger. Tilt stays -6 degrees. Because the safe zone is a circle, the tilt does not change how far the corners sit from the centre; what keeps the card inside is its half-diagonal (36.9 dp) minus the rounding of the corners (4.6 dp), which leaves the corners about 32.3 dp from the centre, inside the 33 dp safe radius. The blue card behind is 40 x 60 dp, tilted 19 degrees (A: 42 x 54, 16 degrees), tilted more so that it still shows beside the narrower white card. The header band is 15 dp as before with three punched dots; the question mark is re-centred in the taller white area under the header. Trade-off: the white card cannot be taller or wider than this without its corners leaving the safe circle (the blue card behind has its corners about 31.5 dp from the centre).</div>']
h.append('<h2>A and A2 side by side at 96, 48 and 32 dp</h2><div class=ov>'+''.join(f'<div>{masked(ICON[k],96)}<small>{k}</small></div>' for k in ICON)+'<div style="width:30px"></div>'+''.join(masked(ICON[k],48) for k in ICON)+''.join(masked(ICON[k],32) for k in ICON)+'<div style="width:30px"></div>'+''.join(f'<div>{masked(ICON[k],220,"sq")}<small>{k} large</small></div>' for k in ICON)+'</div>')
h.append('<h2>A2 in detail</h2>')
h.append(f'<div class=row><div>{masked(ICON["A2"],220,"ci",True)}<div class=cap>Circle mask with guides (dashed circle = 66 dp safe zone, dashed square = 72 dp visible area)</div></div><div>{masked(ICON["A2"],220,"sq",True)}<div class=cap>Squircle mask with guides</div></div><div>{masked(ICON["A2"],220,"ci")}<div class=cap>Circle mask, no guides</div></div><div>{masked(MONO["A2"],220,"sq")}<div class=cap>Monochrome layer (alpha only; the system tints it)</div></div></div>')
h.append(f'<div class=row><div>{launcher("Askcard",False)}<div class=cap>Light wallpaper, 64 dp</div></div><div>{launcher("Askcard",True)}<div class=cap>Dark wallpaper</div></div><div>{launcher("Askcard",False,True)}<div class=cap>Themed icon, light</div></div><div>{launcher("Askcard",True,True)}<div class=cap>Themed icon, dark</div></div></div>')
h.append(f'<div class=row><div class=sm>{masked(ICON["A2"],48,"sq")}{masked(ICON["A2"],32,"sq")}{masked(ICON["A2"],48,"ci")}{masked(ICON["A2"],32,"ci")}{masked(MONO["A2"],48,"sq")}{masked(MONO["A2"],32,"sq")}<span style="font-size:12px;color:#4A5A66">48 and 32 dp: squircle, circle, monochrome</span></div></div></div>')
open(f'{HERE}/logo-concepts-4.html','w',encoding='utf-8').write('\n'.join(h))
print('ok')
