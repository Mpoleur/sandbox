# Artwork style 2 primitives (approved style: flat coloured silhouettes, no outlines on objects).
import math
INK='#212121';WHT='#FFFFFF';SL='#455A64';SL2='#78909C';LG='#CFD8DC';VL='#ECEFF1'
RED='#D32F2F';RD2='#8E1B1B';RDL='#E57373'
ORG='#F57C00';ORL='#F4793A';OR2='#C5501B'
YEL='#FFC107';YE2='#F9A825';CRM='#FFF3E0';CR2='#F6DFAF'
GRN='#2E7D32';GRL='#66BB6A'
BLU='#1E88E5';BL2='#1565C0';BLL='#BBDEFB';BL3='#81D4FA'
BRN='#A9733A';BR2='#6D4C41';TAN='#D9A765'
def n(v): return ('%.1f'%v).rstrip('0').rstrip('.')
def r(x,y,w,h,f=WHT,rx=4,o=''): return f'<rect x="{n(x)}" y="{n(y)}" width="{n(w)}" height="{n(h)}" rx="{n(rx)}" fill="{f}"{o}/>'
def c(x,y,rd,f=WHT,o=''): return f'<circle cx="{n(x)}" cy="{n(y)}" r="{n(rd)}" fill="{f}"{o}/>'
def e(x,y,rx,ry,f=WHT,o=''): return f'<ellipse cx="{n(x)}" cy="{n(y)}" rx="{n(rx)}" ry="{n(ry)}" fill="{f}"{o}/>'
def p(d,f=WHT,o=''): return f'<path d="{d}" fill="{f}"{o}/>'
def ln(d,col=INK,w=4,o=''): return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}"{o}/>'
def g(t,*s): return f'<g transform="{t}">'+''.join(s)+'</g>'
def at(x,y,s,*a): return g(f'translate({n(x)} {n(y)}) scale({n(s)})',*a)
def rot(a,x,y,*s): return g(f'rotate({a} {x} {y})',*s)
def pap(x,y,w,h,rx=4): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="#FFF" stroke="#90A4AE" stroke-width="3"/>'  # white objects get a mid-grey edge
def rs(x,y,w,h,rx,col,sw=4): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="none" stroke="{col}" stroke-width="{sw}"/>'
def rg(x,y,rd,col=INK,sw=4): return f'<circle cx="{x}" cy="{y}" r="{rd}" fill="none" stroke="{col}" stroke-width="{sw}"/>'
def barrow(x,y,L,ang,col,t=1):
    pts=[(0,-5),(L-10*t,-5),(L-10*t,-11),(L,0),(L-10*t,11),(L-10*t,5),(0,5)]
    return f'<path transform="translate({n(x)} {n(y)}) rotate({ang})" d="M'+'L'.join(f'{n(a)} {n(b*t)}' for a,b in pts)+f'Z" fill="{col}"/>'
def star(cx,cy,r1,r2,k,col):
    pts=[]
    for i in range(2*k):
        rr=r1 if i%2==0 else r2; a=-math.pi/2+i*math.pi/k
        pts.append(f'{n(cx+rr*math.cos(a))} {n(cy+rr*math.sin(a))}')
    return p('M'+'L'.join(pts)+'Z',col)
def heart(col,s=1,x=32,y=34): return p('M0 12C-22-4-12-20 0-8C12-20 22-4 0 12z',col,f' transform="translate({x} {y}) scale({s})"')
def pin(x,y,col=RED): return p(f'M{x} {y+22}L{x-9} {y+8}A12 12 0 1 1 {x+9} {y+8}Z',col)+c(x,y,4.5,WHT)
def drop(x,y,col=BLU,s=1): return p('M0 0c6 7 8 10 8 14a8 8 0 0 1-16 0c0-4 2-7 8-14z',col,f' transform="translate({x} {y}) scale({s})"')
def no_ov():
    ring='<circle cx="32" cy="32" r="26"/><path d="M13.6 13.6L50.4 50.4"/>'
    return f'<g stroke="#FFF" stroke-width="11" fill="none">{ring}</g><g stroke="{RED}" stroke-width="7" fill="none">{ring}</g>'
def badge(bg,glyph): return f'<circle cx="32" cy="32" r="28.5" fill="{bg}" stroke="#FFF" stroke-width="3"/>'+glyph
# ---- people (top at y, centre x) ----
def man(x,y,s=1,col=INK):
    return at(x,y,s,c(0,6,6,col)+r(-7,15,14,22,col,5)+r(-11,16,4.5,19,col,2.2)+r(6.5,16,4.5,19,col,2.2)+r(-6,34,5,20,col,2.5)+r(1,34,5,20,col,2.5))
def woman(x,y,s=1,col=INK):
    return at(x,y,s,c(0,6,6,col)+p('M-6 16h12l8 26h-28z',col)+r(-6,40,5,14,col,2.5)+r(1,40,5,14,col,2.5))
def kid(x,y,s=1,col=BL2):
    return at(x,y,s,c(0,5,5,col)+r(-6,12,12,16,col,5)+r(-5,26,4.5,12,col,2.2)+r(0.5,26,4.5,12,col,2.2))
def walker(x,y,col=INK): # walking figure, limbs as 8-wide strokes
    return c(x,y,6.5,col)+ln(f'M{x} {y+13}L{x-3} {y+30}M{x-3} {y+30}L{x-11} {y+49}M{x-3} {y+30}L{x+9} {y+41}L{x+7} {y+51}M{x} {y+17}L{x+11} {y+28}',col,8)
# ---- shared objects ----
def car(x,y,col=BL2):  # 44 x 34
    return (p(f'M{x+6} {y+14}L{x+12} {y+2}H{x+30}L{x+38} {y+14}Z',col)+r(x,y+12,44,14,col,5)+p(f'M{x+14} {y+12}L{x+17} {y+5}H{x+22}V{y+12}ZM{x+25} {y+12}V{y+5}H{x+29}L{x+34} {y+12}Z',BLL)
            +c(x+11,y+28,6,INK)+c(x+33,y+28,6,INK)+c(x+11,y+28,2.2,LG)+c(x+33,y+28,2.2,LG))
def bus(x,y,col=BL2):  # 48 x 36
    return (r(x,y,48,28,col,6)+''.join(r(x+5+i*14,y+6,10,9,BLL,2) for i in range(3))+r(x,y+19,48,3,WHT)+c(x+12,y+30,5,INK)+c(x+36,y+30,5,INK))
def key(x,y,col=YEL): return c(x,y,8,col)+c(x,y,3,WHT)+r(x+6,y-3,22,6,col,2)+r(x+18,y,5,8,col,1)+r(x+25,y,5,6,col,1)
def cam(x,y): return r(x,y+6,52,34,SL,6)+r(x+14,y,24,10,SL,3)+c(x+26,y+23,12,LG)+c(x+26,y+23,8,BL2)+c(x+23,y+20,2.5,WHT)+c(x+46,y+13,2.5,YEL)
def dog(x,y,k=1):
    return at(x,y,k,ln('M7 16q-8-2-6-11',BR2,5)+''.join(r(dx,24,6,13,BR2,2) for dx in(8,16,26,33))+r(6,10,31,17,BRN,7)+r(28,0,16,15,BRN,5)+r(38,6,10,8,BR2,3)+p('M30 2l1-7 6 6z',BR2))
def paw(x,y,col=INK): return e(x,y+8,11,9,col)+''.join(c(x+dx,y+dy,4.5,col) for dx,dy in((-12,-4),(-5,-12),(5,-12),(12,-4)))
def bike(x,y,fr=BL2): return rg(x+12,y,10,INK,5)+rg(x+44,y,10,INK,5)+ln(f'M{x+12} {y}L{x+22} {y-18}H{x+36}L{x+44} {y}M{x+22} {y-18}L{x+28} {y}H{x+12}M{x+36} {y-18}L{x+34} {y-26}H{x+42}M{x+19} {y-22}H{x+26}',fr,4)
def bowl(x,y,col): return p(f'M{x} {y}h48a24 22 0 0 1-48 0z',col)
def pillars(x,y,w,h,k,col=CR2):
    gap=(w-8)/(k-1); return ''.join(r(x+4+i*gap-3,y,6,h,col,1) for i in range(k))
def hexa(cx,cy,r1,col):
    t=lambda a0:'M'+'L'.join(f'{n(cx+r1*math.cos(math.radians(a0+i*120)))} {n(cy+r1*math.sin(math.radians(a0+i*120)))}' for i in range(3))+'Z'
    return p(t(-90),col)+p(t(90),col)
def cube(cx,y,s,t,l,rr):
    P=lambda *a:'M'+'L'.join(f'{x} {yy}' for x,yy in a)+'Z'
    return (p(P((cx,y),(cx+s,y+s/2),(cx,y+s),(cx-s,y+s/2)),t)+p(P((cx-s,y+s/2),(cx,y+s),(cx,y+2*s),(cx-s,y+1.5*s)),l)+p(P((cx,y+s),(cx+s,y+s/2),(cx+s,y+1.5*s),(cx,y+2*s)),rr))
def envelope(x,y,w,h,col=WHT): return pap(x,y,w,h,4)+ln(f'M{x+3} {y+4}L{x+w/2} {y+h*0.6}L{x+w-3} {y+4}','#90A4AE',3)
def cup(f,ex=''): return p('M10 22h34v18a14 14 0 0 1-14 14h-6a14 14 0 0 1-14-14z',f)+ln('M44 27h4a6 6 0 0 1 0 12h-4',f,5)+e(27,58,24,3,SL2)
def hand_stop(col=WHT): # raised palm, ~30 wide
    return ''.join(r(x,y,6,h,col,3) for x,y,h in((18,10,26),(25,6,30),(32,6,30),(39,10,26)))+r(16,28,29,22,col,9)+r(8,34,11,7,col,3.5)

# ---- round 1 revision: vector glyphs (letters, digits and a few signs), drawn as strokes, never <text> ----
GLYPH={'A':(14,20,'M1 19L7 1L13 19M3.5 13H10.5'),'T':(14,20,'M1 1H13M7 1V19'),'M':(14,20,'M1 19V1L7 12L13 1V19'),
 'S':(14,20,'M12 5C11 1 3 0 2 5C1 9 6 10 7 10C12 11 13 15 12 16C10 21 3 21 1 16'),'L':(14,20,'M2 1V19H13'),
 '1':(14,20,'M3 5L8 1V19'),'2':(14,20,'M2 5C2-1 12-1 12 5C12 10 3 14 1 19H13'),'3':(14,20,'M2 3C6-1 12 1 11 5C10 9 6 9 6 9C12 9 13 15 10 18C7 21 3 20 1 17'),
 '@':(24,24,'M16.5 12a4.5 4.5 0 1 0-9 0a4.5 4.5 0 1 0 9 0V13a3 3 0 0 0 6 0V12A10.5 10.5 0 1 0 17 21'),
 '文':(24,24,'M12 1V4M3 6H21M17 8C14 16 9 21 3 23M6 9C9 16 15 21 21 23'),
 '¥':(24,24,'M3 2L12 12L21 2M12 12V23M5 14H19M5 19H19'),'$':(14,24,'M12 6C11 2 3 1 2 6C1 11 12 12 12 17C12 22 3 22 1 18M7 0V24')}
def letter(ch,cx,cy,h,col=INK,w=4):
    W,H,d=GLYPH[ch]; s=h/H
    return g(f'translate({n(cx-W*s/2)} {n(cy-H*s/2)}) scale({n(s)})',ln(d,col,n(w/s)))
def flame(x,y,s,col=ORL,col2=YEL): # about 16 x 22 at s=1, top at (x,y)
    return at(x,y,s,p('M0 0c6 6 8 10 8 15a8 8 0 0 1-16 0c0-4 2-6 4-9 1 2 2 3 3 3 0-3 0-6 1-9z',col)+p('M0 22a4.5 4.5 0 0 1-4.5-5c0-3 3-4 4.5-8 2 3 4.5 5 4.5 8a4.5 4.5 0 0 1-4.5 5z',col2))
