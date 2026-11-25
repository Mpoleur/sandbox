# Round 2: four chat-bubble + question-mark variations. Builds round2-N-{icon,foreground,background,monochrome}.svg and logo-concepts-2.html.
# Separate from build_logo.py so round 1 stays reproducible. Adaptive icon: 108 dp layers, 66 dp safe circle (centre 54,54).
import os,html
HERE=os.path.dirname(os.path.abspath(__file__))
INK='#212121';WHT='#FFFFFF';BL='#1565C0';BL3='#81D4FA';BLL='#BBDEFB';GRN='#2E7D32';YEL='#FFC107';ORG='#F57C00';SLATE='#263238'
NS='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" stroke-linejoin="round" stroke-linecap="round"'
def ln(d,col,w,extra=''): return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}"{extra}/>'
def P(d,f,extra=''): return f'<path d="{d}" fill="{f}"{extra}/>'
# V1 layered bubbles, the question mark as the content, orange dot
B1='M44 27H64a13 13 0 0 1 13 13V58a13 13 0 0 1-13 13H44a13 13 0 0 1-13-13V40a13 13 0 0 1 13-13z'
TAIL1='M38 69L33 83L53 70Z'
Q1='M45 43C45 34 63 34 63 43C63 50 54 51 54 56'
# V2 dialogue
L2='M40 28H52a10 10 0 0 1 10 10V46a10 10 0 0 1-10 10H46L34 66V56A10 10 0 0 1 30 48V38a10 10 0 0 1 10-10z'
R2='M56 46H68a10 10 0 0 1 10 10V64a10 10 0 0 1-10 10H70L76 80L64 74H56a10 10 0 0 1-10-10V56a10 10 0 0 1 10-10z'
Q2='M41 38C41 32 52 32 52 38C52 43 46 43 46 48'
# V3 card as bubble
CARD='M44 26H64a7 7 0 0 1 7 7V71a7 7 0 0 1-7 7H62L54 86L46 78H44a7 7 0 0 1-7-7V33a7 7 0 0 1 7-7z'
# V4 round balloon with route question mark
B4='M54 23a26 26 0 1 1 0 52H51L37 80L42 68A26 26 0 0 1 54 23z'
Q4='M43 43C43 31 65 31 65 43C65 51 54 50 54 56'
PIN4='M54 71L48.5 62.5A6.5 6.5 0 1 1 59.5 62.5Z'
V={
 1:dict(name='Whereto',bg=BL,
  fg=f'<rect x="31" y="27" width="48" height="44" rx="14" fill="{BL3}" transform="rotate(11 54 50)"/>'+P(B1,WHT)+P(TAIL1,YEL)+ln(Q1,BL,7.5)+f'<circle cx="54" cy="63" r="4.6" fill="{ORG}"/>',
  mono=lambda c:f'<rect x="32" y="29" width="46" height="42" rx="13" fill="none" stroke="{c}" stroke-width="3.5" transform="rotate(11 54 50)"/>'+P(B1,'none',f' stroke="{c}" stroke-width="5"')+P(TAIL1,c)+ln(Q1,c,7)+f'<circle cx="54" cy="63" r="4.6" fill="{c}"/>'),
 2:dict(name='Thatway',bg=SLATE,
  fg=P(L2,YEL)+ln(Q2,INK,5.5)+f'<circle cx="46" cy="52.5" r="3" fill="{INK}"/>'+P(R2,WHT)+ln('M54 60H70M63 53L70 60L63 67',BL,5.5),
  mono=lambda c:P(L2,'none',f' stroke="{c}" stroke-width="4.5"')+ln(Q2,c,5)+f'<circle cx="46" cy="52.5" r="3" fill="{c}"/>'+P(R2,'none',f' stroke="{c}" stroke-width="4.5"')+ln('M54 60H70M63 53L70 60L63 67',c,5.5)),
 3:dict(name='Askcard',bg=YEL,
  fg=f'<rect x="37" y="26" width="34" height="52" rx="7" fill="{BL}" transform="rotate(14 54 52)"/>'+f'<g transform="rotate(-6 54 52)">'+P(CARD,WHT)+f'<path d="M44 26H64a7 7 0 0 1 7 7V40H37V33a7 7 0 0 1 7-7z" fill="{ORG}"/>'
      +''.join(f'<circle cx="{x}" cy="33" r="1.9" fill="{WHT}"/>' for x in(46,54,62))+ln('M46 51C46 44 62 44 62 51C62 57 54 57 54 62',INK,6)+f'<circle cx="54" cy="70" r="3.9" fill="{INK}"/></g>',
  mono=lambda c:'<g transform="rotate(-6 54 52)">'+P(CARD,'none',f' stroke="{c}" stroke-width="5"')
      +f'<path d="M44 26H64a7 7 0 0 1 7 7V40H37V33a7 7 0 0 1 7-7z" fill="{c}"/>'+ln('M46 51C46 44 62 44 62 51C62 57 54 57 54 62',c,6)+f'<circle cx="54" cy="70" r="3.9" fill="{c}"/></g>'),
 4:dict(name='Wayask',bg=GRN,
  fg=P(B4,WHT)+ln(Q4,BL,10)+ln(Q4,WHT,1.6,' stroke-dasharray="3 3" stroke-linecap="butt"')+P(PIN4,ORG)+f'<circle cx="54" cy="59.5" r="2.4" fill="{WHT}"/>',
  mono=lambda c:P(B4,'none',f' stroke="{c}" stroke-width="5"')+ln(Q4,c,9)+f'<path fill-rule="evenodd" d="{PIN4} M54 57.1a2.4 2.4 0 1 0 0.01 0z" fill="{c}"/>'),
}
def svg(inner): return f'<svg {NS}>{inner}</svg>'
def icon(k): return svg(f'<rect width="108" height="108" fill="{V[k]["bg"]}"/>'+V[k]['fg'])
def fg(k): return svg(V[k]['fg'])
def bgf(k): return svg(f'<rect width="108" height="108" fill="{V[k]["bg"]}"/>')
def mono(k,c=INK): return svg(V[k]['mono'](c))
for k in V:
    for suf,fn in(('icon',icon),('foreground',fg),('background',bgf),('monochrome',mono)):
        open(f'{HERE}/round2-{k}-{suf}.svg','w',encoding='utf-8').write(fn(k)+'\n')
def sz(s,w): return s.replace('<svg ',f'<svg width="{w}" height="{w}" ',1)
GUIDE='<svg width="{w}" height="{w}" viewBox="0 0 108 108" style="position:absolute;left:0;top:0" fill="none" stroke="#000" stroke-width=".7" stroke-dasharray="2 2"><circle cx="54" cy="54" r="33"/><rect x="18" y="18" width="72" height="72"/></svg>'
def masked(inner,w,shape='sq',guide=False):
    r={'sq':'28%','ci':'50%'}[shape]
    return f'<div class=ic style="width:{w}px;height:{w}px;border-radius:{r}">{sz(inner,w)}{GUIDE.format(w=w) if guide else ""}</div>'
def themed(k,dark,w):
    b,f=('#2B3A4A','#CFE3F8') if dark else ('#DCEBFA','#0B3D7A')
    return f'<div class=ic style="width:{w}px;height:{w}px;border-radius:28%">'+sz(svg(f'<rect width="108" height="108" fill="{b}"/>'+V[k]['mono'](f)),w)+'</div>'
def launcher(k,name,dark,th=False):
    wall='#1B2630' if dark else '#DDE7F0'; txt='#EEF3F7' if dark else '#1B2630'; ph='#4A5A66' if dark else '#B7C4CF'
    me=themed(k,dark,64) if th else masked(icon(k),64)
    items=''.join(f'<div class=app><div class=ic style="width:64px;height:64px;border-radius:28%;background:{ph}"></div><span>&nbsp;</span></div>' for _ in range(3))
    return f'<div class=wall style="background:{wall};color:{txt}"><div class=apps>{items}<div class=app>{me}<span>{html.escape(name)}</span></div></div></div>'
CON=[
 dict(k=1,title='Variation 1: layered bubbles with a yellow tail and an orange dot',idea='A white bubble sits on a second, tilted light-blue bubble for depth; its tail is a yellow accent and the question mark ends in an orange dot.',
  why='Works because the tilted second bubble and the coloured tail give it a crafted, layered look that plain help icons lack, and the orange dot stays a clear point at 48 dp.',
  names=[('Whereto','Reads as "where to?". A common phrase, likely used by other products.'),('Askabout','Friendly and plain. Unchecked.')]),
 dict(k=2,title='Variation 2: a dialogue, question answered by an arrow',idea='Two overlapping bubbles on dark slate: a yellow one asks with a question mark, a white one answers with a blue arrow showing the way.',
  why='Works because it tells the whole exchange (ask, then be pointed the right way) without a word, and yellow, white and slate separate clearly even at 32 dp.',
  names=[('Thatway','Short, human, says "go that way". Likely used elsewhere.'),('Pointsay','Invented. Unchecked.')]),
 dict(k=3,title='Variation 3: the bubble is an info card held out',idea='A white card with a speech tail, an orange header with three punched dots like an information panel, and a big question mark, fanned over a blue second card on taxi yellow.',
  why='Works because it merges the app\'s two ideas, a card you show and a question you ask, and the fanned cards give depth with flat shapes only.',
  names=[('Askcard','Direct, easy to say. Unchecked.'),('Showmark','Card you show, question mark. Unchecked.')]),
 dict(k=4,title='Variation 4: a round balloon, the question mark is a road ending in a pin',idea='A round white balloon holds a question mark drawn as a blue road with a dashed centre line, whose dot is an orange map pin, on green.',
  why='Works because the question becomes a route, which is the traveller\'s real question, "where do I go?", and the round balloon looks unlike any rectangular messaging icon.',
  names=[('Wayask','Way plus ask. Unchecked.'),('Routemark','Route plus question mark. Unchecked.')]),
]
CSS='''*{box-sizing:border-box}body{margin:0;background:#EEF2F5;color:#212121;font:16px/24px Roboto,"Segoe UI",system-ui,sans-serif}.wrap{max-width:1280px;margin:0 auto;padding:28px 24px 60px}h1{font-size:28px;margin:0 0 4px}h2{font-size:22px;margin:44px 0 6px;border-bottom:3px solid #212121;padding-bottom:4px}
.note{background:#fff;border-radius:12px;padding:12px 16px;max-width:980px;font-size:14px;line-height:20px}.row{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;margin-top:14px}.ic{position:relative;overflow:hidden;flex:none}.cap{font-size:12px;line-height:16px;color:#4A5A66;margin-top:6px;max-width:260px}
.wall{border-radius:16px;padding:16px;width:380px}.apps{display:flex;gap:14px}.app{width:64px;text-align:center;font-size:12px;line-height:16px}.app span{display:block;margin-top:4px;white-space:nowrap;margin-left:-10px;margin-right:-10px}
table{border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;font-size:14px;margin-top:10px}td,th{padding:6px 12px;border-bottom:1px solid #E3E8EC;text-align:left;vertical-align:top}.sm{display:flex;gap:18px;align-items:center;background:#fff;padding:12px 16px;border-radius:12px}.ov{display:flex;gap:14px;align-items:center;flex-wrap:wrap}'''
h=[f'<!doctype html><meta charset=utf-8><title>Travel Card logo concepts, round 2</title><style>{CSS}</style><div class=wrap>',
 '<h1>App logo, round 2: chat bubble and question mark</h1><p>Four variations after Matthieu\'s feedback (more character, a question mark, a chat bubble). Draft, not validated. "Travel Card" is only the working name. Round 1 is unchanged in logo-concepts.html.</p>',
 '<div class=note><b>How to read the sheet.</b> Same layout as round 1: the Android adaptive icon (108 dp layers, 72 dp visible, 66 dp safe circle) in circle and squircle masks, once with the guides, the monochrome layer, light and dark home screens, themed icons, and 48 dp and 32 dp. The question mark is a drawn shape, never text, and the icons contain no letters or words. <b>Names are unchecked:</b> I did not check any against trademarks, app stores or domains, so none may be assumed free, and all still need those checks. Bubbles are original shapes; none imitates an existing messaging, help or translation app. No red cross, flag, or religious or political symbol.</div>']
overview='<div class=ov>'+''.join(masked(icon(c['k']),96,'sq') for c in CON)+''.join(masked(icon(c['k']),48,'sq') for c in CON)+''.join(masked(icon(c['k']),32,'sq') for c in CON)+'</div>'
h.append('<h2>All four together, at 96, 48 and 32 dp</h2>'+overview)
for c in CON:
    k=c['k']; nm=c['names'][0][0]
    h.append(f'<h2>{c["title"]}</h2><p>{c["idea"]}</p><p><i>{c["why"]}</i></p>')
    h.append('<table><tr><th>Name idea</th><th>Note</th></tr>'+''.join(f'<tr><td><b>{html.escape(n)}</b></td><td>{html.escape(t)}</td></tr>' for n,t in c['names'])+'</table>')
    h.append(f'<div class=row><div>{masked(icon(k),220,"ci")}<div class=cap>Circle mask</div></div><div>{masked(icon(k),220,"sq")}<div class=cap>Squircle mask</div></div><div>{masked(icon(k),220,"sq",True)}<div class=cap>Safe-zone guides: dashed circle = safe zone, dashed square = visible area</div></div><div>{masked(mono(k),220,"sq")}<div class=cap>Monochrome layer (alpha only; the system tints it)</div></div></div>')
    h.append(f'<div class=row><div>{launcher(k,nm,False)}<div class=cap>Light wallpaper, 64 dp</div></div><div>{launcher(k,nm,True)}<div class=cap>Dark wallpaper</div></div><div>{launcher(k,nm,False,True)}<div class=cap>Themed icon, light</div></div><div>{launcher(k,nm,True,True)}<div class=cap>Themed icon, dark</div></div></div>')
    h.append(f'<div class=row><div class=sm>{masked(icon(k),48,"sq")}{masked(icon(k),32,"sq")}{masked(icon(k),48,"ci")}{masked(icon(k),32,"ci")}<span style="font-size:12px;color:#4A5A66">48 dp and 32 dp, squircle and circle</span></div></div>')
h.append('</div>')
open(f'{HERE}/logo-concepts-2.html','w',encoding='utf-8').write('\n'.join(h))
print('ok')
