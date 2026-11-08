"""Paint the watercolor sunset scene the corgi sits in, for CorgiHero.

    pip install numpy opencv-python-headless   # plus `cwebp` on PATH
    python scripts/corgi-sunset.py [output-dir] [--preview out.png]

Writes two layers on one canvas:
  sunset.webp        the scene behind him: a sunset sky after a reference
                     painting (a sunset over the sea), with big raspberry and
                     coral clouds and the sun setting on the horizon, over a
                     meadow painted in the reference's water colours (magenta
                     and violet far off, blue and indigo up front)
  sunset-front.webp  a few grass tufts that sit in front of his paws

Colours are the reference's own hexes at full strength. The outline is organic:
lobes of sky with clouds breaking out of it, a cloud tail reaching left toward
the headline, and a meadow that tapers off at both ends, all with crisp,
slightly pooled watercolour edges.

The page (#f5f5f5) is the paper, so outside the paint is transparent. The
corgi's layer canvas (scripts/corgi-layers.py) sits on the scene at STAGE_AT;
CorgiHero.css mirrors the numbers printed at the end. The fixed seed makes
every run identical. --preview also writes the scene with the corgi in it.
"""
import os, shutil, subprocess, sys, tempfile
import numpy as np, cv2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARGS = sys.argv[1:]
PREVIEW = ARGS[ARGS.index("--preview") + 1] if "--preview" in ARGS else None
ARGS = [a for i, a in enumerate(ARGS) if a != "--preview" and (i == 0 or ARGS[i - 1] != "--preview")]
OUT = ARGS[0] if ARGS else os.path.join(ROOT, "src/assets/elements/corgi")

if not shutil.which("cwebp"):
    sys.exit("cwebp not found (brew install webp)")

rng = np.random.default_rng(7)
W, H = 1800, 1130   # paint area, in corgi-layer px
P = 245.0           # the paper: the page, #f5f5f5

# The corgi's 588x579 layer canvas on the paint area: the dog (x 92-507 on
# that canvas) on the right, his chin on the horizon and his paws (y 530.5,
# touching down at x 133-445) in the grass.
STAGE = (588, 579)
STAGE_AT = (760, 340)
PAWS_Y = STAGE_AT[1] + 530.5
PAWS_X = (STAGE_AT[0] + 133, STAGE_AT[0] + 445)
HORIZON = 630
SKY_TOP = 100
SUN = (600, HORIZON - 18, 36)   # x, y, radius: setting into the meadow, left of him

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

# ── helpers ────────────────────────────────────────────────
def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)

def noise2d(feature, sx=1.0, sy=1.0):
    """Smooth noise over the paint area (unit std), blobs ~`feature` px; sx/sy stretch it."""
    gw, gh = max(2, int(W / (feature * sx))) + 3, max(2, int(H / (feature * sy))) + 3
    g = rng.normal(0, 1, (gh, gw)).astype(np.float32)
    up = cv2.resize(g, (int(W * gw / (gw - 3)), int(H * gh / (gh - 3))), interpolation=cv2.INTER_CUBIC)
    oy, ox = (up.shape[0] - H) // 2, (up.shape[1] - W) // 2
    n = cv2.GaussianBlur(up[oy:oy + H, ox:ox + W], (0, 0), max(0.5, feature * 0.15 * min(sx, sy)))
    return (n - n.mean()) / (n.std() + 1e-6)

def fine(sigma):
    n = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), sigma)
    return n / (n.std() + 1e-6)

def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)

def ramp(t, stops):
    """Colour at t along (position, hex) stops, blended in Lab."""
    pos = np.array([s for s, _ in stops], np.float32)
    lab = cv2.cvtColor((np.stack([rgb(h) for _, h in stops]) / 255).reshape(-1, 1, 3), cv2.COLOR_RGB2Lab).reshape(-1, 3)
    out = np.stack([np.interp(t, pos, lab[:, i]) for i in range(3)], -1).astype(np.float32)
    return cv2.cvtColor(out.reshape(-1, 1, 3), cv2.COLOR_Lab2RGB).reshape(out.shape) * 255

def deepen(c, k):
    """More of the same pigment: darker and richer, the way watercolour pools."""
    k = np.asarray(k, np.float32)
    return P * np.clip(c / P, 1e-3, None) ** (1 + (k[..., None] if k.ndim else k))

def sdf(m):
    """Signed distance in px to the edge of mask m (+ inside)."""
    m = m.astype(np.uint8)
    return cv2.distanceTransform(m, cv2.DIST_L2, 5) - cv2.distanceTransform(1 - m, cv2.DIST_L2, 5)

def roughen(m, amps, min_area=600):
    """Push an outline in and out by noise at a few scales, for an organic edge
    (dropping any specks that break off)."""
    sd = sdf(m)
    for feature, a in amps:
        sd = sd + a * noise2d(feature)
    n, lab, stats, _ = cv2.connectedComponentsWithStats((sd > 0).astype(np.uint8), connectivity=8)
    keep = np.zeros(n, bool)
    keep[1:] = stats[1:, cv2.CC_STAT_AREA] >= min_area
    return sdf(keep[lab])

def ellipses(lobes):
    """Union of ellipses (cx, cy, rx, ry) as a field: > 0 inside."""
    f = np.full((H, W), -1e9, np.float32)
    for cx, cy, rx, ry in lobes:
        f = np.maximum(f, 1 - ((xx - cx) / rx) ** 2 - ((yy - cy) / ry) ** 2)
    return f

tooth = 0.5 * fine(1.2) + 0.6 * fine(2.6) + 0.35 * fine(5.5)   # cold-press paper
tooth /= tooth.std()

def edge(sd):
    """Crisp coverage from a signed distance, roughened a touch by the paper."""
    return smoothstep(-0.8, 0.8, sd + 0.9 * tooth)

C = np.full((H, W, 3), P, np.float32)   # the painting, on paper
COVER = np.zeros((H, W), np.float32)    # where there's paint

def lay(colour, m):
    global C, COVER
    C = C * (1 - m[..., None]) + colour * m[..., None]
    COVER = np.maximum(COVER, m)

def pick(seq):
    return seq[rng.integers(len(seq))]

# ── sky ────────────────────────────────────────────────────
# Lobes, roughened: a big body behind him, a smaller one to the left, and a
# tip pointing at the headline.
sky_m = ellipses([(990, 380, 590, 285), (480, 415, 330, 160), (290, 388, 210, 70), (880, 232, 280, 115),
                  (1430, 480, 190, 160), (1040, 628, 690, 75)]) > 0  # the last: low sky meeting the meadow
sky_m &= yy < HORIZON + 70  # runs on under the meadow, so no gaps at the horizon
sky_sd = roughen(sky_m, [(130, 26), (45, 10), (14, 3.5)])
sky_cov = edge(sky_sd)
# a few stretches of the rim where the brush ran dry and broke up on the paper
dry = smoothstep(0.7, 1.5, noise2d(160)) * (sky_sd < 16)
thr = -1.6 + 2.8 * (1 - np.clip(sky_sd, 0, 16) / 16)
sky_cov *= 1 - dry * (1 - smoothstep(thr - 0.3, thr + 0.3, tooth))

# Wet-in-wet: lilac-pink up top (pinker on the right), peach, a strong orange
# band, salmon at the horizon. All the reference's hexes.
t = np.clip((yy - SKY_TOP) / (HORIZON - SKY_TOP) + 0.04 * noise2d(240, sx=3) + 0.02 * noise2d(80, sx=2), 0, 1)
sky = ramp(t, [(0.0, '#dfb7c8'), (0.17, '#f4b8b4'), (0.33, '#f7cdb9'), (0.47, '#f9cbaa'), (0.58, '#fab28e'),
               (0.68, '#e97057'), (0.78, '#fab28e'), (0.9, '#fca28b'), (1.0, '#faa485')])
right = (smoothstep(500, 1500, xx) * smoothstep(0.35, 0.0, t))[..., None]
sky = sky * (1 - 0.6 * right) + rgb('#f4b8b4') * 0.6 * right
for (bx, by), br, col, amt in [((700, 350), 170, '#f7cdb9', .5), ((1250, 430), 180, '#f9cbaa', .45),
                               ((420, 520), 150, '#e97057', .3), ((1350, 250), 150, '#f4b8b4', .5)]:
    r = br * np.clip(1 + 0.25 * noise2d(br * 0.6), 0.7, 1.3)
    f = (smoothstep(r * 1.1, r * 0.3, np.hypot(xx - bx, (yy - by) * 1.7)) * amt)[..., None]
    sky = sky * (1 - f) + rgb(col) * f

# the sun's glow: brighter peach right around it
sx, sy, sr = SUN
sun_d = np.hypot(xx - sx, yy - sy)
glow = (np.exp(-(np.clip(sun_d - sr, 0, None) / 70) ** 2) * 0.55)[..., None]
sky = sky * (1 - glow) + rgb('#fdd5bf') * glow

# Clouds, painted into the wet sky: a row of round puffs on a flat-ish base,
# tapering into long tails, coloured top to bottom (lit from below by the sun).
def cloud(x0, x1, base, height, colours):
    L = x1 - x0
    lobes = [(x0 + 0.13 * L, base - 0.2 * height, 0.24 * L, 0.15 * height),   # tails
             (x1 - 0.12 * L, base - 0.17 * height, 0.2 * L, 0.12 * height)]
    c = x0 + 0.1 * L
    while c < x1 - 0.12 * L:
        hump = np.sin(np.pi * np.clip((c - x0) / L, 0, 1)) ** 0.7  # taller toward the middle
        ry = height * rng.uniform(0.32, 0.55) * (0.4 + 0.6 * hump)
        rx = ry * rng.uniform(1.3, 2.3)
        lobes.append((c, base - ry * rng.uniform(0.55, 0.85), rx, ry))
        c += rx * rng.uniform(0.75, 1.15)
    f = ellipses(lobes)
    f = np.minimum(f, (base + 0.05 * height + 5 * noise2d(60) - yy) / (0.2 * height))  # flat base
    sd = roughen(f > 0, [(50, 6), (16, 2.5)])
    cov = edge(sd)
    tc = np.clip((yy - (base - height)) / height * 0.85 + (xx - x0) / L * 0.25 + 0.06 * noise2d(40), 0, 1)
    col = ramp(tc, colours)
    # pigment pools along the bottom and the outer edge
    pool = np.exp(-np.clip(sd, 0, None) / 5) * (0.5 + 0.5 * smoothstep(base - 0.4 * height, base, yy))
    return cov, deepen(col, 0.28 * pool)

CLOUDS = [  # x0, x1, base y, height, colours top to bottom
    (130, 890, 430, 180, [(0, '#dc646e'), (0.45, '#cc697a'), (0.8, '#f67c57'), (1, '#e97057')]),  # the big one
    (640, 1130, 218, 110, [(0, '#c6789e'), (0.6, '#dc849f'), (1, '#ec8d8e')]),
    (1170, 1560, 350, 88, [(0, '#df8795'), (0.6, '#e87b64'), (1, '#f67c57')]),
    (215, 530, 598, 52, [(0, '#c95f7a'), (1, '#cf6d7e')]),
    (1270, 1580, 602, 58, [(0, '#f65e5d'), (1, '#f85c56')]),
]
for x0, x1, base, height, colours in CLOUDS:
    cov, col = cloud(x0, x1, base, height, colours)
    sky = sky * (1 - cov[..., None]) + col * cov[..., None]
    sky_cov = np.maximum(sky_cov, cov)

# the sun: paper left bare, barely warmed
sun = smoothstep(sr + 0.9, sr - 0.9, sun_d + 0.4 * tooth)
sky = sky * (1 - sun[..., None]) + ramp(np.clip(sun_d / sr, 0, 1), [(0, '#fbf2e9'), (1, '#eee3d9')]) * sun[..., None]

# the wash pools a little darker just inside its outer edge
sky = deepen(sky, 0.22 * np.exp(-np.clip(sky_sd, 0, None) / 6) * (0.6 + 0.4 * smoothstep(-1, 1, noise2d(90))))
lay(sky, sky_cov)

# ── the meadow ─────────────────────────────────────────────
# Its top is the horizon, rolling gently; it tapers off at both ends and its
# front edge is ragged. Under the grass, a wash in the reference's water colours.
FRONT_Y = PAWS_Y + 150
mu = np.where(xx < 1060, (xx - 1060) / 790, (xx - 1060) / 540)  # -1 and 1 at its ends
bottom = HORIZON + (FRONT_Y - HORIZON) * np.clip(1 - mu * mu, 0, 1) ** 0.85
top = HORIZON + 12 * np.sin((xx - 260) / 210) * np.sin((xx + 400) / 530) + 4 * noise2d(70)
ground_m = (yy > top) & (yy < bottom) & (bottom > HORIZON + 14)  # tapers off to points at both ends
ground_sd = roughen(ground_m, [(90, 12), (30, 5), (10, 2)])
ground_cov = edge(ground_sd)
depth = np.clip((yy - HORIZON) / (FRONT_Y - HORIZON), 0, 1)
ground = ramp(np.clip(depth + 0.05 * noise2d(110, sx=3), 0, 1),
              [(0.0, '#b66381'), (0.1, '#b96c86'), (0.22, '#bb7fa3'), (0.36, '#a877a1'), (0.5, '#8575a8'),
               (0.64, '#6a5d94'), (0.78, '#627db1'), (0.9, '#445e98'), (1.0, '#363e74')])
for (bx, by), br, col, amt in [((sx, HORIZON + 40), 160, '#e8a9a3', .55), ((760, 750), 150, '#a9a0c5', .4),
                               ((1400, 700), 140, '#bf8fae', .45), ((1150, 950), 160, '#8a90bf', .35),
                               ((560, 690), 120, '#eca2a0', .4), ((1330, 810), 110, '#965374', .3)]:
    r = br * np.clip(1 + 0.25 * noise2d(br * 0.6), 0.7, 1.3)
    f = (smoothstep(r * 1.1, r * 0.3, np.hypot(xx - bx, (yy - by) * 2.0)) * amt)[..., None]
    ground = ground * (1 - f) + rgb(col) * f
# the far edge reads as a darker line, like the reference's horizon
ground = deepen(ground, 0.3 * smoothstep(5, 0, yy - top) + 0.2 * np.exp(-np.clip(ground_sd, 0, None) / 6))
lay(ground, ground_cov)

# Grass: tapered blades in the water colours, tiny far off and tall up front,
# with sunset pinks and oranges catching the tips (more toward the sun).
FAR = ['#b66381', '#b96c86', '#bb7fa3', '#965374', '#b37193', '#a877a1']
MID = ['#a877a1', '#8575a8', '#6a5d94', '#bf8fae', '#a88ab3', '#b789b0', '#8a90bf']
NEAR = ['#627db1', '#445e98', '#363e74', '#6a5d94', '#8a90bf', '#aca6ca', '#a9a0c5', '#8575a8']
LIT = ['#e8a9a3', '#eca2a0', '#f99a7e', '#c5948e', '#f37a5f']

def blade(bx, by, h, w, lean, curve, n=7):
    t = np.linspace(0, 1, n)
    cx = bx + np.sin(lean) * h * t + curve * h * t * t
    cy = by - np.cos(lean) * h * t
    dx, dy = np.gradient(cx), np.gradient(cy)
    ln = np.hypot(dx, dy) + 1e-6
    half = 0.5 * w * (1 - t) ** 0.85
    left = np.stack([cx - dy / ln * half, cy + dx / ln * half], 1)
    right = np.stack([cx + dy / ln * half, cy - dx / ln * half], 1)[::-1]
    return np.vstack([left, right])

def grass_blade(x, y, d, scale=1.0):
    near_sun = np.exp(-((x - sx) / 300) ** 2) * (1 - d)
    if rng.uniform() < 0.04 + 0.45 * near_sun + 0.08 * (d < 0.3):
        col = pick(LIT)
    else:
        col = pick(FAR if d < 0.25 else MID if d < 0.6 else NEAR)
    h = (6 + 64 * d ** 1.5) * rng.uniform(0.6, 1.25) * scale
    w = (1.8 + 6 * d) * rng.uniform(0.75, 1.2) * scale
    return blade(x, y, h, w, rng.normal(0.06, 0.26), rng.normal(0, 0.22)), col, rng.uniform(0.75, 0.95)

def draw(blades, target, alpha):
    """Composite blades (polygon, colour, opacity) over target/alpha, colour by colour."""
    by_col = {}
    for poly, col, op in blades:
        by_col.setdefault(col, []).append((poly, op))
    for col, items in by_col.items():
        m = np.zeros((H, W), np.uint8)
        for poly, op in items:
            cv2.fillPoly(m, [np.round(poly * 16).astype(np.int32)], int(255 * op), cv2.LINE_AA, shift=4)
        m = m.astype(np.float32)[..., None] / 255
        target[:] = target * (1 - m) + rgb(col) * m
        alpha[:] = np.maximum(alpha, m[..., 0])

ys, xs = np.where(ground_sd > 2)
d_all = np.clip((ys - HORIZON) / (FRONT_Y - HORIZON), 0, 1)
for lo, hi in zip(np.linspace(0, 1, 11)[:-1], np.linspace(0, 1, 11)[1:]):   # far to near
    sel = np.flatnonzero((d_all >= lo) & (d_all < hi))
    if not len(sel):
        continue
    dm = (lo + hi) / 2
    size = (6 + 64 * dm ** 1.5) * (1.8 + 6 * dm) * 0.45     # a blade's area
    n = int(len(sel) * (0.25 + 0.3 * dm) / size)
    blades = []
    for i in rng.choice(sel, max(1, n // 5)):   # clumps of a few blades each
        hh = 6 + 64 * d_all[i] ** 1.5
        for _ in range(rng.integers(2, 9)):
            x, y = xs[i] + rng.normal(0, 0.3 * hh), ys[i] + rng.normal(0, 0.1 * hh)
            if 0 <= int(y) < H and 0 <= int(x) < W and ground_sd[int(y), int(x)] > 1:
                blades.append(grass_blade(x, y + 2, d_all[i]))
    draw(blades, C, COVER)

# his shadow in the grass, around and in front of his paws
shadow = smoothstep(1.0, 0.2, np.hypot((xx - (PAWS_X[0] + PAWS_X[1]) / 2) / 210, (yy - PAWS_Y - 6) / 34))
C = deepen(C, 0.4 * shadow * (COVER > 0))

# ── tufts in front of him ──────────────────────────────────
FRONT = np.zeros((H, W, 3), np.float32)
FRONT_A = np.zeros((H, W), np.float32)
tufts = []
for x, y, k, scale in [(PAWS_X[0] - 72, PAWS_Y + 14, 4, 0.55), (PAWS_X[0] + 50, PAWS_Y + 20, 6, 0.75),
                       (PAWS_X[0] + 150, PAWS_Y + 14, 5, 0.7), (PAWS_X[0] + 240, PAWS_Y + 22, 6, 0.8),
                       (PAWS_X[1] + 30, PAWS_Y + 8, 5, 0.7)]:
    for _ in range(k):
        bx, by = x + rng.normal(0, 9), y + rng.uniform(-3, 4)
        tufts.append(grass_blade(bx, by, 1.0, scale))
draw(tufts, FRONT, FRONT_A)

# ── paper ──────────────────────────────────────────────────
# pigment settles into the paper's hollows, with a little mottling
grain = 0.08 * np.clip(-tooth, -2, 2) + 0.035 * noise2d(60)
C = deepen(C, grain * (COVER > 0))
FRONT = deepen(FRONT, grain * (FRONT_A > 0))

# Opaque wherever there's paint (the colour already includes the paper), clear
# beyond, so the paint's own edge is the one you see.
painted = (COVER > 0.004).astype(np.uint8)
alpha = cv2.GaussianBlur(cv2.dilate(painted, np.ones((5, 5), np.uint8)).astype(np.float32), (0, 0), 1.2)

# ── crop and write ─────────────────────────────────────────
ys, xs = np.where(alpha > 0.002)
x0, y0, x1, y1 = xs.min() - 4, ys.min() - 4, xs.max() + 5, ys.max() + 5
if x0 < 0 or y0 < 0 or x1 > W or y1 > H:
    sys.exit(f"paint runs off the paint area ({x0}, {y0}, {x1}, {y1}); move it in or enlarge W, H")
tmp = tempfile.mkdtemp()
os.makedirs(OUT, exist_ok=True)
for name, col, a, q in [("sunset", C, alpha, "86"), ("sunset-front", FRONT, FRONT_A, "90")]:
    png = os.path.join(tmp, f"{name}.png")
    cv2.imwrite(png, np.dstack([col[..., ::-1], a * 255])[y0:y1, x0:x1].clip(0, 255).round().astype(np.uint8))
    subprocess.run(["cwebp", "-quiet", "-q", q, "-alpha_q", "100", "-m", "6", png,
                    "-o", os.path.join(OUT, f"{name}.webp")], check=True)
shutil.rmtree(tmp)

w, h = x1 - x0, y1 - y0
stx, sty = STAGE_AT
print(f"scene {w}x{h} (paint area x {x0}-{x1}, y {y0}-{y1})")
print(f".corgi        width calc(var(--h) * {w} / {STAGE[1]}), aspect-ratio {w} / {h}")
print(f".corgi__stage left {(stx - x0) / w * 100:.2f}% top {(sty - y0) / h * 100:.2f}%"
      f" width {STAGE[0] / w * 100:.2f}% height {STAGE[1] / h * 100:.2f}%")
tip = np.where(alpha[:, x0:x0 + 16].max(1) > 0.3)[0]
print(f"left tip  {(tip.mean() - y0) / h * 100:.1f}% down (it should sit level with the headline's first line)")

if PREVIEW:  # the scene with the corgi in it, on the page colour
    layers = os.path.join(ROOT, "src/assets/elements/corgi")
    img = (np.full((H, W, 3), P, np.float32) * (1 - alpha[..., None]) + C * alpha[..., None])
    for name in ("tail", "body", "ear-l", "ear-r", "jaw", "ball"):
        lay_ = cv2.imread(os.path.join(layers, f"{name}.webp"), cv2.IMREAD_UNCHANGED).astype(np.float32)
        lh, lw = lay_.shape[:2]
        a_ = lay_[..., 3:] / 255
        reg = img[sty:sty + lh, stx:stx + lw]
        reg[:] = reg * (1 - a_) + lay_[..., 2::-1] * a_
    img = img * (1 - FRONT_A[..., None]) + FRONT * FRONT_A[..., None]
    cv2.imwrite(PREVIEW, img[y0:y1, x0:x1, ::-1].round().astype(np.uint8))
