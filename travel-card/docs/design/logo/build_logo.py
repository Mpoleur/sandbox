# Builds the logo concept SVGs and logo-concepts.html (self-contained, inline SVG). Original drawings, no fonts, no text in the icons.
# Adaptive icon: 108 x 108 dp canvas, 72 dp visible square, 66 dp safe circle (centre 54,54). Run: python docs/design/logo/build_logo.py
import os,html
HERE=os.path.dirname(os.path.abspath(__file__))
INK='#212121';WHT='#FFFFFF';BL='#1565C0';GRN='#2E7D32';YEL='#FFC107'
NS='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" stroke-linejoin="round" stroke-linecap="round"'
def ln(d,col,w): return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}"/>'
BUB='M42 32H66a12 12 0 0 1 12 12V56a12 12 0 0 1-12 12H48L34 80V68A12 12 0 0 1 30 56V44a12 12 0 0 1 12-12z'
# concept: bg colour, foreground, monochrome (single colour, alpha only), themed-icon tint
C={
 1:dict(name='Wordless',bg=BL,
   fg=f'<path d="{BUB}" fill="{WHT}"/>'+ln('M43 52L51 60L66 42',GRN,7),
   mono=lambda c:f'<path d="{BUB}" fill="none" stroke="{c}" stroke-width="6"/>'+ln('M43 52L51 60L66 42',c,7)),
 2:dict(name='The sign raiser',bg=YEL,
   fg=f'<rect x="37" y="21" width="34" height="23" rx="8" fill="{WHT}"/><circle cx="54" cy="32.5" r="7" fill="{BL}"/>'+ln('M44 70L41 45M64 70L67 45',INK,6)
      +f'<circle cx="54" cy="57" r="8.5" fill="{INK}"/><path d="M37 82C37 70 45 67 54 67S71 70 71 82z" fill="{INK}"/>',
   mono=lambda c:f'<rect x="37" y="21" width="34" height="23" rx="8" fill="none" stroke="{c}" stroke-width="4.5"/><circle cx="54" cy="32.5" r="6" fill="{c}"/>'+ln('M44 70L41 45M64 70L67 45',c,6)
      +f'<circle cx="54" cy="57" r="8.5" fill="{c}"/><path d="M37 82C37 70 45 67 54 67S71 70 71 82z" fill="{c}"/>'),
 3:dict(name='The luggage tag',bg=GRN,
   fg=('<path fill-rule="evenodd" d="M43 26H65L72 34V74a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6V34z M54 32.5a3.5 3.5 0 1 0 0.01 0z" fill="#FFC107"/>'
       +ln('M54 31C46 22 52 12 60 16C66 20 62 28 54 31',WHT,3.5)+f'<path d="M54 76L47 62A9 9 0 1 1 61 62Z" fill="{BL}"/><circle cx="54" cy="56" r="3.2" fill="{WHT}"/>'),
   mono=lambda c:('<path fill-rule="evenodd" d="M43 26H65L72 34V74a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6V34z M54 32.5a3.5 3.5 0 1 0 0.01 0z M54 76L47 62A9 9 0 1 1 61 62Z" fill="'+c+'"/>'
       +ln('M54 31C46 22 52 12 60 16C66 20 62 28 54 31',c,3.5)+f'<circle cx="54" cy="56" r="3.2" fill="{c}"/>')),
}
T3='<g transform="translate(54 58) scale(.88) translate(-54 -54)">'  # keeps the tag string inside the 66 dp safe circle
C[3]['fg']=T3+C[3]['fg']+'</g>'; _m3=C[3]['mono']; C[3]['mono']=lambda c:T3+_m3(c)+'</g>'
def svg(inner,extra=''): return f'<svg {NS}{extra}>{inner}</svg>'
def icon(k): return svg(f'<rect width="108" height="108" fill="{C[k]["bg"]}"/>'+C[k]['fg'])
def fg(k): return svg(C[k]['fg'])
def bgf(k): return svg(f'<rect width="108" height="108" fill="{C[k]["bg"]}"/>')
def mono(k,c=INK): return svg(C[k]['mono'](c))
for k in C:
    for suffix,fn in(('icon',icon),('foreground',fg),('background',bgf),('monochrome',mono)):
        open(f'{HERE}/concept-{k}-{suffix}.svg','w',encoding='utf-8').write(fn(k)+'\n')
def sz(s,w): return s.replace('<svg ',f'<svg width="{w}" height="{w}" ',1)
GUIDE='<svg width="{w}" height="{w}" viewBox="0 0 108 108" style="position:absolute;left:0;top:0" fill="none" stroke="#000" stroke-width=".7" stroke-dasharray="2 2"><circle cx="54" cy="54" r="33"/><rect x="18" y="18" width="72" height="72"/></svg>'
def masked(inner,w,shape='sq',guide=False,bg=None):
    r={'sq':'28%','ci':'50%'}[shape]
    g=GUIDE.format(w=w) if guide else ''
    return f'<div class=ic style="width:{w}px;height:{w}px;border-radius:{r}">{sz(inner,w)}{g}</div>'
def themed(k,dark,w):
    bgc,fgc=('#2B3A4A','#CFE3F8') if dark else ('#DCEBFA','#0B3D7A')
    return f'<div class=ic style="width:{w}px;height:{w}px;border-radius:28%">'+sz(svg(f'<rect width="108" height="108" fill="{bgc}"/>'+C[k]['mono'](fgc)),w)+'</div>'
def launcher(k,name,dark,themedmode=False,shape='sq'):
    wall='#1B2630' if dark else '#DDE7F0'; txt='#EEF3F7' if dark else '#1B2630'; ph='#4A5A66' if dark else '#B7C4CF'
    me=themed(k,dark,64) if themedmode else masked(icon(k),64,shape)
    items=''.join(f'<div class=app><div class=ic style="width:64px;height:64px;border-radius:{"50%" if shape=="ci" else "28%"};background:{ph}"></div><span>&nbsp;</span></div>' for _ in range(3))
    return f'<div class=wall style="background:{wall};color:{txt}"><div class=apps>{items}<div class=app>{me}<span>{html.escape(name)}</span></div></div></div>'
CON=[
 dict(k=1,title='Concept 1: a wordless speech bubble',idea='Idea: a card that speaks without words, a speech bubble in the calm blue of the app with a green tick for "understood", which is exactly what the app delivers.',
  why='Works because a bubble plus a tick reads as "message received" in every language, and the blue and green are the app\'s own information and yes colours.',
  names=[('Wordless','Clear promise. A plain English word, likely already used by apps or brands.'),('Pictosay','Invented; hints at pictograms that speak. Unchecked.')]),
 dict(k=2,title='Concept 2: the traveller raising a sign',idea='Idea: the moment of use. A neutral signage figure, in the style of the toilet pictogram, holds a sign above their head, on taxi yellow.',
  why='Works because it shows the whole story in one glance (a person, a sign shown to someone) and shares its figure and flat style with the symbol library.',
  names=[('Raisecard','Describes the gesture of showing a card. Unchecked.'),('Holdsign','Short, literal. Unchecked.'),('Heads Up','Not recommended: "Heads Up!" is a well-known game app.')]),
 dict(k=3,title='Concept 3: a luggage tag with a pin',idea='Idea: the object a traveller already knows. A yellow luggage tag with a punched hole and string, carrying a blue map pin for "take me here", on green.',
  why='Works because a tag says "travel" and "this is mine, show it" at once, and the loop and hole give the silhouette a shape no other symbol in the set has.',
  names=[('Showtag','Short and descriptive. Unchecked.'),('Pocket Tag','Friendly, hints at "always with you". Unchecked.'),('Tagalong','Not recommended: also a well-known cookie brand name.')]),
]
CSS='''*{box-sizing:border-box}body{margin:0;background:#EEF2F5;color:#212121;font:16px/24px Roboto,"Segoe UI",system-ui,sans-serif}.wrap{max-width:1280px;margin:0 auto;padding:28px 24px 60px}h1{font-size:28px;margin:0 0 4px}h2{font-size:22px;margin:44px 0 6px;border-bottom:3px solid #212121;padding-bottom:4px}
.note{background:#fff;border-radius:12px;padding:12px 16px;max-width:980px;font-size:14px;line-height:20px}.row{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;margin-top:14px}.ic{position:relative;overflow:hidden;flex:none}.cap{font-size:12px;line-height:16px;color:#4A5A66;margin-top:6px;max-width:260px}
.wall{border-radius:16px;padding:16px;width:380px}.apps{display:flex;gap:14px}.app{width:64px;text-align:center;font-size:12px;line-height:16px}.app span{display:block;margin-top:4px;white-space:nowrap;overflow:visible;margin-left:-10px;margin-right:-10px}
table{border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;font-size:14px;margin-top:10px}td,th{padding:6px 12px;border-bottom:1px solid #E3E8EC;text-align:left;vertical-align:top}.sm{display:flex;gap:18px;align-items:center;background:#fff;padding:12px 16px;border-radius:12px}'''
h=[f'<!doctype html><meta charset=utf-8><title>Travel Card logo concepts</title><style>{CSS}</style><div class=wrap>',
 '<h1>App logo: three concepts, with name ideas</h1><p>Draft for Matthieu to choose from, not validated. "Travel Card" is only the working name. The icons contain no words or letters; names appear only beside them.</p>',
 '<div class=note><b>How to read the sheet.</b> Each concept shows the Android adaptive icon (108 dp layers, 72 dp visible, 66 dp safe circle) large, in a circle and a squircle mask, once with the safe-zone guides (dashed circle = safe zone, dashed square = visible area), then on light and dark home screens at launcher size, then the monochrome version Android 13 and later uses for themed icons, then at 48 dp and 32 dp. SVG files for every concept are in this folder (icon, foreground, background, monochrome). <b>Names:</b> I checked none of them against trademarks, app stores or domains, so none may be assumed free. Trademark, store and domain checks are still needed before Matthieu picks. No red cross, no flags, no religious or political symbol is used.</div>']
for c in CON:
    k=c['k']; nm=c['names'][0][0]
    h.append(f'<h2>{c["title"]}</h2><p>{c["idea"]}</p><p><i>{c["why"]}</i></p>')
    h.append('<table><tr><th>Name idea</th><th>Note</th></tr>'+''.join(f'<tr><td><b>{html.escape(n)}</b></td><td>{html.escape(t)}</td></tr>' for n,t in c['names'])+'</table>')
    h.append(f'<div class=row><div>{masked(icon(k),220,"ci")}<div class=cap>Circle mask</div></div><div>{masked(icon(k),220,"sq")}<div class=cap>Squircle mask</div></div><div>{masked(icon(k),220,"sq",True)}<div class=cap>Safe-zone guides: everything important sits inside the dashed circle</div></div><div>{masked(mono(k),220,"sq")}<div class=cap style="background:#fff">Monochrome layer (alpha only; the system tints it)</div></div></div>')
    h.append(f'<div class=row><div>{launcher(k,nm,False)}<div class=cap>Light wallpaper, 64 dp icon</div></div><div>{launcher(k,nm,True)}<div class=cap>Dark wallpaper</div></div><div>{launcher(k,nm,False,True)}<div class=cap>Themed icon, light</div></div><div>{launcher(k,nm,True,True)}<div class=cap>Themed icon, dark</div></div></div>')
    h.append(f'<div class=row><div class=sm>{masked(icon(k),48,"sq")}{masked(icon(k),32,"sq")}{masked(icon(k),48,"ci")}{masked(icon(k),32,"ci")}<span style="font-size:12px;color:#4A5A66">48 dp and 32 dp, squircle and circle</span></div></div>')
h.append('</div>')
open(f'{HERE}/logo-concepts.html','w',encoding='utf-8').write('\n'.join(h))
print('ok')
