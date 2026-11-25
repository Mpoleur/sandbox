# Round 3: refinement of round 2 variation 3 (info card). A plain, B with MOD-07 Yes/OK, C with MOD-03 Allergy (real artwork, read-only).
# Builds round3-{A,B,C}-{icon,foreground,background,monochrome}.svg and logo-concepts-3.html. Earlier rounds are not touched.
# Adaptive icon: 108 dp layers, 66 dp safe circle (centre 54,54), circle masks cut at about r 36.
import os,re,html
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
INK='#212121';WHT='#FFFFFF';BL='#1565C0';YEL='#FFC107';ORG='#F57C00'
NS='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" stroke-linejoin="round" stroke-linecap="round"'
def ln(d,col,w): return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}"/>'
def inner(i): return re.sub(r'^<svg[^>]*>|</svg>\s*$','',open(f'{ROOT}/assets/symbols/{i}.svg',encoding='utf-8').read().strip())
# geometry: front card 44 x 56, no tail; back card fanned; both corners stay within about r 32 of the centre
FRONT='<rect x="32" y="26" width="44" height="56" rx="9" fill="#FFFFFF"/>'
BAND='M41 26H67a9 9 0 0 1 9 9V41H32V35a9 9 0 0 1 9-9z'
QD='M43 56C43 45 65 45 65 56C65 63 54 64 54 69'
def dots(c): return ''.join(f'<circle cx="{x}" cy="33.5" r="2.3" fill="{c}"/>' for x in(44,54,64))
def card_fg(dx):
    return (f'<rect x="33" y="27" width="42" height="54" rx="9" fill="{BL}" transform="rotate(16 54 54)"/><g transform="rotate(-6 54 54)">{FRONT}'
            f'<path d="{BAND}" fill="{ORG}"/>{dots(WHT)}<g transform="translate({dx} 0)">'+ln(QD,INK,7.5)+f'<circle cx="54" cy="76" r="4.3" fill="{INK}"/></g></g>')
BX,BY,BR=40.5,70,13.5   # badge centre and radius on the 108 canvas (bottom left of the card)
def badge(i): s=2*BR*64/57; return f'<svg x="{BX-s/2:.2f}" y="{BY-s/2:.2f}" width="{s:.2f}" height="{s:.2f}" viewBox="0 0 64 64" stroke-linejoin="round" stroke-linecap="round">{inner(i)}</svg>'
CIRC=f'M{BX-BR} {BY}a{BR} {BR} 0 1 0 {2*BR} 0a{BR} {BR} 0 1 0 {-2*BR} 0z'
OPEN='M48.4 82H67a9 9 0 0 0 9-9V35a9 9 0 0 0-9-9H41a9 9 0 0 0-9 9V53.5'   # card outline with a gap where the badge sits
def mono_card(dx,c,gap=False):
    outline=ln(OPEN,c,5) if gap else f'<rect x="32" y="26" width="44" height="56" rx="9" fill="none" stroke="{c}" stroke-width="5"/>'
    return (f'<g transform="rotate(-6 54 54)">{outline}'
            f'<path fill-rule="evenodd" fill="{c}" d="{BAND} M41.7 33.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0-4.6 0z M51.7 33.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0-4.6 0z M61.7 33.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0-4.6 0z"/>'
            f'<g transform="translate({dx} 0)">'+ln(QD,c,7.5)+f'<circle cx="54" cy="76" r="4.3" fill="{c}"/></g></g>')
# solid disc with a hole (even-odd), so the monochrome badge is one alpha shape
CHECK=f'M{BX-9.75} {BY+1.3}L{BX-6} {BY-2.5}L{BX-2.6} {BY+.9}L{BX+5.3} {BY-7.2}L{BX+9.1} {BY-3.4}L{BX-2.6} {BY+8.5}z'
FORKSPOON='M18 13h3v10a3 3 0 0 0 6 0V13h3v11a6 6 0 0 1-4.5 5.8V50h-3V29.8A6 6 0 0 1 18 24z M22.5 13h3v12h-3z M35 23a6 9.5 0 1 0 12 0a6 9.5 0 1 0-12 0z M39.5 32h3v18h-3z'
V={
 'A':dict(label='A. Plain',fg=card_fg(0),mono=lambda c:mono_card(0,c)),
 'B':dict(label='B. With Yes / OK (MOD-07)',fg=card_fg(3.5)+badge('MOD-07'),mono=lambda c:mono_card(3.5,c,True)+f'<path fill-rule="evenodd" fill="{c}" d="{CIRC} {CHECK}"/>'),
 'C':dict(label='C. With Allergy (MOD-03)',fg=card_fg(3.5)+badge('MOD-03'),mono=lambda c:mono_card(3.5,c,True)+f'<g transform="translate({BX-32*.474:.2f} {BY-32*.474:.2f}) scale(.474)"><path fill-rule="evenodd" fill="{c}" d="M3.5 32a28.5 28.5 0 1 0 57 0a28.5 28.5 0 1 0-57 0z {FORKSPOON}"/></g>'),
}
for k in V: V[k]['bg']=YEL
def svg(x): return f'<svg {NS}>{x}</svg>'
def icon(k): return svg(f'<rect width="108" height="108" fill="{V[k]["bg"]}"/>'+V[k]['fg'])
def fgf(k): return svg(V[k]['fg'])
def bgf(k): return svg(f'<rect width="108" height="108" fill="{V[k]["bg"]}"/>')
def mono(k,c=INK): return svg(V[k]['mono'](c))
for k in V:
    for suf,fn in(('icon',icon),('foreground',fgf),('background',bgf),('monochrome',mono)):
        open(f'{HERE}/round3-{k}-{suf}.svg','w',encoding='utf-8').write(fn(k)+'\n')
def sz(s,w): return s.replace('<svg ',f'<svg width="{w}" height="{w}" ',1)
GUIDE='<svg width="{w}" height="{w}" viewBox="0 0 108 108" style="position:absolute;left:0;top:0" fill="none" stroke="#000" stroke-width=".7" stroke-dasharray="2 2"><circle cx="54" cy="54" r="33"/><rect x="18" y="18" width="72" height="72"/></svg>'
def masked(inner_,w,shape='sq',guide=False):
    r={'sq':'28%','ci':'50%'}[shape]
    return f'<div class=ic style="width:{w}px;height:{w}px;border-radius:{r}">{sz(inner_,w)}{GUIDE.format(w=w) if guide else ""}</div>'
def themed(k,dark,w):
    b,f=('#2B3A4A','#CFE3F8') if dark else ('#DCEBFA','#0B3D7A')
    return f'<div class=ic style="width:{w}px;height:{w}px;border-radius:28%">'+sz(svg(f'<rect width="108" height="108" fill="{b}"/>'+V[k]['mono'](f)),w)+'</div>'
def launcher(k,name,dark,th=False):
    wall='#1B2630' if dark else '#DDE7F0'; txt='#EEF3F7' if dark else '#1B2630'; ph='#4A5A66' if dark else '#B7C4CF'
    me=themed(k,dark,64) if th else masked(icon(k),64)
    items=''.join(f'<div class=app><div class=ic style="width:64px;height:64px;border-radius:28%;background:{ph}"></div><span>&nbsp;</span></div>' for _ in range(3))
    return f'<div class=wall style="background:{wall};color:{txt}"><div class=apps>{items}<div class=app>{me}<span>{html.escape(name)}</span></div></div></div>'
old=open(f'{HERE}/round2-3-icon.svg',encoding='utf-8').read().strip()
CSS='''*{box-sizing:border-box}body{margin:0;background:#EEF2F5;color:#212121;font:16px/24px Roboto,"Segoe UI",system-ui,sans-serif}.wrap{max-width:1280px;margin:0 auto;padding:28px 24px 60px}h1{font-size:28px;margin:0 0 4px}h2{font-size:22px;margin:44px 0 6px;border-bottom:3px solid #212121;padding-bottom:4px}
.note{background:#fff;border-radius:12px;padding:12px 16px;max-width:1000px;font-size:14px;line-height:20px}.row{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;margin-top:14px}.ic{position:relative;overflow:hidden;flex:none}.cap{font-size:12px;line-height:16px;color:#4A5A66;margin-top:6px;max-width:260px}
.wall{border-radius:16px;padding:16px;width:380px}.apps{display:flex;gap:14px}.app{width:64px;text-align:center;font-size:12px;line-height:16px}.app span{display:block;margin-top:4px;white-space:nowrap;margin-left:-10px;margin-right:-10px}
.sm{display:flex;gap:18px;align-items:center;background:#fff;padding:12px 16px;border-radius:12px}.ov{display:flex;gap:18px;align-items:center;flex-wrap:wrap}.ov small{font-size:12px;color:#4A5A66}'''
h=[f'<!doctype html><meta charset=utf-8><title>Travel Card logo, round 3</title><style>{CSS}</style><div class=wrap>',
 '<h1>App logo, round 3: the info card, refined</h1><p>Round 2 variation 3, with a bigger card and no speech tail, in three versions. Draft, not validated. "Travel Card" is the working name; <b>Askcard</b> and <b>Showmark</b> stay as unchecked placeholder names, and no name may be assumed free (trademark, store and domain checks are still needed).</p>',
 '<div class=note><b>What changed.</b> (1) The white card is bigger: 44 x 56 dp instead of 34 x 52 dp, about 35 % more area and 29 % wider, so it fills the safe zone (its rounded corners sit about 32 dp from the centre, inside the 33 dp safe radius, so a circle mask does not cut it). The blue card behind is enlarged the same way. (2) The speech tail is removed. Kept: yellow background, fanned blue card, orange header with three punched dots, large question mark. <b>Badge trade-off (B and C):</b> the real MOD-07 and MOD-03 artwork sits bottom left of the card, 27 dp wide, centred 20 dp from the middle. Its outer edge reaches about 34 dp, 1 dp beyond the 33 dp safe circle but inside the circle mask (about 36 dp), so a circle mask shows it whole but a very tight mask could touch it. To keep the badge clear of the question mark, the question mark moves 3.5 dp to the right in B and C. At 32 dp the badge is about 8 px, so its shape and colour read but the cutlery detail of C does not. The monochrome layers are single alpha shapes (no masks, so they convert to Android vector drawables).</div>']
ov='<div class=ov>'+''.join(f'<div>{masked(icon(k),96)}<small>{V[k]["label"]}</small></div>' for k in V)+'<div style="width:40px"></div>'+''.join(masked(icon(k),48) for k in V)+''.join(masked(icon(k),32) for k in V)+f'<div><div class=ic style="width:96px;height:96px;border-radius:28%">{sz(old,96)}</div><small>Round 2 variation 3 (before)</small></div></div>'
h.append('<h2>A, B and C side by side at 96, 48 and 32 dp (with the round 2 version for comparison)</h2>'+ov)
for k in V:
    nm='Askcard'
    h.append(f'<h2>{V[k]["label"]}</h2>')
    h.append(f'<div class=row><div>{masked(icon(k),220,"ci",True)}<div class=cap>Circle mask with guides (dashed circle = 66 dp safe zone, dashed square = 72 dp visible area)</div></div><div>{masked(icon(k),220,"sq",True)}<div class=cap>Squircle mask with guides</div></div><div>{masked(icon(k),220,"ci")}<div class=cap>Circle mask, no guides</div></div><div>{masked(mono(k),220,"sq")}<div class=cap>Monochrome layer (alpha only; the system tints it)</div></div></div>')
    h.append(f'<div class=row><div>{launcher(k,nm,False)}<div class=cap>Light wallpaper, 64 dp</div></div><div>{launcher(k,nm,True)}<div class=cap>Dark wallpaper</div></div><div>{launcher(k,nm,False,True)}<div class=cap>Themed icon, light</div></div><div>{launcher(k,nm,True,True)}<div class=cap>Themed icon, dark</div></div></div>')
    h.append(f'<div class=row><div class=sm>{masked(icon(k),48,"sq")}{masked(icon(k),32,"sq")}{masked(icon(k),48,"ci")}{masked(icon(k),32,"ci")}{masked(mono(k),48,"sq")}{masked(mono(k),32,"sq")}<span style="font-size:12px;color:#4A5A66">48 and 32 dp: squircle, circle, monochrome</span></div></div>')
h.append('</div>')
open(f'{HERE}/logo-concepts-3.html','w',encoding='utf-8').write('\n'.join(h))
print('ok')
