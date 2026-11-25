# Round 5: version A3 = A2 with a smaller question mark (clear gap between the curve and the dot). Builds round5-A3-{icon,foreground,background,monochrome}.svg and logo-concepts-5.html (A2 vs A3, then A3 detail).
# Earlier rounds are not touched (round4-A2-*.svg are only read).
import os,html
HERE=os.path.dirname(os.path.abspath(__file__))
INK='#212121';WHT='#FFFFFF';BL='#1565C0';YEL='#FFC107';ORG='#F57C00'
NS='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" stroke-linejoin="round" stroke-linecap="round"'
def ln(d,col,w): return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}"/>'
# A2 geometry: front card 40 x 62 (A was 44 x 56), corner radius 11, tilt -6 deg. Corner distance from the centre
# sqrt(20^2+31^2)=36.9 minus the rounding gain 11*(sqrt2-1)=4.6 -> about 32.3, inside the 33 dp safe radius.
X,Y,W,H,RX=34,23,40,62,11
BAND=f'M{X+RX} {Y}H{X+W-RX}a{RX} {RX} 0 0 1 {RX} {RX}V{Y+15}H{X}V{Y+RX}a{RX} {RX} 0 0 1 {RX}-{RX}z'
QD='M46 54C46 46 62 46 62 54C62 60 54 60.5 54 64'   # A3: smaller; stem end + round cap reaches y 67, dot top at y 72 -> 5 dp gap
DOTY=Y+7.5
def dots(c): return ''.join(f'<circle cx="{x}" cy="{DOTY}" r="2.3" fill="{c}"/>' for x in(45,54,63))
FG=(f'<rect x="34" y="24" width="40" height="60" rx="11" fill="{BL}" transform="rotate(19 54 54)"/><g transform="rotate(-6 54 54)">'
    f'<rect x="{X}" y="{Y}" width="{W}" height="{H}" rx="{RX}" fill="#FFFFFF"/><path d="{BAND}" fill="{ORG}"/>{dots(WHT)}'+ln(QD,INK,6)+f'<circle cx="54" cy="75.5" r="3.5" fill="{INK}"/></g>')
def mono(c):
    holes=''.join(f'M{x-2.3} {DOTY}a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0-4.6 0z ' for x in(45,54,63))
    return (f'<g transform="rotate(-6 54 54)"><rect x="{X}" y="{Y}" width="{W}" height="{H}" rx="{RX}" fill="none" stroke="{c}" stroke-width="5"/>'
            f'<path fill-rule="evenodd" fill="{c}" d="{BAND} {holes}"/>'+ln(QD,c,6)+f'<circle cx="54" cy="75.5" r="3.5" fill="{c}"/></g>')
def svg(x): return f'<svg {NS}>{x}</svg>'
LAYERS={'icon':svg(f'<rect width="108" height="108" fill="{YEL}"/>'+FG),'foreground':svg(FG),'background':svg(f'<rect width="108" height="108" fill="{YEL}"/>'),'monochrome':svg(mono(INK))}
for suf,s in LAYERS.items(): open(f'{HERE}/round5-A3-{suf}.svg','w',encoding='utf-8').write(s+'\n')
ICON={'A2':open(f'{HERE}/round4-A2-icon.svg',encoding='utf-8').read().strip(),'A3':LAYERS['icon']}
MONO={'A2':open(f'{HERE}/round4-A2-monochrome.svg',encoding='utf-8').read().strip(),'A3':LAYERS['monochrome']}
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
    me=themed(dark,64) if th else masked(ICON['A3'],64)
    items=''.join(f'<div class=app><div class=ic style="width:64px;height:64px;border-radius:28%;background:{ph}"></div><span>&nbsp;</span></div>' for _ in range(3))
    return f'<div class=wall style="background:{wall};color:{txt}"><div class=apps>{items}<div class=app>{me}<span>{html.escape(name)}</span></div></div></div>'
CSS='''*{box-sizing:border-box}body{margin:0;background:#EEF2F5;color:#212121;font:16px/24px Roboto,"Segoe UI",system-ui,sans-serif}.wrap{max-width:1280px;margin:0 auto;padding:28px 24px 60px}h1{font-size:28px;margin:0 0 4px}h2{font-size:22px;margin:44px 0 6px;border-bottom:3px solid #212121;padding-bottom:4px}
.note{background:#fff;border-radius:12px;padding:12px 16px;max-width:1000px;font-size:14px;line-height:20px}.row{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;margin-top:14px}.ic{position:relative;overflow:hidden;flex:none}.cap{font-size:12px;line-height:16px;color:#4A5A66;margin-top:6px;max-width:260px}
.wall{border-radius:16px;padding:16px;width:380px}.apps{display:flex;gap:14px}.app{width:64px;text-align:center;font-size:12px;line-height:16px}.app span{display:block;margin-top:4px;white-space:nowrap;margin-left:-10px;margin-right:-10px}
.sm{display:flex;gap:18px;align-items:center;background:#fff;padding:12px 16px;border-radius:12px}.ov{display:flex;gap:18px;align-items:center;flex-wrap:wrap}.ov small{font-size:12px;color:#4A5A66;display:block}'''
h=[f'<!doctype html><meta charset=utf-8><title>Travel Card logo, round 5</title><style>{CSS}</style><div class=wrap>',
 '<h1>App logo, round 5: A3, a smaller question mark</h1><p>Matthieu said A2 is almost right: the question mark is made smaller so the dot and the curve never touch. A3 approved by Matthieu as the app logo on 25/11/2026. "Travel Card" is the working name; <b>Askcard</b> and <b>Showmark</b> remain unchecked placeholder names (no trademark, store or domain check done).</p>',
 '<div class=note><b>A3 against A2.</b> Only the question mark changed. Curve stroke 6 dp (A2: 7.5), curve width 22 dp outside to outside (A2: 27.5), dot radius 3.5 dp (A2: 4.3); the whole mark is 34 dp tall (A2: 38), so about 80 % as wide and 89 % as tall (about 82 % of the stroke and dot). The <b>gap between the end of the stem (with its round cap) and the dot is 5 dp</b> on the 108 dp canvas (A2: the two touched): about 4.4 px at 96 dp, 2.2 px at 48 dp and 1.5 px at 32 dp. The mark is re-centred under the header (its middle sits 0.5 dp from the middle of the white area). Everything else is exactly A2: white card 40 x 62 dp, radius 11, tilt -6 degrees, blue card 40 x 60 dp at 19 degrees, yellow background, orange header with three punched dots. The monochrome layer uses the same shapes, so it has the same gap.</div>']
h.append('<h2>A2 and A3 side by side at 96, 48 and 32 dp</h2><div class=ov>'+''.join(f'<div>{masked(ICON[k],96)}<small>{k}</small></div>' for k in ICON)+'<div style="width:30px"></div>'+''.join(masked(ICON[k],48) for k in ICON)+''.join(masked(ICON[k],32) for k in ICON)+'<div style="width:30px"></div>'+''.join(f'<div>{masked(ICON[k],220,"sq")}<small>{k} large</small></div>' for k in ICON)+'</div>')
h.append('<h2>A3 in detail</h2>')
h.append(f'<div class=row><div>{masked(ICON["A3"],220,"ci",True)}<div class=cap>Circle mask with guides (dashed circle = 66 dp safe zone, dashed square = 72 dp visible area)</div></div><div>{masked(ICON["A3"],220,"sq",True)}<div class=cap>Squircle mask with guides</div></div><div>{masked(ICON["A3"],220,"ci")}<div class=cap>Circle mask, no guides</div></div><div>{masked(MONO["A3"],220,"sq")}<div class=cap>Monochrome layer (alpha only; the system tints it)</div></div></div>')
h.append(f'<div class=row><div>{launcher("Askcard",False)}<div class=cap>Light wallpaper, 64 dp</div></div><div>{launcher("Askcard",True)}<div class=cap>Dark wallpaper</div></div><div>{launcher("Askcard",False,True)}<div class=cap>Themed icon, light</div></div><div>{launcher("Askcard",True,True)}<div class=cap>Themed icon, dark</div></div></div>')
h.append(f'<div class=row><div class=sm>{masked(ICON["A3"],48,"sq")}{masked(ICON["A3"],32,"sq")}{masked(ICON["A3"],48,"ci")}{masked(ICON["A3"],32,"ci")}{masked(MONO["A3"],48,"sq")}{masked(MONO["A3"],32,"sq")}<span style="font-size:12px;color:#4A5A66">48 and 32 dp: squircle, circle, monochrome</span></div></div></div>')
open(f'{HERE}/logo-concepts-5.html','w',encoding='utf-8').write('\n'.join(h))
print('ok')
