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
def ic(n,s=24): return f'<svg class=ic width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">{ICON[n]}</svg>'
CAT={'Diet & allergies':'#E65100','Places & directions':'#1565C0','Pets':'#6D4C41','Transport':'#00796B'}
FAV=[("No peanuts, I'm allergic",'DIE-01',('MOD-01','MOD-03'),'Diet & allergies',False),('Take me to my hotel','TRA-03',(),'Transport',True)]
SEC=[('Diet & allergies',[('No gluten, please','DIE-04',('MOD-01',),'Diet & allergies',False)])]
# ---- the five backgrounds: pattern svg (no gradients, no filters, no bitmaps), ground, text and route colours ----
def wave(y,ph,c,w=1.6): return f'<path d="M0 {y}Q30 {y-18+ph} 60 {y}T120 {y}" fill="none" stroke="{c}" stroke-width="{w}"/>'
def ring(cx,cy,rs,c): return ''.join(f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r*.62:.0f}" fill="none" stroke="{c}" stroke-width="1.6" transform="rotate(-14 {cx} {cy})"/>' for r in rs)
# stamps: (kind, x, y, size, rotation, tint). Few at the top-left, more and closer towards the bottom-right; none behind the header or the top of the list.
TINT={'y':'#E6CF80','n':'#B2C6E6','g':'#A9D2B4','o':'#F0BC9A','t':'#98D1C9','b':'#CDB9AA'}
def stamp(k,x,y,s,rot,c):
    r=s/2; g=f'<g transform="translate({x} {y}) rotate({rot})" fill="none" stroke="{c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
    if k=='ring': g+=f'<circle r="{r}"/><circle r="{r*.72:.1f}" stroke-width="1.2"/><path d="M0 {-r*.4:.1f}l{r*.13:.1f} {r*.3:.1f} {r*.3:.1f} {r*.03:.1f}-{r*.24:.1f} {r*.2:.1f} {r*.08:.1f} {r*.3:.1f}-{r*.27:.1f}-{r*.15:.1f}-{r*.27:.1f} {r*.15:.1f} {r*.08:.1f}-{r*.3:.1f}-{r*.24:.1f}-{r*.2:.1f} {r*.3:.1f}-{r*.03:.1f}z" fill="{c}" stroke="none"/>'
    elif k=='oval': g+=f'<ellipse rx="{r*1.3:.1f}" ry="{r*.75:.1f}"/><ellipse rx="{r*.95:.1f}" ry="{r*.5:.1f}" stroke-width="1.2"/>'
    elif k=='rect': g+=f'<rect x="{-r*1.1:.1f}" y="{-r*.7:.1f}" width="{r*2.2:.1f}" height="{r*1.4:.1f}" rx="4" stroke-dasharray="5 3"/>'
    elif k=='tri': g+=f'<path d="M0 {-r:.1f}L{r:.1f} {r*.8:.1f}H{-r:.1f}z"/>'
    elif k=='wave': g+=f'<circle r="{r}"/><path d="M{-r*.7:.1f} -4q{r*.35:.1f} -6 {r*.7:.1f} 0t{r*.7:.1f} 0M{-r*.7:.1f} 5q{r*.35:.1f} -6 {r*.7:.1f} 0t{r*.7:.1f} 0"/>'
    elif k=='sq': g+=f'<rect x="{-r:.1f}" y="{-r:.1f}" width="{2*r:.1f}" height="{2*r:.1f}" rx="6"/><path d="M{-r*.5:.1f} 0H{r*.5:.1f}M0 {-r*.5:.1f}V{r*.5:.1f}"/>'
    return g+'</g>'
ST=[('ring',318,632,40,12,'y'),('oval',248,704,46,-10,'n'),('tri',196,650,30,8,'o'),('wave',304,716,36,0,'t'),('rect',336,680,40,16,'g'),('sq',150,716,28,-14,'b'),
    ('ring',226,610,26,-20,'n'),('wave',108,644,26,10,'y'),('tri',58,710,24,-8,'g'),('rect',22,616,26,-12,'n'),('oval',86,728,28,6,'o'),('sq',262,654,22,20,'t')]

PLANE='M32 2c3 0 4 3 4 6v14l24 15v6L36 36v12l7 5v5l-11-3-11 3v-5l7-5V36L4 43v-6l24-15V8c0-3 1-6 4-6z'
SN,SY,SB='#CBD8EC','#FAE7A0','#D2E2F6'
import math
def arc(x,y,r,w,rot,c): return f'<g transform="translate({x} {y}) rotate({rot})"><path d="M{-r} 0A{r} {r} 0 0 1 {r} 0" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round"/></g>'
def hd(x,y,r,rot,c): return f'<g transform="translate({x} {y}) rotate({rot})"><path d="M{-r} 0A{r} {r} 0 0 1 {r} 0z" fill="{c}"/></g>'
def dot(x,y,r,c): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>'
def sl(x,y,n,w,rot,c): return f'<g transform="translate({x} {y}) rotate({rot})"><path d="M{-n/2} 0H{n/2}" stroke="{c}" stroke-width="{w}" stroke-linecap="round"/></g>'
G='#F3F6FB'
A3C=[(300,250,46,5,20,SB),(60,330,34,10,200,SY),(210,420,60,4,-30,SN),(320,520,26,12,90,SB),(40,520,52,6,160,SN),(150,610,30,8,-60,SY),(290,640,64,5,10,SB),(70,700,40,12,30,SY),(200,730,24,6,200,SN),(340,380,40,4,120,SY),(120,250,28,7,-10,SB),(240,300,36,9,60,SN)]
RIP=[(40,10,SY),(70,4,SB),(104,12,SN),(142,5,SY),(186,9,SB),(236,4,SN),(292,11,SY),(354,5,SB),(420,8,SN),(494,4,SY),(570,10,SB)]
MIX=[hd(300,300,44,20,SY),hd(40,560,50,-70,SB),hd(230,700,36,200,SY),dot(60,300,6,SN),dot(330,470,4,SN),dot(120,430,7,SY),dot(250,600,5,SB),dot(310,740,6,SN),dot(30,420,4,SB),dot(190,270,5,SY),
     sl(200,330,34,5,-25,SB),sl(60,470,26,4,35,SN),sl(320,590,30,6,-50,SY),sl(110,640,38,4,10,SB),sl(280,220,24,4,60,SN),arc(110,340,34,8,10,SN),arc(300,660,48,5,-20,SB),arc(190,520,26,12,150,SY),arc(60,740,36,6,-10,SN)]
def plane_at(x,y,sz,rot,c): return f'<path transform="translate({x:.1f} {y:.1f}) rotate({rot}) scale({sz/64:.3f}) translate(-32 -32)" d="{PLANE}" fill="{c}" stroke="none"/>'
def bars(w,y,c,n=2,gap=6): return ''.join(f'<path d="M{-w/2:.1f} {y+i*gap:.1f}H{w/2-i*w*.25:.1f}" stroke="{c}" stroke-width="2.2" stroke-linecap="round" fill="none"/>' for i in range(n))
def st_round(x,y,r,rot,c): return (f'<g transform="translate({x} {y}) rotate({rot})" fill="none" stroke="{c}"><circle r="{r}" stroke-width="2.6"/><circle r="{r-10}" stroke-width="1.3"/><circle r="{r-5}" stroke-width="3.6" stroke-dasharray="2.4 2"/>'
    +plane_at(0,-r*.16,r*.62,0,c)+bars(r*.8,r*.32,c)+'</g>')
def st_rect(x,y,r,rot,c): return (f'<g transform="translate({x} {y}) rotate({rot})" fill="none" stroke="{c}"><rect x="{-r*1.2:.1f}" y="{-r*.8:.1f}" width="{r*2.4:.1f}" height="{r*1.6:.1f}" rx="5" stroke-width="3.2" stroke-dasharray="0 4.5" stroke-linecap="round"/>'
    f'<rect x="{-r*1.05:.1f}" y="{-r*.65:.1f}" width="{r*2.1:.1f}" height="{r*1.3:.1f}" rx="3" stroke-width="1.8"/>'+plane_at(-r*.5,0,r*.8,0,c)+f'<g transform="translate({r*.5:.1f} 0)">{bars(r*.8,-6,c,3,6)}</g></g>')
def st_oval(x,y,r,rot,c): return (f'<g transform="translate({x} {y}) rotate({rot})" fill="none" stroke="{c}"><ellipse rx="{r*1.35:.1f}" ry="{r*.85:.1f}" stroke-width="2.4"/><ellipse rx="{r*1.15:.1f}" ry="{r*.65:.1f}" stroke-width="1.2"/>'
    f'<path d="M{-r*.65:.1f} {-r*.3:.1f}l{r*.22:.1f} {r*.2:.1f} {-r*.22:.1f} {r*.2:.1f}M{-r*.35:.1f} {-r*.3:.1f}l{r*.22:.1f} {r*.2:.1f} {-r*.22:.1f} {r*.2:.1f}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'+bars(r*.9,r*.32,c,2,6)+plane_at(r*.55,-r*.05,r*.5,90,c)+'</g>')
def st_hex(x,y,r,rot,c):
    p=lambda k:' '.join(f'{k*r*math.cos(math.radians(60*i+30)):.1f},{k*r*math.sin(math.radians(60*i+30)):.1f}' for i in range(6))
    return (f'<g transform="translate({x} {y}) rotate({rot})" fill="none" stroke="{c}"><polygon points="{p(1)}" stroke-width="2.6"/><polygon points="{p(.82)}" stroke-width="1.3"/><circle r="{r*.55:.1f}" stroke-width="3" stroke-dasharray="2.2 1.8"/>'+plane_at(0,-3,r*.5,0,c)+bars(r*.6,r*.2,c,1)+'</g>')
def st_post(x,y,r,rot,c): return (f'<g transform="translate({x} {y}) rotate({rot})" fill="none" stroke="{c}"><circle r="{r}" stroke-width="2.4"/><circle r="{r-6}" stroke-width="1.2"/>{bars(r*.9,-6,c,3,7)}'
    +''.join(f'<path d="M{r+6} {-9+i*9}q8 -5 16 0t16 0t16 0" stroke-width="2"/>' for i in range(3))+'</g>')
INK={'n':'#A9BEDF','o':'#E4B48A','g':'#9CCBA8','t':'#8FC8C1','y':'#D9B84E'}
S4C=[(st_round,300,650,38,-14,'n'),(st_rect,226,712,34,9,'o'),(st_oval,330,716,26,-8,'t'),(st_hex,198,630,26,12,'g'),(st_post,120,708,24,-6,'y'),(st_round,262,596,22,18,'o'),(st_hex,334,584,20,-20,'y'),(st_rect,66,742,22,-12,'g')]
BG=[
 dict(n='3b. Colour wash, calmer',idea='Same wash, paler and with only two smaller flat circles, so it stays calm behind the tickets.',g='#F3F6FB',ttl='#212121',sec='#4A5A66',route='#5C7A99',pat='#E3ECF8',
  svg=lambda c:'<rect width=360 height=760 fill="#F3F6FB"/><circle cx="338" cy="330" r="70" fill="#FFF6D8"/><circle cx="24" cy="610" r="100" fill="#E4EDF8"/>',
  spec='Ground #F3F6FB with two flat circles: #FFF6D8 (r 70 dp) and #E4EDF8 (r 100 dp). Was four circles up to r 190 and stronger tints.'),
 dict(n='3c. Scattered arcs',idea='Semi-circles of different radii (24 to 64 dp) and thickness (4 to 12 dp), with their origins scattered across the screen, in pale navy, yellow and blue.',g=G,ttl='#212121',sec='#4A5A66',route='#5C7A99',pat=SN,
  svg=lambda c:f'<rect width=360 height=760 fill="{G}"/>'+''.join(arc(*a) for a in A3C),
  spec='Ground #F3F6FB. 12 semi-circle arcs, radius 24 to 64 dp, stroke 4 to 12 dp, tints navy #CBD8EC, yellow #FAE7A0, blue #D2E2F6.'),
 dict(n='3d. Ripple',idea='Semi-circles spreading from one origin near the bottom-left corner, like ripples, with growing radius and varied thickness.',g=G,ttl='#212121',sec='#4A5A66',route='#5C7A99',pat=SN,
  svg=lambda c:f'<rect width=360 height=760 fill="{G}"/>'+''.join(arc(20,745,r,w,0,t) for r,w,t in RIP),
  spec='Ground #F3F6FB. 11 concentric semi-circles from (20, 745), radius 40 to 570 dp, stroke 4 to 12 dp, same three tints.'),
 dict(n='3e. Mixed shapes',idea='Arcs plus half-discs, dots and short lines of different sizes, scattered evenly and kept pale.',g=G,ttl='#212121',sec='#4A5A66',route='#5C7A99',pat=SN,
  svg=lambda c:f'<rect width=360 height=760 fill="{G}"/>'+''.join(MIX),
  spec='Ground #F3F6FB. 3 half-discs (r 36 to 50), 7 dots (r 4 to 7), 5 short lines (24 to 38 dp, stroke 4 to 6), 4 arcs, same three tints.'),
 dict(n='4b. Passport stamps, muted colour',idea='Fewer, smaller stamps in six shapes and soft palette tints, gathered at the bottom-right, thinning towards the top-left.',g='#FFFAEC',ttl='#212121',sec='#4A5A66',route='#66798A',pat='#E6CF80',
  svg=lambda c:'<rect width=360 height=760 fill="#FFFAEC"/>'+''.join(stamp(*a[:5],TINT[a[5]]) for a in ST),
  spec='Ground #FFFAEC; 12 stamps 22 to 46 dp, 2.2 dp lines in soft tints #E6CF80 yellow, #B2C6E6 navy, #A9D2B4 green, #F0BC9A orange, #98D1C9 teal, #CDB9AA brown. All sit below the list (lowest 150 dp), densest at the right; none above y 600, none behind a title or a ticket (tickets are opaque).'),
 dict(n='4c. Realistic passport stamps',idea='Inked stamps with double borders, perforated and scalloped edges, a tiny plane, dashes for dates and text, and a slight tilt, clustered bottom-right on a light yellow ground.',g='#FFF5CC',ttl='#212121',sec='#4A5A66',route='#66798A',pat='#D9B84E',
  svg=lambda c:'<rect width=360 height=760 fill="#FFF5CC"/>'+''.join(f(x,y,r,rot,INK[k]) for f,x,y,r,rot,k in S4C),
  spec='Ground #FFF5CC. 8 stamps (round with ring dashes, perforated rectangle, oval with chevrons, hexagon, postmark with wavy cancel lines) 40 to 76 dp wide in inks #A9BEDF, #E4B48A, #9CCBA8, #8FC8C1, #D9B84E, 1.2 to 3.6 dp lines, tilted up to 20 degrees. No words, flags or places: dashes stand for text. Drawn in a fixed layer behind the scroll list so they stay while cards scroll over them.'),
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
h=[f'<!doctype html><meta charset=utf-8><title>Travel Cards Home backgrounds 3</title><style>{CSS}</style><div class=wrap>',
 '<h1>Home D4 backgrounds: 3c, 3d, 3e and 4c</h1><div class=note>Draft for Matthieu, not validated. 3b and 4b are shown for reference. Only the screen background changes; everything else in D4 is unchanged, including the 88 dp bottom spacer. Flat vector only (paths, circles, dashes; no gradients, filters or bitmaps). The background is one fixed layer behind the scroll list, so it stays still while the cards scroll over it; tickets are opaque, so no shape is ever behind a ticket label. Contrast lines give ink against the ground and against the darkest tint a title could cross.</div><div class=cols>',
 ''.join(col(b) for b in BG),'</div></div>']
open(os.path.join(HERE,'home-backgrounds-3.html'),'w',encoding='utf-8').write(chr(10).join(h))
print('ok',[(b['n'][:3],round(cr(b['ttl'],b['g']),1),round(cr(b['ttl'],b['pat']),1),round(cr(b['route'],b['g']),1)) for b in BG])
