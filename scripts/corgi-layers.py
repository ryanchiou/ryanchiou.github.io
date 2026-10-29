"""Cut src/assets/elements/corgi.png (the sitting corgi) into the layers CorgiHero animates.

    pip install numpy opencv-python-headless scipy   # plus `cwebp` on PATH
    python scripts/corgi-layers.py [source.png] [output-dir]

Writes grass, tail, body, ear-l, ear-r, jaw, eyes-blink, eyes-happy, ball and
grass-front as WebP on one shared canvas, so they stack with `inset: 0`. The
tennis ball and the grass patch are painted here in the corgi's watercolor style.

Cut lines, eye positions and pivots are measured from this painting (source
px). CorgiHero.css mirrors the canvas percentages printed at the end, so
update it if they change.
"""
import os, shutil, subprocess, sys, tempfile
import numpy as np, cv2
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "src/assets/elements/corgi.png")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "src/assets/elements/corgi")
SCALE = 0.5
PAPER = 253.0
INK = np.array([24, 33, 52], np.float32)  # BGR, core of the outline strokes

if not shutil.which("cwebp"):
    sys.exit("cwebp not found (brew install webp)")

im = cv2.imread(SRC).astype(np.float32)
B, G, R = im[..., 0], im[..., 1], im[..., 2]
gray = 0.299 * R + 0.587 * G + 0.114 * B
warm = R - B
H, W = gray.shape
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)

def side_of(p, q):
    """Signed distance of every pixel from line p→q (positive = above for these lines)."""
    (px, py), (qx, qy) = p, q
    dx, dy = qx - px, qy - py
    return ((xx - px) * dy - (yy - py) * dx) / np.hypot(dx, dy)

grow = lambda m, r: cv2.dilate(m.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))) > 0

# ── silhouette ─────────────────────────────────────────────
# Fur is warmer than the neutral paper, so warm or dark pixels seed the corgi;
# closing bridges gaps in the ink, then holes are filled (the white paws and
# chest are enclosed by ink). The painted floor shadow is warm too, so under the
# paw line only ink and orange fur count.
GROUND = 1172  # where the paws meet the floor
seed = ((warm > 5) | (gray < 170)) & ((yy < GROUND - 22) | (gray < 170) | (warm > 30))
seed = seed.astype(np.uint8) * 255
seed = cv2.medianBlur(seed, 5) > 0
closed = cv2.morphologyEx(seed.astype(np.uint8), cv2.MORPH_CLOSE,
                          cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
filled = ndi.binary_fill_holes(closed)
lab, n = ndi.label(filled)
sizes = ndi.sum(filled, lab, range(1, n + 1))
mask = lab == (int(np.argmax(sizes)) + 1)

# paper trapped between fur spikes: flood from outside through paper-like
# pixels, but only within a shallow band so it can't leak into white fur.
paperlike = (np.abs(warm) < 5) & (gray > 236)
band = mask & (ndi.distance_transform_edt(mask) < 18)
reach = ndi.binary_propagation(~mask, mask=(~mask) | (band & paperlike))
solid = mask & ~reach
# The floor shadow: flood in from the bottom edge through anything that isn't
# ink or orange fur, but only in a band just above the paw line, so it takes
# the shadow and the gaps between the legs and stops at every paw outline.
# The shadow's pinkish grey (warm, but paler than orange fur) also reaches a
# little higher, up the side of the front paw, so it's followed further up.
shadowish = (warm > 7) & (warm < 26) & (gray > 175) & (gray < 248)
passable = ((gray > 175) & (warm < 26) & (yy > GROUND - 40)) | (shadowish & (yy > GROUND - 110))
floor = ndi.binary_propagation(passable & (yy >= H - 2), mask=passable)
solid &= ~floor

# color-to-alpha against paper for a soft, ink-true edge
c2a = np.clip((PAPER - im.min(axis=2)) / PAPER, 0, 1)
c2a = np.clip((c2a - 0.02) / 0.75, 0, 1)
inside = ndi.distance_transform_edt(solid)
ring = (cv2.dilate(solid.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0) & (inside <= 1.5)
# white fur that meets the background directly gets a short ramp, not a stair-step
soft_core = np.clip((inside - 0.5) / 3.0, 0, 1)
alpha = np.maximum(np.where(ring, c2a, 0.0), soft_core).astype(np.float32)
alpha *= 1 - cv2.GaussianBlur(floor.astype(np.float32), (0, 0), 2)  # soften where the floor was cut away
core = soft_core >= 1
a = np.maximum(alpha, 1e-3)[..., None]
color = np.where(core[..., None], im, np.clip((im - (1 - a) * PAPER) / a, 0, 255))

# ── tail: everything right of the body's back outline ─────
# x(y) hugs the outer edge of the body's stroke; across the open stretch of the
# tail base (no stroke, rows ~940-972) the body feathers into the tail.
cut_pts = [(770, 905), (840, 900), (863, 903), (875, 909), (890, 907), (905, 916), (920, 924),
           (935, 930), (955, 932), (980, 937), (995, 939), (1010, 941), (1030, 943)]
cut_x = np.interp(yy, [p[0] for p in cut_pts], [p[1] for p in cut_pts])
tail_zone = (yy > 770) & (yy < 1018) & (xx > 860)
open_base = smoothstep(932, 944, yy) * (1 - smoothstep(968, 980, yy))
feather = np.where(open_base > 0, 4 + 10 * open_base, 0.75)
body_keep_tail = np.where(tail_zone, 1 - smoothstep(-feather, feather, xx - cut_x), 1.0)
# the tail carries ~25px of body under its base, so a wag slides it out from
# behind the body instead of opening a gap
tail_a = np.where(tail_zone, smoothstep(-30, -12, xx - cut_x), 0.0)
tail_a = np.where((xx - cut_x < 0) & ~((yy > 875) & (yy < 1008)), 0.0, tail_a)

# ── ears: above a line across each ear base ────────────────
EF = 10  # feather half-width
ear_l_line = ((268, 405), (432, 318))
ear_r_line = ((530, 322), (752, 420))
s_l, s_r = side_of(*ear_l_line), side_of(*ear_r_line)
reg_l = (xx < 452) & (yy < 425)
reg_r = (xx > 512) & (yy < 445)
ear_l = smoothstep(-EF, EF, s_l) * reg_l
ear_r = smoothstep(-EF, EF, s_r) * reg_r
# body runs a little past the base under the (opaque) ear so a twitch never
# opens a see-through seam
body_keep_ears = 1 - np.maximum(smoothstep(EF, EF + 14, s_l) * reg_l, smoothstep(EF, EF + 14, s_r) * reg_r)

# ── jaw: open mouth and tongue, below the upper lip ───────
# It only ever stretches downward from its top edge (CorgiHero pants with
# scaleY >= 1), so it always covers the painted mouth beneath it.
JAW_TOP, JAW_BOTTOM, JAW_LEFT, JAW_RIGHT = 548, 676, 364, 496
jaw = ((1 - smoothstep(JAW_BOTTOM - 16, JAW_BOTTOM, yy)) * (yy >= JAW_TOP)
       * smoothstep(JAW_LEFT, JAW_LEFT + 10, xx) * (1 - smoothstep(JAW_RIGHT - 10, JAW_RIGHT, xx)))

# ── closed-eye patches ─────────────────────────────────────
# (centre, patch radii, the eye's own radii): ink inside the patch but outside
# the eye (the muzzle line under the left eye) is laid back on top unchanged.
eyes = [((369, 420), (36, 37), (30, 31)), ((543, 444), (36, 36), (31, 31))]
eye_mask = np.zeros((H, W), np.uint8)
eye_core = np.zeros((H, W), np.uint8)
for (cx, cy), (rx, ry), (ex, ey) in eyes:
    cv2.ellipse(eye_mask, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
    cv2.ellipse(eye_core, (cx, cy), (ex, ey), 0, 0, 360, 255, -1)
eye_in = eye_mask > 0
other_ink = eye_in & (gray < 150) & ~grow(eye_core > 0, 2)
# normalized blur: smooth fur colour from nearby pixels, ignoring all ink
valid = (~eye_in & (gray > 160)).astype(np.float32)
fill = cv2.GaussianBlur(im * valid[..., None], (0, 0), 9) / np.maximum(cv2.GaussianBlur(valid, (0, 0), 9), 1e-3)[..., None]
w_fill = np.clip(cv2.GaussianBlur(grow(eye_in, 3).astype(np.float32), (0, 0), 3) * 1.25, 0, 1)[..., None]
lids = fill * w_fill + im * (1 - w_fill)
keep = (np.clip((150 - gray) / 70, 0, 1) * other_ink)[..., None]
lids = lids * (1 - keep) + im * keep
grain = cv2.GaussianBlur(np.random.default_rng(3).normal(0, 1, (H, W)).astype(np.float32), (0, 0), 2.2)
lids += grain[..., None] * np.array([3, 4, 3], np.float32) * eye_in[..., None]

def brush(canvas_alpha, pts, width, ss=4):
    """Tapered brush stroke along a quadratic bezier, drawn supersampled."""
    (ax, ay), (bx, by), (cx_, cy_) = pts
    h, w = canvas_alpha.shape
    big = np.zeros((h * ss, w * ss), np.uint8)
    for t in np.linspace(0, 1, 160):
        x = (1 - t) ** 2 * ax + 2 * (1 - t) * t * bx + t ** 2 * cx_
        y = (1 - t) ** 2 * ay + 2 * (1 - t) * t * by + t ** 2 * cy_
        r = width * (0.35 + 0.65 * np.sin(np.pi * t) ** 0.55) / 2
        cv2.circle(big, (int(x * ss), int(y * ss)), max(1, int(r * ss)), 255, -1, lineType=cv2.LINE_AA)
    return np.maximum(canvas_alpha, cv2.resize(big, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255)

def eye_patch(kind):
    stroke = np.zeros((H, W), np.float32)
    for (cx, cy), _, (ex, _ey) in eyes:
        k = ex / 31  # strokes were drawn for a 31px eye
        if kind == 'blink':  # soft closed lid, curving down
            stroke = brush(stroke, [(cx - 27 * k, cy - 2 * k), (cx, cy + 16 * k), (cx + 27 * k, cy - 2 * k)], 11 * k)
        else:  # happy ^ ^
            stroke = brush(stroke, [(cx - 26 * k, cy + 10 * k), (cx - 2 * k, cy - 22 * k), (cx + 24 * k, cy + 10 * k)], 11 * k)
    patch_a = np.clip(cv2.GaussianBlur(grow(eye_in, 8).astype(np.float32), (0, 0), 3) * 1.25, 0, 1)
    return lids * (1 - stroke[..., None]) + INK * stroke[..., None], np.maximum(patch_a, stroke)

# ── paint area ─────────────────────────────────────────────
# The ball and grass are painted on an area a little wider than the painting
# (the grass runs past the tail); the final canvas is cropped to fit them all.
BALL_C, BALL_R = (196, GROUND - 66), 66
CW = W + 120
gy, gx = np.mgrid[0:H, 0:CW].astype(np.float32)

# ── tennis ball, painted to match ──────────────────────────
ball_rng = np.random.default_rng(11)
BALL_LIGHT = np.array([142, 236, 232], np.float32)  # BGR: pale yellow-green
BALL_DEEP = np.array([66, 190, 172], np.float32)    # deeper green where pigment pools
FUR_WHITE = np.array([242, 249, 253], np.float32)

def catmull(points, n=40):
    pts = np.array(points, np.float32)
    pts = np.vstack([pts[:1], pts, pts[-1:]])
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for t in np.linspace(0, 1, n, endpoint=False):
            out.append(0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
                              + (3 * p1 - p0 - 3 * p2 + p3) * t ** 3))
    out.append(pts[-2])
    return np.array(out, np.float32)

def ink_stroke(points, width, taper, ss=3):
    """Tapered, slightly wobbly brush stroke through the points."""
    curve = catmull(points)
    t = np.r_[0, np.cumsum(np.linalg.norm(np.diff(curve, axis=0), axis=1))]
    t /= t[-1]
    prof = np.minimum(np.clip(t / taper[0], 0, 1), np.clip((1 - t) / taper[1], 0, 1))
    prof = 0.25 + 0.75 * np.sin(prof * np.pi / 2)
    wobble = cv2.GaussianBlur(ball_rng.normal(0, 1, (len(t), 1)).astype(np.float32), (1, 0), 6).ravel()
    big = np.zeros((H * ss, CW * ss), np.uint8)
    for (x, y), r in zip(curve, width / 2 * prof * (1 + 0.12 * wobble)):
        cv2.circle(big, (int(x * ss), int(y * ss)), max(1, int(r * ss)), 255, -1, lineType=cv2.LINE_AA)
    return cv2.resize(big, (CW, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255

def arc(c, r, a0, a1, n=9, squash=1.0):
    return [(c[0] + r * np.cos(np.radians(a)), c[1] + r * squash * np.sin(np.radians(a))) for a in np.linspace(a0, a1, n)]

cx, cy = BALL_C
dist = np.hypot(gx - cx, gy - cy)
ball = np.clip(BALL_R + 0.5 - dist, 0, 1)
noise = lambda s: (lambda m: m / (m.std() + 1e-6))(cv2.GaussianBlur(ball_rng.normal(0, 1, (H, CW)).astype(np.float32), (0, 0), s))
# lighter toward the top-left, pigment pooled at the wet edge and lower right
d = (0.42 + 0.16 * noise(14) + 0.05 * noise(4) + 0.38 * np.exp(-(BALL_R - dist).clip(0) / 8)
     + 0.22 * np.clip(((gx - cx) + (gy - cy)) / (2 * BALL_R), -1, 1))
d = np.clip(d, 0, 1)[..., None]
ball_col = BALL_LIGHT * (1 - d) + BALL_DEEP * d + noise(1.2)[..., None] * 3
# the felt seam, left as bare paper: two curves bowing toward each other
k = BALL_R / 58  # seam proportions were set on a 58px ball
seam = np.maximum(ink_stroke(arc((cx - 70 * k, cy), 52 * k, -52, 52), 9 * k, (0.2, 0.2)),
                  ink_stroke(arc((cx + 70 * k, cy), 52 * k, 128, 232), 9 * k, (0.2, 0.2)))
seam = cv2.GaussianBlur(seam, (0, 0), 1.2) * ball
ball_col = ball_col * (1 - seam[..., None]) + FUR_WHITE * seam[..., None]
outline = np.maximum(ink_stroke(arc(BALL_C, BALL_R, -150, 118, 14), 13, (0.12, 0.2)),
                     ink_stroke(arc(BALL_C, BALL_R, 132, 196, 6), 12, (0.3, 0.3)))
ball_col = ball_col * (1 - outline[..., None]) + INK * outline[..., None]
ball_a = np.maximum(ball, outline)


# ── grass patch, painted to match ──────────────────────────
# A soft wash with a pooled wet edge and a deeper green under the paws, blades
# clumping along the rim (taller toward the ends), and short flicks through the
# wash. No ink outline: it stays background to the corgi. `grass` sits behind
# him; `grass-front` is a few short blades in front of the paws.
grass_rng = np.random.default_rng(7)
GRASS_C, GRASS_R = (600, GROUND + 14), (540, 62)
GRASS_LIGHT = np.array([162, 228, 214], np.float32)  # BGR: spring green, warm to sit with the orange
GRASS_DEEP = np.array([66, 146, 100], np.float32)
BAND = (GROUND - 200, H)  # blades are drawn in this row band to keep it quick

def gnoise(sigma):
    n = cv2.GaussianBlur(grass_rng.normal(0, 1, (H, CW)).astype(np.float32), (0, 0), sigma)
    return n / (n.std() + 1e-6)

gcx, gcy = GRASS_C
u, v = (gx - gcx) / GRASS_R[0], (gy - gcy) / GRASS_R[1]
theta = np.arctan2(v, u)
wob = sum(amp * np.sin(k * theta + grass_rng.uniform(0, 6.28)) for k, amp in [(3, .05), (5, .04), (9, .025), (17, .015)])
r = np.hypot(u, v) - wob - 0.02 * gnoise(6)
wash = 1 - smoothstep(0.97, 1.0, r)
d = (0.36 + 0.14 * gnoise(26) + 0.05 * gnoise(5)
     + 0.5 * np.exp(-np.clip((1 - r) * GRASS_R[1], 0, None) / 7)          # wet edge
     + 0.5 * np.exp(-(((gx - 640) / 320) ** 2 + ((gy - (GROUND + 4)) / 30) ** 2)))  # under the paws
d = np.clip(d, 0, 1)[..., None]
grass_col = GRASS_LIGHT * (1 - d) + GRASS_DEEP * d
grass_a = wash * np.clip(0.28 + 0.66 * d[..., 0], 0, 1)

def blade_mask(base, height, width, lean, bend, ss=3):
    """A tapered, slightly curved blade: wide at the base, pointed at the tip."""
    t = np.linspace(0, 1, 24)
    sx = base[0] + lean * height * t + bend * height * t ** 2
    sy = base[1] - height * t
    half = width / 2 * (1 - t) ** 0.9
    nx, ny = np.gradient(sy), -np.gradient(sx)
    nl = np.hypot(nx, ny) + 1e-6
    poly = np.vstack([np.stack([sx + nx / nl * half, sy + ny / nl * half], 1),
                      np.stack([sx - nx / nl * half, sy - ny / nl * half], 1)[::-1]])
    bh = BAND[1] - BAND[0]
    big = np.zeros((bh * ss, CW * ss), np.uint8)
    cv2.fillPoly(big, [np.round((poly - [0, BAND[0]]) * ss).astype(np.int32)], 255, lineType=cv2.LINE_AA)
    out = np.zeros((H, CW), np.float32)
    out[BAND[0]:BAND[1]] = cv2.resize(big, (CW, bh), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    return out

def paint_blades(items, col, a):
    """items: (base, height, width, lean, bend, shade 0-1, alpha); painted over col/a."""
    for base, h, w, lean, bend, shade, al0 in items:
        m = blade_mask(base, h, w, lean, bend) * al0
        c = GRASS_LIGHT * (1 - shade) + GRASS_DEEP * shade
        col = c * m[..., None] + col * (1 - m[..., None])
        a = m + a * (1 - m)
    return col, a

g = grass_rng
flicks = []
for _ in range(60):  # short flicks through the wash
    th, rr = g.uniform(-np.pi, np.pi), np.sqrt(g.uniform(0, 1)) * 0.95
    flicks.append(((gcx + GRASS_R[0] * rr * np.cos(th), gcy + GRASS_R[1] * rr * np.sin(th)),
                   g.uniform(14, 26), g.uniform(6, 9), g.uniform(-0.5, 0.5), g.uniform(-0.3, 0.3), g.uniform(0.55, 1), g.uniform(0.35, 0.6)))
rim = []
ph1, ph2 = g.uniform(0, 6.28, 2)
for th in np.linspace(-np.pi, np.pi, 96, endpoint=False) + g.uniform(0, 0.2):
    th += g.uniform(-0.08, 0.08)
    clump = (np.sin(3 * th + ph1) + 0.6 * np.sin(7 * th + ph2)) / 1.6  # -1..1 along the rim
    if clump < -0.25 and g.uniform() < 0.8:  # sparse stretches between clumps
        continue
    ex, ey = np.cos(th), np.sin(th)
    h = g.uniform(28, 58) * (0.55 + 0.9 * abs(ex) ** 3) * (1.0 if ey < 0 else 0.75) * (0.75 + 0.45 * max(clump, 0))
    rim.append(((gcx + GRASS_R[0] * ex * 0.985, gcy + GRASS_R[1] * ey * 0.9 + g.uniform(-4, 4)),
                h, g.uniform(8, 13), 0.55 * ex + g.uniform(-0.25, 0.25), g.uniform(-0.3, 0.3), g.uniform(0.45, 1), g.uniform(0.75, 0.95)))

def tuft(center, n, hmin, hmax, spread):
    out = []
    for _ in range(n):
        bx = center[0] + g.uniform(-spread, spread)
        out.append(((bx, center[1] + g.uniform(-6, 6)), g.uniform(hmin, hmax), g.uniform(7, 11),
                    g.uniform(-0.45, 0.45) + (bx - center[0]) / spread * 0.25, g.uniform(-0.25, 0.25), g.uniform(0.35, 0.95), g.uniform(0.75, 0.95)))
    return out

grass_col, grass_a = paint_blades(flicks + rim + tuft((90, 1172), 6, 40, 90, 34) + tuft((1110, 1176), 7, 40, 95, 36), grass_col, grass_a)
front_col, front_a = paint_blades(tuft((430, 1226), 4, 22, 42, 26) + tuft((770, 1230), 4, 22, 42, 30) + tuft((300, 1236), 3, 18, 34, 20),
                                  np.zeros((H, CW, 3), np.float32), np.zeros((H, CW), np.float32))

# ── canvas ─────────────────────────────────────────────────
# Everything drawn, plus a little air.
drawn = np.pad(alpha, ((0, 0), (0, CW - W))) > 0.02
drawn |= (ball_a > 0.02) | (grass_a > 0.02) | (front_a > 0.02)
ys, xs = np.where(drawn)
x0, x1, y0, y1 = max(xs.min() - 16, 0), xs.max() + 16, ys.min() - 16, min(ys.max() + 16, H)

# ── write layers ───────────────────────────────────────────
TMP = tempfile.mkdtemp()
os.makedirs(OUT, exist_ok=True)

def save_layer(name, col, a_):
    # crop + downscale premultiplied so edges don't pick up a dark fringe
    a_ = np.clip(a_, 0, 1).astype(np.float32)
    if a_.shape[1] < CW:
        a_ = np.pad(a_, ((0, 0), (0, CW - a_.shape[1])))
        col = np.pad(col, ((0, 0), (0, CW - col.shape[1]), (0, 0)))
    pm = cv2.resize((col * a_[..., None])[y0:y1, x0:x1], None, fx=SCALE, fy=SCALE, interpolation=cv2.INTER_AREA)
    aa = cv2.resize(a_[y0:y1, x0:x1], None, fx=SCALE, fy=SCALE, interpolation=cv2.INTER_AREA)
    c = np.where(aa[..., None] > 1e-4, pm / np.maximum(aa[..., None], 1e-4), 0)
    png = os.path.join(TMP, f"{name}.png")
    cv2.imwrite(png, np.dstack([c.clip(0, 255), aa * 255]).round().astype(np.uint8))
    subprocess.run(["cwebp", "-quiet", "-q", "88", "-alpha_q", "100", "-m", "6", png,
                    "-o", os.path.join(OUT, f"{name}.webp")], check=True)

save_layer('body', color, alpha * body_keep_tail * body_keep_ears)
save_layer('tail', color, alpha * tail_a)
save_layer('ear-l', color, alpha * ear_l)
save_layer('ear-r', color, alpha * ear_r)
save_layer('jaw', color, alpha * jaw)
for kind in ('blink', 'happy'):
    save_layer(f'eyes-{kind}', *eye_patch(kind))
save_layer('ball', ball_col, ball_a)
save_layer('grass', grass_col, grass_a)
save_layer('grass-front', front_col, front_a)
shutil.rmtree(TMP)

# Canvas percentages for CorgiHero.css.
cw, ch = (x1 - x0), (y1 - y0)
pct = lambda x, y: f"{(x - x0) / cw * 100:.2f}% {(y - y0) / ch * 100:.2f}%"
print(f"canvas {round(cw * SCALE)}x{round(ch * SCALE)} (source x {x0}-{x1}, y {y0}-{y1})")
print("tail pivot ", pct(925, 955))
print("ear-l pivot", pct(350, 362))
print("ear-r pivot", pct(641, 371))
print("jaw origin ", pct((JAW_LEFT + JAW_RIGHT) / 2, JAW_TOP))
dys, dxs = np.where(alpha > 0.3)
print("corgi box  ", f"left {(dxs.min() - x0) / cw * 100:.1f}% right {(x1 - dxs.max()) / cw * 100:.1f}%",
      f"top {(dys.min() - y0) / ch * 100:.1f}% bottom {(y1 - GROUND) / ch * 100:.1f}%", "(for the pettable area)")
br = BALL_R + 7  # with its outline
print("ball       ", f"centre {pct(*BALL_C)}, box left {(BALL_C[0] - br - x0) / cw * 100:.2f}% top {(BALL_C[1] - br - y0) / ch * 100:.2f}%",
      f"width {2 * br / cw * 100:.2f}% height {2 * br / ch * 100:.2f}%, rests at {(GROUND - y0) / ch * 100:.2f}%")
